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
        model = genai.GenerativeModel("gemini-1.5-flash")

        response = model.generate_content(prompt)

        return (response.text or "").strip()

    except Exception as e:
        print("Doctor chat Gemini error:", str(e))
        return (
            "Sorry, I could not generate an AI response right now. "
            "Please try again later or consult a qualified doctor for medical advice."
        )