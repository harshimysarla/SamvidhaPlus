"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import TopNavbar from "@/components/navigation/TopNavbar";
import AttendanceDonut from "@/components/charts/AttendanceDonut";
import { api, getStoredUser } from "@/lib/api";
import { AttendanceOverview, AttendanceForecastResult } from "@/lib/types";
import { getAttendanceBadge } from "@/lib/utils";
import { UserCheck, ShieldAlert, Calculator, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export default function StudentAttendancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceOverview | null>(null);
  const [upcomingAttend, setUpcomingAttend] = useState<number>(10);
  const [upcomingTotal, setUpcomingTotal] = useState<number>(10);
  const [forecast, setForecast] = useState<AttendanceForecastResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    const rollNo = user.rollNo || user.username || "21951A0501";

    Promise.all([
      api.getAttendanceOverview(rollNo),
      api.forecastAttendance(rollNo, 10, 10)
    ]).then(([att, fcast]) => {
      setAttendance(att);
      setForecast(fcast);
    }).finally(() => setIsLoading(false));
  }, []);

  const handleForecastRecalc = async (att: number, tot: number) => {
    setUpcomingAttend(att);
    setUpcomingTotal(tot);
    const user = getStoredUser();
    const rollNo = user.rollNo || user.username || "21951A0501";
    try {
      const res = await api.forecastAttendance(rollNo, att, tot);
      setForecast(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="Attendance & Compliance Intelligence"
          subtitle="Mandatory Autonomous University Thresholds: 75% Regular • 65% Condonation"
        />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Aggregate Attendance Status</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Overall presence across all registered theory and lab courses.
                </p>
              </div>

              {attendance && (
                <AttendanceDonut
                  percentage={attendance.overall_percentage}
                  totalAttended={attendance.total_attended}
                  totalConducted={attendance.total_conducted}
                />
              )}

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Compliance Category: </span>
                <span className={`font-bold ${attendance?.status === "Regular" ? "text-emerald-600" : "text-rose-600"}`}>
                  {attendance?.status}
                </span>
              </div>
            </div>

            {/* Attendance Forecaster & Buffer Calculator */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-portal-600" />
                    <span>Predictive Attendance Forecaster & Scenario Calculator</span>
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-portal-50 dark:bg-portal-950 text-portal-700 dark:text-portal-300 border border-portal-200">
                    Live Simulator
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Simulate future attendance percentages based on upcoming lecture attendance behavior.
                </p>

                {/* Input controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Upcoming Classes to Attend
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={upcomingTotal}
                      value={upcomingAttend}
                      onChange={(e) => handleForecastRecalc(parseInt(e.target.value) || 0, upcomingTotal)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-portal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Total Upcoming Classes
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={upcomingTotal}
                      onChange={(e) => {
                        const tot = parseInt(e.target.value) || 1;
                        handleForecastRecalc(Math.min(upcomingAttend, tot), tot);
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-portal-500"
                    />
                  </div>
                </div>

                {/* Results Metrics */}
                {forecast && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Current %</span>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                        {forecast.current_percentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-portal-50 dark:bg-portal-950/40 border border-portal-200 dark:border-portal-800">
                      <span className="text-[10px] text-portal-700 dark:text-portal-300 uppercase font-bold">Projected %</span>
                      <p className="text-xl font-black text-portal-600 dark:text-portal-400 mt-0.5">
                        {forecast.projected_percentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Needed for 75%</span>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                        {forecast.classes_needed_for_75} Classes
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Safe Can Miss</span>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {forecast.max_classes_can_miss_safe} Classes
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
                <span>Calculated with university condonation algorithms</span>
                <span className="text-portal-600 dark:text-portal-400 font-semibold">Strict 75% SEE Exam Rule</span>
              </div>
            </div>
          </div>

          {/* Course-wise Detailed Attendance Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-portal-600" />
              <span>Subject-wise Attendance Breakdown & Margins</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Course Title</th>
                    <th className="py-2.5 px-2 text-center">Type</th>
                    <th className="py-2.5 px-2 text-center">Conducted</th>
                    <th className="py-2.5 px-2 text-center">Attended</th>
                    <th className="py-2.5 px-2 text-center">Percentage</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Classes to Reach 75%</th>
                    <th className="py-2.5 px-3 text-center">Safe Buffer to Miss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {attendance?.courses.map((c) => {
                    const badge = getAttendanceBadge(c.attendance_pct);
                    return (
                      <tr key={c.course_code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-mono font-bold">{c.course_code}</td>
                        <td className="py-3 px-3 font-semibold">{c.course_name}</td>
                        <td className="py-3 px-2 text-center text-slate-500">{c.course_type}</td>
                        <td className="py-3 px-2 text-center font-mono">{c.classes_conducted}</td>
                        <td className="py-3 px-2 text-center font-mono">{c.classes_attended}</td>
                        <td className="py-3 px-2 text-center font-black">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${badge.className}`}>
                            {c.attendance_pct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="text-[11px] font-bold">{badge.label}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {c.margin_classes_to_75 > 0 ? (
                            <span className="font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded">
                              +{c.margin_classes_to_75} required
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {c.can_miss_classes > 0 ? (
                            <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                              {c.can_miss_classes} classes
                            </span>
                          ) : (
                            <span className="text-rose-500 font-semibold">0 classes</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
