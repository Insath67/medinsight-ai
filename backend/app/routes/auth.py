import os
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.doctor_profile import DoctorProfile
from app.models.user import User
from app.schemas.user import (
    ForgotPasswordRequest,
    ResendEmailVerificationRequest,
    ResetPasswordRequest,
    UserLogin,
    UserRegister,
    VerifyEmailRequest,
)
from app.services.email_service import (
    send_password_reset_email,
    send_registration_verification_email,
)
from app.utils.security import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Auth"])


def generate_otp():
    return f"{secrets.randbelow(1000000):06d}"


def create_email_verification_for_user(db_user: User, db: Session):
    otp = generate_otp()

    db_user.email_verification_otp_hash = hash_password(otp)
    db_user.email_verification_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db_user.email_verification_attempts = 0

    db.commit()

    try:
        send_registration_verification_email(
            to_email=db_user.email,
            full_name=db_user.full_name,
            otp=otp,
        )
    except Exception as error:
        db_user.email_verification_otp_hash = None
        db_user.email_verification_expires_at = None
        db_user.email_verification_attempts = 0
        db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to send verification email: {str(error)}",
        )


def check_account_status(db_user: User):
    if db_user.account_status == "email_pending":
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in.",
        )

    if db_user.account_status == "pending":
        raise HTTPException(
            status_code=403,
            detail="Your doctor account is pending admin approval.",
        )

    if db_user.account_status == "rejected":
        raise HTTPException(
            status_code=403,
            detail="Your account has been rejected. Please contact admin.",
        )

    if db_user.account_status == "disabled":
        raise HTTPException(
            status_code=403,
            detail="Your account has been disabled by admin. Please contact support.",
        )

    if db_user.account_status != "active":
        raise HTTPException(
            status_code=403,
            detail="Your account is not active. Please contact admin.",
        )


def create_user_token_response(db_user: User):
    access_token = create_access_token(
        data={
            "sub": db_user.email,
            "user_id": str(db_user.id),
            "role": db_user.role,
            "account_status": db_user.account_status,
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(db_user.id),
            "full_name": db_user.full_name,
            "email": db_user.email,
            "phone": db_user.phone,
            "role": db_user.role,
            "account_status": db_user.account_status,
            "email_verified": db_user.email_verified,
        },
    }


@router.post("/register")
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    role = user.role.lower().strip()

    if role not in ["patient", "doctor"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role. Only patient or doctor registration is allowed.",
        )

    if role == "doctor":
        if not user.specialization:
            raise HTTPException(
                status_code=400,
                detail="Specialization is required for doctor registration",
            )

        if not user.hospital_name:
            raise HTTPException(
                status_code=400,
                detail="Working hospital/clinic is required for doctor registration",
            )

        if not user.license_number:
            raise HTTPException(
                status_code=400,
                detail="Medical registration number is required for doctor registration",
            )

        existing_license = (
            db.query(DoctorProfile)
            .filter(DoctorProfile.license_number == user.license_number)
            .first()
        )

        if existing_license:
            raise HTTPException(
                status_code=400,
                detail="Medical registration number already exists",
            )

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password_hash=hash_password(user.password),
        phone=user.phone,
        role=role,
        account_status="email_pending",
        email_verified=False,
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        doctor_profile = None

        if role == "doctor":
            doctor_profile = DoctorProfile(
                user_id=new_user.id,
                specialization=user.specialization,
                hospital_name=user.hospital_name,
                qualification=user.qualification,
                license_number=user.license_number,
                experience_years=user.experience_years,
                bio=user.bio,
                approval_status="email_pending",
            )

            db.add(doctor_profile)
            db.commit()
            db.refresh(doctor_profile)

        create_email_verification_for_user(new_user, db)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Registration failed. Email or license number may already exist.",
        )

    if role == "doctor":
        return {
            "message": "Doctor registered successfully. Please verify your email. After email verification, your account will wait for admin approval.",
            "email_verification_required": True,
            "email": new_user.email,
            "user": {
                "id": str(new_user.id),
                "full_name": new_user.full_name,
                "email": new_user.email,
                "phone": new_user.phone,
                "role": new_user.role,
                "account_status": new_user.account_status,
                "email_verified": new_user.email_verified,
            },
            "doctor_profile": {
                "id": str(doctor_profile.id),
                "user_id": str(doctor_profile.user_id),
                "specialization": doctor_profile.specialization,
                "hospital_name": doctor_profile.hospital_name,
                "qualification": doctor_profile.qualification,
                "license_number": doctor_profile.license_number,
                "experience_years": doctor_profile.experience_years,
                "bio": doctor_profile.bio,
                "approval_status": doctor_profile.approval_status,
            },
        }

    return {
        "message": "Patient registered successfully. Please verify your email to activate your account.",
        "email_verification_required": True,
        "email": new_user.email,
        "user": {
            "id": str(new_user.id),
            "full_name": new_user.full_name,
            "email": new_user.email,
            "phone": new_user.phone,
            "role": new_user.role,
            "account_status": new_user.account_status,
            "email_verified": new_user.email_verified,
        },
    }


