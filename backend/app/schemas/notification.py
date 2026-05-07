from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class NotificationCreate(BaseModel):
    user_id: UUID
    title: str
    message: str
    type: str


class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True