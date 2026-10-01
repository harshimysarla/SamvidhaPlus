from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str
    full_name: str
    department: Optional[str] = None
    roll_no: Optional[str] = None
    faculty_id: Optional[str] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

class LoginRequest(BaseModel):
    username: str
    password: str
    role_requested: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    full_name: str
    department: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True

# --- Student Schemas ---
class StudentBase(BaseModel):
    roll_no: str
    department: str
    branch: str
    section: str
    regulation: str
    academic_year: str
    current_semester: int
    enrollment_status: str
    admission_year: int
    mentor_name: Optional[str] = None
    mentor_email: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    cgpa: float
    total_credits_earned: float
    total_credits_required: float
    overall_attendance_percentage: float
    avatar_url: Optional[str] = None

class StudentResponse(StudentBase):
    id: int
    name: str

    class Config:
        from_attributes = True

# --- Faculty Schemas ---
class FacultyResponse(BaseModel):
    id: int
    faculty_id: str
    name: str
    department: str
    designation: str
    email: str
    phone: Optional[str] = None
    office_location: Optional[str] = None

    class Config:
        from_attributes = True

# --- Course & Assessment Schemas ---
class CourseResponse(BaseModel):
    id: int
    code: str
    name: str
    department: str
    semester: int
    regulation: str
    category: str
    course_type: str
    credits: float
    faculty_name: Optional[str] = None

    class Config:
        from_attributes = True

class TheoryAssessmentResponse(BaseModel):
    id: int
    course_code: str
    course_name: str
    category: str
    credits: float
    cie1: float
    aat1_1: float
    aat1_2: float
    cie2: float
    aat2_1: float
    aat2_2: float
    internal_total: float
    grade: str
    grade_point: float
    status: str
    classes_conducted: int
    classes_attended: int
    attendance_pct: float
    faculty_name: Optional[str] = None

class LaboratoryAssessmentResponse(BaseModel):
    id: int
    course_code: str
    course_name: str
    category: str
    credits: float
    week_marks: List[float]
    day_to_day_marks: float
    internal_exam_marks: float
    internal_total: float
    grade: str
    grade_point: float
    status: str
    classes_conducted: int
    classes_attended: int
    attendance_pct: float
    faculty_name: Optional[str] = None

class SemesterResultResponse(BaseModel):
    id: int
    semester: int
    academic_year: str
    sgpa: Optional[float]
    cgpa: Optional[float]
    credits_registered: float
    credits_earned: float
    published: bool
    status: str
    published_date: Optional[datetime]

    class Config:
        from_attributes = True

class PendingCourseResponse(BaseModel):
    id: int
    category: str
    required_count: int
    registered_count: int
    pending_count: int
    status: str

    class Config:
        from_attributes = True

# --- Attendance Schemas ---
class CourseAttendanceDetail(BaseModel):
    course_code: str
    course_name: str
    course_type: str
    classes_conducted: int
    classes_attended: int
    attendance_pct: float
    status: str  # Regular (>=75), Condonation (65-74.9), Critical (<65)
    margin_classes_to_75: int
    can_miss_classes: int

class AttendanceOverviewResponse(BaseModel):
    overall_percentage: float
    total_conducted: int
    total_attended: int
    status: str  # Regular, Condonation, Critical
    regular_threshold: float
    condonation_threshold: float
    courses: List[CourseAttendanceDetail]
    attendance_trend: str

# --- Analytics Schemas ---
class ComponentScore(BaseModel):
    name: str
    weight: float
    score: float
    max_score: float = 100.0
    status: str # "Available", "Partial", "Missing"
    description: str

class ExplainableInsight(BaseModel):
    type: str # "strength", "warning", "info", "trend"
    title: str
    observation: str
    supporting_data: str
    significance: str
    recommended_action: str

class PerformanceIndexResponse(BaseModel):
    index_score: float # 0 - 100
    rating: str # Exemplary, Superior, Proficient, Needs Improvement
    is_partial: bool
    data_completeness_pct: float
    components: List[ComponentScore]
    insights: List[ExplainableInsight]

# --- Predictions & Scenarios Schemas ---
class SGPAEstimationResponse(BaseModel):
    estimated_sgpa_min: float
    estimated_sgpa_max: float
    most_likely_sgpa: float
    historical_avg_sgpa: float
    confidence_level: str
    assumptions: List[str]
    methodology: str
    limitations: str
    disclaimer: str

