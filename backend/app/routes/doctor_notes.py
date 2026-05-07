from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.consultation import Consultation
from app.models.medical_report import MedicalReport
from app.models.doctor_note import DoctorNote
from app.schemas.doctor_note import DoctorNoteCreate
from app.utils.security import get_current_user
from app.services.notification_service import create_notification


router = APIRouter(tags=["Doctor Notes"])


def is_doctor(user: User):
    return str(user.role).lower() == "doctor"


def is_patient(user: User):
    return str(user.role).lower() == "patient"


def serialize_note(note: DoctorNote):
    return {
        "id": str(note.id),
        "consultation_id": str(note.consultation_id) if note.consultation_id else None,
        "report_id": str(note.report_id) if note.report_id else None,
        "doctor_id": str(note.doctor_id),
        "notes": note.notes,
        "recommendations": note.recommendations,
        "follow_up": note.follow_up,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
    }


# =========================
# Report-based Doctor Notes
# =========================

@router.post("/doctor-notes/reports/{report_id}")
def create_or_update_report_doctor_note(
    report_id: str,
    note_data: DoctorNoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not is_doctor(current_user):
        raise HTTPException(status_code=403, detail="Doctor access only")

    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id
    ).first()

    if not report:
        raise HTTPException(status_code=404, detail="Medical report not found")

    existing_note = db.query(DoctorNote).filter(
        DoctorNote.report_id == report.id,
        DoctorNote.doctor_id == current_user.id
    ).first()

    if existing_note:
        existing_note.notes = note_data.notes
        existing_note.recommendations = note_data.recommendations
        existing_note.follow_up = note_data.follow_up

        db.commit()
        db.refresh(existing_note)

        try:
            create_notification(
                db=db,
                user_id=report.patient_id,
                title="Doctor Note Updated",
                message="Your doctor has updated notes or recommendations for your medical report.",
                type="doctor_note"
            )
        except Exception:
            pass

        return {
            "message": "Doctor note updated successfully",
            "note": serialize_note(existing_note)
        }

    new_note = DoctorNote(
        report_id=report.id,
        doctor_id=current_user.id,
        notes=note_data.notes,
        recommendations=note_data.recommendations,
        follow_up=note_data.follow_up
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    try:
        create_notification(
            db=db,
            user_id=report.patient_id,
            title="New Doctor Note",
            message="Your doctor has added notes or recommendations for your medical report.",
            type="doctor_note"
        )
    except Exception:
        pass

    return {
        "message": "Doctor note created successfully",
        "note": serialize_note(new_note)
    }


@router.get("/doctor-notes/reports/{report_id}")
def get_report_doctor_notes(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id
    ).first()

    if not report:
        raise HTTPException(status_code=404, detail="Medical report not found")

    allowed = False

    if is_doctor(current_user):
        allowed = True

    if is_patient(current_user) and report.patient_id == current_user.id:
        allowed = True

    if not allowed:
        raise HTTPException(status_code=403, detail="You are not allowed to view notes for this report")

    notes = db.query(DoctorNote).filter(
        DoctorNote.report_id == report.id
    ).order_by(DoctorNote.created_at.desc()).all()

    return [
        serialize_note(note)
        for note in notes
    ]


# ==============================
# Consultation-based Doctor Notes
# Kept for existing consultation flow
# ==============================

@router.post("/consultations/{consultation_id}/notes")
def create_or_update_consultation_doctor_note(
    consultation_id: str,
    note_data: DoctorNoteCreate,
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

    existing_note = db.query(DoctorNote).filter(
        DoctorNote.consultation_id == consultation.id,
        DoctorNote.doctor_id == current_user.id
    ).first()

    if existing_note:
        existing_note.notes = note_data.notes
        existing_note.recommendations = note_data.recommendations
        existing_note.follow_up = note_data.follow_up

        db.commit()
        db.refresh(existing_note)

        try:
            create_notification(
                db=db,
                user_id=consultation.patient_id,
                title="Doctor Note Updated",
                message="Your doctor has updated notes or recommendations for your consultation.",
                type="doctor_note"
            )
        except Exception:
            pass

        return {
            "message": "Doctor note updated successfully",
            "note": serialize_note(existing_note)
        }

    new_note = DoctorNote(
        consultation_id=consultation.id,
        doctor_id=current_user.id,
        notes=note_data.notes,
        recommendations=note_data.recommendations,
        follow_up=note_data.follow_up
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    try:
        create_notification(
            db=db,
            user_id=consultation.patient_id,
            title="New Doctor Note",
            message="Your doctor has added notes or recommendations to your consultation.",
            type="doctor_note"
        )
    except Exception:
        pass

    return {
        "message": "Doctor note created successfully",
        "note": serialize_note(new_note)
    }


@router.get("/consultations/{consultation_id}/notes")
def get_consultation_doctor_note(
    consultation_id: str,
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

    if not allowed:
        raise HTTPException(status_code=403, detail="You are not allowed to view notes for this consultation")

    note = db.query(DoctorNote).filter(
        DoctorNote.consultation_id == consultation.id
    ).first()

    if not note:
        raise HTTPException(status_code=404, detail="Doctor note not found")

    return serialize_note(note)