"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import TopNavbar from "@/components/navigation/TopNavbar";
import { api, getStoredUser } from "@/lib/api";
import { StudyTask, StudyPlannerSummary } from "@/lib/types";
import {
  BookOpen,
  CheckCircle2,
  Plus,
  Calendar,
  Clock,
  Flame,
  CheckSquare,
  Sparkles,
  Trash2,
  AlertCircle,
  BarChart3,
  CalendarDays
} from "lucide-react";

export default function StudentPlannerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [summary, setSummary] = useState<StudyPlannerSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newHours, setNewHours] = useState(1.5);
  const [newPriority, setNewPriority] = useState("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPlannerData();
  }, []);

  const loadPlannerData = async () => {
    const user = getStoredUser();
    const rollNo = user.rollNo || user.username || "21951A0501";
    setIsLoading(true);
    try {
      const [tasksData, summaryData] = await Promise.all([
        api.getStudyTasks(rollNo),
        api.getStudyPlannerSummary(rollNo)
      ]);
      setTasks(tasksData);
      setSummary(summaryData);
    } catch (err) {
      console.error("Failed to load study planner data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const user = getStoredUser();
    const rollNo = user.rollNo || user.username || "21951A0501";
    setIsSubmitting(true);
    try {
      await api.createStudyTask(rollNo, {
        title: newTitle.trim(),
        course_code: newCourseCode.trim() || undefined,
        scheduled_date: newDate,
        allocated_hours: Number(newHours),
        priority: newPriority
      });
      setNewTitle("");
      setNewCourseCode("");
      setNewHours(1.5);
      await loadPlannerData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (task: StudyTask) => {
    const user = getStoredUser();
    const rollNo = user.rollNo || user.username || "21951A0501";
    const nextCompleted = !task.is_completed;
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, is_completed: nextCompleted } : t))
      );
      await api.updateStudyTask(rollNo, task.id, { is_completed: nextCompleted });
      // Refresh summary metrics
      const newSummary = await api.getStudyPlannerSummary(rollNo);
      setSummary(newSummary);
    } catch (err) {
      console.error(err);
      loadPlannerData();
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const user = getStoredUser();
    const rollNo = user.rollNo || user.username || "21951A0501";
    try {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      await api.deleteStudyTask(rollNo, taskId);
      const newSummary = await api.getStudyPlannerSummary(rollNo);
      setSummary(newSummary);
    } catch (err) {
      console.error(err);
      loadPlannerData();
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "PENDING") return !t.is_completed;
    if (filter === "COMPLETED") return t.is_completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="Smart Study Planner"
          subtitle="Align your daily revision with continuous internal evaluations and exam readiness"
        />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Consistency Streak</span>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {summary?.study_streak_days || 0} <span className="text-xs font-semibold text-slate-400">Days</span>
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Completion Rate</span>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {summary?.completion_rate_pct || 0}%
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Allocated Time</span>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {summary?.total_allocated_hours || 0} <span className="text-xs font-semibold text-slate-400">Hours</span>
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Tasks</span>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {summary?.completed_tasks || 0} / {summary?.total_tasks || 0}
                </h4>
              </div>
            </div>
          </div>

          {/* 7-Day Weekly Breakdown Timeline */}
          {summary && summary.weekly_breakdown && summary.weekly_breakdown.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    7-Day Rolling Revision Schedule
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">Weekly Target: ~15 Hours</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {summary.weekly_breakdown.map((day) => (
                  <div
                    key={day.date}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center text-center"
                  >
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      {day.day_name}
                    </span>
                    <span className="text-[11px] text-slate-500 mb-1.5">{day.date.slice(5)}</span>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {day.allocated_hours}h
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">
                      {day.completed_count}/{day.task_count} done
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Grid: Add Task & Task List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Create Task Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>Schedule Study Session</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Allocate structured study blocks to stay ahead of upcoming CIE assessments.
                </p>

                <form onSubmit={handleCreateTask} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Study Focus & Topic
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Practice LR(1) parser tables & conflict resolution"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Course Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={newCourseCode}
                        onChange={(e) => setNewCourseCode(e.target.value)}
                        placeholder="e.g. ACSC31"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Scheduled Date
                      </label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Allocated Hours
                      </label>
                      <select
                        value={newHours}
                        onChange={(e) => setNewHours(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      >
                        <option value={0.5}>30 Mins</option>
                        <option value={1.0}>1.0 Hour</option>
                        <option value={1.5}>1.5 Hours</option>
                        <option value={2.0}>2.0 Hours</option>
                        <option value={2.5}>2.5 Hours</option>
                        <option value={3.0}>3.0 Hours</option>
                        <option value={4.0}>4.0 Hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Priority Level
                      </label>
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      >
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low">Low Priority</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-indigo-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSubmitting ? "Adding Session..." : "Add to Study Planner"}</span>
                  </button>
                </form>
              </div>

              {/* AI-Suggested Weekly Course Allocations */}
              {summary && summary.suggested_allocations && summary.suggested_allocations.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      CIE Performance-Grounded Hour Allocation
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3.5">
                    Recommended weekly study time based on your current continuous assessment scores:
                  </p>

                  <div className="space-y-2.5">
                    {summary.suggested_allocations.map((alloc) => (
                      <div
                        key={alloc.course_code}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {alloc.course_name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {alloc.course_code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{alloc.recommended_focus}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                            {alloc.suggested_hours_per_week}h / wk
                          </div>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            alloc.priority === "High" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400" : "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400"
                          }`}>
                            {alloc.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Task List with Filters */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Scheduled Study Tasks
                    </h3>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                    <button
                      onClick={() => setFilter("ALL")}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        filter === "ALL" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs" : "text-slate-500"
                      }`}
                    >
                      All ({tasks.length})
                    </button>
                    <button
                      onClick={() => setFilter("PENDING")}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        filter === "PENDING" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs" : "text-slate-500"
                      }`}
                    >
                      Pending ({tasks.filter((t) => !t.is_completed).length})
                    </button>
                    <button
                      onClick={() => setFilter("COMPLETED")}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        filter === "COMPLETED" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs" : "text-slate-500"
                      }`}
                    >
                      Done ({tasks.filter((t) => t.is_completed).length})
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-12 text-xs text-slate-400">Loading study schedule...</div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    No study tasks in this view. Use the form on the left to schedule revision blocks.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                    {filteredTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                          t.is_completed
                            ? "bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 shadow-2xs"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={t.is_completed}
                          onChange={() => handleToggleTask(t)}
                          className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs font-bold ${
                                t.is_completed ? "line-through text-slate-400" : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {t.title}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {t.course_code && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                                  {t.course_code}
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                  t.priority === "High"
                                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                                    : t.priority === "Medium"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                }`}
                              >
                                {t.priority}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {t.scheduled_date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {t.allocated_hours} Hours
                            </span>
                            {t.rescheduled_count > 0 && (
                              <span className="text-amber-600 dark:text-amber-400 text-[10px]">
                                Rescheduled ({t.rescheduled_count}x)
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
                SamvidhaPlus Smart Study Planner • Study sessions synchronize with your personal performance records.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
