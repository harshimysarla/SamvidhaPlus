from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="student")  # student, faculty, admin
    full_name = Column(String(100), nullable=False)
    department = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    
    student_profile = relationship("Student", back_populates="user", uselist=False)
    faculty_profile = relationship("Faculty", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    hod_name = Column(String(100), nullable=True)

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    roll_no = Column(String(30), unique=True, index=True, nullable=False)
    department = Column(String(50), nullable=False)
    branch = Column(String(100), nullable=False)
    section = Column(String(10), nullable=False, default="A")
    regulation = Column(String(20), nullable=False, default="R20")
    academic_year = Column(String(20), nullable=False, default="2024-2025")
    current_semester = Column(Integer, nullable=False, default=1)
    enrollment_status = Column(String(50), default="Active Regular")
    admission_year = Column(Integer, default=2021)
    mentor_name = Column(String(100), nullable=True)
    mentor_email = Column(String(100), nullable=True)
    blood_group = Column(String(10), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    parent_name = Column(String(100), nullable=True)
    parent_phone = Column(String(20), nullable=True)
    cgpa = Column(Float, default=0.0)
    total_credits_earned = Column(Float, default=0.0)
    total_credits_required = Column(Float, default=160.0)
    overall_attendance_percentage = Column(Float, default=0.0)
    avatar_url = Column(String(255), nullable=True)
    
    user = relationship("User", back_populates="student_profile")
    semester_results = relationship("SemesterResult", back_populates="student", cascade="all, delete-orphan")
    theory_assessments = relationship("TheoryAssessment", back_populates="student", cascade="all, delete-orphan")
    lab_assessments = relationship("LaboratoryAssessment", back_populates="student", cascade="all, delete-orphan")
    pending_courses = relationship("PendingCourse", back_populates="student", cascade="all, delete-orphan")
    study_goals = relationship("PersonalStudyGoal", back_populates="student", cascade="all, delete-orphan")
    submissions = relationship("AssignmentSubmission", back_populates="student", cascade="all, delete-orphan")

class Faculty(Base):
    __tablename__ = "faculty"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    faculty_id = Column(String(30), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    department = Column(String(50), nullable=False)
    designation = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    office_location = Column(String(100), nullable=True)
    
    user = relationship("User", back_populates="faculty_profile")
    courses = relationship("Course", back_populates="faculty")
    assignments = relationship("Assignment", back_populates="faculty")

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(30), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    department = Column(String(50), nullable=False)
    semester = Column(Integer, nullable=False)
    regulation = Column(String(20), default="R20")
    category = Column(String(50), default="Core")  # Foundation, Core, Professional Elective, Open Elective, Core Lab, Project Work, Audit
    course_type = Column(String(20), default="Theory")  # Theory, Laboratory, Project
    credits = Column(Float, nullable=False, default=3.0)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=True)
    
    faculty = relationship("Faculty", back_populates="courses")
    theory_assessments = relationship("TheoryAssessment", back_populates="course")
    lab_assessments = relationship("LaboratoryAssessment", back_populates="course")
    assignments = relationship("Assignment", back_populates="course")

class TheoryAssessment(Base):
    __tablename__ = "theory_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    # Samvidha CIE-I & CIE-II breakdown
    cie1 = Column(Float, default=0.0)      # max 10
    aat1_1 = Column(Float, default=0.0)    # max 5
    aat1_2 = Column(Float, default=0.0)    # max 5
    cie2 = Column(Float, default=0.0)      # max 10
    aat2_1 = Column(Float, default=0.0)    # max 5
    aat2_2 = Column(Float, default=0.0)    # max 5
    internal_total = Column(Float, default=0.0) # max 40
    grade = Column(String(10), default="In Progress")
    grade_point = Column(Float, default=0.0)
    status = Column(String(20), default="In Progress")
    classes_conducted = Column(Integer, default=0)
    classes_attended = Column(Integer, default=0)
    attendance_pct = Column(Float, default=0.0)
    
    student = relationship("Student", back_populates="theory_assessments")
    course = relationship("Course", back_populates="theory_assessments")

class LaboratoryAssessment(Base):
    __tablename__ = "laboratory_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    week_marks_json = Column(JSON, default=list) # 14 weeks marks array
    day_to_day_marks = Column(Float, default=0.0) # max 30
    internal_exam_marks = Column(Float, default=0.0) # max 10
    internal_total = Column(Float, default=0.0) # max 40
    grade = Column(String(10), default="In Progress")
    grade_point = Column(Float, default=0.0)
    status = Column(String(20), default="In Progress")
    classes_conducted = Column(Integer, default=0)
    classes_attended = Column(Integer, default=0)
    attendance_pct = Column(Float, default=0.0)
    
    student = relationship("Student", back_populates="lab_assessments")
    course = relationship("Course", back_populates="lab_assessments")

class SemesterResult(Base):
    __tablename__ = "semester_results"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    academic_year = Column(String(20), nullable=False)
    sgpa = Column(Float, nullable=True)
    cgpa = Column(Float, nullable=True)
    credits_registered = Column(Float, default=0.0)
    credits_earned = Column(Float, default=0.0)
    published = Column(Boolean, default=False)
    status = Column(String(30), default="IN_PROGRESS")
    published_date = Column(DateTime, nullable=True)
    
    student = relationship("Student", back_populates="semester_results")

class PendingCourse(Base):
    __tablename__ = "pending_courses"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    category = Column(String(50), nullable=False) # Foundation, Core, etc.
    required_count = Column(Integer, default=0)
    registered_count = Column(Integer, default=0)
    pending_count = Column(Integer, default=0)
    status = Column(String(30), default="In Progress")
    
    student = relationship("Student", back_populates="pending_courses")

class TimetableEntry(Base):
    __tablename__ = "timetable_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    department = Column(String(50), nullable=False)
    semester = Column(Integer, nullable=False)
    section = Column(String(10), nullable=False)
    day = Column(String(20), nullable=False) # Monday, Tuesday, etc.
    start_time = Column(String(10), nullable=False) # 09:30
    end_time = Column(String(10), nullable=False) # 10:30
    course_code = Column(String(30), nullable=False)
    course_name = Column(String(150), nullable=False)
    faculty_name = Column(String(100), nullable=False)
    room = Column(String(50), nullable=False)

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(String(50), primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    due_date = Column(DateTime, nullable=False)
    max_marks = Column(Float, default=10.0)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    created_at = Column(DateTime, default=utcnow)
    
    course = relationship("Course", back_populates="assignments")
    faculty = relationship("Faculty", back_populates="assignments")
    submissions = relationship("AssignmentSubmission", back_populates="assignment")

class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(String(50), ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    submitted_at = Column(DateTime, default=utcnow)
    status = Column(String(20), default="Submitted") # Submitted, Pending, Graded
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    attachment_name = Column(String(255), nullable=True)
    
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("Student", back_populates="submissions")

class Announcement(Base):
    __tablename__ = "announcements"
    
    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), default="General") # Examinations, Academic Regulation, Placements
    scope = Column(String(50), default="Institution-wide") # Institution-wide, Department, Section
    department = Column(String(50), nullable=True)
    content = Column(Text, nullable=False)
    author = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=utcnow)

class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    
    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    event_date = Column(String(30), nullable=False) # YYYY-MM-DD
    end_date = Column(String(30), nullable=True)
    event_type = Column(String(30), default="event") # exam, holiday, event, deadline
    description = Column(Text, nullable=True)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="info") # alert, warning, info, grade, assignment
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    link = Column(String(255), nullable=True)
    
    user = relationship("User", back_populates="notifications")

class PersonalStudyGoal(Base):
    __tablename__ = "personal_study_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    title = Column(String(150), nullable=False)
    target_date = Column(String(30), nullable=True)
    is_completed = Column(Boolean, default=False)
    category = Column(String(50), default="Academic")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    
    student = relationship("Student", back_populates="study_goals")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=False)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=utcnow)
    details = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="audit_logs")

class IntegrationConfig(Base):
    __tablename__ = "integration_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    provider_name = Column(String(50), unique=True, nullable=False) # "Demo Data", "Authorized Import", "Official API"
    is_active = Column(Boolean, default=False)
    api_base_url = Column(String(255), nullable=True)
    sync_status = Column(String(50), default="Idle")
    last_synced_at = Column(DateTime, nullable=True)
    config_json = Column(JSON, default=dict)