class CGPAScenarioRequest(BaseModel):
    hypothetical_sgpa_next: float
    target_cgpa: Optional[float] = None

class CGPAScenarioResponse(BaseModel):
    current_cgpa: float
    current_earned_credits: float
    next_semester_credits: float
    projected_cgpa: float
    cgpa_difference: float
    required_sgpa_for_target: Optional[float] = None
    is_target_achievable: Optional[bool] = None
    scenario_trajectory: List[Dict[str, Any]]

class AttendanceForecastRequest(BaseModel):
    course_code: Optional[str] = None
    upcoming_classes_to_attend: int
    total_upcoming_classes: int

class AttendanceForecastResponse(BaseModel):
    current_percentage: float
    projected_percentage: float
    classes_needed_for_75: int
    classes_needed_for_85: int
    max_classes_can_miss_safe: int
    forecast_trajectory: List[Dict[str, Any]]

class RiskIndicator(BaseModel):
    severity: str # "HIGH", "MEDIUM", "LOW"
    category: str # "ATTENDANCE", "INTERNAL_MARKS", "CREDITS", "PREREQUISITE"
    title: str
    details: str
    threshold_breached: str
    action_suggested: str

class AcademicRiskResponse(BaseModel):
    overall_risk_level: str # "SAFE", "MONITOR", "AT_RISK"
    indicators: List[RiskIndicator]
    disclaimer: str

# --- Calendar & Timetable Schemas ---
class TimetableResponse(BaseModel):
    day: str
    slots: List[Dict[str, Any]]

class CalendarEventResponse(BaseModel):
    id: str
    title: str
    event_date: str
    end_date: Optional[str] = None
    event_type: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

# --- Assignment Schemas ---
class AssignmentResponse(BaseModel):
    id: str
    course_code: str
    course_name: str
    title: str
    description: str
    due_date: datetime
    max_marks: float
    faculty_name: str
    submission_status: str # "Submitted", "Pending", "Overdue"
    score: Optional[float] = None
    feedback: Optional[str] = None

class AssignmentCreateRequest(BaseModel):
    course_id: int
    title: str
    description: str
    due_date: datetime
    max_marks: float = 10.0

class AssignmentSubmissionRequest(BaseModel):
    assignment_id: str
    attachment_name: Optional[str] = "assignment_submission.pdf"

# --- Announcement & Notification Schemas ---
class AnnouncementResponse(BaseModel):
    id: str
    title: str
    category: str
    scope: str
    department: Optional[str] = None
    content: str
    author: str
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    category: str
    is_read: bool
    created_at: datetime
    link: Optional[str] = None

    class Config:
        from_attributes = True

class PersonalStudyGoalResponse(BaseModel):
    id: int
    title: str
    target_date: Optional[str] = None
    is_completed: bool
    category: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class PersonalStudyGoalCreate(BaseModel):
    title: str
    target_date: Optional[str] = None
    category: str = "Academic"
    notes: Optional[str] = None

# --- Faculty Class Analytics Schemas ---
class FacultyCourseOverview(BaseModel):
    course_id: int
    course_code: str
    course_name: str
    department: str
    semester: int
    enrolled_count: int
    avg_attendance: float
    avg_internal_marks: float
    students_at_risk_count: int

class FacultyClassAnalyticsResponse(BaseModel):
    course_code: str
    course_name: str
    total_students: int
    avg_internal: float
    avg_attendance: float
    grade_distribution: Dict[str, int]
    attendance_distribution: Dict[str, int]
    students: List[Dict[str, Any]]

# --- Data Import & Integration Schemas ---
class DataImportPreviewRow(BaseModel):
    row_number: int
    roll_no: str
    name: str
    course_code: str
    marks: Optional[float] = None
    attendance_pct: Optional[float] = None
    is_valid: bool
    validation_error: Optional[str] = None

class DataImportSummary(BaseModel):
    file_name: str
    total_rows: int
    valid_rows: int
    invalid_rows: int
    preview_sample: List[DataImportPreviewRow]
    can_import: bool

class IntegrationStatusResponse(BaseModel):
    active_provider: str # "Demo Data", "Authorized Import", "Official API"
    data_source_badge: str
    official_api_configured: bool
    sync_status: str
    last_synced_at: Optional[datetime] = None
    system_message: str
