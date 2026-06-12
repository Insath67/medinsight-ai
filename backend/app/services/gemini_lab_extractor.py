import json
import re

from app.services.groq_client import groq_chat


def _clean_json_response(text: str) -> str:
    text = text.strip()

    if text.startswith("```"):
        text = re.sub(r"^```json", "", text, flags=re.IGNORECASE).strip()
        text = re.sub(r"^```", "", text).strip()
        text = re.sub(r"```$", "", text).strip()

    match = re.search(r"\[.*\]|\{.*\}", text, re.DOTALL)
    if match:
        return match.group(0)

    return text


def extract_lab_results_with_gemini(report_text: str):
    prompt = f"""
Extract lab test results from the following medical report text.

Return ONLY valid JSON array.

Each item must use this structure:
[
  {{
    "test": "test name",
    "value": "value",
    "unit": "unit if available",
    "normal_range": "normal/reference range if available",
    "status": "NORMAL | HIGH | LOW | ABNORMAL | UNKNOWN"
  }}
]

Rules:
- If the value is above the reference range, status must be HIGH.
- If the value is below the reference range, status must be LOW.
- If the value is inside the reference range, status must be NORMAL.
- If you cannot decide, use UNKNOWN.
- Do not add markdown.
- Do not add explanation outside JSON.

Medical Report Text:
{report_text}
"""

    try:
        text = groq_chat(
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical lab result extraction assistant. Return only valid JSON.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0,
            max_tokens=2000,
        )

        cleaned = _clean_json_response(text or "[]")
        return json.loads(cleaned)

    except Exception as e:
        print("Groq lab extraction error:", str(e))
        return []


extract_lab_results = extract_lab_results_with_gemini
extract_labs_with_gemini = extract_lab_results_with_gemini
extract_labs_with_ai = extract_lab_results_with_gemini
extract_lab_values = extract_lab_results_with_gemini
extract_lab_values_with_gemini = extract_lab_results_with_gemini