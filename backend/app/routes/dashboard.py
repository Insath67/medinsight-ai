from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.user import User
from app.models.medical_report import MedicalReport
from app.models.report_analysis import ReportAnalysis
from app.models.lab_test_result import LabTestResult
from app.models.consultation import Consultation
from app.models.consultation_message import ConsultationMessage
from app.models.doctor_profile import DoctorProfile
from app.utils.security import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return current_user


@router.get("/patient/summary")
def get_patient_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")

    total_reports = db.query(func.count(MedicalReport.id)).filter(
        MedicalReport.patient_id == current_user.id
    ).scalar()

    total_analyses = db.query(func.count(ReportAnalysis.id)).join(
        MedicalReport, ReportAnalysis.report_id == MedicalReport.id
    ).filter(
        MedicalReport.patient_id == current_user.id
    ).scalar()

    total_lab_results = db.query(func.count(LabTestResult.id)).filter(
        LabTestResult.patient_id == current_user.id
    ).scalar()

    active_consultations = db.query(func.count(Consultation.id)).filter(
        Consultation.patient_id == current_user.id,
        Consultation.status == "active"
    ).scalar()

    pending_consultations = db.query(func.count(Consultation.id)).filter(
        Consultation.patient_id == current_user.id,
        Consultation.status.in_(["pending", "pending_doctor_acceptance", "assigned"])
    ).scalar()

    completed_consultations = db.query(func.count(Consultation.id)).filter(
        Consultation.patient_id == current_user.id,
        Consultation.status == "completed"
    ).scalar()

    return {
        "total_reports": total_reports or 0,
        "total_analyses": total_analyses or 0,
        "total_lab_results": total_lab_results or 0,
        "active_consultations": active_consultations or 0,
        "pending_consultations": pending_consultations or 0,
        "completed_consultations": completed_consultations or 0
    }


@router.get("/patient/recent-reports")
def get_patient_recent_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")

    reports = db.query(MedicalReport).filter(
        MedicalReport.patient_id == current_user.id
    ).order_by(MedicalReport.uploaded_at.desc()).limit(5).all()

    return [
        {
            "id": str(report.id),
            "file_name": report.file_name,
            "report_type": report.report_type,
            "uploaded_at": report.uploaded_at
        }
        for report in reports
    ]


@router.get("/patient/recent-consultations")
def get_patient_recent_consultations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")

    consultations = db.query(Consultation).filter(
        Consultation.patient_id == current_user.id
    ).order_by(Consultation.created_at.desc()).limit(5).all()

    return [
        {
            "id": str(item.id),
            "doctor_id": str(item.doctor_id) if item.doctor_id else None,
            "report_id": str(item.report_id) if item.report_id else None,
            "patient_message": item.patient_message,
            "status": item.status,
            "created_at": item.created_at
        }
        for item in consultations
    ]


@router.get("/doctor/summary")
def get_doctor_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access only")

    total_assigned_consultations = db.query(func.count(Consultation.id)).filter(
        Consultation.doctor_id == current_user.id
    ).scalar()

    active_consultations = db.query(func.count(Consultation.id)).filter(
        Consultation.doctor_id == current_user.id,
        Consultation.status == "active"
    ).scalar()

    pending_consultations = db.query(func.count(Consultation.id)).filter(
        Consultation.doctor_id == current_user.id,
        Consultation.status.in_(["pending", "pending_doctor_acceptance", "assigned"])
    ).scalar()

    completed_consultations = db.query(func.count(Consultation.id)).filter(
        Consultation.doctor_id == current_user.id,
        Consultation.status == "completed"
    ).scalar()

    total_messages_sent = db.query(func.count(ConsultationMessage.id)).filter(
        ConsultationMessage.sender_id == current_user.id
    ).scalar()

    return {
        "total_assigned_consultations": total_assigned_consultations or 0,
        "active_consultations": active_consultations or 0,
        "pending_consultations": pending_consultations or 0,
        "completed_consultations": completed_consultations or 0,
        "total_messages_sent": total_messages_sent or 0
    }


@router.get("/doctor/recent-consultations")
def get_doctor_recent_consultations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access only")

    consultations = db.query(Consultation).filter(
        Consultation.doctor_id == current_user.id
    ).order_by(Consultation.created_at.desc()).limit(5).all()

    return [
        {
            "id": str(item.id),
            "patient_id": str(item.patient_id),
            "report_id": str(item.report_id) if item.report_id else None,
            "patient_message": item.patient_message,
            "status": item.status,
            "created_at": item.created_at
        }
        for item in consultations
    ]


@router.get("/doctor/recent-messages")
def get_doctor_recent_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access only")

    messages = db.query(ConsultationMessage).filter(
        ConsultationMessage.sender_id == current_user.id
    ).order_by(ConsultationMessage.created_at.desc()).limit(5).all()

    return [
        {
            "id": str(item.id),
            "consultation_id": str(item.consultation_id),
            "sender_id": str(item.sender_id),
            "message_text": item.message_text,
            "created_at": item.created_at
        }
        for item in messages
    ]


