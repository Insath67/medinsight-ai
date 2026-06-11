import os
from openai import OpenAI


AI_API_KEY = os.getenv("AI_API_KEY") or os.getenv("GROQ_API_KEY")
AI_BASE_URL = os.getenv("AI_BASE_URL", "https://api.groq.com/openai/v1")
AI_MODEL = os.getenv("AI_MODEL", "llama-3.3-70b-versatile")


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
                    "content": (
                        "You are MedInsight AI, a safe medical report explanation assistant. "
                        "You explain medical reports in simple patient-friendly language. "
                        "You must not diagnose disease with certainty and must not prescribe medicine."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.2,
            max_tokens=1200,
        )

        return (response.choices[0].message.content or "").strip()

    except Exception as e:
        print("Groq analysis error:", str(e))
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