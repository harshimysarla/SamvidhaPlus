from app.models.models import (
    User, Department, Student, Faculty, Course, TheoryAssessment,
    LaboratoryAssessment, SemesterResult, PendingCourse, TimetableEntry,
    Assignment, AssignmentSubmission, Announcement, CalendarEvent,
    Notification, PersonalStudyGoal, AuditLog, IntegrationConfig
)
from app.core.database import Base

__all__ = [
    "Base", "User", "Department", "Student", "Faculty", "Course",
    "TheoryAssessment", "LaboratoryAssessment", "SemesterResult",
    "PendingCourse", "TimetableEntry", "Assignment", "AssignmentSubmission",
    "Announcement", "CalendarEvent", "Notification", "PersonalStudyGoal",
    "AuditLog", "IntegrationConfig"
]
