import google.generativeai as genai

from app.core.config import GEMINI_API_KEY


genai.configure(api_key=GEMINI_API_KEY)


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

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")

        response = model.generate_content(prompt)

        return (response.text or "").strip()

    except Exception as e:
        print("Gemini analysis error:", str(e))
        return """
SUMMARY:
Unable to generate AI summary at the moment.

KEY_FINDINGS:
- AI analysis service is currently unavailable.
- Please try again later.

DOCTOR_QUESTIONS:
- Can you explain the main findings in this report?
- Are any values outside the normal range?
- Do I need any follow-up tests or consultation?
"""