from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.doctor_profile import DoctorProfile
from app.schemas.admin import DoctorApprovalAction
from app.utils.security import get_current_user
from app.services.notification_service import create_notification
from app.services.audit_log_service import create_audit_log
import os
from app.models.medical_report import MedicalReport
from app.models.report_analysis import ReportAnalysis
from app.models.lab_test_result import LabTestResult

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return current_user


def format_doctor_profile(item: DoctorProfile, user: User | None = None):
    return {
        "id": str(item.id),
        "user_id": str(item.user_id),

        # User details
        "full_name": user.full_name if user else None,
        "email": user.email if user else None,
        "phone": user.phone if user else None,
        "account_status": user.account_status if user else None,

        # Doctor profile details
        "specialization": item.specialization,
        "hospital_name": item.hospital_name,
        "qualification": item.qualification,
        "license_number": item.license_number,
        "experience_years": item.experience_years,
        "bio": item.bio,
        "approval_status": item.approval_status,
        "rejection_reason": item.rejection_reason,
    }


@router.get("/doctors/pending")
def get_pending_doctors(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    doctors = (
        db.query(DoctorProfile, User)
        .join(User, DoctorProfile.user_id == User.id)
        .filter(DoctorProfile.approval_status == "pending")
        .order_by(DoctorProfile.created_at.desc())
        .all()
    )

    return [
        format_doctor_profile(doctor_profile, user)
        for doctor_profile, user in doctors
    ]


@router.get("/doctors/all")
def get_all_doctors(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    doctors = (
        db.query(DoctorProfile, User)
        .join(User, DoctorProfile.user_id == User.id)
        .order_by(DoctorProfile.created_at.desc())
        .all()
    )

    return [
        format_doctor_profile(doctor_profile, user)
        for doctor_profile, user in doctors
    ]


@router.put("/doctors/{doctor_profile_id}/approve")
def approve_doctor(
    doctor_profile_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    doctor_profile = (
        db.query(DoctorProfile)
        .filter(DoctorProfile.id == doctor_profile_id)
        .first()
    )

    if not doctor_profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    doctor_user = db.query(User).filter(User.id == doctor_profile.user_id).first()

    if not doctor_user:
        raise HTTPException(status_code=404, detail="Doctor user not found")

    doctor_profile.approval_status = "approved"
    doctor_profile.rejection_reason = None

    doctor_user.account_status = "active"

    db.commit()
    db.refresh(doctor_profile)
    db.refresh(doctor_user)

    create_notification(
        db=db,
        user_id=doctor_profile.user_id,
        title="Doctor Profile Approved",
        message="Your doctor profile has been approved by the admin.",
        type="doctor_approved"
    )

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="DOCTOR_APPROVED",
        target_type="DoctorProfile",
        target_id=str(doctor_profile.id),
        description=f"Admin approved doctor profile {doctor_profile.id}"
    )

    return {
        "message": "Doctor approved successfully",
        "doctor_profile": format_doctor_profile(doctor_profile, doctor_user)
    }


@router.put("/doctors/{doctor_profile_id}/reject")
def reject_doctor(
    doctor_profile_id: str,
    action_data: DoctorApprovalAction,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    doctor_profile = (
        db.query(DoctorProfile)
        .filter(DoctorProfile.id == doctor_profile_id)
        .first()
    )

    if not doctor_profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    doctor_user = db.query(User).filter(User.id == doctor_profile.user_id).first()

    if not doctor_user:
        raise HTTPException(status_code=404, detail="Doctor user not found")

    doctor_profile.approval_status = "rejected"
    doctor_profile.rejection_reason = action_data.rejection_reason

    doctor_user.account_status = "rejected"

    db.commit()
    db.refresh(doctor_profile)
    db.refresh(doctor_user)

    create_notification(
        db=db,
        user_id=doctor_profile.user_id,
        title="Doctor Profile Rejected",
        message="Your doctor profile has been rejected by the admin.",
        type="doctor_rejected"
    )

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="DOCTOR_REJECTED",
        target_type="DoctorProfile",
        target_id=str(doctor_profile.id),
        description=f"Admin rejected doctor profile {doctor_profile.id}"
    )

    return {
        "message": "Doctor rejected successfully",
        "doctor_profile": format_doctor_profile(doctor_profile, doctor_user)
    }

@router.get("/reports")
def get_all_reports_for_admin(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    reports = (
        db.query(MedicalReport, User)
        .join(User, MedicalReport.patient_id == User.id)
        .order_by(MedicalReport.uploaded_at.desc())
        .all()
    )

    return [
        {
            "id": str(report.id),
            "patient_id": str(report.patient_id),
            "patient_name": user.full_name,
            "patient_email": user.email,
            "file_name": report.file_name,
            "stored_file_name": report.stored_file_name,
            "file_path": report.file_path,
            "report_type": report.report_type,
            "uploaded_at": report.uploaded_at,
        }
        for report, user in reports
    ]


@router.delete("/reports/{report_id}")
def delete_report_by_admin(
    report_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id
    ).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    patient_id = report.patient_id
    file_name = report.file_name

    analysis = db.query(ReportAnalysis).filter(
        ReportAnalysis.report_id == report.id
    ).first()

    if analysis:
        db.delete(analysis)

    lab_results = db.query(LabTestResult).filter(
        LabTestResult.report_id == report.id
    ).all()

    for item in lab_results:
        db.delete(item)

    if report.file_path and os.path.exists(report.file_path):
        os.remove(report.file_path)

    db.delete(report)
    db.commit()

    create_notification(
        db=db,
        user_id=patient_id,
        title="Report Removed by Admin",
        message=f"Your uploaded report '{file_name}' was removed by admin.",
        type="report_removed"
    )

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="ADMIN_REPORT_DELETED",
        target_type="MedicalReport",
        target_id=report_id,
        description=f"Admin deleted patient report: {file_name}"
    )

    return {
        "message": "Report deleted successfully by admin"
    }

@router.get("/users")
def get_all_users_for_admin(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()

    results = []

    for user in users:
        doctor_profile = None

        if user.role.lower() == "doctor":
            doctor_profile = (
                db.query(DoctorProfile)
                .filter(DoctorProfile.user_id == user.id)
                .first()
            )

        results.append({
            "id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "account_status": user.account_status,
            "email_verified": user.email_verified,
            "profile_image_url": user.profile_image_url,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "doctor_profile": {
                "id": str(doctor_profile.id),
                "specialization": doctor_profile.specialization,
                "hospital_name": doctor_profile.hospital_name,
                "qualification": doctor_profile.qualification,
                "license_number": doctor_profile.license_number,
                "experience_years": doctor_profile.experience_years,
                "approval_status": doctor_profile.approval_status,
            } if doctor_profile else None
        })

    return results


@router.put("/users/{user_id}/disable")
def disable_user_account(
    user_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if target_user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot disable your own admin account"
        )

    target_user.account_status = "disabled"

    db.commit()
    db.refresh(target_user)

    create_notification(
        db=db,
        user_id=target_user.id,
        title="Account Disabled",
        message="Your account has been disabled by admin. Please contact support.",
        type="account_disabled"
    )

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="USER_ACCOUNT_DISABLED",
        target_type="User",
        target_id=str(target_user.id),
        description=f"Admin disabled user account: {target_user.email}"
    )

    return {
        "message": "User account disabled successfully",
        "user": {
            "id": str(target_user.id),
            "full_name": target_user.full_name,
            "email": target_user.email,
            "role": target_user.role,
            "account_status": target_user.account_status
        }
    }


@router.put("/users/{user_id}/enable")
def enable_user_account(
    user_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    role = target_user.role.lower()

    if not target_user.email_verified:
        target_user.account_status = "email_pending"
    elif role == "doctor":
        doctor_profile = (
            db.query(DoctorProfile)
            .filter(DoctorProfile.user_id == target_user.id)
            .first()
        )

        if doctor_profile:
            doctor_profile.approval_status = "approved"
            doctor_profile.rejection_reason = None

        target_user.account_status = "active"
    else:
        target_user.account_status = "active"

    db.commit()
    db.refresh(target_user)

    create_notification(
        db=db,
        user_id=target_user.id,
        title="Account Reactivated",
        message="Your account has been reactivated by admin.",
        type="account_reactivated"
    )

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="USER_ACCOUNT_REACTIVATED",
        target_type="User",
        target_id=str(target_user.id),
        description=f"Admin reactivated user account: {target_user.email}"
    )

    return {
        "message": "User account reactivated successfully",
        "user": {
            "id": str(target_user.id),
            "full_name": target_user.full_name,
            "email": target_user.email,
            "role": target_user.role,
            "account_status": target_user.account_status,
            "email_verified": target_user.email_verified
        }
    }