from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.api.deps import get_db, get_current_user
from app.repositories.academic_repo import AcademicRepository
from app.models.models import User
from app.schemas.schemas import CalendarEventResponse, TimetableResponse

router = APIRouter(tags=["Academic Calendar and Timetable"])

@router.get("/calendar/events", response_model=List[CalendarEventResponse])
def get_calendar_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = AcademicRepository(db)
    return repo.get_calendar_events()

@router.get("/timetable", response_model=List[TimetableResponse])
def get_timetable(
    department: str = Query("CSE"),
    semester: int = Query(7),
    section: str = Query("A"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = AcademicRepository(db)
    return repo.get_timetable(department, semester, section)
