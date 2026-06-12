from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.lab_test_result import LabTestResult
from app.models.chat_message import ChatMessage
from app.schemas.chat import ChatQuestionRequest
from app.utils.security import get_current_user
from app.services.doctor_chat_service import generate_doctor_chat_answer


router = APIRouter(prefix="/chat", tags=["AI Doctor Chat"])


@router.post("/ask")
def ask_ai_doctor(
    request: ChatQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.lower() != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")

    question = request.question.strip()

    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    lab_results = (
        db.query(LabTestResult)
        .filter(LabTestResult.patient_id == current_user.id)
        .order_by(LabTestResult.created_at.asc())
        .all()
    )

    lab_history_lines = []

    for item in lab_results:
        created_date = (
            item.created_at.strftime("%Y-%m-%d")
            if item.created_at
            else "Unknown date"
        )

        lab_history_lines.append(
            f"Test: {item.test_name}, "
            f"Value: {item.test_value}, "
            f"Range: {item.normal_range}, "
            f"Status: {item.status}, "
            f"Date: {created_date}"
        )

    if lab_history_lines:
        patient_context = (
            "Patient lab history is available. Use it when relevant, but do not diagnose.\n\n"
            + "\n".join(lab_history_lines)
        )
    else:
        patient_context = (
            "No lab history is available for this patient yet. "
            "Answer the user's question as general medical guidance only. "
            "Do not diagnose, do not prescribe medicine, and advise consulting a qualified doctor when needed."
        )

    answer = generate_doctor_chat_answer(question, patient_context)

    new_chat = ChatMessage(
        patient_id=current_user.id,
        question=question,
        answer=answer,
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    return {
        "id": str(new_chat.id),
        "question": new_chat.question,
        "answer": new_chat.answer,
        "created_at": new_chat.created_at,
    }


@router.get("/history")
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.lower() != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.patient_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    return [
        {
            "id": str(item.id),
            "question": item.question,
            "answer": item.answer,
            "created_at": item.created_at,
        }
        for item in messages
    ]