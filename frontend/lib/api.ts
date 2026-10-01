import {
  AuthToken,
  AuthUser,
  StudentProfile,
  FacultyProfile,
  TheoryAssessment,
  LaboratoryAssessment,
  SemesterResult,
  PendingCourseCategory,
  AttendanceOverview,
  PerformanceIndex,
  SGPAEstimate,
  CGPAScenarioResult,
  AttendanceForecastResult,
  AcademicRiskResult,
  CalendarEvent,
  TimetableDay,
  Assignment,
  Announcement,
  NotificationItem,
  PersonalStudyGoal,
  FacultyCourseOverview,
  FacultyClassAnalytics,
  IntegrationStatus,
  DataImportSummary
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("saip_token");
}

export function saveAuthSession(tokenData: AuthToken) {
  if (typeof window === "undefined") return;
  localStorage.setItem("saip_token", tokenData.access_token);
  localStorage.setItem("saip_role", tokenData.role);
  localStorage.setItem("saip_username", tokenData.username);
  localStorage.setItem("saip_fullname", tokenData.full_name);
  if (tokenData.roll_no) localStorage.setItem("saip_roll_no", tokenData.roll_no);
  if (tokenData.faculty_id) localStorage.setItem("saip_faculty_id", tokenData.faculty_id);
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("saip_token");
  localStorage.removeItem("saip_role");
  localStorage.removeItem("saip_username");
  localStorage.removeItem("saip_fullname");
  localStorage.removeItem("saip_roll_no");
  localStorage.removeItem("saip_faculty_id");
}

