from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.medical_report import MedicalReport
from app.models.consultation import Consultation
from app.models.doctor_profile import DoctorProfile
from app.schemas.consultation import ConsultationRequestCreate, ConsultationStatusUpdate
from app.services.notification_service import create_notification
from app.services.audit_log_service import create_audit_log
from app.utils.security import get_current_user

router = APIRouter(prefix="/consultations", tags=["Consultations"])


def is_patient(user: User):
    return str(user.role).lower() == "patient"


def is_doctor(user: User):
    return str(user.role).lower() == "doctor"


def get_user_name(user: User | None):
    if not user:
        return "Unknown User"

    return (
        getattr(user, "full_name", None)
        or getattr(user, "name", None)
        or getattr(user, "email", "Unknown User")
    )


def get_report_name(report: MedicalReport | None):
    if not report:
        return "Unknown Report"

    return (
        getattr(report, "file_name", None)
        or getattr(report, "filename", None)
        or "Unknown Report"
    )


def serialize_consultation(item: Consultation, db: Session):
    patient = db.query(User).filter(User.id == item.patient_id).first()
    doctor = db.query(User).filter(User.id == item.doctor_id).first() if item.doctor_id else None
    report = db.query(MedicalReport).filter(MedicalReport.id == item.report_id).first()

    return {
        "id": str(item.id),
        "patient_id": str(item.patient_id),
        "patient_name": get_user_name(patient),
        "doctor_id": str(item.doctor_id) if item.doctor_id else None,
        "doctor_name": get_user_name(doctor) if doctor else None,
        "report_id": str(item.report_id),
        "report_name": get_report_name(report),
        "patient_message": item.patient_message,
        "status": item.status,
        "created_at": item.created_at,
    }


