from typing import List, Optional
from pydantic import BaseModel
from google import genai
from app.core.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)


class LabValueItem(BaseModel):
    test: str
    value: float
    unit: Optional[str] = None
    normal_range: Optional[str] = None
    status: str


class LabValueList(BaseModel):
    detected_values: List[LabValueItem]


def extract_lab_values_with_gemini(report_text: str) -> list:
    prompt = f"""
You are a medical lab value extraction assistant.

Extract lab test values from the following medical report text.

Rules:
- Return only actual lab test values found in the report.
- Ignore general narrative text, diagnosis notes, prescriptions, employment letters, and administrative text.
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
- If status cannot be confidently determined, use NORMAL only when explicitly supported by the report; otherwise do not include that item.

Medical Report Text:
{report_text}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": LabValueList,
        },
    )

    parsed = response.parsed
    if not parsed:
        return []

    return [
        {
            "test": item.test,
            "value": item.value,
            "unit": item.unit,
            "normal_range": item.normal_range,
            "status": item.status
        }
        for item in parsed.detected_values
    ]