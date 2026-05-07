from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.models.user import User
from app.models.consultation import Consultation
from app.models.care_plan import CarePlan
from app.schemas.care_plan import CarePlanCreate, CarePlanStatusUpdate, CarePlanResponse
from app.utils.security import get_current_user
from app.services.notification_service import create_notification
from app.services.audit_log_service import create_audit_log

router = APIRouter(prefix="/care-plans", tags=["Care Plans"])


@router.post("/{consultation_id}", response_model=CarePlanResponse)
def create_care_plan(
    consultation_id: UUID,
    payload: CarePlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access only")

    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id,
        Consultation.doctor_id == current_user.id
    ).first()

    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    existing_plan = db.query(CarePlan).filter(
        CarePlan.consultation_id == consultation.id
    ).first()

    if existing_plan:
        raise HTTPException(status_code=400, detail="Care plan already exists for this consultation")

    care_plan = CarePlan(
        consultation_id=consultation.id,
        patient_id=consultation.patient_id,
        doctor_id=current_user.id,
        medicines=payload.medicines,
        dosage=payload.dosage,
        instructions=payload.instructions,
        follow_up_advice=payload.follow_up_advice,
        status="active"
    )

    db.add(care_plan)
    db.commit()
    db.refresh(care_plan)

    create_notification(
    db=db,
    user_id=care_plan.patient_id,
    title="New Care Plan Added",
    message="Your doctor has added a care plan for your consultation.",
    type="care_plan_created"
)

    create_audit_log(
    db=db,
    user_id=current_user.id,
    action="CARE_PLAN_CREATED",
    target_type="CarePlan",
    target_id=str(care_plan.id),
    description=f"Doctor created care plan for consultation {consultation.id}"
)

    return care_plan


@router.get("/{consultation_id}", response_model=CarePlanResponse)
def get_care_plan(
    consultation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id
    ).first()

    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    allowed = False
    if current_user.role == "doctor" and consultation.doctor_id == current_user.id:
        allowed = True
    if current_user.role == "patient" and consultation.patient_id == current_user.id:
        allowed = True

    if not allowed:
        raise HTTPException(status_code=403, detail="Access denied")

    care_plan = db.query(CarePlan).filter(
        CarePlan.consultation_id == consultation.id
    ).first()

    if not care_plan:
        raise HTTPException(status_code=404, detail="Care plan not found")

    return care_plan


@router.put("/{care_plan_id}/status", response_model=CarePlanResponse)
def update_care_plan_status(
    care_plan_id: UUID,
    payload: CarePlanStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access only")

    care_plan = db.query(CarePlan).filter(
        CarePlan.id == care_plan_id,
        CarePlan.doctor_id == current_user.id
    ).first()

    if not care_plan:
        raise HTTPException(status_code=404, detail="Care plan not found")

    care_plan.status = payload.status

    db.commit()
    db.refresh(care_plan)

    create_notification(
    db=db,
    user_id=care_plan.patient_id,
    title="Care Plan Status Updated",
    message=f"Your care plan status has been updated to {care_plan.status}.",
    type="care_plan_status_updated"
)

    create_audit_log(
    db=db,
    user_id=current_user.id,
    action="CARE_PLAN_STATUS_UPDATED",
    target_type="CarePlan",
    target_id=str(care_plan.id),
    description=f"Doctor updated care plan status to {care_plan.status}"
)

    return care_plan