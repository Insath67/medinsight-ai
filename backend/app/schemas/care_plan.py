from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class CarePlanCreate(BaseModel):
    medicines: Optional[str] = None
    dosage: Optional[str] = None
    instructions: Optional[str] = None
    follow_up_advice: Optional[str] = None


class CarePlanStatusUpdate(BaseModel):
    status: str


class CarePlanResponse(BaseModel):
    id: UUID
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    medicines: Optional[str] = None
    dosage: Optional[str] = None
    instructions: Optional[str] = None
    follow_up_advice: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True