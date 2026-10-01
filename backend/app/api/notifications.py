from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user
from app.repositories.academic_repo import AcademicRepository
from app.models.models import User
from app.schemas.schemas import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = AcademicRepository(db)
    return repo.get_user_notifications(current_user.id)

@router.patch("/{notif_id}/read")
def mark_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = AcademicRepository(db)
    success = repo.mark_notification_read(notif_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}
