import json
import re
from typing import List, Optional

import google.generativeai as genai
from pydantic import BaseModel

from app.core.config import GEMINI_API_KEY


genai.configure(api_key=GEMINI_API_KEY)


class LabValueItem(BaseModel):
    test: str
    value: float
    unit: Optional[str] = None
    normal_range: Optional[str] = None
    status: str


class LabValueList(BaseModel):
    detected_values: List[LabValueItem]


def _extract_json_from_text(text: str) -> dict:
    """
    Gemini may sometimes return markdown JSON blocks.
    This helper safely extracts the JSON object.
    """
    if not text:
        return {"detected_values": []}

    cleaned = text.strip()

    cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(0)

    try:
        return json.loads(cleaned)
    except Exception:
        return {"detected_values": []}


def extract_lab_values_with_gemini(report_text: str) -> list:
    prompt = f"""
You are a medical lab value extraction assistant.

Extract lab test values from the following medical report text.

Return ONLY valid JSON in this exact structure:

{{
  "detected_values": [
    {{
      "test": "Hemoglobin",
      "value": 13.5,
      "unit": "g/dL",
      "normal_range": "13.0 - 17.0",
      "status": "NORMAL"
    }}
  ]
}}

Rules:
- Return only actual lab test values found in the report.
- Ignore general narrative text, diagnosis notes, prescriptions, employment letters, and administrative text.
- Do not include explanations.
- Do not include markdown.
- Do not wrap the JSON inside ```json.
- For each detected lab result, extract:
  - test
  - value
  - unit
  - normal_range
  - status

Status rules:
- Use HIGH if the value is above the visible reference range.
- Use LOW if the value is below the visible reference range.
- Use NORMAL if the value is within the visible reference range.
- If no range is visible but the report explicitly marks it high/low/normal, use that.
- If status cannot be confidently determined, do not include that item.

Medical Report Text:
{report_text}
"""

    try:
        model = genai.GenerativeModel("gemini-1.5-flash-8b")

        response = model.generate_content(
            prompt,
            generation_config={
                "response_mime_type": "application/json"
            },
        )

        data = _extract_json_from_text(response.text or "")
        parsed = LabValueList(**data)

        return [
            {
                "test": item.test,
                "value": item.value,
                "unit": item.unit,
                "normal_range": item.normal_range,
                "status": item.status,
            }
            for item in parsed.detected_values
        ]

    except Exception as e:
        print("Gemini lab extraction error:", str(e))
        return []