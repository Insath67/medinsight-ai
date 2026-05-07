from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.core.database import get_db
from app.models.user import User
from app.models.medical_report import MedicalReport
from app.models.consultation import Consultation
from app.models.notification import Notification
from app.models.lab_test_result import LabTestResult
from app.models.doctor_profile import DoctorProfile
from app.utils.security import get_current_user

router = APIRouter(prefix="/search", tags=["Search"])


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return current_user


@router.get("/reports")
def search_reports(
    q: str | None = Query(None),
    report_type: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    sort_by: str = Query("uploaded_at"),
    sort_order: str = Query("desc"),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")

    query = db.query(MedicalReport).filter(
        MedicalReport.patient_id == current_user.id
    )

    if q:
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                MedicalReport.file_name.ilike(search_term),
                MedicalReport.report_type.ilike(search_term)
            )
        )

    if report_type:
        query = query.filter(
            func.lower(MedicalReport.report_type) == report_type.strip().lower()
        )

    if date_from:
        query = query.filter(MedicalReport.uploaded_at >= date_from)

    if date_to:
        query = query.filter(MedicalReport.uploaded_at <= date_to)

    sort_column = MedicalReport.uploaded_at
    if sort_by == "file_name":
        sort_column = MedicalReport.file_name
    elif sort_by == "report_type":
        sort_column = MedicalReport.report_type

    if sort_order.lower() == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    total = query.count()
    reports = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "results": [
            {
                "id": str(item.id),
                "file_name": item.file_name,
                "report_type": item.report_type,
                "uploaded_at": item.uploaded_at
            }
            for item in reports
        ]
    }


@router.get("/consultations")
def search_consultations(
    status: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    sort_order: str = Query("desc"),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["patient", "doctor"]:
        raise HTTPException(status_code=403, detail="Access denied")

    query = db.query(Consultation)

    if current_user.role == "patient":
        query = query.filter(Consultation.patient_id == current_user.id)
    elif current_user.role == "doctor":
        query = query.filter(Consultation.doctor_id == current_user.id)

    if status:
        query = query.filter(
            func.lower(Consultation.status) == status.strip().lower()
        )

    if date_from:
        query = query.filter(Consultation.created_at >= date_from)

    if date_to:
        query = query.filter(Consultation.created_at <= date_to)

    if sort_order.lower() == "asc":
        query = query.order_by(Consultation.created_at.asc())
    else:
        query = query.order_by(Consultation.created_at.desc())

    total = query.count()
    consultations = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "results": [
            {
                "id": str(item.id),
                "patient_id": str(item.patient_id),
                "doctor_id": str(item.doctor_id) if item.doctor_id else None,
                "report_id": str(item.report_id) if item.report_id else None,
                "patient_message": item.patient_message,
                "status": item.status,
                "created_at": item.created_at
            }
            for item in consultations
        ]
    }


@router.get("/notifications")
def search_notifications(
    notification_type: str | None = Query(None),
    is_read: bool | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    sort_order: str = Query("desc"),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Notification).filter(
        Notification.user_id == current_user.id
    )

    if notification_type:
        query = query.filter(
            func.lower(Notification.type) == notification_type.strip().lower()
        )

    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)

    if date_from:
        query = query.filter(Notification.created_at >= date_from)

    if date_to:
        query = query.filter(Notification.created_at <= date_to)

    if sort_order.lower() == "asc":
        query = query.order_by(Notification.created_at.asc())
    else:
        query = query.order_by(Notification.created_at.desc())

    total = query.count()
    notifications = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "results": [
            {
                "id": str(item.id),
                "title": item.title,
                "message": item.message,
                "type": item.type,
                "is_read": item.is_read,
                "created_at": item.created_at
            }
            for item in notifications
        ]
    }


@router.get("/lab-results")
def search_lab_results(
    test_name: str | None = Query(None),
    status: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")

    query = db.query(LabTestResult).filter(
        LabTestResult.patient_id == current_user.id
    )

    if test_name:
        query = query.filter(
            LabTestResult.test_name.ilike(f"%{test_name.strip()}%")
        )

    if status:
        query = query.filter(
            func.lower(LabTestResult.status) == status.strip().lower()
        )

    if date_from:
        query = query.filter(LabTestResult.created_at >= date_from)

    if date_to:
        query = query.filter(LabTestResult.created_at <= date_to)

    sort_column = LabTestResult.created_at
    if sort_by == "test_name":
        sort_column = LabTestResult.test_name
    elif sort_by == "status":
        sort_column = LabTestResult.status

    if sort_order.lower() == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    total = query.count()
    results = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "results": [
            {
                "id": str(item.id),
                "report_id": str(item.report_id),
                "test_name": item.test_name,
                "test_value": item.test_value,
                "normal_range": item.normal_range,
                "status": item.status,
                "created_at": item.created_at
            }
            for item in results
        ]
    }


@router.get("/doctor-requests")
def search_doctor_requests(
    approval_status: str | None = Query(None),
    q: str | None = Query(None),
    sort_order: str = Query("desc"),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(DoctorProfile)

    if approval_status:
        query = query.filter(
            func.lower(DoctorProfile.approval_status) == approval_status.strip().lower()
        )

    if q:
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                DoctorProfile.specialization.ilike(search_term),
                DoctorProfile.hospital_name.ilike(search_term),
                DoctorProfile.qualification.ilike(search_term),
                DoctorProfile.license_number.ilike(search_term)
            )
        )

    if sort_order.lower() == "asc":
        query = query.order_by(DoctorProfile.created_at.asc())
    else:
        query = query.order_by(DoctorProfile.created_at.desc())

    total = query.count()
    requests = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "results": [
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
    }