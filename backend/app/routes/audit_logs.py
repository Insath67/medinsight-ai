from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.audit_log import AuditLogResponse
from app.services.audit_log_service import get_user_audit_logs, get_all_audit_logs
from app.utils.security import get_current_user

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


@router.get("/my", response_model=list[AuditLogResponse])
def get_my_audit_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_user_audit_logs(db, current_user.id)


@router.get("/admin", response_model=list[AuditLogResponse])
def get_admin_audit_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    return get_all_audit_logs(db)