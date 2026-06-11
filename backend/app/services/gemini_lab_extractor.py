import os
import json
import re
from openai import OpenAI


AI_API_KEY = os.getenv("AI_API_KEY") or os.getenv("GROQ_API_KEY")
AI_BASE_URL = os.getenv("AI_BASE_URL", "https://api.groq.com/openai/v1")
AI_MODEL = os.getenv("AI_MODEL", "llama-3.3-70b-versatile")


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
    """
    Old function name kept so existing imports will not break.
    Now this uses Groq instead of Gemini.
    """

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
        if not AI_API_KEY:
            raise ValueError("AI_API_KEY is missing in .env file")

        client = OpenAI(
            api_key=AI_API_KEY,
            base_url=AI_BASE_URL,
        )

        response = client.chat.completions.create(
            model=AI_MODEL,
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

        text = response.choices[0].message.content or "[]"
        cleaned = _clean_json_response(text)

        return json.loads(cleaned)

    except Exception as e:
        print("Groq lab extraction error:", str(e))
        return []


# Aliases to avoid route import errors
extract_lab_results = extract_lab_results_with_gemini
extract_labs_with_gemini = extract_lab_results_with_gemini
extract_labs_with_ai = extract_lab_results_with_gemini
extract_lab_values = extract_lab_results_with_gemini
extract_lab_values_with_gemini = extract_lab_results_with_gemini