from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, verify_student_access
from app.repositories.academic_repo import AcademicRepository
from app.models.models import User
from app.schemas.schemas import AttendanceOverviewResponse

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.get("/{roll_no}/overview", response_model=AttendanceOverviewResponse)
def get_attendance_overview(
    roll_no: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    return repo.get_attendance_summary(roll_no)
