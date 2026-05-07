from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.doctor_profile import DoctorProfile
from app.models.medical_report import MedicalReport
from app.models.report_analysis import ReportAnalysis
from app.schemas.doctor_profile import DoctorProfileCreate
from app.utils.security import get_current_user
from app.services.notification_service import create_notification


router = APIRouter(prefix="/doctors", tags=["Doctors"])


def is_doctor(user: User):
    return str(user.role).lower() == "doctor"


def get_date_column(model):
    return getattr(model, "created_at", None) or getattr(model, "uploaded_at", None)


def serialize_patient(patient: User):
    return {
        "id": str(patient.id),
        "name": getattr(patient, "full_name", None)
        or getattr(patient, "name", None)
        or patient.email,
        "email": patient.email,
        "created_at": str(getattr(patient, "created_at", "")),
    }


def serialize_report(report: MedicalReport, patient: User | None = None):
    patient_name = "Unknown Patient"

    if patient:
        patient_name = (
            getattr(patient, "full_name", None)
            or getattr(patient, "name", None)
            or getattr(patient, "email", "Unknown Patient")
        )

    return {
        "id": str(report.id),
        "patient_id": str(report.patient_id) if getattr(report, "patient_id", None) else None,
        "patient_name": patient_name,
        "file_name": getattr(report, "file_name", None)
        or getattr(report, "filename", None)
        or "Unknown file",
        "report_type": getattr(report, "report_type", None)
        or getattr(report, "type", None)
        or "General Report",
        "uploaded_at": str(
            getattr(report, "uploaded_at", None)
            or getattr(report, "created_at", "")
        ),
        "status": getattr(report, "status", "Uploaded"),
        "notes": getattr(report, "notes", None)
        or getattr(report, "description", None)
        or "",
    }


