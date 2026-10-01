from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db, get_current_user
from app.repositories.academic_repo import AcademicRepository
from app.models.models import User
from app.schemas.schemas import AnnouncementResponse

router = APIRouter(prefix="/announcements", tags=["Announcements"])

@router.get("", response_model=List[AnnouncementResponse])
def get_announcements(
    department: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = AcademicRepository(db)
    dept = department or current_user.department
    return repo.get_announcements(department=dept)
