from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.consultation import Consultation
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.services.notification_service import create_notification
from app.services.audit_log_service import create_audit_log
from app.utils.security import get_current_user

router = APIRouter(prefix="/feedback", tags=["Feedback"])


def require_patient_feedback(current_user: User = Depends(get_current_user)):
    if str(current_user.role).lower() != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")

    if str(current_user.account_status).lower() != "active":
        raise HTTPException(status_code=403, detail="Patient account is not active")

    return current_user


def require_doctor_feedback(current_user: User = Depends(get_current_user)):
    if str(current_user.role).lower() != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access only")

    if str(current_user.account_status).lower() != "active":
        raise HTTPException(status_code=403, detail="Doctor account is not active")

    return current_user


@router.post("/{consultation_id}", response_model=FeedbackResponse)
def create_feedback(
    consultation_id: str,
    payload: FeedbackCreate,
    current_user: User = Depends(require_patient_feedback),
    db: Session = Depends(get_db),
):
    consultation = (
        db.query(Consultation)
        .filter(
            Consultation.id == consultation_id,
            Consultation.patient_id == current_user.id,
        )
        .first()
    )

    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    if str(consultation.status).lower() != "completed":
        raise HTTPException(
            status_code=400,
            detail="Feedback can only be submitted for completed consultations",
        )

    if not consultation.doctor_id:
        raise HTTPException(
            status_code=400,
            detail="Consultation has no assigned doctor",
        )

    existing_feedback = (
        db.query(Feedback)
        .filter(Feedback.consultation_id == consultation.id)
        .first()
    )

    if existing_feedback:
        raise HTTPException(
            status_code=400,
            detail="Feedback already submitted for this consultation",
        )

    feedback = Feedback(
        consultation_id=consultation.id,
        patient_id=current_user.id,
        doctor_id=consultation.doctor_id,
        rating=payload.rating,
        comment=payload.comment,
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    create_notification(
        db=db,
        user_id=consultation.doctor_id,
        title="New Patient Feedback",
        message="A patient has submitted feedback for a completed consultation.",
        type="feedback_submitted",
    )

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="FEEDBACK_CREATED",
        target_type="Feedback",
        target_id=str(feedback.id),
        description=f"Patient submitted feedback for consultation {consultation.id}",
    )

    return feedback


@router.get("/doctor/my-feedback")
def get_my_doctor_feedback(
    current_user: User = Depends(require_doctor_feedback),
    db: Session = Depends(get_db),
):
    feedback_list = (
        db.query(Feedback)
        .filter(Feedback.doctor_id == current_user.id)
        .order_by(Feedback.created_at.desc())
        .all()
    )

    average_rating = 0

    if feedback_list:
        average_rating = sum(item.rating for item in feedback_list) / len(feedback_list)

    return {
        "total_feedback": len(feedback_list),
        "average_rating": round(average_rating, 2) if feedback_list else 0,
        "feedback": [
            {
                "id": str(item.id),
                "consultation_id": str(item.consultation_id),
                "patient_id": str(item.patient_id),
                "doctor_id": str(item.doctor_id),
                "rating": item.rating,
                "comment": item.comment,
                "created_at": item.created_at,
            }
            for item in feedback_list
        ],
    }


@router.get("/{consultation_id}", response_model=FeedbackResponse)
def get_feedback_by_consultation(
    consultation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    consultation = (
        db.query(Consultation)
        .filter(Consultation.id == consultation_id)
        .first()
    )

    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    role = str(current_user.role).lower()

    allowed = False

    if role == "patient" and consultation.patient_id == current_user.id:
        allowed = True

    if role == "doctor" and consultation.doctor_id == current_user.id:
        allowed = True

    if role == "admin":
        allowed = True

    if not allowed:
        raise HTTPException(status_code=403, detail="Access denied")

    feedback = (
        db.query(Feedback)
        .filter(Feedback.consultation_id == consultation.id)
        .first()
    )

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    return feedback