"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import TopNavbar from "@/components/navigation/TopNavbar";
import { api, getStoredUser } from "@/lib/api";
import { StudentProfile, TheoryAssessment, LaboratoryAssessment, SemesterResult, AttendanceOverview } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { FileText, Download, Printer, ShieldAlert, CheckCircle2, School } from "lucide-react";

export default function StudentReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [theory, setTheory] = useState<TheoryAssessment[]>([]);
  const [labs, setLabs] = useState<LaboratoryAssessment[]>([]);
  const [semesters, setSemesters] = useState<SemesterResult[]>([]);
  const [attendance, setAttendance] = useState<AttendanceOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    const rollNo = user.rollNo || user.username || "21951A0501";

    Promise.all([
      api.getStudentProfile(rollNo),
      api.getTheoryRecords(rollNo),
      api.getLabRecords(rollNo),
      api.getSemesterRecords(rollNo),
      api.getAttendanceOverview(rollNo)
    ]).then(([p, t, l, s, a]) => {
      setProfile(p);
      setTheory(t);
      setLabs(l);
      setSemesters(s);
      setAttendance(a);
    }).finally(() => setIsLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    if (!profile) return;
    window.open(api.getStudentReportCsvUrl(profile.roll_no), "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <div className="print:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 md:pl-64 flex flex-col min-w-0 print:pl-0">
        <div className="print:hidden">
          <TopNavbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            title="Academic Performance Reports"
            subtitle="Unofficial institutional academic summary and performance transcript"
          />
        </div>

        <main className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full">
          {/* Action Bar */}
          <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-portal-600" />
                <span>Student Academic Portfolio & Transcript Summary</span>
              </h2>
              <p className="text-xs text-slate-500">
                Data provenance: Verified autonomous academic records database.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDownloadCsv}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-portal-600 hover:bg-portal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* Printable Report Document */}
          <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6 print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="text-center pb-5 border-b-2 border-slate-800">
              <div className="flex items-center justify-center gap-2 mb-1">
                <School className="w-7 h-7 text-portal-700" />
                <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-wide">
                  Institute of Aeronautical Engineering
                </h1>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                (Autonomous Institution • Accredited by NAAC with 'A+' Grade • Hyderabad)
              </p>
              <h3 className="text-xs font-black uppercase text-portal-800 mt-2 tracking-wider">
                Unofficial Student Academic Summary & Performance Report
              </h3>
              <p className="text-[10px] text-slate-500 italic mt-0.5">
                Disclaimer: This report is generated for academic counseling and self-evaluation. It is not an official university certificate.
              </p>
            </div>

            {/* Student Info Grid */}
            {profile && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Name</span>
                  <span className="font-bold text-slate-900">{profile.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Roll Number</span>
                  <span className="font-bold text-slate-900 font-mono">{profile.roll_no}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Department / Branch</span>
                  <span className="font-semibold text-slate-900">{profile.branch}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Semester / Sec</span>
                  <span className="font-semibold text-slate-900">Sem {profile.current_semester} (Sec {profile.section})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Regulation</span>
                  <span className="font-semibold text-slate-900">{profile.regulation} ({profile.academic_year})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Cumulative CGPA</span>
                  <span className="font-black text-portal-700">{profile.cgpa.toFixed(2)} / 10.0</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Credits Earned</span>
                  <span className="font-bold text-slate-900">{profile.total_credits_earned} / {profile.total_credits_required}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Aggregate Attendance</span>
                  <span className="font-bold text-slate-900">{attendance?.overall_percentage.toFixed(1)}%</span>
                </div>
              </div>
            )}

            {/* Semester History Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                I. Semester-wise Academic Progression Ledger
              </h4>
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Semester</th>
                    <th className="p-2 border-r border-slate-300">Academic Year</th>
                    <th className="p-2 border-r border-slate-300 text-center">Registered Credits</th>
                    <th className="p-2 border-r border-slate-300 text-center">Earned Credits</th>
                    <th className="p-2 border-r border-slate-300 text-center">SGPA</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {semesters.map((s) => (
                    <tr key={s.semester}>
                      <td className="p-2 border-r border-slate-200 font-bold">Semester {s.semester}</td>
                      <td className="p-2 border-r border-slate-200">{s.academic_year}</td>
                      <td className="p-2 border-r border-slate-200 text-center">{s.credits_registered}</td>
                      <td className="p-2 border-r border-slate-200 text-center">{s.credits_earned}</td>
                      <td className="p-2 border-r border-slate-200 text-center font-bold font-mono">
                        {s.sgpa ? s.sgpa.toFixed(2) : "In Progress"}
                      </td>
                      <td className="p-2 text-center font-semibold text-[11px]">
                        {s.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Current Continuous Internal Evaluation Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                II. Current Semester Continuous Evaluation Marks (CIE & Laboratory)
              </h4>
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Code</th>
                    <th className="p-2 border-r border-slate-300">Course Title</th>
                    <th className="p-2 border-r border-slate-300 text-center">Credits</th>
                    <th className="p-2 border-r border-slate-300 text-center">CIE-I (10)</th>
                    <th className="p-2 border-r border-slate-300 text-center">AAT-I (10)</th>
                    <th className="p-2 border-r border-slate-300 text-center">CIE-II (10)</th>
                    <th className="p-2 border-r border-slate-300 text-center">AAT-II (10)</th>
                    <th className="p-2 border-r border-slate-300 text-center font-bold">Total (40)</th>
                    <th className="p-2 text-center">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {theory.map((c) => (
                    <tr key={c.id}>
                      <td className="p-2 border-r border-slate-200 font-mono font-bold">{c.course_code}</td>
                      <td className="p-2 border-r border-slate-200 font-semibold">{c.course_name}</td>
                      <td className="p-2 border-r border-slate-200 text-center">{c.credits}</td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono">{c.cie1.toFixed(1)}</td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono">{(c.aat1_1 + c.aat1_2).toFixed(1)}</td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono">{c.cie2.toFixed(1)}</td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono">{(c.aat2_1 + c.aat2_2).toFixed(1)}</td>
                      <td className="p-2 border-r border-slate-200 text-center font-bold font-mono text-portal-700">
                        {c.internal_total.toFixed(1)}
                      </td>
                      <td className="p-2 text-center font-bold">{c.attendance_pct.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {labs.map((l) => (
                    <tr key={l.id}>
                      <td className="p-2 border-r border-slate-200 font-mono font-bold">{l.course_code}</td>
                      <td className="p-2 border-r border-slate-200 font-semibold">{l.course_name} (Lab)</td>
                      <td className="p-2 border-r border-slate-200 text-center">{l.credits}</td>
                      <td className="p-2 border-r border-slate-200 text-center" colSpan={4}>
                        Day-to-day: {l.day_to_day_marks}/30 • Exam: {l.internal_exam_marks}/10
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center font-bold font-mono text-portal-700">
                        {l.internal_total.toFixed(1)}
                      </td>
                      <td className="p-2 text-center font-bold">{l.attendance_pct.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Document Verification Footer */}
            <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs text-slate-500">
              <div>
                <p>Generated on: {new Date().toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">Portal Version 1.0.0 • SAIP Academic Analytics Engine</p>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-slate-400 mb-1" />
                <span className="font-semibold text-slate-700">Controller of Examinations</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
