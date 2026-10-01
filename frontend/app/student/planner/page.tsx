"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import TopNavbar from "@/components/navigation/TopNavbar";
import { api, getStoredUser } from "@/lib/api";
import { PersonalStudyGoal } from "@/lib/types";
import { BookOpen, CheckCircle, Plus, Calendar, CheckSquare, Clock } from "lucide-react";

export default function StudentPlannerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [goals, setGoals] = useState<PersonalStudyGoal[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newCategory, setNewCategory] = useState("Academic");
  const [newNotes, setNewNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const user = getStoredUser();
    const rollNo = user.rollNo || user.username || "21951A0501";
    try {
      const data = await api.getStudyGoals(rollNo);
      setGoals(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const user = getStoredUser();
    const rollNo = user.rollNo || user.username || "21951A0501";
    setIsAdding(true);
    try {
      await api.addStudyGoal(rollNo, {
        title: newTitle.trim(),
        target_date: newDate || undefined,
        category: newCategory,
        notes: newNotes || undefined
      });
      setNewTitle("");
      setNewDate("");
      setNewNotes("");
      await loadGoals();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (goalId: number) => {
    const user = getStoredUser();
    const rollNo = user.rollNo || user.username || "21951A0501";
    try {
      await api.toggleStudyGoal(rollNo, goalId);
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, is_completed: !g.is_completed } : g))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const completedCount = goals.filter((g) => g.is_completed).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="Student Academic Study Planner"
          subtitle="Self-defined revision milestones, target goals, and study schedules"
        />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Create Goal Form */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <Plus className="w-4 h-4 text-portal-600" />
                <span>Add Study Milestone or Task</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Personal planning goals remain private and separate from official institutional records.
              </p>

              <form onSubmit={handleAddGoal} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Goal / Task Description
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Complete AWS Terraform IaC Lab revision"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300"
                    >
                      <option value="Academic">Academic Exam</option>
                      <option value="Assignment">Assignment AAT</option>
                      <option value="Lab">Lab Practical</option>
                      <option value="Project">Project Work</option>
                      <option value="Placement">Placement Prep</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notes & Action Items (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Reference chapters, key formulas, or repository links"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAdding}
                  className="w-full py-2.5 rounded-xl bg-portal-600 hover:bg-portal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAdding ? "Saving..." : "Add to Study Planner"}</span>
                </button>
              </form>
            </div>

            {/* Goals List */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>My Action Milestones</span>
                  </h3>
                  <span className="text-xs font-bold text-portal-600 dark:text-portal-400 bg-portal-50 dark:bg-portal-950 px-2.5 py-0.5 rounded-full border border-portal-200">
                    {completedCount} of {goals.length} Completed
                  </span>
                </div>

                {goals.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No study milestones added yet. Create one to organize your revision schedule.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                    {goals.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => handleToggle(g.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          g.is_completed
                            ? "bg-slate-50/60 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-60"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-portal-400 shadow-2xs"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={g.is_completed}
                          onChange={() => {}}
                          className="mt-1 w-4 h-4 rounded text-portal-600 focus:ring-portal-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${g.is_completed ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}>
                              {g.title}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {g.category}
                            </span>
                          </div>
                          {g.notes && (
                            <p className="text-[11px] text-slate-500 mt-1">{g.notes}</p>
                          )}
                          {g.target_date && (
                            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Target: {g.target_date}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
                Study goals are saved locally to your profile for continuous revision management.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