@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == payload.email).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if db_user.email_verified:
        return {
            "message": "Email already verified.",
            "role": db_user.role,
            "account_status": db_user.account_status,
            "email_verified": db_user.email_verified,
        }

    if not db_user.email_verification_otp_hash or not db_user.email_verification_expires_at:
        raise HTTPException(
            status_code=400,
            detail="No active verification code found. Please request a new code.",
        )

    if db_user.email_verification_expires_at < datetime.utcnow():
        db_user.email_verification_otp_hash = None
        db_user.email_verification_expires_at = None
        db_user.email_verification_attempts = 0
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Verification code expired. Please request a new code.",
        )

    if db_user.email_verification_attempts >= 5:
        db_user.email_verification_otp_hash = None
        db_user.email_verification_expires_at = None
        db_user.email_verification_attempts = 0
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Too many incorrect attempts. Please request a new code.",
        )

    if not verify_password(payload.otp, db_user.email_verification_otp_hash):
        db_user.email_verification_attempts += 1
        db.commit()

        raise HTTPException(status_code=401, detail="Invalid verification code.")

    db_user.email_verified = True
    db_user.email_verification_otp_hash = None
    db_user.email_verification_expires_at = None
    db_user.email_verification_attempts = 0

    if db_user.role == "doctor":
        db_user.account_status = "pending"

        doctor_profile = (
            db.query(DoctorProfile)
            .filter(DoctorProfile.user_id == db_user.id)
            .first()
        )

        if doctor_profile:
            doctor_profile.approval_status = "pending"
    else:
        db_user.account_status = "active"

    db.commit()
    db.refresh(db_user)

    return {
        "message": (
            "Email verified successfully. Your doctor account is now pending admin approval."
            if db_user.role == "doctor"
            else "Email verified successfully. You can now login."
        ),
        "role": db_user.role,
        "account_status": db_user.account_status,
        "email_verified": db_user.email_verified,
    }


@router.post("/resend-verification-code")
def resend_verification_code(
    payload: ResendEmailVerificationRequest,
    db: Session = Depends(get_db),
):
    db_user = db.query(User).filter(User.email == payload.email).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if db_user.email_verified:
        return {
            "message": "Email already verified. You can login.",
            "email_verified": True,
        }

    create_email_verification_for_user(db_user, db)

    return {
        "message": "New verification code sent to your email.",
        "email": db_user.email,
        "email_verification_required": True,
    }


@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")

    check_account_status(db_user)

    return create_user_token_response(db_user)


@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    db_user = db.query(User).filter(User.email == form_data.username).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(form_data.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")

    check_account_status(db_user)

    return create_user_token_response(db_user)


@router.get("/me")
def get_logged_in_user(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "account_status": current_user.account_status,
        "email_verified": current_user.email_verified,
    }


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == payload.email).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    db_user.reset_token = reset_token
    db_user.reset_token_expires_at = expires_at

    db.commit()

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"

    try:
        send_password_reset_email(
            to_email=db_user.email,
            full_name=db_user.full_name,
            reset_link=reset_link,
        )
    except Exception as error:
        db_user.reset_token = None
        db_user.reset_token_expires_at = None
        db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to send password reset email: {str(error)}",
        )

    return {
        "message": "Password reset link has been sent to your email."
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.reset_token == payload.token).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    if not db_user.reset_token_expires_at:
        raise HTTPException(status_code=400, detail="Reset token expiry missing")

    if db_user.reset_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token has expired")

    db_user.password_hash = hash_password(payload.new_password)
    db_user.reset_token = None
    db_user.reset_token_expires_at = None

    db.commit()

    return {"message": "Password reset successful"}