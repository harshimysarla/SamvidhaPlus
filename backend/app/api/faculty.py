from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.api.deps import get_db, get_current_user, require_role
from app.repositories.academic_repo import AcademicRepository
from app.models.models import User, Faculty, Course, TheoryAssessment, LaboratoryAssessment, Student, FacultyIntervention
from app.schemas.schemas import FacultyResponse, FacultyCourseOverview, FacultyClassAnalyticsResponse, FacultyInterventionCreate, FacultyInterventionResponse

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

@router.get("/interventions", response_model=List[FacultyInterventionResponse])
def get_faculty_interventions(
    current_user: User = Depends(require_role(["faculty", "admin"])),
    db: Session = Depends(get_db)
):
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty and current_user.role == "admin":
        interventions = db.query(FacultyIntervention).order_by(FacultyIntervention.created_at.desc()).all()
    elif faculty:
        interventions = db.query(FacultyIntervention).filter(
            FacultyIntervention.faculty_id == faculty.id
        ).order_by(FacultyIntervention.created_at.desc()).all()
    else:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    res = []
    for it in interventions:
        st_name = it.student.name if hasattr(it.student, "name") and it.student.name else (it.student.user.full_name if it.student and it.student.user else "Student")
        res.append(FacultyInterventionResponse(
            id=it.id,
            student_roll_no=it.student.roll_no if it.student else "UNKNOWN",
            student_name=st_name,
            course_code=it.course.code if it.course else "COURSE",
            course_name=it.course.name if it.course else "Course Name",
            action_type=it.action_type,
            notes=it.notes,
            follow_up_date=it.follow_up_date,
            status=it.status,
            created_at=it.created_at
        ))
    return res

@router.post("/interventions", response_model=FacultyInterventionResponse, status_code=status.HTTP_201_CREATED)
def create_faculty_intervention(
    item_in: FacultyInterventionCreate,
    current_user: User = Depends(require_role(["faculty", "admin"])),
    db: Session = Depends(get_db)
):
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty and current_user.role != "admin":
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    faculty_id = faculty.id if faculty else 1

    student = db.query(Student).filter(Student.roll_no == item_in.student_roll_no).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student {item_in.student_roll_no} not found")

    course = db.query(Course).filter(Course.code == item_in.course_code).first()
    if not course:
        raise HTTPException(status_code=404, detail=f"Course {item_in.course_code} not found")

    new_interv = FacultyIntervention(
        faculty_id=faculty_id,
        student_id=student.id,
        course_id=course.id,
        action_type=item_in.action_type,
        notes=item_in.notes,
        follow_up_date=item_in.follow_up_date,
        status="Initiated"
    )
    db.add(new_interv)
    db.commit()
    db.refresh(new_interv)

    st_name = student.name if hasattr(student, "name") and student.name else (student.user.full_name if student.user else "Student")
    return FacultyInterventionResponse(
        id=new_interv.id,
        student_roll_no=student.roll_no,
        student_name=st_name,
        course_code=course.code,
        course_name=course.name,
        action_type=new_interv.action_type,
        notes=new_interv.notes,
        follow_up_date=new_interv.follow_up_date,
        status=new_interv.status,
        created_at=new_interv.created_at
    )

@router.patch("/interventions/{intervention_id}", response_model=FacultyInterventionResponse)
def update_faculty_intervention(
    intervention_id: int,
    status_update: Dict[str, Any],
    current_user: User = Depends(require_role(["faculty", "admin"])),
    db: Session = Depends(get_db)
):
    interv = db.query(FacultyIntervention).filter(FacultyIntervention.id == intervention_id).first()
    if not interv:
        raise HTTPException(status_code=404, detail="Intervention not found")

    if "status" in status_update:
        interv.status = status_update["status"]
    if "notes" in status_update:
        interv.notes = status_update["notes"]
    if "follow_up_date" in status_update:
        interv.follow_up_date = status_update["follow_up_date"]

    db.commit()
    db.refresh(interv)

    st_name = interv.student.name if hasattr(interv.student, "name") and interv.student.name else (interv.student.user.full_name if interv.student and interv.student.user else "Student")
    return FacultyInterventionResponse(
        id=interv.id,
        student_roll_no=interv.student.roll_no if interv.student else "UNKNOWN",
        student_name=st_name,
        course_code=interv.course.code if interv.course else "COURSE",
        course_name=interv.course.name if interv.course else "Course Name",
        action_type=interv.action_type,
        notes=interv.notes,
        follow_up_date=interv.follow_up_date,
        status=interv.status,
        created_at=interv.created_at
    )

