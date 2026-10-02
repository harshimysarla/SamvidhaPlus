"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import TopNavbar from "@/components/navigation/TopNavbar";
import { api, getStoredUser } from "@/lib/api";
import { TimetableDay, CalendarEvent, StudentProfile } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Calendar, Clock, MapPin, User, Bookmark } from "lucide-react";

export default function StudentTimetablePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timetable, setTimetable] = useState<TimetableDay[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"timetable" | "calendar">("timetable");
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    const rollNo = user.rollNo || user.username || "21951A0501";

    Promise.all([
      api.getStudentProfile(rollNo),
      api.getTimetable("CSE", 7, "A"),
      api.getCalendarEvents()
    ]).then(([p, tt, ev]) => {
      setProfile(p);
      setTimetable(tt);
      setEvents(ev);
      if (tt.length > 0) setSelectedDay(tt[0].day);
    }).finally(() => setIsLoading(false));
  }, []);

  const activeDaySlots = timetable.find((d) => d.day.toLowerCase() === selectedDay.toLowerCase())?.slots || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="Timetable & Academic Calendar"
          subtitle="Semester class schedule, examination dates, symposia, and vacation schedules"
        />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Switcher Tab */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
            <button
              onClick={() => setActiveTab("timetable")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "timetable"
                  ? "bg-portal-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Weekly Class Timetable
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "calendar"
                  ? "bg-portal-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Academic Calendar Events ({events.length})
            </button>
          </div>

          {activeTab === "timetable" ? (
            <div className="space-y-4">
              {/* Day Selector */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {timetable.map((t) => (
                  <button
                    key={t.day}
                    onClick={() => setSelectedDay(t.day)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedDay.toLowerCase() === t.day.toLowerCase()
                        ? "bg-portal-600 text-white border-portal-500 shadow-md"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <span>{t.day}</span>
                    <span className="block text-[10px] opacity-75 font-normal">{t.slots.length} Classes</span>
                  </button>
                ))}
              </div>

              {/* Slot Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeDaySlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-portal-400 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-portal-600 dark:text-portal-400 font-bold mb-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{slot.start_time} – {slot.end_time}</span>
                        </span>
                        <span className="font-mono text-[11px] bg-portal-50 dark:bg-portal-950 px-2 py-0.5 rounded border border-portal-200 dark:border-portal-800">
                          {slot.course_code}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {slot.course_name}
                      </h4>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{slot.faculty}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">{slot.room}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Academic Calendar Events */
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-portal-600" />
                <span>Autonomous Academic Schedule (2024-2025)</span>
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {events.map((ev) => (
                  <div key={ev.id} className="py-3.5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                        ev.event_type === "exam"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60"
                          : ev.event_type === "holiday"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950/60"
                      }`}>
                        {ev.event_type === "exam" ? "EXAM" : ev.event_type === "holiday" ? "HOL" : "EVT"}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {ev.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ev.description || "Official autonomous academic event."}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-portal-600 dark:text-portal-400 block">
                        {formatDate(ev.event_date)}
                      </span>
                      {ev.end_date && (
                        <span className="text-[10px] text-slate-400">
                          to {formatDate(ev.end_date)}
                        </span>
                      )}
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
