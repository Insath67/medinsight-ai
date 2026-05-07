from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.patient_profile import PatientProfile
from app.schemas.patient_profile import PatientProfileCreate
from app.utils.security import get_current_user

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/me")
def get_my_patient_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")

    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "date_of_birth": profile.date_of_birth,
        "gender": profile.gender,
        "address": profile.address,
        "emergency_contact_name": profile.emergency_contact_name,
        "emergency_contact_phone": profile.emergency_contact_phone
    }

@router.post("/me")
def create_or_update_my_patient_profile(
    profile_data: PatientProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")

    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()

    if profile:
        profile.date_of_birth = profile_data.date_of_birth
        profile.gender = profile_data.gender
        profile.address = profile_data.address
        profile.emergency_contact_name = profile_data.emergency_contact_name
        profile.emergency_contact_phone = profile_data.emergency_contact_phone

        db.commit()
        db.refresh(profile)

        return {
            "message": "Patient profile updated successfully",
            "profile": {
                "id": str(profile.id),
                "user_id": str(profile.user_id),
                "date_of_birth": profile.date_of_birth,
                "gender": profile.gender,
                "address": profile.address,
                "emergency_contact_name": profile.emergency_contact_name,
                "emergency_contact_phone": profile.emergency_contact_phone
            }
        }

    new_profile = PatientProfile(
        user_id=current_user.id,
        date_of_birth=profile_data.date_of_birth,
        gender=profile_data.gender,
        address=profile_data.address,
        emergency_contact_name=profile_data.emergency_contact_name,
        emergency_contact_phone=profile_data.emergency_contact_phone
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return {
        "message": "Patient profile created successfully",
        "profile": {
            "id": str(new_profile.id),
            "user_id": str(new_profile.user_id),
            "date_of_birth": new_profile.date_of_birth,
            "gender": new_profile.gender,
            "address": new_profile.address,
            "emergency_contact_name": new_profile.emergency_contact_name,
            "emergency_contact_phone": new_profile.emergency_contact_phone
        }
    }