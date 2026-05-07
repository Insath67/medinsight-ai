import uuid
from sqlalchemy import Column, String, Text, TIMESTAMP, DateTime, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(String(20), nullable=False)
    account_status = Column(String(20), nullable=False, default="active")
    profile_image_url = Column(Text, nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    reset_token = Column(String, nullable=True)
    reset_token_expires_at = Column(DateTime, nullable=True)

    email_verified = Column(Boolean, nullable=False, default=False)
    email_verification_otp_hash = Column(Text, nullable=True)
    email_verification_expires_at = Column(DateTime, nullable=True)
    email_verification_attempts = Column(Integer, nullable=False, default=0)