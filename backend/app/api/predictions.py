from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, verify_student_access
from app.repositories.academic_repo import AcademicRepository
from app.models.models import User
from app.predictions.sgpa_estimator import SGPAEstimator
from app.predictions.cgpa_scenario import CGPAScenarioCalculator
from app.predictions.attendance_forecaster import AttendanceForecaster
from app.predictions.risk_detector import AcademicRiskDetector
from app.schemas.schemas import (
    SGPAEstimationResponse,
    CGPAScenarioRequest,
    CGPAScenarioResponse,
    AttendanceForecastRequest,
    AttendanceForecastResponse,
    AcademicRiskResponse
)

router = APIRouter(prefix="/predictions", tags=["Predictive Intelligence"])

@router.get("/{roll_no}/sgpa-estimate", response_model=SGPAEstimationResponse)
def get_sgpa_estimate(
    roll_no: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    student = repo.get_student_by_roll_no(roll_no)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    semesters = repo.get_semester_history(roll_no)
    theory = repo.get_theory_assessments(roll_no)
    labs = repo.get_lab_assessments(roll_no)

    sem_dicts = [{"semester": s.semester, "sgpa": s.sgpa, "published": s.published} for s in semesters]
    courses_dicts = []
    for t in theory:
        courses_dicts.append({
            "credits": t.course.credits if t.course else 3.0,
            "internal_total": t.internal_total
        })
    for l in labs:
        courses_dicts.append({
            "credits": l.course.credits if l.course else 1.5,
            "internal_total": l.internal_total
        })

    return SGPAEstimator.estimate(sem_dicts, courses_dicts)

@router.post("/{roll_no}/cgpa-scenario", response_model=CGPAScenarioResponse)
def simulate_cgpa_scenario(
    roll_no: str,
    req: CGPAScenarioRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    student = repo.get_student_by_roll_no(roll_no)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Assuming current semester has ~20-22 credits
    next_sem_credits = 22.0
    return CGPAScenarioCalculator.simulate(
        current_cgpa=student.cgpa,
        earned_credits=student.total_credits_earned,
        next_credits=next_sem_credits,
        hypothetical_sgpa=req.hypothetical_sgpa_next,
        target_cgpa=req.target_cgpa
    )

@router.post("/{roll_no}/attendance-forecast", response_model=AttendanceForecastResponse)
def forecast_attendance(
    roll_no: str,
    req: AttendanceForecastRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    att_summary = repo.get_attendance_summary(roll_no)

    return AttendanceForecaster.forecast(
        total_conducted=att_summary["total_conducted"],
        total_attended=att_summary["total_attended"],
        upcoming_attend=req.upcoming_classes_to_attend,
        upcoming_total=req.total_upcoming_classes
    )

@router.get("/{roll_no}/risk-indicators", response_model=AcademicRiskResponse)
def get_risk_indicators(
    roll_no: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_student_access(roll_no, current_user, db)
    repo = AcademicRepository(db)
    student = repo.get_student_by_roll_no(roll_no)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    att_summary = repo.get_attendance_summary(roll_no)
    theory = repo.get_theory_assessments(roll_no)
    assignments = repo.get_assignments(student_roll_no=roll_no)
    pending_asg = sum(1 for a in assignments if a.get("submission_status") != "Submitted")

    theory_dicts = [{
        "course_name": t.course.name if t.course else "Subject",
        "cie1": t.cie1,
        "cie2": t.cie2,
        "internal_total": t.internal_total
    } for t in theory]

    return AcademicRiskDetector.evaluate(
        overall_attendance=att_summary["overall_percentage"],
        course_attendances=att_summary["courses"],
        theory_assessments=theory_dicts,
        pending_assignments_count=pending_asg
    )
