export type UserRole = "student" | "faculty" | "admin";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  full_name: string;
  department?: string;
  is_active: boolean;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  role: UserRole;
  username: string;
  full_name: string;
  department?: string;
  roll_no?: string;
  faculty_id?: string;
}

export interface StudentProfile {
  id: number;
  roll_no: string;
  name: string;
  department: string;
  branch: string;
  section: string;
  regulation: string;
  academic_year: string;
  current_semester: number;
  enrollment_status: string;
  admission_year: number;
  mentor_name?: string;
  mentor_email?: string;
  blood_group?: string;
  phone?: string;
  address?: string;
  parent_name?: string;
  parent_phone?: string;
  cgpa: number;
  total_credits_earned: number;
  total_credits_required: number;
  overall_attendance_percentage: number;
  avatar_url?: string;
}

export interface FacultyProfile {
  id: number;
  faculty_id: string;
  name: string;
  department: string;
  designation: string;
  email: string;
  phone?: string;
  office_location?: string;
}

export interface TheoryAssessment {
  id: number;
  course_code: string;
  course_name: string;
  category: string;
  credits: number;
  cie1: number;
  aat1_1: number;
  aat1_2: number;
  cie2: number;
  aat2_1: number;
  aat2_2: number;
  internal_total: number;
  grade: string;
  grade_point: number;
  status: string;
  classes_conducted: number;
  classes_attended: number;
  attendance_pct: number;
  faculty_name?: string;
}

export interface LaboratoryAssessment {
  id: number;
  course_code: string;
  course_name: string;
  category: string;
  credits: number;
  week_marks: number[];
  day_to_day_marks: number;
  internal_exam_marks: number;
  internal_total: number;
  grade: string;
  grade_point: number;
  status: string;
  classes_conducted: number;
  classes_attended: number;
  attendance_pct: number;
  faculty_name?: string;
}

export interface SemesterResult {
  id: number;
  semester: number;
  academic_year: string;
  sgpa: number | null;
  cgpa: number | null;
  credits_registered: number;
  credits_earned: number;
  published: boolean;
  status: string;
  published_date?: string;
}

export interface PendingCourseCategory {
  id: number;
  category: string;
  required_count: number;
  registered_count: number;
  pending_count: number;
  status: string;
}

export interface CourseAttendanceDetail {
  course_code: string;
  course_name: string;
  course_type: string;
  classes_conducted: number;
  classes_attended: number;
  attendance_pct: number;
  status: "Regular" | "Condonation" | "Critical";
  margin_classes_to_75: number;
  can_miss_classes: number;
}

export interface AttendanceOverview {
  overall_percentage: number;
  total_conducted: number;
  total_attended: number;
  status: "Regular" | "Condonation" | "Critical";
  regular_threshold: number;
  condonation_threshold: number;
  courses: CourseAttendanceDetail[];
  attendance_trend: string;
}

export interface ComponentScore {
  name: string;
  weight: number;
  score: number;
  max_score: number;
  status: "Available" | "Partial" | "Missing";
  description: string;
}

export interface ExplainableInsight {
  type: "strength" | "warning" | "info" | "trend";
  title: string;
  observation: string;
  supporting_data: string;
  significance: string;
  recommended_action: string;
}

export interface PerformanceIndex {
  index_score: number;
  rating: string;
  is_partial: boolean;
  data_completeness_pct: number;
  components: ComponentScore[];
  insights: ExplainableInsight[];
}

export interface SGPAEstimate {
  estimated_sgpa_min: number;
  estimated_sgpa_max: number;
  most_likely_sgpa: number;
  historical_avg_sgpa: number;
  confidence_level: string;
  assumptions: string[];
  methodology: string;
  limitations: string;
  disclaimer: string;
}

export interface CGPAScenarioTrajectoryItem {
  hypothetical_sgpa: number;
  projected_cgpa: number;
  delta: number;
}

export interface CGPAScenarioResult {
  current_cgpa: number;
  current_earned_credits: number;
  next_semester_credits: number;
  projected_cgpa: number;
  cgpa_difference: number;
  required_sgpa_for_target?: number;
  is_target_achievable?: boolean;
  scenario_trajectory: CGPAScenarioTrajectoryItem[];
}

export interface AttendanceForecastItem {
  additional_classes: number;
  pct_if_attend_all: number;
  pct_if_miss_all: number;
}

export interface AttendanceForecastResult {
  current_percentage: number;
  projected_percentage: number;
  classes_needed_for_75: number;
  classes_needed_for_85: number;
  max_classes_can_miss_safe: number;
  forecast_trajectory: AttendanceForecastItem[];
}

export interface RiskIndicator {
  severity: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  title: string;
  details: string;
  threshold_breached: string;
  action_suggested: string;
}

export interface AcademicRiskResult {
  overall_risk_level: "SAFE" | "MONITOR" | "AT_RISK";
  indicators: RiskIndicator[];
  disclaimer: string;
}

export interface TimetableSlot {
  start_time: string;
  end_time: string;
  course_code: string;
  course_name: string;
  faculty: string;
  room: string;
}

export interface TimetableDay {
  day: string;
  slots: TimetableSlot[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  event_date: string;
  end_date?: string;
  event_type: "exam" | "holiday" | "event" | "deadline";
  description?: string;
}

export interface Assignment {
  id: string;
  course_code: string;
  course_name: string;
  title: string;
  description: string;
  due_date: string;
  max_marks: number;
  faculty_name: string;
  submission_status: "Submitted" | "Pending" | "Overdue";
  score?: number;
  feedback?: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: string;
  scope: string;
  department?: string;
  content: string;
  author: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

export interface PersonalStudyGoal {
  id: number;
  title: string;
  target_date?: string;
  is_completed: boolean;
  category: string;
  notes?: string;
}

export interface FacultyCourseOverview {
  course_id: number;
  course_code: string;
  course_name: string;
  department: string;
  semester: number;
  enrolled_count: number;
  avg_attendance: number;
  avg_internal_marks: number;
  students_at_risk_count: number;
}

export interface FacultyClassStudentItem {
  roll_no: string;
  name: string;
  section: string;
  attendance_pct: number;
  internal_total: number;
  projected_grade: string;
  status: "AT_RISK" | "ON_TRACK";
}

export interface FacultyClassAnalytics {
  course_code: string;
  course_name: string;
  total_students: number;
  avg_internal: number;
  avg_attendance: number;
  grade_distribution: Record<string, number>;
  attendance_distribution: Record<string, number>;
  students: FacultyClassStudentItem[];
}

export interface IntegrationStatus {
  active_provider: "Demo Data" | "Authorized Import" | "Official API";
  data_source_badge: string;
  official_api_configured: boolean;
  sync_status: string;
  last_synced_at?: string;
  system_message: string;
}

export interface DataImportPreviewRow {
  row_number: number;
  roll_no: string;
  name: string;
  course_code: string;
  marks?: number;
  attendance_pct?: number;
  is_valid: boolean;
  validation_error?: string;
}

export interface DataImportSummary {
  file_name: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  preview_sample: DataImportPreviewRow[];
  can_import: boolean;
}
