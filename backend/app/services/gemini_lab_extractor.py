import json
import re
from typing import Any, Dict, List

from app.services.groq_client import groq_chat


def _clean_json_response(text: str) -> str:
    text = (text or "").strip()

    if text.startswith("```"):
        text = re.sub(r"^```json", "", text, flags=re.IGNORECASE).strip()
        text = re.sub(r"^```", "", text).strip()
        text = re.sub(r"```$", "", text).strip()

    match = re.search(r"\[.*\]|\{.*\}", text, re.DOTALL)
    if match:
        return match.group(0)

    return text


def _normalize_status(value: str, status: str) -> str:
    value_lower = str(value or "").lower().strip()
    status_lower = str(status or "").lower().strip()

    abnormal_words = [
        "positive",
        "reactive",
        "detected",
        "present",
        "abnormal",
        "high",
        "low",
        "raised",
        "elevated",
    ]

    normal_words = [
        "negative",
        "non-reactive",
        "non reactive",
        "not detected",
        "absent",
        "normal",
        "within range",
    ]

    if status_lower in ["high"]:
        return "HIGH"

    if status_lower in ["low"]:
        return "LOW"

    if status_lower in ["normal"]:
        return "NORMAL"

    if status_lower in ["abnormal"]:
        return "ABNORMAL"

    if any(word in value_lower for word in abnormal_words):
        return "ABNORMAL"

    if any(word in value_lower for word in normal_words):
        return "NORMAL"

    return "UNKNOWN"


def _normalize_items(data: Any) -> List[Dict[str, str]]:
    if isinstance(data, dict):
        if isinstance(data.get("lab_results"), list):
            data = data["lab_results"]
        elif isinstance(data.get("results"), list):
            data = data["results"]
        else:
            data = [data]

    if not isinstance(data, list):
        return []

    normalized = []

    for item in data:
        if not isinstance(item, dict):
            continue

        test = (
            item.get("test")
            or item.get("test_name")
            or item.get("name")
            or item.get("parameter")
            or ""
        )

        value = (
            item.get("value")
            or item.get("result")
            or item.get("test_value")
            or item.get("finding")
            or ""
        )

        unit = item.get("unit") or ""
        normal_range = (
            item.get("normal_range")
            or item.get("reference_range")
            or item.get("range")
            or ""
        )

        status = item.get("status") or ""

        test = str(test).strip()
        value = str(value).strip()
        unit = str(unit).strip()
        normal_range = str(normal_range).strip()
        status = _normalize_status(value=value, status=status)

        if not test or not value:
            continue

        normalized.append(
            {
                "test": test,
                "value": value,
                "unit": unit,
                "normal_range": normal_range,
                "status": status,
            }
        )

    return normalized


def _fallback_extract_common_qualitative_tests(report_text: str) -> List[Dict[str, str]]:
    """
    Backup extractor for common qualitative reports like Widal / serology.
    This runs only if AI extraction returns empty.
    """

    results = []
    text = report_text or ""

    possible_tests = [
        "Salmonella typhi O",
        "Salmonella typhi H",
        "Salmonella paratyphi A",
        "Salmonella paratyphi B",
        "S. typhi O",
        "S. typhi H",
        "S. paratyphi A",
        "S. paratyphi B",
        "Typhi O",
        "Typhi H",
        "Paratyphi A",
        "Paratyphi B",
        "Widal",
    ]

    lines = [line.strip() for line in text.splitlines() if line.strip()]

    for line in lines:
        line_lower = line.lower()

        has_test_name = any(test.lower() in line_lower for test in possible_tests)
        has_result_word = any(
            word in line_lower
            for word in [
                "positive",
                "negative",
                "reactive",
                "non-reactive",
                "non reactive",
                "detected",
                "not detected",
            ]
        )
        has_titre = bool(re.search(r"\b1\s*:\s*\d+\b", line_lower))

        if has_test_name and (has_result_word or has_titre):
            value = line

            if "positive" in line_lower or "reactive" in line_lower or "detected" in line_lower:
                status = "ABNORMAL"
            elif "negative" in line_lower or "non-reactive" in line_lower or "not detected" in line_lower:
                status = "NORMAL"
            else:
                status = "UNKNOWN"

            results.append(
                {
                    "test": line.split(":")[0].strip() if ":" in line else "Widal / Serology Result",
                    "value": value,
                    "unit": "",
                    "normal_range": "",
                    "status": status,
                }
            )

    return results


def extract_lab_results_with_gemini(report_text: str):
    prompt = f"""
Extract ALL medical test/lab results from the following report text.

Return ONLY a valid JSON array.

Each item must use this exact structure:
[
  {{
    "test": "test name",
    "value": "result value",
    "unit": "unit if available, otherwise empty string",
    "normal_range": "normal/reference range if available, otherwise empty string",
    "status": "NORMAL | HIGH | LOW | ABNORMAL | UNKNOWN"
  }}
]

Important extraction rules:
- Extract numeric lab values such as Hemoglobin, WBC, Platelets, Glucose, Cholesterol, Creatinine, etc.
- Also extract qualitative results such as POSITIVE, NEGATIVE, REACTIVE, NON-REACTIVE, DETECTED, NOT DETECTED.
- Also extract Widal test results, including Salmonella typhi O, Salmonella typhi H, Salmonella paratyphi A, Salmonella paratyphi B.
- Also extract titre values like 1:20, 1:40, 1:80, 1:160, 1:320.
- Do NOT skip a test just because there is no numeric value.
- Do NOT skip a test just because there is no normal range.
- For positive/reactive/detected results, status should usually be ABNORMAL.
- For negative/non-reactive/not detected results, status should usually be NORMAL.
- For numeric values:
  - above range = HIGH
  - below range = LOW
  - inside range = NORMAL
  - cannot decide = UNKNOWN
- If the report contains no lab/test results, return [].
- Do not add markdown.
- Do not add explanations outside JSON.

Medical Report Text:
{report_text}
"""

    try:
        text = groq_chat(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a medical lab result extraction assistant. "
                        "Return only valid JSON. Extract both numeric and qualitative medical test results."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0,
            max_tokens=2500,
        )

        cleaned = _clean_json_response(text or "[]")
        parsed = json.loads(cleaned)

        normalized_results = _normalize_items(parsed)

        if normalized_results:
            return normalized_results

        return _fallback_extract_common_qualitative_tests(report_text)

    except Exception as e:
        print("Groq lab extraction error:", str(e))
        return _fallback_extract_common_qualitative_tests(report_text)


extract_lab_results = extract_lab_results_with_gemini
extract_labs_with_gemini = extract_lab_results_with_gemini
extract_labs_with_ai = extract_lab_results_with_gemini
extract_lab_values = extract_lab_results_with_gemini
extract_lab_values_with_gemini = extract_lab_results_with_gemini