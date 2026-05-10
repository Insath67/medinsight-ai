import google.generativeai as genai

from app.core.config import GEMINI_API_KEY


genai.configure(api_key=GEMINI_API_KEY)


def generate_doctor_chat_answer(question: str, lab_history_text: str):
    prompt = f"""
You are a patient-friendly AI medical assistant.

Use the patient's saved lab history below to answer the question.

Rules:
- Do NOT diagnose with certainty.
- Do NOT prescribe medicine.
- Explain in simple language.
- If something seems serious, advise the patient to consult a doctor.
- Be concise but helpful.

Patient Lab History:
{lab_history_text}

Patient Question:
{question}
"""

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")

        response = model.generate_content(prompt)

        return (response.text or "").strip()

    except Exception as e:
        error_message = str(e)
        print("Doctor chat Gemini error:", error_message)
        return f"AI service error: {error_message}"