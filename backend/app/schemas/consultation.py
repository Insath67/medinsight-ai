from pydantic import BaseModel
from typing import Optional

class ConsultationRequestCreate(BaseModel):
    report_id: str
    doctor_user_id: str
    patient_message: Optional[str] = None

class ConsultationStatusUpdate(BaseModel):
    status: str