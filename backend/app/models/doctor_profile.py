import uuid
from sqlalchemy import Column, String, Text, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    specialization = Column(String(100), nullable=False)
    hospital_name = Column(String(150), nullable=True)
    qualification = Column(String(150), nullable=True)
    license_number = Column(String(100), unique=True, nullable=False)
    experience_years = Column(Integer, nullable=True)
    bio = Column(Text, nullable=True)
    approval_status = Column(String(20), nullable=False, default="pending")
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())