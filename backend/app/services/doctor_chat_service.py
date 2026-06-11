import os
from openai import OpenAI


AI_API_KEY = os.getenv("AI_API_KEY") or os.getenv("GROQ_API_KEY")
AI_BASE_URL = os.getenv("AI_BASE_URL", "https://api.groq.com/openai/v1")
AI_MODEL = os.getenv("AI_MODEL", "llama-3.3-70b-versatile")


def doctor_chat_response(question: str, patient_context: str = "") -> str:
    prompt = f"""
You are MedInsight AI assistant for doctors.

Help the doctor understand patient reports and lab history.

Important rules:
- Do not replace a qualified doctor's clinical judgment.
- Do not give unsafe or overconfident conclusions.
- Do not prescribe medicine.
- Summarize clearly.
- Mention possible points to review, not final diagnosis.
- Keep the answer professional and concise.

Patient Context:
{patient_context}

Doctor Question:
{question}
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
                        "You are MedInsight AI, a safe clinical information assistant "
                        "for doctors. Provide educational and clinical-support information only. "
                        "Do not replace professional medical judgment."
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
        print("Groq doctor chat error:", str(e))
        return (
            "AI doctor chat service is currently unavailable. "
            "Please try again later."
        )


# Aliases to avoid route import errors
ask_doctor_ai = doctor_chat_response
ask_doctor_chat = doctor_chat_response
generate_doctor_chat_response = doctor_chat_response
generate_doctor_response = doctor_chat_response
get_doctor_ai_response = doctor_chat_response
ask_doctor = doctor_chat_response
generate_doctor_chat_answer = doctor_chat_response