@router.get("/admin/summary")
def get_admin_dashboard_summary(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_patients = db.query(func.count(User.id)).filter(
        User.role == "patient"
    ).scalar()

    total_doctors = db.query(func.count(User.id)).filter(
        User.role == "doctor"
    ).scalar()

    pending_doctor_approvals = db.query(func.count(DoctorProfile.id)).filter(
        DoctorProfile.approval_status == "pending"
    ).scalar()

    approved_doctors = db.query(func.count(DoctorProfile.id)).filter(
        DoctorProfile.approval_status == "approved"
    ).scalar()

    rejected_doctors = db.query(func.count(DoctorProfile.id)).filter(
        DoctorProfile.approval_status == "rejected"
    ).scalar()

    total_reports = db.query(func.count(MedicalReport.id)).scalar()

    active_consultations = db.query(func.count(Consultation.id)).filter(
        Consultation.status == "active"
    ).scalar()

    return {
        "totals": {
            "patients": total_patients or 0,
            "doctors": total_doctors or 0,
            "pending_doctor_approvals": pending_doctor_approvals or 0,
            "approved_doctors": approved_doctors or 0,
            "rejected_doctors": rejected_doctors or 0,
            "reports": total_reports or 0,
            "active_consultations": active_consultations or 0
        }
    }


@router.get("/admin/recent-doctor-requests")
def get_recent_doctor_requests(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    requests = db.query(DoctorProfile).filter(
        DoctorProfile.approval_status == "pending"
    ).order_by(DoctorProfile.created_at.desc()).limit(5).all()

    return [
        {
            "id": str(item.id),
            "user_id": str(item.user_id),
            "specialization": item.specialization,
            "hospital_name": item.hospital_name,
            "qualification": item.qualification,
            "license_number": item.license_number,
            "approval_status": item.approval_status,
            "created_at": item.created_at
        }
        for item in requests
    ]


@router.get("/admin/recent-reports")
def get_recent_reports_for_admin(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    reports = db.query(MedicalReport).order_by(
        MedicalReport.uploaded_at.desc()
    ).limit(5).all()

    return [
        {
            "id": str(item.id),
            "patient_id": str(item.patient_id),
            "file_name": item.file_name,
            "report_type": item.report_type,
            "uploaded_at": item.uploaded_at
        }
        for item in reports
    ]

@router.get("/admin/doctor-workload")
def get_doctor_workload_distribution(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    rows = (
        db.query(
            Consultation.doctor_id,
            func.count(Consultation.id).label("total_consultations")
        )
        .filter(Consultation.doctor_id.isnot(None))
        .group_by(Consultation.doctor_id)
        .order_by(func.count(Consultation.id).desc())
        .all()
    )

    return [
        {
            "doctor_id": str(item.doctor_id),
            "total_consultations": item.total_consultations
        }
        for item in rows
    ]

@router.get("/admin/daily-activity")
def get_daily_platform_activity(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    report_rows = (
        db.query(
            func.date(MedicalReport.uploaded_at).label("date"),
            func.count(MedicalReport.id).label("report_count")
        )
        .group_by(func.date(MedicalReport.uploaded_at))
        .all()
    )

    consultation_rows = (
        db.query(
            func.date(Consultation.created_at).label("date"),
            func.count(Consultation.id).label("consultation_count")
        )
        .group_by(func.date(Consultation.created_at))
        .all()
    )

    activity_map = {}

    for row in report_rows:
        date_key = str(row.date)
        if date_key not in activity_map:
            activity_map[date_key] = {
                "date": date_key,
                "report_count": 0,
                "consultation_count": 0
            }
        activity_map[date_key]["report_count"] = row.report_count

    for row in consultation_rows:
        date_key = str(row.date)
        if date_key not in activity_map:
            activity_map[date_key] = {
                "date": date_key,
                "report_count": 0,
                "consultation_count": 0
            }
        activity_map[date_key]["consultation_count"] = row.consultation_count

    return sorted(activity_map.values(), key=lambda x: x["date"], reverse=True)

@router.get("/admin/top-active-patients")
def get_top_active_patients(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    rows = (
        db.query(
            MedicalReport.patient_id,
            func.count(MedicalReport.id).label("total_reports")
        )
        .group_by(MedicalReport.patient_id)
        .order_by(func.count(MedicalReport.id).desc())
        .limit(10)
        .all()
    )

    return [
        {
            "patient_id": str(item.patient_id),
            "total_reports": item.total_reports
        }
        for item in rows
    ]

@router.get("/admin/top-active-doctors")
def get_top_active_doctors(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    rows = (
        db.query(
            Consultation.doctor_id,
            func.count(Consultation.id).label("total_consultations")
        )
        .filter(Consultation.doctor_id.isnot(None))
        .group_by(Consultation.doctor_id)
        .order_by(func.count(Consultation.id).desc())
        .limit(10)
        .all()
    )

    return [
        {
            "doctor_id": str(item.doctor_id),
            "total_consultations": item.total_consultations
        }
        for item in rows
    ]

@router.get("/admin/report-type-distribution")
def get_report_type_distribution(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    rows = (
        db.query(
            MedicalReport.report_type,
            func.count(MedicalReport.id).label("count")
        )
        .group_by(MedicalReport.report_type)
        .order_by(func.count(MedicalReport.id).desc())
        .all()
    )

    return [
        {
            "report_type": item.report_type or "Unknown",
            "count": item.count
        }
        for item in rows
    ]