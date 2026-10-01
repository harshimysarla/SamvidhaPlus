from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.api.deps import get_db, get_current_user, verify_student_access
from app.repositories.academic_repo import AcademicRepository
from app.models.models import User
from app.analytics.performance_index import PerformanceIndexEngine
from app.schemas.schemas import PerformanceIndexResponse

router = APIRouter(prefix="/analytics", tags=["Performance Analytics"])

@router.get("/{roll_no}/performance-index", response_model=PerformanceIndexResponse)
def get_performance_index(
    roll_no: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    student = repo.get_student_by_roll_no(roll_no)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    theory = repo.get_theory_assessments(roll_no)
    labs = repo.get_lab_assessments(roll_no)
    semesters = repo.get_semester_history(roll_no)
    att_summary = repo.get_attendance_summary(roll_no)

    theory_dicts = [{"internal_total": t.internal_total, "attendance_pct": t.attendance_pct} for t in theory]
    lab_dicts = [{"internal_total": l.internal_total, "attendance_pct": l.attendance_pct} for l in labs]
    sem_dicts = [{"semester": s.semester, "sgpa": s.sgpa, "cgpa": s.cgpa, "published": s.published} for s in semesters]

    engine = PerformanceIndexEngine()
    result = engine.calculate(
        cgpa=student.cgpa,
        attendance_pct=att_summary.get("overall_percentage", student.overall_attendance_percentage),
        theory_assessments=theory_dicts,
        lab_assessments=lab_dicts,
        semesters_history=sem_dicts,
        earned_credits=student.total_credits_earned,
        required_credits=student.total_credits_required
    )

    return result

@router.get("/{roll_no}/subject-analysis")
def get_subject_analysis(
    roll_no: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    theory = repo.get_theory_assessments(roll_no)
    labs = repo.get_lab_assessments(roll_no)

    subjects = []
    strengths = []
    attention_areas = []

    for t in theory:
        c_name = t.course.name if t.course else "Subject"
        c_code = t.course.code if t.course else ""
        internal_pct = (t.internal_total / 40.0) * 100.0
        att_pct = t.attendance_pct

        item = {
            "course_code": c_code,
            "course_name": c_name,
            "type": "Theory",
            "internal_pct": round(internal_pct, 1),
            "attendance_pct": round(att_pct, 1),
            "grade_point": t.grade_point,
            "credits": t.course.credits if t.course else 3.0
        }
        subjects.append(item)

        if internal_pct >= 85.0 and att_pct >= 85.0:
            strengths.append(f"{c_code}: {c_name} (High internal score {internal_pct:.1f}% & attendance {att_pct:.1f}%)")
        elif internal_pct < 65.0 or att_pct < 75.0:
            attention_areas.append(f"{c_code}: {c_name} (Internal: {internal_pct:.1f}%, Attendance: {att_pct:.1f}%)")

    for l in labs:
        c_name = l.course.name if l.course else "Laboratory"
        c_code = l.course.code if l.course else ""
        internal_pct = (l.internal_total / 40.0) * 100.0
        att_pct = l.attendance_pct

        item = {
            "course_code": c_code,
            "course_name": c_name,
            "type": "Laboratory",
            "internal_pct": round(internal_pct, 1),
            "attendance_pct": round(att_pct, 1),
            "grade_point": l.grade_point,
            "credits": l.course.credits if l.course else 1.5
        }
        subjects.append(item)

    return {
        "subjects": subjects,
        "strengths": strengths,
        "attention_areas": attention_areas
    }
