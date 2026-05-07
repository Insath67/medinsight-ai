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
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")

    lab_results = db.query(LabTestResult).filter(
        LabTestResult.patient_id == current_user.id
    ).order_by(LabTestResult.created_at.asc()).all()

    if not lab_results:
        raise HTTPException(status_code=404, detail="No lab history found for this patient")

    lab_history_lines = []
    for item in lab_results:
        lab_history_lines.append(
            f"Test: {item.test_name}, Value: {item.test_value}, Range: {item.normal_range}, Status: {item.status}, Date: {item.created_at.strftime('%Y-%m-%d')}"
        )

    lab_history_text = "\n".join(lab_history_lines)

    answer = generate_doctor_chat_answer(request.question, lab_history_text)

    new_chat = ChatMessage(
        patient_id=current_user.id,
        question=request.question,
        answer=answer
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    return {
        "question": request.question,
        "answer": answer
    }


@router.get("/history")
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")

    messages = db.query(ChatMessage).filter(
        ChatMessage.patient_id == current_user.id
    ).order_by(ChatMessage.created_at.desc()).all()

    return [
        {
            "id": str(item.id),
            "question": item.question,
            "answer": item.answer,
            "created_at": item.created_at
        }
        for item in messages
    ]