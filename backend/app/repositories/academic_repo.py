from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
from app.models.models import (
    User, Student, Faculty, Course, TheoryAssessment, LaboratoryAssessment,
    SemesterResult, PendingCourse, TimetableEntry, Assignment, AssignmentSubmission,
    Announcement, CalendarEvent, Notification, PersonalStudyGoal, AuditLog, IntegrationConfig
)

class AcademicRepository:
    def __init__(self, db: Session):
        self.db = db

    # User & Auth
    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_student_by_roll_no(self, roll_no: str) -> Optional[Student]:
        return self.db.query(Student).filter(Student.roll_no == roll_no).first()

    def get_student_by_user_id(self, user_id: int) -> Optional[Student]:
        return self.db.query(Student).filter(Student.user_id == user_id).first()

    def get_faculty_by_id(self, faculty_id: str) -> Optional[Faculty]:
        return self.db.query(Faculty).filter(Faculty.faculty_id == faculty_id).first()

    def get_faculty_by_user_id(self, user_id: int) -> Optional[Faculty]:
        return self.db.query(Faculty).filter(Faculty.user_id == user_id).first()

    # Courses & Assessments
    def get_all_courses(self, department: Optional[str] = None, semester: Optional[int] = None) -> List[Course]:
        query = self.db.query(Course)
        if department:
            query = query.filter(Course.department == department)
        if semester:
            query = query.filter(Course.semester == semester)
        return query.all()

    def get_theory_assessments(self, roll_no: str, semester: Optional[int] = None) -> List[TheoryAssessment]:
        student = self.get_student_by_roll_no(roll_no)
        if not student:
            return []
        query = self.db.query(TheoryAssessment).filter(TheoryAssessment.student_id == student.id)
        if semester:
            query = query.filter(TheoryAssessment.semester == semester)
        return query.all()

    def get_lab_assessments(self, roll_no: str, semester: Optional[int] = None) -> List[LaboratoryAssessment]:
        student = self.get_student_by_roll_no(roll_no)
        if not student:
            return []
        query = self.db.query(LaboratoryAssessment).filter(LaboratoryAssessment.student_id == student.id)
        if semester:
            query = query.filter(LaboratoryAssessment.semester == semester)
        return query.all()

    def get_semester_history(self, roll_no: str) -> List[SemesterResult]:
        student = self.get_student_by_roll_no(roll_no)
        if not student:
            return []
        return self.db.query(SemesterResult).filter(SemesterResult.student_id == student.id).order_by(SemesterResult.semester.asc()).all()

    def get_pending_courses(self, roll_no: str) -> List[PendingCourse]:
        student = self.get_student_by_roll_no(roll_no)
        if not student:
            return []
        return self.db.query(PendingCourse).filter(PendingCourse.student_id == student.id).all()

    def get_credit_summary(self, roll_no: str) -> Dict[str, Any]:
        student = self.get_student_by_roll_no(roll_no)
        if not student:
            return {"cgpa": 0.0, "earned_credits": 0.0, "required_credits": 160.0}
        return {
            "cgpa": student.cgpa,
            "earned_credits": student.total_credits_earned,
            "required_credits": student.total_credits_required
        }

    def get_attendance_summary(self, roll_no: str) -> Dict[str, Any]:
        student = self.get_student_by_roll_no(roll_no)
        if not student:
            return {"overall_percentage": 0.0, "total_conducted": 0, "total_attended": 0, "courses": []}
        
        theory = self.get_theory_assessments(roll_no)
        labs = self.get_lab_assessments(roll_no)
        
        courses_summary = []
        total_conducted = 0
        total_attended = 0
        
        for t in theory:
            conducted = t.classes_conducted or 0
            attended = t.classes_attended or 0
            pct = (attended / conducted * 100) if conducted > 0 else 0.0
            total_conducted += conducted
            total_attended += attended
            
            # Calculate classes needed or can miss
            margin = 0
            can_miss = 0
            if conducted > 0:
                if pct < 75.0:
                    # (attended + x) / (conducted + x) >= 0.75 => x >= (0.75 * conducted - attended) / 0.25
                    margin = max(0, int(round((0.75 * conducted - attended) / 0.25 + 0.49)))
                else:
                    # attended / (conducted + y) >= 0.75 => y <= (attended - 0.75 * conducted) / 0.75
                    can_miss = max(0, int((attended - 0.75 * conducted) / 0.75))
            
            courses_summary.append({
                "course_code": t.course.code if t.course else "UNKNOWN",
                "course_name": t.course.name if t.course else "Unknown Course",
                "course_type": "Theory",
                "classes_conducted": conducted,
                "classes_attended": attended,
                "attendance_pct": round(pct, 1),
                "status": "Regular" if pct >= 75.0 else ("Condonation" if pct >= 65.0 else "Critical"),
                "margin_classes_to_75": margin,
                "can_miss_classes": can_miss
            })
            
        for l in labs:
            conducted = l.classes_conducted or 0
            attended = l.classes_attended or 0
            pct = (attended / conducted * 100) if conducted > 0 else 0.0
            total_conducted += conducted
            total_attended += attended
            margin = 0
            can_miss = 0
            if conducted > 0:
                if pct < 75.0:
                    margin = max(0, int(round((0.75 * conducted - attended) / 0.25 + 0.49)))
                else:
                    can_miss = max(0, int((attended - 0.75 * conducted) / 0.75))
            
            courses_summary.append({
                "course_code": l.course.code if l.course else "UNKNOWN",
                "course_name": l.course.name if l.course else "Unknown Lab",
                "course_type": "Laboratory",
                "classes_conducted": conducted,
                "classes_attended": attended,
                "attendance_pct": round(pct, 1),
                "status": "Regular" if pct >= 75.0 else ("Condonation" if pct >= 65.0 else "Critical"),
                "margin_classes_to_75": margin,
                "can_miss_classes": can_miss
            })
            
        overall_pct = (total_attended / total_conducted * 100) if total_conducted > 0 else student.overall_attendance_percentage
        
        status = "Regular"
        if overall_pct < 65.0:
            status = "Critical"
        elif overall_pct < 75.0:
            status = "Condonation"
            
        return {
            "overall_percentage": round(overall_pct, 2),
            "total_conducted": total_conducted,
            "total_attended": total_attended,
            "status": status,
            "regular_threshold": 75.0,
            "condonation_threshold": 65.0,
            "courses": courses_summary,
            "attendance_trend": "Consistent" if overall_pct >= 75 else "Requires Attention"
        }

    # Timetable
    def get_timetable(self, department: str, semester: int, section: str) -> List[Dict[str, Any]]:
        entries = self.db.query(TimetableEntry).filter(
            TimetableEntry.department == department,
            TimetableEntry.semester == semester,
            TimetableEntry.section == section
        ).all()
        # Group by day
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        result = []
        for day in days:
            day_entries = [e for e in entries if e.day.lower() == day.lower()]
            if day_entries:
                slots = []
                for e in day_entries:
                    slots.append({
                        "start_time": e.start_time,
                        "end_time": e.end_time,
                        "course_code": e.course_code,
                        "course_name": e.course_name,
                        "faculty": e.faculty_name,
                        "room": e.room
                    })
                result.append({"day": day, "slots": slots})
        return result

    # Assignments
    def get_assignments(self, course_id: Optional[int] = None, faculty_id: Optional[int] = None, student_roll_no: Optional[str] = None) -> List[Dict[str, Any]]:
        query = self.db.query(Assignment)
        if course_id:
            query = query.filter(Assignment.course_id == course_id)
        if faculty_id:
            query = query.filter(Assignment.faculty_id == faculty_id)
        assignments = query.all()
        
        student = self.get_student_by_roll_no(student_roll_no) if student_roll_no else None
        
        result = []
        for a in assignments:
            sub = None
            if student:
                sub = self.db.query(AssignmentSubmission).filter(
                    AssignmentSubmission.assignment_id == a.id,
                    AssignmentSubmission.student_id == student.id
                ).first()
            
            result.append({
                "id": a.id,
                "course_code": a.course.code if a.course else "",
                "course_name": a.course.name if a.course else "",
                "title": a.title,
                "description": a.description,
                "due_date": a.due_date,
                "max_marks": a.max_marks,
                "faculty_name": a.faculty.name if a.faculty else "Faculty",
                "submission_status": sub.status if sub else "Pending",
                "score": sub.score if sub else None,
                "feedback": sub.feedback if sub else None
            })
        return result

    # Calendar & Announcements
    def get_calendar_events(self) -> List[CalendarEvent]:
        return self.db.query(CalendarEvent).order_by(CalendarEvent.event_date.asc()).all()

    def get_announcements(self, department: Optional[str] = None) -> List[Announcement]:
        query = self.db.query(Announcement)
        if department:
            query = query.filter((Announcement.department == department) | (Announcement.scope == "Institution-wide"))
        return query.order_by(Announcement.created_at.desc()).all()

    # Notifications
    def get_user_notifications(self, user_id: int) -> List[Notification]:
        return self.db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

    def mark_notification_read(self, notif_id: int, user_id: int) -> bool:
        notif = self.db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == user_id).first()
        if notif:
            notif.is_read = True
            self.db.commit()
            return True
        return False

    # Personal Study Goals
    def get_study_goals(self, student_id: int) -> List[PersonalStudyGoal]:
        return self.db.query(PersonalStudyGoal).filter(PersonalStudyGoal.student_id == student_id).order_by(PersonalStudyGoal.created_at.desc()).all()

    def add_study_goal(self, student_id: int, title: str, target_date: Optional[str], category: str, notes: Optional[str]) -> PersonalStudyGoal:
        goal = PersonalStudyGoal(
            student_id=student_id,
            title=title,
            target_date=target_date,
            category=category,
            notes=notes,
            is_completed=False
        )
        self.db.add(goal)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def toggle_study_goal(self, goal_id: int, student_id: int) -> Optional[PersonalStudyGoal]:
        goal = self.db.query(PersonalStudyGoal).filter(PersonalStudyGoal.id == goal_id, PersonalStudyGoal.student_id == student_id).first()
        if goal:
            goal.is_completed = not goal.is_completed
            self.db.commit()
            self.db.refresh(goal)
            return goal
        return None

    # Audit Logging
    def log_action(self, user_id: Optional[int], action: str, resource: str, details: Optional[str] = None, ip_address: Optional[str] = None):
        log = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            details=details,
            ip_address=ip_address
        )
        self.db.add(log)
        self.db.commit()