export function getStoredUser(): {
  token: string | null;
  role: string | null;
  username: string | null;
  fullName: string | null;
  rollNo: string | null;
  facultyId: string | null;
} {
  if (typeof window === "undefined") {
    return { token: null, role: null, username: null, fullName: null, rollNo: null, facultyId: null };
  }
  return {
    token: localStorage.getItem("saip_token"),
    role: localStorage.getItem("saip_role"),
    username: localStorage.getItem("saip_username"),
    fullName: localStorage.getItem("saip_fullname"),
    rollNo: localStorage.getItem("saip_roll_no"),
    facultyId: localStorage.getItem("saip_faculty_id")
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearAuthSession();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login") && window.location.pathname !== "/") {
      window.location.href = "/";
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    let errMessage = `Error ${res.status}`;
    try {
      const errJson = await res.json();
      errMessage = errJson.detail || errMessage;
    } catch {
      // ignore non-json errors
    }
    throw new Error(errMessage);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  async login(username: string, password: string, roleRequested?: string): Promise<AuthToken> {
    const data = await request<AuthToken>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password, role_requested: roleRequested })
    });
    saveAuthSession(data);
    return data;
  },

  async getDemoCredentials(): Promise<{ demo_accounts: any[] }> {
    return request<{ demo_accounts: any[] }>("/auth/demo-credentials");
  },

  async logout(): Promise<void> {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      clearAuthSession();
    }
  },

  // Student Profiles
  async getStudentProfile(rollNo: string): Promise<StudentProfile> {
    return request<StudentProfile>(`/students/${rollNo}`);
  },

  async getStudyGoals(rollNo: string): Promise<PersonalStudyGoal[]> {
    return request<PersonalStudyGoal[]>(`/students/${rollNo}/study-goals`);
  },

  async addStudyGoal(rollNo: string, goal: { title: string; target_date?: string; category?: string; notes?: string }): Promise<PersonalStudyGoal> {
    return request<PersonalStudyGoal>(`/students/${rollNo}/study-goals`, {
      method: "POST",
      body: JSON.stringify(goal)
    });
  },

  async toggleStudyGoal(rollNo: string, goalId: number): Promise<PersonalStudyGoal> {
    return request<PersonalStudyGoal>(`/students/${rollNo}/study-goals/${goalId}/toggle`, {
      method: "PATCH"
    });
  },

  // Academic Records
  async getTheoryRecords(rollNo: string, semester?: number): Promise<TheoryAssessment[]> {
    const q = semester ? `?semester=${semester}` : "";
    return request<TheoryAssessment[]>(`/academic-records/${rollNo}/theory${q}`);
  },

  async getLabRecords(rollNo: string, semester?: number): Promise<LaboratoryAssessment[]> {
    const q = semester ? `?semester=${semester}` : "";
    return request<LaboratoryAssessment[]>(`/academic-records/${rollNo}/laboratory${q}`);
  },

  async getSemesterRecords(rollNo: string): Promise<SemesterResult[]> {
    return request<SemesterResult[]>(`/academic-records/${rollNo}/semesters`);
  },

  async getPendingCourses(rollNo: string): Promise<PendingCourseCategory[]> {
    return request<PendingCourseCategory[]>(`/academic-records/${rollNo}/pending-courses`);
  },

  async getCreditsSummary(rollNo: string): Promise<{ cgpa: number; earned_credits: number; required_credits: number }> {
    return request<{ cgpa: number; earned_credits: number; required_credits: number }>(`/academic-records/${rollNo}/credits-summary`);
  },

  // Attendance
  async getAttendanceOverview(rollNo: string): Promise<AttendanceOverview> {
    return request<AttendanceOverview>(`/attendance/${rollNo}/overview`);
  },

  // Analytics
  async getPerformanceIndex(rollNo: string): Promise<PerformanceIndex> {
    return request<PerformanceIndex>(`/analytics/${rollNo}/performance-index`);
  },

  async getSubjectAnalysis(rollNo: string): Promise<{ subjects: any[]; strengths: string[]; attention_areas: string[] }> {
    return request<{ subjects: any[]; strengths: string[]; attention_areas: string[] }>(`/analytics/${rollNo}/subject-analysis`);
  },

  // Predictions & Scenarios
  async getSGPAEstimate(rollNo: string): Promise<SGPAEstimate> {
    return request<SGPAEstimate>(`/predictions/${rollNo}/sgpa-estimate`);
  },

  async simulateCGPAScenario(rollNo: string, hypotheticalSgpaNext: number, targetCgpa?: number): Promise<CGPAScenarioResult> {
    return request<CGPAScenarioResult>(`/predictions/${rollNo}/cgpa-scenario`, {
      method: "POST",
      body: JSON.stringify({ hypothetical_sgpa_next: hypotheticalSgpaNext, target_cgpa: targetCgpa })
    });
  },

  async forecastAttendance(rollNo: string, upcomingAttend: number, totalUpcoming: number): Promise<AttendanceForecastResult> {
    return request<AttendanceForecastResult>(`/predictions/${rollNo}/attendance-forecast`, {
      method: "POST",
      body: JSON.stringify({ upcoming_classes_to_attend: upcomingAttend, total_upcoming_classes: totalUpcoming })
    });
  },

  async getRiskIndicators(rollNo: string): Promise<AcademicRiskResult> {
    return request<AcademicRiskResult>(`/predictions/${rollNo}/risk-indicators`);
  },

  // Calendar & Timetable
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return request<CalendarEvent[]>("/calendar/events");
  },

  async getTimetable(dept: string = "CSE", sem: number = 7, sec: string = "A"): Promise<TimetableDay[]> {
    return request<TimetableDay[]>(`/timetable?department=${dept}&semester=${sem}&section=${sec}`);
  },

  // Assignments
  async getAssignments(): Promise<Assignment[]> {
    return request<Assignment[]>("/assignments");
  },

  async createAssignment(courseId: number, title: string, description: string, dueDate: string, maxMarks: number = 10): Promise<Assignment> {
    return request<Assignment>("/assignments", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId, title, description, due_date: dueDate, max_marks: maxMarks })
    });
  },

  async submitAssignment(assignmentId: string, attachmentName?: string): Promise<{ message: string; submission_id: number }> {
    return request<{ message: string; submission_id: number }>(`/assignments/${assignmentId}/submit`, {
      method: "POST",
      body: JSON.stringify({ assignment_id: assignmentId, attachment_name: attachmentName })
    });
  },

  // Announcements & Notifications
  async getAnnouncements(): Promise<Announcement[]> {
    return request<Announcement[]>("/announcements");
  },

  async getNotifications(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>("/notifications");
  },

  async markNotificationRead(notifId: number): Promise<void> {
    await request(`/notifications/${notifId}/read`, { method: "PATCH" });
  },

  // Faculty
  async getFacultyProfile(): Promise<FacultyProfile> {
    return request<FacultyProfile>("/faculty/me");
  },

  async getFacultyCourses(facultyId: string): Promise<FacultyCourseOverview[]> {
    return request<FacultyCourseOverview[]>(`/faculty/${facultyId}/courses`);
  },

  async getFacultyClassAnalytics(facultyId: string, courseCode: string): Promise<FacultyClassAnalytics> {
    return request<FacultyClassAnalytics>(`/faculty/${facultyId}/classes/${courseCode}/analytics`);
  },

  // Admin & Imports
  async getIntegrationStatus(): Promise<IntegrationStatus> {
    return request<IntegrationStatus>("/admin/integration-status");
  },

  async getAdminStats(): Promise<{ total_students: number; total_faculty: number; total_courses: number; total_audit_logs: number; institution_name: string; institution_code: string }> {
    return request("/admin/overview-stats");
  },

  async getAuditLogs(): Promise<any[]> {
    return request<any[]>("/admin/audit-logs");
  },

  async previewCSVImport(file: File): Promise<DataImportSummary> {
    const formData = new FormData();
    formData.append("file", file);
    return request<DataImportSummary>("/imports/preview-csv", {
      method: "POST",
      body: formData
    });
  },

  async commitImport(rows: any[]): Promise<{ message: string; records_imported: number }> {
    return request<{ message: string; records_imported: number }>("/imports/commit", {
      method: "POST",
      body: JSON.stringify(rows)
    });
  },

  // Reports
  getStudentReportCsvUrl(rollNo: string): string {
    return `${API_BASE}/reports/student/${rollNo}/csv`;
  },

  getClassReportCsvUrl(courseCode: string): string {
    return `${API_BASE}/reports/faculty/class/${courseCode}/csv`;
  }
};
