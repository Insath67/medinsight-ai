from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.core.database import Base


class CarePlan(Base):
    __tablename__ = "care_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    consultation_id = Column(UUID(as_uuid=True), ForeignKey("consultations.id"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    medicines = Column(Text, nullable=True)
    dosage = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    follow_up_advice = Column(Text, nullable=True)

    status = Column(String, default="active")   # active / completed / stopped
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    consultation = relationship("Consultation")