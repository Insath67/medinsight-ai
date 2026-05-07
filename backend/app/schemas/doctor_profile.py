from pydantic import BaseModel
from typing import Optional

class DoctorProfileCreate(BaseModel):
    specialization: str
    hospital_name: Optional[str] = None
    qualification: Optional[str] = None
    license_number: str
    experience_years: Optional[int] = None
    bio: Optional[str] = None

class DoctorProfileResponse(BaseModel):
    id: str
    user_id: str
    specialization: str
    hospital_name: Optional[str] = None
    qualification: Optional[str] = None
    license_number: str
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    approval_status: str

    class Config:
        from_attributes = True