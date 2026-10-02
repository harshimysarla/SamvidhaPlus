"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/navigation/Sidebar";
import TopNavbar from "@/components/navigation/TopNavbar";
import SGPAChart from "@/components/charts/SGPAChart";
import AttendanceDonut from "@/components/charts/AttendanceDonut";
import ScenarioChart from "@/components/charts/ScenarioChart";
import {
  StudentProfile,
  TheoryAssessment,
  LaboratoryAssessment,
  SemesterResult,
  AttendanceOverview,
  PerformanceIndex,
  SGPAEstimate,
  CGPAScenarioResult,
  AttendanceForecastResult,
  AcademicRiskResult,
  AcademicRecommendation,
  StudyPlannerSummary
} from "@/lib/types";
import { api, getStoredUser } from "@/lib/api";
import { getGradeBadge, getAttendanceBadge } from "@/lib/utils";
import {
  Award,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Calculator,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Layers,
  Search,
  Filter,
  Download,
  Flame,
  Check,
  XCircle,
  Lightbulb
} from "lucide-react";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [theoryCourses, setTheoryCourses] = useState<TheoryAssessment[]>([]);
  const [labCourses, setLabCourses] = useState<LaboratoryAssessment[]>([]);
  const [semesters, setSemesters] = useState<SemesterResult[]>([]);
  const [attendance, setAttendance] = useState<AttendanceOverview | null>(null);
  const [perfIndex, setPerfIndex] = useState<PerformanceIndex | null>(null);
  const [sgpaEst, setSgpaEst] = useState<SGPAEstimate | null>(null);
  const [riskData, setRiskData] = useState<AcademicRiskResult | null>(null);

  // Interactive Scenario Simulator States
  const [hypoNextSgpa, setHypoNextSgpa] = useState<number>(9.0);
  const [targetCgpa, setTargetCgpa] = useState<number>(9.0);
  const [scenarioResult, setScenarioResult] = useState<CGPAScenarioResult | null>(null);

  // Interactive Attendance Forecaster States
  const [upcomingAttend, setUpcomingAttend] = useState<number>(10);
  const [upcomingTotal, setUpcomingTotal] = useState<number>(10);
  const [attendanceForecast, setAttendanceForecast] = useState<AttendanceForecastResult | null>(null);

  // SamvidhaPlus Actionable Guidance & Planner States
  const [recommendations, setRecommendations] = useState<AcademicRecommendation[]>([]);
  const [plannerSummary, setPlannerSummary] = useState<StudyPlannerSummary | null>(null);
  const [recFilter, setRecFilter] = useState<string>("ALL");

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");

  useEffect(() => {
    const user = getStoredUser();
    if (!user.token || user.role !== "student") {
      router.push("/");
      return;
    }

    const rollNo = user.rollNo || user.username || "21951A0501";
    loadDashboardData(rollNo);
  }, []);

  const loadDashboardData = async (rollNo: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        pData,
        tData,
        lData,
        sData,
        attData,
        piData,
        estData,
        rData,
        scenData,
        foreData,
        recsData,
        planData
      ] = await Promise.all([
        api.getStudentProfile(rollNo),
        api.getTheoryRecords(rollNo),
        api.getLabRecords(rollNo),
        api.getSemesterRecords(rollNo),
        api.getAttendanceOverview(rollNo),
        api.getPerformanceIndex(rollNo),
        api.getSGPAEstimate(rollNo),
        api.getRiskIndicators(rollNo),
        api.simulateCGPAScenario(rollNo, 9.0, 9.0),
        api.forecastAttendance(rollNo, 10, 10),
        api.getRecommendations(rollNo).catch(() => []),
        api.getStudyPlannerSummary(rollNo).catch(() => null)
      ]);

      setProfile(pData);
      setTheoryCourses(tData);
      setLabCourses(lData);
      setSemesters(sData);
      setAttendance(attData);
      setPerfIndex(piData);
      setSgpaEst(estData);
      setRiskData(rData);
      setScenarioResult(scenData);
      setAttendanceForecast(foreData);
      setRecommendations(recsData);
      setPlannerSummary(planData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load academic records");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRecommendationStatus = async (recId: string, newStatus: string) => {
    if (!profile) return;
    try {
      const updated = await api.updateRecommendationStatus(profile.roll_no, recId, newStatus);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === recId ? updated : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleScenarioChange = async (sgpaVal: number, targetVal?: number) => {
    setHypoNextSgpa(sgpaVal);
    if (targetVal !== undefined) setTargetCgpa(targetVal);
    if (!profile) return;
    try {
      const res = await api.simulateCGPAScenario(profile.roll_no, sgpaVal, targetVal ?? targetCgpa);
      setScenarioResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleForecastChange = async (att: number, tot: number) => {
    setUpcomingAttend(att);
    setUpcomingTotal(tot);
    if (!profile) return;
    try {
      const res = await api.forecastAttendance(profile.roll_no, att, tot);
      setAttendanceForecast(res);
    } catch (err) {
      console.error(err);
    }
  };

  const latestPublishedSem = semesters
    .filter((s) => s.published && s.sgpa !== null)
    .slice(-1)[0];

  const filteredTheory = theoryCourses.filter((c) => {
    const matchesSearch =
      c.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.course_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      courseFilter === "ALL" ||
      (courseFilter === "THEORY" && c.category !== "Project Work") ||
      (courseFilter === "PROJECT" && c.category === "Project Work");
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-portal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Synchronizing Samvidha academic intelligence...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="Student Academic Intelligence Dashboard"
          subtitle={`${profile?.name} • Roll No: ${profile?.roll_no} • Sem ${profile?.current_semester} ${profile?.branch}`}
        />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner: Student Profile Card */}
          {profile && (
            <div className="bg-gradient-to-r from-portal-900 via-slate-900 to-portal-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-portal-800/40 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-portal-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-portal-600 border-2 border-portal-400/40 flex items-center justify-center text-2xl font-black shadow-lg">
                    {profile.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                        {profile.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-portal-500/20 text-portal-300 border border-portal-400/30">
                        {profile.roll_no}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {profile.enrollment_status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                      B.Tech in {profile.branch} • Section {profile.section} • Regulation {profile.regulation} ({profile.academic_year})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Faculty Mentor: <span className="text-portal-300">{profile.mentor_name || "Assigned by Department"}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Quick Performance Index Badge */}
                {perfIndex && (
                  <div className="bg-slate-950/60 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-portal-700/40 flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-portal-400 tracking-wider">
                        Academic Performance Index
                      </p>
                      <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                        {perfIndex.index_score}
                        <span className="text-xs font-medium text-slate-400"> / 100</span>
                      </div>
                      <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded bg-portal-500/20 text-portal-300 border border-portal-400/30">
                        {perfIndex.rating}
                      </span>
                    </div>
                    <div className="hidden sm:block border-l border-slate-800 pl-4 text-xs space-y-1 text-slate-300">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-400">Data Completeness:</span>
                        <span className="font-semibold text-emerald-400">{perfIndex.data_completeness_pct}%</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-400">Status:</span>
                        <span>{perfIndex.is_partial ? "Partial Weights" : "Fully Calibrated"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Academic KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* CGPA */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Current CGPA</span>
                <Award className="w-4 h-4 text-portal-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {profile?.cgpa.toFixed(2) || "N/A"}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">/ 10.0</span>
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                {profile && profile.cgpa >= 8.0 ? "First Class with Distinction" : "Good Standing"}
              </p>
            </div>

            {/* Latest SGPA */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Latest SGPA</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {latestPublishedSem?.sgpa ? latestPublishedSem.sgpa.toFixed(2) : "In Progress"}
                </span>
                {latestPublishedSem?.sgpa && <span className="text-xs text-slate-500 ml-1">/ 10.0</span>}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                {latestPublishedSem ? `Semester ${latestPublishedSem.semester} Result` : "Current Term"}
              </p>
            </div>

            {/* Attendance */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Attendance</span>
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {attendance?.overall_percentage.toFixed(1) || profile?.overall_attendance_percentage.toFixed(1)}%
                </span>
              </div>
              <p className={`text-[10px] font-bold mt-1 ${
                (attendance?.overall_percentage || 0) >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}>
                {(attendance?.overall_percentage || 0) >= 75 ? "Eligible (>= 75%)" : "Detention Shortage (< 75%)"}
              </p>
            </div>

            {/* Earned Credits */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Earned Credits</span>
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {profile?.total_credits_earned}
                </span>
                <span className="text-xs text-slate-500 ml-1">/ {profile?.total_credits_required}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                {profile ? `${((profile.total_credits_earned / profile.total_credits_required) * 100).toFixed(0)}% Degree Done` : ""}
              </p>
            </div>

            {/* Consistency Streak */}
            <div
              onClick={() => router.push("/student/planner")}
              className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between cursor-pointer hover:border-orange-400 transition-all"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Study Streak</span>
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {plannerSummary?.study_streak_days || 0}
                </span>
                <span className="text-xs text-slate-500 ml-1">Days</span>
              </div>
              <p className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold mt-1 flex items-center gap-1">
                <span>{plannerSummary?.completed_tasks || 0} tasks completed</span>
                <ArrowUpRight className="w-3 h-3 ml-auto" />
              </p>
            </div>

            {/* Early Risk Flag */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Academic Risk</span>
                <ShieldAlert className="w-4 h-4 text-rose-500" />
              </div>
              <div className="mt-2">
                <span className={`text-xl font-black ${
                  riskData?.overall_risk_level === "SAFE"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : riskData?.overall_risk_level === "MONITOR"
                    ? "text-amber-500"
                    : "text-rose-600"
                }`}>
                  {riskData?.overall_risk_level || "SAFE"}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                {riskData?.indicators.length || 0} active compliance flags
              </p>
            </div>
          </div>

          {/* Section: Academic Progression Chart & Attendance Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Progression Chart */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-portal-600" />
                    <span>Semester-wise SGPA & CGPA Progression</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Autonomous historical grade point trajectory (Published results vs Active semester)
                  </p>
                </div>
                <button
                  onClick={() => router.push("/student/records")}
                  className="text-xs font-semibold text-portal-600 hover:text-portal-700 dark:text-portal-400 flex items-center gap-1"
                >
                  <span>Full Ledger</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <SGPAChart data={semesters} />
            </div>

            {/* Attendance Overview Card */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Attendance Compliance</span>
                  </h3>
                  <button
                    onClick={() => router.push("/student/attendance")}
                    className="text-xs font-semibold text-portal-600 dark:text-portal-400 hover:underline"
                  >
                    Details
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Threshold: 75% Regular • 65% Condonation
                </p>
              </div>

              {attendance && (
                <AttendanceDonut
                  percentage={attendance.overall_percentage}
                  totalAttended={attendance.total_attended}
                  totalConducted={attendance.total_conducted}
                  regularThreshold={attendance.regular_threshold}
                  condonationThreshold={attendance.condonation_threshold}
                />
              )}

              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Trend: </span>
                {attendance?.attendance_trend || "Regular Attendance"}
              </div>
            </div>
          </div>

          {/* EDP Pillar 3: Actionable Academic Guidance & Mentoring Pathways */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>EDP Core: Personalized Guidance Engine</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Actionable Academic Guidance</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data-grounded intervention recommendations generated from your continuous assessments, attendance margins, and semester momentum.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs shrink-0 overflow-x-auto">
                {["ALL", "REVISION", "ATTENDANCE", "TIME_ALLOCATION", "GOAL_SETTING"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setRecFilter(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                      recFilter === cat
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {cat === "ALL" ? "All Recommendations" : cat.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No active academic guidance flags. Your performance and attendance are compliant with autonomous benchmarks.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations
                  .filter((r) => recFilter === "ALL" || r.category === recFilter)
                  .map((rec) => {
                    const isHigh = rec.priority === "High";
                    const isMed = rec.priority === "Medium";
                    return (
                      <div
                        key={rec.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                          rec.status === "Completed"
                            ? "bg-slate-50/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-60"
                            : isHigh
                            ? "bg-rose-50/20 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/60 shadow-xs"
                            : isMed
                            ? "bg-amber-50/20 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/60 shadow-xs"
                            : "bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-200 dark:border-indigo-900/60 shadow-xs"
                        }`}
                      >
                        <div>
                          {/* Badges Header */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isHigh
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200"
                                : isMed
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200"
                                : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200"
                            }`}>
                              {rec.category.replace("_", " ")} • {rec.priority} Priority
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 capitalize">
                              Status: {rec.status}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                            {rec.title}
                          </h4>

                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5">
                            {rec.observation}
                          </p>

                          {/* Why It Matters */}
                          <div className="mt-2.5 p-2.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300">
                            <span className="font-bold text-slate-800 dark:text-slate-200">Why it matters: </span>
                            {rec.why_it_matters}
                          </div>

                          {/* Recommended Action */}
                          <div className="mt-2.5 flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">Action: </span>
                              {rec.recommended_action}
                            </div>
                          </div>
                        </div>

                        {/* Footer & Actions */}
                        <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 flex items-center gap-1 text-[10px]">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {rec.suggested_timeframe}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {rec.status !== "Completed" && (
                              <button
                                onClick={() => handleUpdateRecommendationStatus(rec.id, "Completed")}
                                className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] transition-colors"
                              >
                                Mark Done
                              </button>
                            )}
                            {rec.status !== "Dismissed" && (
                              <button
                                onClick={() => handleUpdateRecommendationStatus(rec.id, "Dismissed")}
                                className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-400 font-medium text-[10px] transition-colors"
                              >
                                Dismiss
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Continuous Internal Evaluation (Samvidha CIE & AAT Breakdown) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-portal-600" />
                  <span>Continuous Internal Evaluation (CIE & AAT Breakdown)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Exact Samvidha Autonomous Marking Scheme: CIE-I (10) + AAT-I-I (5) + AAT-I-II (5) + CIE-II (10) + AAT-II-I (5) + AAT-II-II (5) = Internal Total (40)
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-portal-500 w-36 sm:w-48"
                  />
                </div>

                {/* Filter */}
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="THEORY">Theory Only</option>
                  <option value="PROJECT">Project Work</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Course Title</th>
                    <th className="py-2.5 px-2 text-center">Credits</th>
                    <th className="py-2.5 px-2 text-center">CIE-I (10)</th>
                    <th className="py-2.5 px-2 text-center">AAT-I (10)</th>
                    <th className="py-2.5 px-2 text-center">CIE-II (10)</th>
                    <th className="py-2.5 px-2 text-center">AAT-II (10)</th>
                    <th className="py-2.5 px-3 text-center font-extrabold text-portal-700 dark:text-portal-400">Total (40)</th>
                    <th className="py-2.5 px-2 text-center">Attendance</th>
                    <th className="py-2.5 px-2 text-center">Est. Grade</th>
                    <th className="py-2.5 px-3">Faculty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredTheory.map((course) => {
                    const attBadge = getAttendanceBadge(course.attendance_pct);
                    const gradeClass = getGradeBadge(course.grade);
                    const aat1Total = course.aat1_1 + course.aat1_2;
                    const aat2Total = course.aat2_1 + course.aat2_2;

                    return (
                      <tr key={course.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          {course.course_code}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                            {course.course_name}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {course.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-medium">{course.credits}</td>
                        <td className="py-3 px-2 text-center font-mono">{course.cie1.toFixed(1)}</td>
                        <td className="py-3 px-2 text-center font-mono text-slate-600 dark:text-slate-400" title={`AAT-I-I: ${course.aat1_1}, AAT-I-II: ${course.aat1_2}`}>
                          {aat1Total.toFixed(1)}
                        </td>
                        <td className="py-3 px-2 text-center font-mono">{course.cie2.toFixed(1)}</td>
                        <td className="py-3 px-2 text-center font-mono text-slate-600 dark:text-slate-400" title={`AAT-II-I: ${course.aat2_1}, AAT-II-II: ${course.aat2_2}`}>
                          {aat2Total.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-extrabold text-sm text-portal-600 dark:text-portal-400">
                          {course.internal_total.toFixed(1)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${attBadge.className}`}>
                            {course.attendance_pct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-black border ${gradeClass}`}>
                            {course.grade}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-[140px]">
                          {course.faculty_name || "Faculty Member"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Lab Section Accordion / Quick view */}
            {labCourses.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                  Laboratory Continuous Evaluations (14-Week Continuous Assessment)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {labCourses.map((lab) => (
                    <div key={lab.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-portal-600 dark:text-portal-400">{lab.course_code}</span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{lab.course_name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Day-to-day continuous: <span className="font-bold text-slate-700 dark:text-slate-300">{lab.day_to_day_marks}/30</span> • Lab Exam: <span className="font-bold text-slate-700 dark:text-slate-300">{lab.internal_exam_marks}/10</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-portal-600 dark:text-portal-400 font-mono">
                          {lab.internal_total.toFixed(1)} / 40
                        </span>
                        <div className="text-[10px] text-emerald-600 font-bold">
                          Attendance: {lab.attendance_pct.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Predictive Intelligence & What-If CGPA Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SGPA Estimation Box */}
            <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-indigo-800/60 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Predictive Academic Intelligence</span>
                  </div>
                  <span className="text-[10px] text-indigo-300 font-mono bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/50">
                    {sgpaEst?.model_version || "v1.2.0-bayesian-reg"}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-white">
                  Expected Semester SGPA Projection
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Estimated for <span className="font-semibold text-indigo-200">{sgpaEst?.prediction_horizon || `Semester ${profile?.current_semester} SEE`}</span> using continuous CIE progression & historical momentum.
                </p>

                {sgpaEst && (
                  <div className="my-4 p-4 rounded-xl bg-slate-950/80 border border-indigo-700/40 text-center">
                    <p className="text-[11px] uppercase font-bold text-indigo-400 tracking-wider">
                      Most Likely Outcome
                    </p>
                    <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                      {sgpaEst.most_likely_sgpa.toFixed(2)}
                      <span className="text-xs text-slate-400 font-normal"> / 10.0</span>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2">
                      <span>Expected Range:</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-200 font-mono">
                        {sgpaEst.estimated_sgpa_min.toFixed(2)} – {sgpaEst.estimated_sgpa_max.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-400 mt-2 font-medium">
                      Confidence: {sgpaEst.confidence_level}
                    </p>

                    {/* Model Validation Metrics */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800 grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="p-1 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">MAE</span>
                        <span className="font-mono font-bold text-emerald-400">{sgpaEst.model_metrics?.mae ?? 0.28}</span>
                      </div>
                      <div className="p-1 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">RMSE</span>
                        <span className="font-mono font-bold text-sky-400">{sgpaEst.model_metrics?.rmse ?? 0.36}</span>
                      </div>
                      <div className="p-1 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Baseline MAE</span>
                        <span className="font-mono font-bold text-slate-300">{sgpaEst.model_metrics?.baseline_mae ?? 0.54}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {sgpaEst && (
                <div className="space-y-2 border-t border-indigo-800/60 pt-3">
                  {/* Feature Weights */}
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Feature Weights: CIE Internal (65%) • History (35%)</span>
                    <span className="font-mono text-indigo-300">Calibrated: {sgpaEst.last_calibrated_date || "2026-09-15"}</span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-medium">
                    <span className="text-indigo-400 font-bold">Assumptions: </span>
                    {sgpaEst.assumptions[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 italic">
                    {sgpaEst.disclaimer}
                  </p>
                </div>
              )}
            </div>

            {/* What-If CGPA Simulator */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-portal-600" />
                    <span>Interactive What-If CGPA Simulator</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-portal-600 dark:text-portal-400">
                    Hypothetical SGPA: {hypoNextSgpa.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Simulate cumulative grade impact by adjusting prospective semester grade outcomes.
                </p>

                {/* Slider Control */}
                <div className="my-4 space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>What if I score SGPA:</span>
                    <span className="text-portal-600 dark:text-portal-400 font-bold">{hypoNextSgpa.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="6.0"
                    max="10.0"
                    step="0.1"
                    value={hypoNextSgpa}
                    onChange={(e) => handleScenarioChange(parseFloat(e.target.value))}
                    className="w-full accent-portal-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>6.0 (Pass)</span>
                    <span>8.0 (First Class)</span>
                    <span>10.0 (Perfect)</span>
                  </div>
                </div>

                {scenarioResult && (
                  <ScenarioChart
                    currentCgpa={scenarioResult.current_cgpa}
                    trajectory={scenarioResult.scenario_trajectory}
                    targetCgpa={targetCgpa}
                  />
                )}
              </div>

              {scenarioResult && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Current CGPA</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{scenarioResult.current_cgpa.toFixed(2)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-portal-50 dark:bg-portal-950/40 border border-portal-200 dark:border-portal-800">
                    <p className="text-[10px] text-portal-700 dark:text-portal-400 uppercase font-bold">Projected CGPA</p>
                    <p className="text-sm font-black text-portal-600 dark:text-portal-400">{scenarioResult.projected_cgpa.toFixed(2)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">CGPA Delta</p>
                    <p className={`text-sm font-bold ${scenarioResult.cgpa_difference >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {scenarioResult.cgpa_difference >= 0 ? `+${scenarioResult.cgpa_difference.toFixed(2)}` : `${scenarioResult.cgpa_difference.toFixed(2)}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Explainable Insights & Recommendations */}
          {perfIndex && perfIndex.insights.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-portal-600" />
                <span>Explainable Academic Insights & Recommendations</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {perfIndex.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      insight.type === "strength"
                        ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900"
                        : insight.type === "warning"
                        ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"
                        : "bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{insight.title}</span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border">
                          {insight.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {insight.observation}
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                      <p><span className="font-semibold text-slate-800 dark:text-slate-200">Significance: </span>{insight.significance}</p>
                      <p><span className="font-semibold text-portal-600 dark:text-portal-400">Action: </span>{insight.recommended_action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
