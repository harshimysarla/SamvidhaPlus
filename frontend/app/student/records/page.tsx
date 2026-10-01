"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import TopNavbar from "@/components/navigation/TopNavbar";
import { api, getStoredUser } from "@/lib/api";
import { SemesterResult, TheoryAssessment, LaboratoryAssessment, PendingCourseCategory, StudentProfile } from "@/lib/types";
import { getGradeBadge } from "@/lib/utils";
import { GraduationCap, BookOpen, Layers, CheckCircle2, Clock } from "lucide-react";

export default function StudentRecordsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [semesters, setSemesters] = useState<SemesterResult[]>([]);
  const [theoryCourses, setTheoryCourses] = useState<TheoryAssessment[]>([]);
  const [labCourses, setLabCourses] = useState<LaboratoryAssessment[]>([]);
  const [pendingCourses, setPendingCourses] = useState<PendingCourseCategory[]>([]);
  const [selectedSem, setSelectedSem] = useState<number>(7);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    const rollNo = user.rollNo || user.username || "21951A0501";

    Promise.all([
      api.getStudentProfile(rollNo),
      api.getSemesterRecords(rollNo),
      api.getTheoryRecords(rollNo),
      api.getLabRecords(rollNo),
      api.getPendingCourses(rollNo)
    ]).then(([p, s, t, l, pc]) => {
      setProfile(p);
      setSemesters(s);
      setTheoryCourses(t);
      setLabCourses(l);
      setPendingCourses(pc);
      if (p.current_semester) setSelectedSem(p.current_semester);
    }).finally(() => setIsLoading(false));
  }, []);

  const currentSemRecord = semesters.find((s) => s.semester === selectedSem);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="Semester-wise Academic Records & Degree Audit"
          subtitle="Official autonomous grade sheets, laboratory marks, and curriculum completion audit"
        />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Semester Selector Tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Academic Semester
              </span>
              <span className="text-xs font-semibold text-portal-600 dark:text-portal-400">
                Regulation {profile?.regulation || "R20"}
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {semesters.map((s) => (
                <button
                  key={s.semester}
                  onClick={() => setSelectedSem(s.semester)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                    selectedSem === s.semester
                      ? "bg-portal-600 text-white border-portal-500 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>Semester {s.semester}</span>
                  <span className="block text-[10px] opacity-80">
                    {s.published ? `SGPA: ${s.sgpa?.toFixed(2)}` : "In Progress"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Semester Summary Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Semester SGPA</span>
              <p className="text-xl sm:text-2xl font-black text-portal-600 dark:text-portal-400 mt-0.5">
                {currentSemRecord?.sgpa ? currentSemRecord.sgpa.toFixed(2) : "In Progress"}
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Cumulative CGPA</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {currentSemRecord?.cgpa ? currentSemRecord.cgpa.toFixed(2) : profile?.cgpa.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Credits Registered</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {currentSemRecord?.credits_registered || 20}
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Publication Status</span>
              <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {currentSemRecord?.published ? "Official Result Published" : "Active Continuous Evaluation"}
              </p>
            </div>
          </div>

          {/* Theory Course Detailed Breakdown Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-portal-600" />
              <span>Theory Courses Continuous Evaluation (Semester {selectedSem})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Course Title</th>
                    <th className="py-2.5 px-2 text-center">Category</th>
                    <th className="py-2.5 px-2 text-center">Credits</th>
                    <th className="py-2.5 px-2 text-center">CIE-I (10)</th>
                    <th className="py-2.5 px-2 text-center">AAT-I (10)</th>
                    <th className="py-2.5 px-2 text-center">CIE-II (10)</th>
                    <th className="py-2.5 px-2 text-center">AAT-II (10)</th>
                    <th className="py-2.5 px-3 text-center font-extrabold text-portal-600 dark:text-portal-400">Total (40)</th>
                    <th className="py-2.5 px-2 text-center">Grade</th>
                    <th className="py-2.5 px-2 text-center">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {theoryCourses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">{c.course_code}</td>
                      <td className="py-3 px-3 font-semibold">{c.course_name}</td>
                      <td className="py-3 px-2 text-center text-slate-500">{c.category}</td>
                      <td className="py-3 px-2 text-center">{c.credits}</td>
                      <td className="py-3 px-2 text-center font-mono">{c.cie1.toFixed(1)}</td>
                      <td className="py-3 px-2 text-center font-mono">{(c.aat1_1 + c.aat1_2).toFixed(1)}</td>
                      <td className="py-3 px-2 text-center font-mono">{c.cie2.toFixed(1)}</td>
                      <td className="py-3 px-2 text-center font-mono">{(c.aat2_1 + c.aat2_2).toFixed(1)}</td>
                      <td className="py-3 px-3 text-center font-mono font-black text-sm text-portal-600 dark:text-portal-400">
                        {c.internal_total.toFixed(1)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getGradeBadge(c.grade)}`}>
                          {c.grade}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-bold">{c.grade_point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Degree Courses Completion Audit */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Autonomous Curriculum Completion Audit (Pending Courses Tracker)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Institutional degree progress tracking across all mandatory categories.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingCourses.map((pc) => (
                <div
                  key={pc.category}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pc.category}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Required: <span className="font-semibold text-slate-700 dark:text-slate-300">{pc.required_count}</span> • Registered: <span className="font-semibold text-slate-700 dark:text-slate-300">{pc.registered_count}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      pc.pending_count === 0
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-amber-50 text-amber-700 border-amber-300"
                    }`}>
                      {pc.pending_count === 0 ? "Completed" : `${pc.pending_count} Pending`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
