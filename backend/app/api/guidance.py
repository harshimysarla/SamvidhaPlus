from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, verify_student_access
from app.models.models import User, Student, AcademicRecommendation, TheoryAssessment, LaboratoryAssessment, SemesterResult
from app.schemas.schemas import RecommendationResponse, RecommendationStatusUpdate
from app.analytics.guidance_engine import GuidanceEngine

router = APIRouter(prefix="/guidance", tags=["Academic Guidance"])

@router.get("/{roll_no}", response_model=List[RecommendationResponse])
def get_student_recommendations(
    roll_no: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_student_access)
):
    student = db.query(Student).filter(Student.roll_no == roll_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check for existing recommendations in database
    existing = db.query(AcademicRecommendation).filter(
        AcademicRecommendation.student_id == student.id
    ).all()

    if existing:
        return existing

    # Synthesize dynamically if not seeded
    theory_records = db.query(TheoryAssessment).filter(TheoryAssessment.student_id == student.id).all()
    course_att = [
        {
            "course_code": t.course.code if t.course else "Course",
            "course_name": t.course.name if t.course else "Course",
            "percentage": t.attendance_pct,
            "classes_attended": t.classes_attended,
            "classes_conducted": t.classes_conducted
        }
        for t in theory_records
    ]

    theory_list = [
        {
            "course_code": t.course.code if t.course else "Course",
            "course_name": t.course.name if t.course else "Course",
            "internal_total": t.internal_total,
            "cie1_marks": t.cie1,
            "aat1_marks": t.aat1_1 + t.aat1_2,
            "aat2_marks": t.aat2_1 + t.aat2_2,
            "faculty_name": "Course Faculty"
        }
        for t in theory_records
    ]

    lab_records = db.query(LaboratoryAssessment).filter(LaboratoryAssessment.student_id == student.id).all()
    lab_list = [
        {
            "course_code": l.course.code if l.course else "Lab",
            "course_name": l.course.name if l.course else "Lab",
            "day_to_day_marks": l.day_to_day_marks,
            "internal_exam_marks": l.internal_exam_marks
        }
        for l in lab_records
    ]

    sem_records = db.query(SemesterResult).filter(SemesterResult.student_id == student.id).all()
    sem_list = [{"sgpa": s.sgpa, "semester": s.semester_number, "published": s.is_published} for s in sem_records]

    generated = GuidanceEngine.generate_recommendations(
        student_roll=student.roll_no,
        student_name=student.name if hasattr(student, "name") and student.name else "Student",
        current_cgpa=student.cgpa,
        attendance_overall=student.current_attendance_pct,
        course_attendance=course_att,
        theory_assessments=theory_list,
        lab_assessments=lab_list,
        semester_history=sem_list
    )

    created_objs = []
    for g in generated:
        rec_obj = AcademicRecommendation(
            id=g["id"],
            student_id=student.id,
            category=g["category"],
            title=g["title"],
            observation=g["observation"],
            why_it_matters=g["why_it_matters"],
            supporting_data=g["supporting_data"],
            recommended_action=g["recommended_action"],
            suggested_timeframe=g["suggested_timeframe"],
            priority=g["priority"],
            status=g["status"]
        )
        db.add(rec_obj)
        created_objs.append(rec_obj)

    db.commit()
    for obj in created_objs:
        db.refresh(obj)

    return created_objs

@router.patch("/{roll_no}/{rec_id}/status", response_model=RecommendationResponse)
def update_recommendation_status(
    roll_no: str,
    rec_id: str,
    update: RecommendationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_student_access)
):
    student = db.query(Student).filter(Student.roll_no == roll_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    rec = db.query(AcademicRecommendation).filter(
        AcademicRecommendation.id == rec_id,
        AcademicRecommendation.student_id == student.id
    ).first()

    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.status = update.status
    db.commit()
    db.refresh(rec)
    return rec
