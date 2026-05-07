from pydantic import BaseModel
from typing import Optional

class DoctorApprovalAction(BaseModel):
    rejection_reason: Optional[str] = None