@router.post("/me")
def create_or_update_my_doctor_profile(
    profile_data: DoctorProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not is_doctor(current_user):
        raise HTTPException(status_code=403, detail="Doctor access only")

    existing_license = db.query(DoctorProfile).filter(
        DoctorProfile.license_number == profile_data.license_number,
        DoctorProfile.user_id != current_user.id
    ).first()

    if existing_license:
        raise HTTPException(status_code=400, detail="License number already in use")

    profile = db.query(DoctorProfile).filter(
        DoctorProfile.user_id == current_user.id
    ).first()

    if profile:
        profile.specialization = profile_data.specialization
        profile.hospital_name = profile_data.hospital_name
        profile.qualification = profile_data.qualification
        profile.license_number = profile_data.license_number
        profile.experience_years = profile_data.experience_years
        profile.bio = profile_data.bio

        db.commit()
        db.refresh(profile)

        admin_users = db.query(User).filter(User.role.ilike("admin")).all()

        for admin_user in admin_users:
            create_notification(
                db=db,
                user_id=admin_user.id,
                title="Doctor Approval Request",
                message="A doctor profile has been submitted or updated and is waiting for admin review.",
                type="doctor_approval_request"
            )

        return {
            "message": "Doctor profile updated successfully",
            "profile": {
                "id": str(profile.id),
                "user_id": str(profile.user_id),
                "specialization": profile.specialization,
                "hospital_name": profile.hospital_name,
                "qualification": profile.qualification,
                "license_number": profile.license_number,
                "experience_years": profile.experience_years,
                "bio": profile.bio,
                "approval_status": profile.approval_status,
                "rejection_reason": profile.rejection_reason
            }
        }

    new_profile = DoctorProfile(
        user_id=current_user.id,
        specialization=profile_data.specialization,
        hospital_name=profile_data.hospital_name,
        qualification=profile_data.qualification,
        license_number=profile_data.license_number,
        experience_years=profile_data.experience_years,
        bio=profile_data.bio,
        approval_status="pending"
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    admin_users = db.query(User).filter(User.role.ilike("admin")).all()

    for admin_user in admin_users:
        create_notification(
            db=db,
            user_id=admin_user.id,
            title="Doctor Approval Request",
            message="A new doctor profile has been submitted and is waiting for approval.",
            type="doctor_approval_request"
        )

    return {
        "message": "Doctor profile created successfully",
        "profile": {
            "id": str(new_profile.id),
            "user_id": str(new_profile.user_id),
            "specialization": new_profile.specialization,
            "hospital_name": new_profile.hospital_name,
            "qualification": new_profile.qualification,
            "license_number": new_profile.license_number,
            "experience_years": new_profile.experience_years,
            "bio": new_profile.bio,
            "approval_status": new_profile.approval_status,
            "rejection_reason": new_profile.rejection_reason
        }
    }


@router.get("/me")
def get_my_doctor_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not is_doctor(current_user):
        raise HTTPException(status_code=403, detail="Doctor access only")

    profile = db.query(DoctorProfile).filter(
        DoctorProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "specialization": profile.specialization,
        "hospital_name": profile.hospital_name,
        "qualification": profile.qualification,
        "license_number": profile.license_number,
        "experience_years": profile.experience_years,
        "bio": profile.bio,
        "approval_status": profile.approval_status,
        "rejection_reason": profile.rejection_reason
    }


@router.get("/approved")
def get_approved_doctors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doctors_query = db.query(DoctorProfile).filter(
        DoctorProfile.approval_status == "approved"
    )

    doctor_date_column = get_date_column(DoctorProfile)

    if doctor_date_column is not None:
        doctors_query = doctors_query.order_by(doctor_date_column.desc())

    doctors = doctors_query.all()

    return [
        {
            "id": str(item.id),
            "user_id": str(item.user_id),
            "specialization": item.specialization,
            "hospital_name": item.hospital_name,
            "qualification": item.qualification,
            "license_number": item.license_number,
            "experience_years": item.experience_years,
            "bio": item.bio,
            "approval_status": item.approval_status
        }
        for item in doctors
    ]


@router.get("/dashboard")
def get_doctor_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not is_doctor(current_user):
        raise HTTPException(status_code=403, detail="Doctor access only")

    total_patients = db.query(User).filter(User.role.ilike("patient")).count()
    total_reports = db.query(MedicalReport).count()

    report_date_column = get_date_column(MedicalReport)

    recent_reports_query = db.query(MedicalReport)

    if report_date_column is not None:
        recent_reports_query = recent_reports_query.order_by(report_date_column.desc())

    recent_reports = recent_reports_query.limit(5).all()

    recent_report_data = []

    for report in recent_reports:
        patient = db.query(User).filter(User.id == report.patient_id).first()
        recent_report_data.append(serialize_report(report, patient))

    return {
        "doctor": {
            "id": str(current_user.id),
            "name": getattr(current_user, "full_name", None)
            or getattr(current_user, "name", None)
            or current_user.email,
            "email": current_user.email,
        },
        "stats": {
            "total_patients": total_patients,
            "total_reports": total_reports,
            "recent_reports_count": len(recent_report_data),
        },
        "recent_reports": recent_report_data,
    }


@router.get("/patients")
def get_doctor_patients(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not is_doctor(current_user):
        raise HTTPException(status_code=403, detail="Doctor access only")

    patients_query = db.query(User).filter(User.role.ilike("patient"))

    user_date_column = get_date_column(User)

    if user_date_column is not None:
        patients_query = patients_query.order_by(user_date_column.desc())

    patients = patients_query.all()

    return [serialize_patient(patient) for patient in patients]


@router.get("/patients/{patient_id}/reports")
def get_patient_reports_for_doctor(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not is_doctor(current_user):
        raise HTTPException(status_code=403, detail="Doctor access only")

    patient = db.query(User).filter(
        User.id == patient_id,
        User.role.ilike("patient")
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    report_date_column = get_date_column(MedicalReport)

    reports_query = db.query(MedicalReport).filter(
        MedicalReport.patient_id == patient_id
    )

    if report_date_column is not None:
        reports_query = reports_query.order_by(report_date_column.desc())

    reports = reports_query.all()

    return {
        "patient": serialize_patient(patient),
        "reports": [
            serialize_report(report, patient)
            for report in reports
        ],
    }


@router.get("/reports/{report_id}")
def get_single_report_for_doctor(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not is_doctor(current_user):
        raise HTTPException(status_code=403, detail="Doctor access only")

    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id
    ).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    patient = db.query(User).filter(User.id == report.patient_id).first()

    analysis = db.query(ReportAnalysis).filter(
        ReportAnalysis.report_id == report.id
    ).first()

    return {
        "report": serialize_report(report, patient),
        "analysis": {
            "id": str(analysis.id),
            "summary": analysis.summary,
            "key_findings": analysis.key_findings,
            "doctor_questions": analysis.doctor_questions,
            "extracted_text": analysis.extracted_text,
        } if analysis else None,
    }


@router.get("/{doctor_profile_id}")
def get_single_doctor_profile(
    doctor_profile_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(DoctorProfile).filter(
        DoctorProfile.id == doctor_profile_id,
        DoctorProfile.approval_status == "approved"
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Approved doctor profile not found")

    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "specialization": profile.specialization,
        "hospital_name": profile.hospital_name,
        "qualification": profile.qualification,
        "license_number": profile.license_number,
        "experience_years": profile.experience_years,
        "bio": profile.bio,
        "approval_status": profile.approval_status
    }