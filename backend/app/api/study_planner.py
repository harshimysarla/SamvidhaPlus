from typing import List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, verify_student_access
from app.models.models import User, Student, StudyTask, Course, TheoryAssessment
from app.schemas.schemas import StudyTaskCreate, StudyTaskUpdate, StudyTaskResponse, StudyPlannerSummary

router = APIRouter(prefix="/planner", tags=["Smart Study Planner"])

@router.get("/{roll_no}/tasks", response_model=List[StudyTaskResponse])
def get_study_tasks(
    roll_no: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_student_access)
):
    student = db.query(Student).filter(Student.roll_no == roll_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    tasks = db.query(StudyTask).filter(
        StudyTask.student_id == student.id
    ).order_by(StudyTask.scheduled_date.asc()).all()

    return tasks

@router.post("/{roll_no}/tasks", response_model=StudyTaskResponse, status_code=status.HTTP_201_CREATED)
def create_study_task(
    roll_no: str,
    task_in: StudyTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_student_access)
):
    student = db.query(Student).filter(Student.roll_no == roll_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_task = StudyTask(
        student_id=student.id,
        title=task_in.title,
        course_code=task_in.course_code,
        scheduled_date=task_in.scheduled_date,
        allocated_hours=task_in.allocated_hours,
        priority=task_in.priority,
        is_completed=False,
        rescheduled_count=0
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.patch("/{roll_no}/tasks/{task_id}", response_model=StudyTaskResponse)
def update_study_task(
    roll_no: str,
    task_id: int,
    task_update: StudyTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_student_access)
):
    student = db.query(Student).filter(Student.roll_no == roll_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    task = db.query(StudyTask).filter(
        StudyTask.id == task_id,
        StudyTask.student_id == student.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_update.title is not None:
        task.title = task_update.title
    if task_update.scheduled_date is not None:
        if task_update.scheduled_date != task.scheduled_date:
            task.rescheduled_count += 1
        task.scheduled_date = task_update.scheduled_date
    if task_update.allocated_hours is not None:
        task.allocated_hours = task_update.allocated_hours
    if task_update.priority is not None:
        task.priority = task_update.priority
    if task_update.is_completed is not None:
        task.is_completed = task_update.is_completed

    db.commit()
    db.refresh(task)
    return task

@router.delete("/{roll_no}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_study_task(
    roll_no: str,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_student_access)
):
    student = db.query(Student).filter(Student.roll_no == roll_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    task = db.query(StudyTask).filter(
        StudyTask.id == task_id,
        StudyTask.student_id == student.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return None

@router.get("/{roll_no}/summary", response_model=StudyPlannerSummary)
def get_study_planner_summary(
    roll_no: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_student_access)
):
    student = db.query(Student).filter(Student.roll_no == roll_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    tasks = db.query(StudyTask).filter(StudyTask.student_id == student.id).all()
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.is_completed)
    completion_rate = (completed_tasks / total_tasks * 100.0) if total_tasks > 0 else 0.0
    total_hours = sum(t.allocated_hours for t in tasks)

    # Calculate streak (simulated based on completed tasks count or consecutive active days)
    streak_days = max(1, completed_tasks // 2) if completed_tasks > 0 else 0

    # Build weekly breakdown (next 7 days starting from today)
    today = datetime.now()
    weekly_breakdown = []
    for i in range(7):
        day = today + timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        day_tasks = [t for t in tasks if t.scheduled_date == day_str]
        weekly_breakdown.append({
            "date": day_str,
            "day_name": day.strftime("%a"),
            "task_count": len(day_tasks),
            "completed_count": sum(1 for t in day_tasks if t.is_completed),
            "allocated_hours": sum(t.allocated_hours for t in day_tasks)
        })

    # Build suggested course allocations based on current enrolled courses and assessment scores
    assessments = db.query(TheoryAssessment).filter(TheoryAssessment.student_id == student.id).all()
    suggested_allocations = []
    for a in assessments:
        course_name = a.course.name if a.course else "Theory Subject"
        course_code = a.course.code if a.course else "COURSE"
        score = a.internal_total
        # Lower score => higher suggested weekly hours
        if score < 24:
            sugg_hours = 4.5
            sugg_prio = "High"
            focus = "Core concepts & tutorial problem sets"
        elif score < 32:
            sugg_hours = 3.0
            sugg_prio = "Medium"
            focus = "Unit revisions & practice assignments"
        else:
            sugg_hours = 2.0
            sugg_prio = "Standard"
            focus = "Self-study & sample papers"

        suggested_allocations.append({
            "course_code": course_code,
            "course_name": course_name,
            "current_score": score,
            "suggested_hours_per_week": sugg_hours,
            "priority": sugg_prio,
            "recommended_focus": focus
        })

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "completion_rate_pct": round(completion_rate, 1),
        "study_streak_days": streak_days,
        "total_allocated_hours": round(total_hours, 1),
        "weekly_breakdown": weekly_breakdown,
        "suggested_allocations": suggested_allocations
    }
