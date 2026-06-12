from app.services.groq_client import groq_chat


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
        return groq_chat(
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
        ).strip()

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