from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
import csv
import io
from datetime import datetime, timezone
from app.api.deps import get_db, get_current_user, verify_student_access, require_role
from app.repositories.academic_repo import AcademicRepository
from app.models.models import User, Student, Course, TheoryAssessment

router = APIRouter(prefix="/reports", tags=["Academic Reports"])

@router.get("/student/{roll_no}/csv")
def export_student_academic_csv(
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

    output = io.StringIO()
    writer = csv.writer(output)

    # Document Header & Provenance Disclaimer
    writer.writerow(["SMART ACADEMIC INTELLIGENCE PORTAL - STUDENT ACADEMIC SUMMARY REPORT"])
    writer.writerow(["Disclaimer: Unofficial student academic summary for reference only. Not an official transcript."])
    writer.writerow([f"Generated At: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}"])
    writer.writerow([f"Roll Number: {student.roll_no}", f"Name: {student.user.full_name if student.user else student.roll_no}"])
    writer.writerow([f"Department: {student.department}", f"Current Semester: {student.current_semester}", f"CGPA: {student.cgpa}"])
    writer.writerow([])

    # Table Header
    writer.writerow(["Course Code", "Course Name", "Type", "Credits", "CIE-I (10)", "CIE-II (10)", "Internal Total (40)", "Attendance %", "Grade Point", "Status"])

    for t in theory:
        writer.writerow([
            t.course.code if t.course else "",
            t.course.name if t.course else "",
            "Theory",
            t.course.credits if t.course else 3.0,
            t.cie1,
            t.cie2,
            t.internal_total,
            f"{t.attendance_pct}%",
            t.grade_point,
            t.status
        ])

    for l in labs:
        writer.writerow([
            l.course.code if l.course else "",
            l.course.name if l.course else "",
            "Laboratory",
            l.course.credits if l.course else 1.5,
            "-",
            "-",
            l.internal_total,
            f"{l.attendance_pct}%",
            l.grade_point,
            l.status
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=Academic_Report_{roll_no}.csv"}
    )

@router.get("/faculty/class/{course_code}/csv")
def export_class_performance_csv(
    course_code: str,
    current_user: User = Depends(require_role(["faculty", "admin"])),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.code == course_code).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    theory = db.query(TheoryAssessment).filter(TheoryAssessment.course_id == course.id).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["SMART ACADEMIC INTELLIGENCE PORTAL - CLASS PERFORMANCE REPORT"])
    writer.writerow([f"Course: {course.code} - {course.name}", f"Department: {course.department}", f"Semester: {course.semester}"])
    writer.writerow([f"Generated At: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}"])
    writer.writerow([])
    writer.writerow(["Roll Number", "Student Name", "Section", "Internal Total (40)", "Attendance %", "Support Needed"])

    for t in theory:
        st = t.student
        writer.writerow([
            st.roll_no if st else "",
            st.user.full_name if st and st.user else "Student",
            st.section if st else "A",
            t.internal_total,
            f"{t.attendance_pct}%",
            "YES (Attendance < 75%)" if t.attendance_pct < 75.0 else "NO"
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=Class_Report_{course_code}.csv"}
    )
