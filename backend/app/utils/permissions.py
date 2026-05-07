from fastapi import Depends, HTTPException
from app.models.user import User
from app.utils.security import get_current_user


def require_roles(*allowed_roles):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Allowed roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker


def require_patient(current_user: User = Depends(get_current_user)):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")
    return current_user


def require_doctor(current_user: User = Depends(get_current_user)):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access only")
    return current_user


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return current_user


def require_patient_or_doctor(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["patient", "doctor"]:
        raise HTTPException(status_code=403, detail="Patient or doctor access only")
    return current_user


def require_doctor_or_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["doctor", "admin"]:
        raise HTTPException(status_code=403, detail="Doctor or admin access only")
    return current_user