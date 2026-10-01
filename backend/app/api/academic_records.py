from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.api.deps import get_db, get_current_user, verify_student_access
from app.repositories.academic_repo import AcademicRepository
from app.models.models import User
from app.schemas.schemas import (
    TheoryAssessmentResponse,
    LaboratoryAssessmentResponse,
    SemesterResultResponse,
    PendingCourseResponse
)

router = APIRouter(prefix="/academic-records", tags=["Academic Records"])

@router.get("/{roll_no}/theory", response_model=List[TheoryAssessmentResponse])
def get_theory_records(
    roll_no: str,
    semester: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    records = repo.get_theory_assessments(roll_no, semester=semester)
    
    output = []
    for r in records:
        output.append(TheoryAssessmentResponse(
            id=r.id,
            course_code=r.course.code if r.course else "",
            course_name=r.course.name if r.course else "",
            category=r.course.category if r.course else "Core",
            credits=r.course.credits if r.course else 3.0,
            cie1=r.cie1,
            aat1_1=r.aat1_1,
            aat1_2=r.aat1_2,
            cie2=r.cie2,
            aat2_1=r.aat2_1,
            aat2_2=r.aat2_2,
            internal_total=r.internal_total,
            grade=r.grade,
            grade_point=r.grade_point,
            status=r.status,
            classes_conducted=r.classes_conducted,
            classes_attended=r.classes_attended,
            attendance_pct=r.attendance_pct,
            faculty_name=r.course.faculty.name if (r.course and r.course.faculty) else "Faculty"
        ))
    return output

@router.get("/{roll_no}/laboratory", response_model=List[LaboratoryAssessmentResponse])
def get_laboratory_records(
    roll_no: str,
    semester: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    records = repo.get_lab_assessments(roll_no, semester=semester)

    output = []
    for r in records:
        output.append(LaboratoryAssessmentResponse(
            id=r.id,
            course_code=r.course.code if r.course else "",
            course_name=r.course.name if r.course else "",
            category=r.course.category if r.course else "Core Lab",
            credits=r.course.credits if r.course else 1.5,
            week_marks=r.week_marks_json or [3.0] * 14,
            day_to_day_marks=r.day_to_day_marks,
            internal_exam_marks=r.internal_exam_marks,
            internal_total=r.internal_total,
            grade=r.grade,
            grade_point=r.grade_point,
            status=r.status,
            classes_conducted=r.classes_conducted,
            classes_attended=r.classes_attended,
            attendance_pct=r.attendance_pct,
            faculty_name=r.course.faculty.name if (r.course and r.course.faculty) else "Faculty"
        ))
    return output

@router.get("/{roll_no}/semesters", response_model=List[SemesterResultResponse])
def get_semester_records(
    roll_no: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    return repo.get_semester_history(roll_no)

@router.get("/{roll_no}/pending-courses", response_model=List[PendingCourseResponse])
def get_pending_courses(
    roll_no: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    return repo.get_pending_courses(roll_no)

@router.get("/{roll_no}/credits-summary")
def get_credits_summary(
    roll_no: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    return repo.get_credit_summary(roll_no)
