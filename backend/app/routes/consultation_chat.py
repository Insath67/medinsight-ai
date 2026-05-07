from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.consultation import Consultation
from app.models.consultation_message import ConsultationMessage
from app.schemas.consultation_message import ConsultationMessageCreate
from app.utils.security import get_current_user
from app.models.doctor_profile import DoctorProfile
from app.services.notification_service import create_notification

router = APIRouter(prefix="/consultations", tags=["Consultation Chat"])


@router.post("/{consultation_id}/messages")
def send_consultation_message(
    consultation_id: str,
    message_data: ConsultationMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = ...

    if not consultation:
        ...

    if consultation.status != "active":
        ...

    allowed = False

    if current_user.role == "patient" and consultation.patient_id == current_user.id:
        allowed = True

    if current_user.role == "doctor" and consultation.doctor_id == current_user.id:
        doctor_profile = ...
        if not doctor_profile:
            ...
        allowed = True

    if not allowed:
        ...

    new_message = ConsultationMessage(
        consultation_id=consultation.id,
        sender_id=current_user.id,
        message_text=message_data.message_text
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    receiver_id = None

    if current_user.role == "patient":
        receiver_id = consultation.doctor_id
    elif current_user.role == "doctor":
        receiver_id = consultation.patient_id

    if receiver_id:
        create_notification(
            db=db,
            user_id=receiver_id,
            title="New Chat Message",
            message="You have received a new message in your consultation chat.",
            type="consultation_chat"
        )

    return {
        "message": "Consultation message sent successfully",
        "chat_message": {
            "id": str(new_message.id),
            "consultation_id": str(new_message.consultation_id),
            "sender_id": str(new_message.sender_id),
            "message_text": new_message.message_text,
            "created_at": new_message.created_at
        }
    }

@router.get("/{consultation_id}/messages")
def get_consultation_messages(
    consultation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()

    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    if consultation.status != "active":
        raise HTTPException(status_code=403, detail="Messages can be viewed only for active consultations")

    allowed = False

    if current_user.role == "patient" and consultation.patient_id == current_user.id:
        allowed = True

    if current_user.role == "doctor" and consultation.doctor_id == current_user.id:
        allowed = True

    if not allowed:
        raise HTTPException(status_code=403, detail="You are not allowed to view messages in this consultation")

    messages = db.query(ConsultationMessage).filter(
        ConsultationMessage.consultation_id == consultation.id
    ).order_by(ConsultationMessage.created_at.asc()).all() 
    
    return {
        "consultation_id": consultation_id,
        "messages": [
            {
                "id": str(item.id),
                "consultation_id": str(item.consultation_id),
                "sender_id": str(item.sender_id),
                "message_text": item.message_text,
                "created_at": item.created_at
            }
            for item in messages
        ]
    }