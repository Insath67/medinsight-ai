from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.notification import NotificationCreate
from app.services.notification_service import (
    create_notification,
    get_user_notifications,
    mark_notification_as_read
)
from app.utils.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("/create")
def create_new_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db)
):
    notification = create_notification(
        db=db,
        user_id=payload.user_id,
        title=payload.title,
        message=payload.message,
        type=payload.type
    )

    return {
        "id": str(notification.id),
        "user_id": str(notification.user_id),
        "title": notification.title,
        "message": notification.message,
        "type": notification.type,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat() if notification.created_at else None,
    }


@router.get("/my")
def get_my_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifications = get_user_notifications(db, current_user.id)

    return [
        {
            "id": str(notification.id),
            "user_id": str(notification.user_id),
            "title": notification.title,
            "message": notification.message,
            "type": notification.type,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat() if notification.created_at else None,
        }
        for notification in notifications
    ]


@router.put("/read/{notification_id}")
def mark_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification = mark_notification_as_read(db, notification_id, current_user.id)

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {
        "id": str(notification.id),
        "user_id": str(notification.user_id),
        "title": notification.title,
        "message": notification.message,
        "type": notification.type,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat() if notification.created_at else None,
    }