@router.post("/request")
def request_consultation(
    request_data: ConsultationRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not is_patient(current_user):
        raise HTTPException(status_code=403, detail="Patient access only")

    report = db.query(MedicalReport).filter(
        MedicalReport.id == request_data.report_id,
        MedicalReport.patient_id == current_user.id
    ).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    doctor = db.query(User).filter(
        User.id == request_data.doctor_user_id
    ).first()

    if not doctor or not is_doctor(doctor):
        raise HTTPException(status_code=404, detail="Doctor user not found")

    doctor_profile = db.query(DoctorProfile).filter(
        DoctorProfile.user_id == doctor.id
    ).first()

    if doctor_profile and str(doctor_profile.approval_status).lower() not in ["approved", "active"]:
        raise HTTPException(
            status_code=403,
            detail="Only approved doctors can receive consultation requests"
        )

    existing_consultation = db.query(Consultation).filter(
        Consultation.patient_id == current_user.id,
        Consultation.doctor_id == doctor.id,
        Consultation.report_id == report.id,
        Consultation.status.in_(["pending_doctor_acceptance", "assigned", "active"])
    ).first()

    if existing_consultation:
        return {
            "message": "Consultation request already exists for this report and doctor",
            "consultation": serialize_consultation(existing_consultation, db)
        }

    new_consultation = Consultation(
        patient_id=current_user.id,
        doctor_id=doctor.id,
        report_id=report.id,
        patient_message=request_data.patient_message,
        status="pending_doctor_acceptance"
    )

    db.add(new_consultation)
    db.commit()
    db.refresh(new_consultation)

    try:
        create_notification(
            db=db,
            user_id=new_consultation.doctor_id,
            title="New Consultation Request",
            message="You have received a new consultation request from a patient.",
            type="consultation_request"
        )
    except Exception:
        pass

    return {
        "message": "Consultation request sent to doctor successfully",
        "consultation": serialize_consultation(new_consultation, db)
    }


@router.get("/my-requests")
def get_my_consultation_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not is_patient(current_user):
        raise HTTPException(status_code=403, detail="Patient access only")

    consultations = db.query(Consultation).filter(
        Consultation.patient_id == current_user.id
    ).order_by(Consultation.created_at.desc()).all()

    return [
        serialize_consultation(item, db)
        for item in consultations
    ]


@router.get("/doctor-requests")
def get_doctor_consultation_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not is_doctor(current_user):
        raise HTTPException(status_code=403, detail="Doctor access only")

    consultations = db.query(Consultation).filter(
        Consultation.doctor_id == current_user.id
    ).order_by(Consultation.created_at.desc()).all()

    return [
        serialize_consultation(item, db)
        for item in consultations
    ]


@router.put("/{consultation_id}/assign-doctor/{doctor_user_id}")
def assign_doctor_to_consultation(
    consultation_id: str,
    doctor_user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id
    ).first()

    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    doctor = db.query(User).filter(
        User.id == doctor_user_id
    ).first()

    if not doctor or not is_doctor(doctor):
        raise HTTPException(status_code=404, detail="Doctor user not found")

    doctor_profile = db.query(DoctorProfile).filter(
        DoctorProfile.user_id == doctor.id
    ).first()

    if doctor_profile and str(doctor_profile.approval_status).lower() not in ["approved", "active"]:
        raise HTTPException(
            status_code=403,
            detail="Only approved doctors can be assigned to consultations"
        )

    consultation.doctor_id = doctor.id
    consultation.status = "assigned"

    db.commit()
    db.refresh(consultation)

    return {
        "message": "Doctor assigned successfully",
        "consultation": serialize_consultation(consultation, db)
    }


@router.put("/{consultation_id}/status")
def update_consultation_status(
    consultation_id: str,
    status_data: ConsultationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id
    ).first()

    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    allowed = False

    if is_patient(current_user) and consultation.patient_id == current_user.id:
        allowed = True

    if is_doctor(current_user) and consultation.doctor_id == current_user.id:
        allowed = True

    if str(current_user.role).lower() == "admin":
        allowed = True

    if not allowed:
        raise HTTPException(status_code=403, detail="You are not allowed to update this consultation")

    consultation.status = status_data.status

    db.commit()
    db.refresh(consultation)

    return {
        "message": "Consultation status updated successfully",
        "consultation": serialize_consultation(consultation, db)
    }


@router.put("/{consultation_id}/accept")
def accept_consultation(
    consultation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not is_doctor(current_user):
        raise HTTPException(status_code=403, detail="Doctor access only")

    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id,
        Consultation.doctor_id == current_user.id
    ).first()

    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    consultation.status = "active"

    db.commit()
    db.refresh(consultation)

    try:
        create_audit_log(
            db=db,
            user_id=current_user.id,
            action="CONSULTATION_ACCEPTED",
            target_type="Consultation",
            target_id=str(consultation.id),
            description=f"Doctor accepted consultation {consultation.id}"
        )
    except Exception:
        pass

    try:
        create_notification(
            db=db,
            user_id=consultation.patient_id,
            title="Consultation Accepted",
            message="Your consultation request has been accepted by the doctor.",
            type="consultation_accepted"
        )
    except Exception:
        pass

    return {
        "message": "Consultation accepted successfully",
        "consultation": serialize_consultation(consultation, db)
    }


@router.put("/{consultation_id}/decline")
def decline_consultation(
    consultation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not is_doctor(current_user):
        raise HTTPException(status_code=403, detail="Doctor access only")

    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id,
        Consultation.doctor_id == current_user.id
    ).first()

    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    consultation.status = "declined"

    db.commit()
    db.refresh(consultation)

    try:
        create_audit_log(
            db=db,
            user_id=current_user.id,
            action="CONSULTATION_DECLINED",
            target_type="Consultation",
            target_id=str(consultation.id),
            description=f"Doctor declined consultation {consultation.id}"
        )
    except Exception:
        pass

    try:
        create_notification(
            db=db,
            user_id=consultation.patient_id,
            title="Consultation Declined",
            message="Your consultation request has been declined by the doctor.",
            type="consultation_declined"
        )
    except Exception:
        pass

    return {
        "message": "Consultation declined successfully",
        "consultation": serialize_consultation(consultation, db)
    }