from sqlalchemy.orm import Session
from app.models.reminder import Reminder


def create_reminder(
    db: Session,
    user_id,
    title: str,
    message: str | None,
    reminder_type: str,
    due_at
):
    reminder = Reminder(
        user_id=user_id,
        title=title,
        message=message,
        reminder_type=reminder_type,
        due_at=due_at
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


def get_user_reminders(db: Session, user_id):
    return (
        db.query(Reminder)
        .filter(Reminder.user_id == user_id)
        .order_by(Reminder.due_at.asc())
        .all()
    )


def complete_reminder(db: Session, reminder_id, user_id):
    reminder = (
        db.query(Reminder)
        .filter(
            Reminder.id == reminder_id,
            Reminder.user_id == user_id
        )
        .first()
    )

    if not reminder:
        return None

    reminder.is_completed = True
    db.commit()
    db.refresh(reminder)
    return reminder