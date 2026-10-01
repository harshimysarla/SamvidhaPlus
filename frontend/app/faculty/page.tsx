"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/navigation/Sidebar";
import TopNavbar from "@/components/navigation/TopNavbar";
import { api, getStoredUser } from "@/lib/api";
import { FacultyProfile, FacultyCourseOverview, FacultyClassAnalytics } from "@/lib/types";
import { getAttendanceBadge, getGradeBadge } from "@/lib/utils";
import {
  Users,
  BookOpen,
  Award,
  ShieldAlert,
  BarChart3,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Layers
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from "recharts";

export default function FacultyDashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [courses, setCourses] = useState<FacultyCourseOverview[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("ACSC31");
  const [analytics, setAnalytics] = useState<FacultyClassAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    if (!user.token || (user.role !== "faculty" && user.role !== "admin")) {
      router.push("/");
      return;
    }

    const facId = user.facultyId || user.username || "FAC001";
    loadFacultyData(facId);
  }, []);

  const loadFacultyData = async (facId: string) => {
    setIsLoading(true);
    try {
      const p = await api.getFacultyProfile();
      setProfile(p);
      const cList = await api.getFacultyCourses(facId);
      setCourses(cList);

      const activeCode = cList.length > 0 ? cList[0].course_code : "ACSC31";
      setSelectedCourse(activeCode);
      const a = await api.getFacultyClassAnalytics(facId, activeCode);
      setAnalytics(a);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCourse = async (code: string) => {
    setSelectedCourse(code);
    const user = getStoredUser();
    const facId = user.facultyId || user.username || "FAC001";
    try {
      const a = await api.getFacultyClassAnalytics(facId, code);
      setAnalytics(a);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportClassCsv = () => {
    window.open(api.getClassReportCsvUrl(selectedCourse), "_blank");
  };

  const gradeChartData = analytics
    ? Object.entries(analytics.grade_distribution).map(([grade, count]) => ({
        grade,
        count
      }))
    : [];

  const attChartData = analytics
    ? Object.entries(analytics.attendance_distribution).map(([bracket, count]) => ({
        bracket,
        count
      }))
    : [];

  const atRiskStudents = analytics?.students.filter((s) => s.status === "AT_RISK") || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="Faculty Academic Intelligence & Course Analytics"
          subtitle={`${profile?.name} • ${profile?.designation} • ${profile?.department}`}
        />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Faculty Header Card */}
          {profile && (
            <div className="bg-gradient-to-r from-slate-900 via-portal-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-portal-600 flex items-center justify-center text-2xl font-bold border-2 border-portal-400 shadow-lg">
                  {profile.name[0]}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold">{profile.name}</h2>
                  <p className="text-xs text-portal-300 mt-0.5">
                    {profile.designation} • Department of {profile.department}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Email: <span className="text-slate-200">{profile.email}</span> • Faculty ID: <span className="font-mono text-portal-400">{profile.faculty_id}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push("/faculty/assignments")}
                  className="px-4 py-2 rounded-xl bg-portal-600 hover:bg-portal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Manage Coursework</span>
                </button>
              </div>
            </div>
          )}

          {/* Assigned Courses Cards */}
          <div id="courses" className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Assigned Courses & Enrollment Cohorts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {courses.map((c) => (
                <div
                  key={c.course_code}
                  onClick={() => handleSelectCourse(c.course_code)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedCourse === c.course_code
                      ? "bg-portal-50 dark:bg-portal-950/60 border-portal-500 shadow-md ring-1 ring-portal-500"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-portal-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-portal-600 dark:text-portal-400">{c.course_code}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">Sem {c.semester} • {c.department}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{c.course_name}</h4>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500">Enrolled</span>
                      <p className="font-bold text-slate-900 dark:text-white">{c.enrolled_count}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Avg Att.</span>
                      <p className="font-bold text-emerald-600">{c.avg_attendance}%</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">At Risk</span>
                      <p className={`font-bold ${c.students_at_risk_count > 0 ? "text-rose-600" : "text-slate-400"}`}>
                        {c.students_at_risk_count}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Course Analytics Section */}
          {analytics && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-portal-600 uppercase tracking-wider">
                    Course Cohort Analytics
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {analytics.course_code}: {analytics.course_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cohort Size: {analytics.total_students} Students • Average CIE Total: {analytics.avg_internal} / 40 • Class Attendance: {analytics.avg_attendance}%
                  </p>
                </div>

                <button
                  onClick={handleExportClassCsv}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Class CSV Report</span>
                </button>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grade Distribution Bar */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                    Projected Grade Distribution
                  </h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gradeChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                        <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Attendance Distribution Bar */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                    Attendance Compliance Distribution
                  </h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                        <XAxis dataKey="bracket" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}>
                          {attChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.bracket === "<65%" ? "#ef4444" : entry.bracket === "65-74%" ? "#f59e0b" : "#10b981"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Student Monitoring Roster Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Enrolled Students Roster & Academic Status
                  </h4>
                  <span className="text-xs text-slate-500 font-semibold">
                    {atRiskStudents.length} Students Flagged for Mentoring Support
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2.5 px-3">Roll Number</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-2 text-center">Sec</th>
                        <th className="py-2.5 px-3 text-center">Attendance %</th>
                        <th className="py-2.5 px-3 text-center font-bold">CIE Internal (40)</th>
                        <th className="py-2.5 px-2 text-center">Est. Grade</th>
                        <th className="py-2.5 px-3 text-center">Mentoring Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {analytics.students.map((st) => (
                        <tr key={st.roll_no} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">{st.roll_no}</td>
                          <td className="py-3 px-3 font-semibold">{st.name}</td>
                          <td className="py-3 px-2 text-center">{st.section}</td>
                          <td className="py-3 px-3 text-center font-bold">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] border ${
                              st.attendance_pct >= 75 ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-rose-50 text-rose-700 border-rose-300"
                            }`}>
                              {st.attendance_pct.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-portal-600 dark:text-portal-400">
                            {st.internal_total.toFixed(1)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded font-black border ${getGradeBadge(st.projected_grade)}`}>
                              {st.projected_grade}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {st.status === "AT_RISK" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-300">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Support Needed</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>On Track</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
