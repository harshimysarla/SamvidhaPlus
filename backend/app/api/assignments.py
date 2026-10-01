from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import uuid
from app.api.deps import get_db, get_current_user, require_role
from app.repositories.academic_repo import AcademicRepository
from app.models.models import User, Student, Faculty, Assignment, AssignmentSubmission, Course
from app.schemas.schemas import AssignmentResponse, AssignmentCreateRequest, AssignmentSubmissionRequest

router = APIRouter(prefix="/assignments", tags=["Assignments"])

@router.get("", response_model=List[AssignmentResponse])
def get_assignments(
    course_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = AcademicRepository(db)
    roll_no = None
    faculty_id = None
    if current_user.role == "student":
        student = repo.get_student_by_user_id(current_user.id)
        if student:
            roll_no = student.roll_no
    elif current_user.role == "faculty":
        fac = repo.get_faculty_by_user_id(current_user.id)
        if fac:
            faculty_id = fac.id

    return repo.get_assignments(course_id=course_id, faculty_id=faculty_id, student_roll_no=roll_no)

@router.post("", response_model=AssignmentResponse)
def create_assignment(
    req: AssignmentCreateRequest,
    current_user: User = Depends(require_role(["faculty", "admin"])),
    db: Session = Depends(get_db)
):
    repo = AcademicRepository(db)
    fac = repo.get_faculty_by_user_id(current_user.id)
    if not fac and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only faculty can publish assignments.")
    
    course = db.query(Course).filter(Course.id == req.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    new_id = f"ASG-{uuid.uuid4().hex[:6].upper()}"
    faculty_db_id = fac.id if fac else 1

    asg = Assignment(
        id=new_id,
        course_id=course.id,
        title=req.title,
        description=req.description,
        due_date=req.due_date,
        max_marks=req.max_marks,
        faculty_id=faculty_db_id
    )
    db.add(asg)
    db.commit()
    db.refresh(asg)

    return AssignmentResponse(
        id=asg.id,
        course_code=course.code,
        course_name=course.name,
        title=asg.title,
        description=asg.description,
        due_date=asg.due_date,
        max_marks=asg.max_marks,
        faculty_name=fac.name if fac else "Academic Faculty",
        submission_status="Pending"
    )

@router.post("/{assignment_id}/submit")
def submit_assignment(
    assignment_id: str,
    req: AssignmentSubmissionRequest,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
):
    repo = AcademicRepository(db)
    student = repo.get_student_by_user_id(current_user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    sub = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.student_id == student.id
    ).first()

    if not sub:
        sub = AssignmentSubmission(
            assignment_id=assignment_id,
            student_id=student.id,
            attachment_name=req.attachment_name or "submission.pdf",
            status="Submitted",
            submitted_at=datetime.now(timezone.utc)
        )
        db.add(sub)
    else:
        sub.attachment_name = req.attachment_name or sub.attachment_name
        sub.status = "Submitted"
        sub.submitted_at = datetime.now(timezone.utc)

    db.commit()
    return {"message": "Assignment submitted successfully", "submission_id": sub.id, "status": sub.status}
