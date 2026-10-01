from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.api.deps import get_db, require_role
from app.models.models import User, Student, Faculty, Course, AuditLog
from app.core.config import settings
from app.integrations.official_api_provider import OfficialApiProvider
from app.schemas.schemas import IntegrationStatusResponse, UserResponse

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    return db.query(User).all()

@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 50,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [{
        "id": l.id,
        "username": l.user.username if l.user else "System",
        "action": l.action,
        "resource": l.resource,
        "timestamp": l.timestamp,
        "details": l.details,
        "ip_address": l.ip_address
    } for l in logs]

@router.get("/integration-status", response_model=IntegrationStatusResponse)
def get_integration_status(
    current_user: User = Depends(require_role(["admin", "faculty", "student"])),
    db: Session = Depends(get_db)
):
    official = OfficialApiProvider()
    is_official_ready = official.is_live_integration
    
    # Active badge resolution
    if settings.ACTIVE_DATA_PROVIDER == "Official API" and is_official_ready:
        badge = "Official API"
        msg = "Connected to live official Samvidha college API."
    elif settings.ACTIVE_DATA_PROVIDER == "Authorized Import":
        badge = "Authorized Import"
        msg = "Using institution-approved verified imported datasets."
    else:
        badge = "Demo Data"
        msg = "Operating in local demonstration mode with structured synthetic academic datasets."

    return IntegrationStatusResponse(
        active_provider=settings.ACTIVE_DATA_PROVIDER,
        data_source_badge=badge,
        official_api_configured=is_official_ready,
        sync_status="Verified Active" if is_official_ready else "Local / Ready",
        last_synced_at=None,
        system_message=msg
    )

@router.get("/overview-stats")
def get_admin_stats(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    total_students = db.query(Student).count()
    total_faculty = db.query(Faculty).count()
    total_courses = db.query(Course).count()
    total_logs = db.query(AuditLog).count()

    return {
        "total_students": total_students,
        "total_faculty": total_faculty,
        "total_courses": total_courses,
        "total_audit_logs": total_logs,
        "institution_name": settings.INSTITUTION_NAME,
        "institution_code": settings.INSTITUTION_SHORT_NAME
    }
