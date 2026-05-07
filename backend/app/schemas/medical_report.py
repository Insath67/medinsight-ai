from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MedicalReportResponse(BaseModel):
    id: str
    patient_id: str
    file_name: str
    stored_file_name: str
    file_path: str
    report_type: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True