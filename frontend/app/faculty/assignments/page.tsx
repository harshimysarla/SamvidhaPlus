"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import TopNavbar from "@/components/navigation/TopNavbar";
import { api } from "@/lib/api";
import { Assignment } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { CheckSquare, Plus, Clock, Users, CheckCircle2 } from "lucide-react";

export default function FacultyAssignmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState(1);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("2026-10-25T23:59:59");
  const [maxMarks, setMaxMarks] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await api.getAssignments();
      setAssignments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setIsCreating(true);
    setSuccessMsg(null);
    try {
      await api.createAssignment(courseId, title.trim(), description.trim(), dueDate, maxMarks);
      setSuccessMsg("Assignment created and published to enrolled student cohort.");
      setTitle("");
      setDescription("");
      await loadAssignments();
    } catch (err: any) {
      alert(err.message || "Failed to create assignment");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="Faculty Coursework & Assessment Management"
          subtitle="Publish Alternative Assessment Tasks (AAT), set deadlines, and review student deliverables"
        />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Create Assignment Form */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <Plus className="w-4 h-4 text-portal-600" />
                <span>Publish New Coursework Assignment</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Assigned deliverables are automatically integrated into student AAT internal components.
              </p>

              {successMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code / Title
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value={1}>ACSC31 - Cloud Computing and Virtualization</option>
                    <option value={2}>AITC24 - Cryptography and Network Security</option>
                    <option value={3}>ACSE14 - Full Stack Web Development</option>
                    <option value={4}>AOEE08 - Cyber Laws and Ethics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Distributed Consensus in Cloud Systems"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description & Problem Statement
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed prompt, instructions, and submission requirements"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Maximum Marks
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="40"
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-2.5 rounded-xl bg-portal-600 hover:bg-portal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreating ? "Publishing..." : "Publish to Class Cohort"}</span>
                </button>
              </form>
            </div>

            {/* Existing Course Assignments */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-portal-600" />
                <span>Active Course Assignments & Review Queue</span>
              </h3>

              <div className="space-y-3">
                {assignments.map((asg) => (
                  <div key={asg.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-portal-600 dark:text-portal-400 bg-portal-50 dark:bg-portal-950 px-2 py-0.5 rounded border border-portal-200">
                        {asg.course_code}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Due: {formatDate(asg.due_date)}</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{asg.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{asg.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Max Score: {asg.max_marks} marks</span>
                      <span className="text-[11px] font-semibold text-portal-600">Continuous Assessment (AAT)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
