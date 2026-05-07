from google import genai
from app.core.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)

def analyze_medical_report_text(report_text: str):
    prompt = f"""
You are a medical report explanation assistant.

Analyze the following medical report text and return your response in this exact format:

SUMMARY:
<short patient-friendly summary>

KEY_FINDINGS:
<important findings in simple bullet-style text>

DOCTOR_QUESTIONS:
<3 useful questions the patient can ask their doctor>

Important rules:
- Do NOT diagnose disease with certainty.
- Do NOT prescribe medicine.
- Use simple, patient-friendly language.
- Mention when values should be discussed with a doctor.
- Keep the response structured and concise.

Medical Report Text:
{report_text}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text