from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user, verify_student_access
from app.repositories.academic_repo import AcademicRepository
from app.models.models import User, Student
from app.schemas.schemas import StudentResponse, PersonalStudyGoalResponse, PersonalStudyGoalCreate

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/me", response_model=StudentResponse)
def get_current_student_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current user is not a student")
    repo = AcademicRepository(db)
    student = repo.get_student_by_user_id(current_user.id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")
    
    return StudentResponse(
        id=student.id,
        name=current_user.full_name,
        roll_no=student.roll_no,
        department=student.department,
        branch=student.branch,
        section=student.section,
        regulation=student.regulation,
        academic_year=student.academic_year,
        current_semester=student.current_semester,
        enrollment_status=student.enrollment_status,
        admission_year=student.admission_year,
        mentor_name=student.mentor_name,
        mentor_email=student.mentor_email,
        blood_group=student.blood_group,
        phone=student.phone,
        address=student.address,
        parent_name=student.parent_name,
        parent_phone=student.parent_phone,
        cgpa=student.cgpa,
        total_credits_earned=student.total_credits_earned,
        total_credits_required=student.total_credits_required,
        overall_attendance_percentage=student.overall_attendance_percentage,
        avatar_url=student.avatar_url
    )

@router.get("/{roll_no}", response_model=StudentResponse)
def get_student_by_roll_no(
    roll_no: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    student = repo.get_student_by_roll_no(roll_no)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student {roll_no} not found")
    
    return StudentResponse(
        id=student.id,
        name=student.user.full_name if student.user else roll_no,
        roll_no=student.roll_no,
        department=student.department,
        branch=student.branch,
        section=student.section,
        regulation=student.regulation,
        academic_year=student.academic_year,
        current_semester=student.current_semester,
        enrollment_status=student.enrollment_status,
        admission_year=student.admission_year,
        mentor_name=student.mentor_name,
        mentor_email=student.mentor_email,
        blood_group=student.blood_group,
        phone=student.phone,
        address=student.address,
        parent_name=student.parent_name,
        parent_phone=student.parent_phone,
        cgpa=student.cgpa,
        total_credits_earned=student.total_credits_earned,
        total_credits_required=student.total_credits_required,
        overall_attendance_percentage=student.overall_attendance_percentage,
        avatar_url=student.avatar_url
    )

@router.get("/{roll_no}/study-goals", response_model=List[PersonalStudyGoalResponse])
def get_student_study_goals(
    roll_no: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    student = repo.get_student_by_roll_no(roll_no)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return repo.get_study_goals(student.id)

@router.post("/{roll_no}/study-goals", response_model=PersonalStudyGoalResponse)
def add_student_study_goal(
    roll_no: str,
    goal_in: PersonalStudyGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    student = repo.get_student_by_roll_no(roll_no)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return repo.add_study_goal(
        student_id=student.id,
        title=goal_in.title,
        target_date=goal_in.target_date,
        category=goal_in.category,
        notes=goal_in.notes
    )

@router.patch("/{roll_no}/study-goals/{goal_id}/toggle", response_model=PersonalStudyGoalResponse)
def toggle_study_goal(
    roll_no: str,
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    student = repo.get_student_by_roll_no(roll_no)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    updated = repo.toggle_study_goal(goal_id, student.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Goal not found")
    return updated
