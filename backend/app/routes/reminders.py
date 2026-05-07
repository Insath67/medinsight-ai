from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.models.user import User
from app.schemas.reminder import ReminderCreate, ReminderResponse
from app.services.reminder_service import (
    create_reminder,
    get_user_reminders,
    complete_reminder
)
from app.utils.security import get_current_user

router = APIRouter(prefix="/reminders", tags=["Reminders"])


@router.post("/", response_model=ReminderResponse)
def create_my_reminder(
    payload: ReminderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = create_reminder(
        db=db,
        user_id=current_user.id,
        title=payload.title,
        message=payload.message,
        reminder_type=payload.reminder_type,
        due_at=payload.due_at
    )
    return reminder


@router.get("/my", response_model=list[ReminderResponse])
def get_my_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_user_reminders(db, current_user.id)


@router.put("/{reminder_id}/complete", response_model=ReminderResponse)
def mark_reminder_completed(
    reminder_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = complete_reminder(db, reminder_id, current_user.id)

    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    return reminder