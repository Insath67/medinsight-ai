from app.services.groq_client import groq_chat


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
        return groq_chat(
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
        ).strip()

    except Exception as e:
        print("Groq doctor chat error:", str(e))
        return (
            "AI doctor chat service is currently unavailable. "
            "Please try again later."
        )


ask_doctor_ai = doctor_chat_response
ask_doctor_chat = doctor_chat_response
generate_doctor_chat_response = doctor_chat_response
generate_doctor_response = doctor_chat_response
get_doctor_ai_response = doctor_chat_response
ask_doctor = doctor_chat_response
generate_doctor_chat_answer = doctor_chat_response