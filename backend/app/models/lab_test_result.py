import uuid
from sqlalchemy import Column, String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class LabTestResult(Base):
    __tablename__ = "lab_test_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(UUID(as_uuid=True), ForeignKey("medical_reports.id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    test_name = Column(String(100), nullable=False)
    test_value = Column(String, nullable=False)
    normal_range = Column(String(100), nullable=True)
    status = Column(String(20), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())