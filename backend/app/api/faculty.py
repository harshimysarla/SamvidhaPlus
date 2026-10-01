from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.api.deps import get_db, get_current_user, require_role
from app.repositories.academic_repo import AcademicRepository
from app.models.models import User, Faculty, Course, TheoryAssessment, LaboratoryAssessment, Student
from app.schemas.schemas import FacultyResponse, FacultyCourseOverview, FacultyClassAnalyticsResponse

router = APIRouter(prefix="/faculty", tags=["Faculty"])

@router.get("/me", response_model=FacultyResponse)
def get_current_faculty(
    current_user: User = Depends(require_role(["faculty", "admin"])),
    db: Session = Depends(get_db)
):
    repo = AcademicRepository(db)
    f = repo.get_faculty_by_user_id(current_user.id)
    if not f and current_user.role == "admin":
        return FacultyResponse(
            id=0,
            faculty_id="ADMIN",
            name=current_user.full_name,
            department="Administration",
            designation="Academic Administrator",
            email=current_user.email
        )
    if not f:
        raise HTTPException(status_code=404, detail="Faculty profile not found")
    return f

@router.get("/{faculty_id}/courses", response_model=List[FacultyCourseOverview])
def get_assigned_courses(
    faculty_id: str,
    current_user: User = Depends(require_role(["faculty", "admin"])),
    db: Session = Depends(get_db)
):
    repo = AcademicRepository(db)
    f = repo.get_faculty_by_id(faculty_id)
    courses = db.query(Course).all()
    if f and current_user.role != "admin":
        courses = [c for c in courses if c.faculty_id == f.id]

    results = []
    for c in courses:
        theory = db.query(TheoryAssessment).filter(TheoryAssessment.course_id == c.id).all()
        labs = db.query(LaboratoryAssessment).filter(LaboratoryAssessment.course_id == c.id).all()
        all_records = theory if c.course_type != "Laboratory" else labs
        
        enrolled = len(all_records)
        avg_att = sum(r.attendance_pct for r in all_records) / enrolled if enrolled > 0 else 0.0
        avg_internal = sum(r.internal_total for r in all_records) / enrolled if enrolled > 0 else 0.0
        at_risk = sum(1 for r in all_records if r.attendance_pct < 75.0 or r.internal_total < 20.0)

        results.append(FacultyCourseOverview(
            course_id=c.id,
            course_code=c.code,
            course_name=c.name,
            department=c.department,
            semester=c.semester,
            enrolled_count=enrolled,
            avg_attendance=round(avg_att, 1),
            avg_internal_marks=round(avg_internal, 1),
            students_at_risk_count=at_risk
        ))

    return results

@router.get("/{faculty_id}/classes/{course_code}/analytics", response_model=FacultyClassAnalyticsResponse)
def get_class_analytics(
    faculty_id: str,
    course_code: str,
    current_user: User = Depends(require_role(["faculty", "admin"])),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.code == course_code).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    theory = db.query(TheoryAssessment).filter(TheoryAssessment.course_id == course.id).all()
    labs = db.query(LaboratoryAssessment).filter(LaboratoryAssessment.course_id == course.id).all()
    records = theory if course.course_type != "Laboratory" else labs

    enrolled = len(records)
    avg_int = sum(r.internal_total for r in records) / enrolled if enrolled > 0 else 0.0
    avg_att = sum(r.attendance_pct for r in records) / enrolled if enrolled > 0 else 0.0

    grade_dist = {"S": 0, "A+": 0, "A": 0, "B+": 0, "B": 0, "C": 0, "F": 0}
    att_dist = {">=85%": 0, "75-84%": 0, "65-74%": 0, "<65%": 0}

    students_list = []
    for r in records:
        st = r.student
        att = r.attendance_pct
        internal = r.internal_total
        
        # Attendance brackets
        if att >= 85: att_dist[">=85%"] += 1
        elif att >= 75: att_dist["75-84%"] += 1
        elif att >= 65: att_dist["65-74%"] += 1
        else: att_dist["<65%"] += 1

        # Projected grade based on internal
        equiv_100 = (internal / 40.0) * 100.0
        g = "B"
        if equiv_100 >= 90: g = "S"
        elif equiv_100 >= 80: g = "A+"
        elif equiv_100 >= 70: g = "A"
        elif equiv_100 >= 60: g = "B+"
        elif equiv_100 >= 50: g = "B"
        elif equiv_100 >= 40: g = "C"
        else: g = "F"
        grade_dist[g] = grade_dist.get(g, 0) + 1

        students_list.append({
            "roll_no": st.roll_no if st else "UNKNOWN",
            "name": st.user.full_name if st and st.user else "Student",
            "section": st.section if st else "A",
            "attendance_pct": att,
            "internal_total": internal,
            "projected_grade": g,
            "status": "AT_RISK" if att < 75.0 or internal < 20.0 else "ON_TRACK"
        })

    return FacultyClassAnalyticsResponse(
        course_code=course.code,
        course_name=course.name,
        total_students=enrolled,
        avg_internal=round(avg_int, 1),
        avg_attendance=round(avg_att, 1),
        grade_distribution=grade_dist,
        attendance_distribution=att_dist,
        students=students_list
    )
