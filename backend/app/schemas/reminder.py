from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID


class ReminderCreate(BaseModel):
    title: str
    message: Optional[str] = None
    reminder_type: str
    due_at: datetime


class ReminderResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: Optional[str] = None
    reminder_type: str
    due_at: datetime
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True