from pydantic import BaseModel
from typing import Optional

class DoctorNoteCreate(BaseModel):
    notes: Optional[str] = None
    recommendations: Optional[str] = None
    follow_up: Optional[str] = None