from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional


class LabTestResultResponse(BaseModel):
    id: UUID
    report_id: UUID
    patient_id: UUID
    test_name: str
    test_value: float
    normal_range: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True