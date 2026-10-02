"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import TopNavbar from "@/components/navigation/TopNavbar";
import { api } from "@/lib/api";
import { Assignment } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { CheckSquare, Upload, Clock, Award, FileText, CheckCircle2 } from "lucide-react";

export default function StudentAssignmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAsg, setSelectedAsg] = useState<Assignment | null>(null);
  const [fileName, setFileName] = useState("assignment_solution.pdf");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleOpenSubmit = (asg: Assignment) => {
    setSelectedAsg(asg);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsg) return;
    setIsSubmitting(true);
    try {
      await api.submitAssignment(selectedAsg.id, fileName);
      setSuccessMsg("Assignment submitted successfully to faculty reviewer.");
      // Reload assignments
      await loadAssignments();
      setTimeout(() => setSelectedAsg(null), 1500);
    } catch (err: any) {
      alert(err.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="Coursework & Alternative Assessment Tasks (AAT)"
          subtitle="Continuous assessment deliverables, problem sets, and faculty feedback"
        />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-portal-600 dark:text-portal-400 bg-portal-50 dark:bg-portal-950 px-2 py-0.5 rounded border border-portal-200">
                      {asg.course_code}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      asg.submission_status === "Submitted"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                        : "bg-amber-50 text-amber-700 border border-amber-300"
                    }`}>
                      {asg.submission_status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{asg.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{asg.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between items-center">
                    <span>Due Date:</span>
                    <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(asg.due_date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Max Marks:</span>
                    <span className="font-semibold">{asg.max_marks} marks</span>
                  </div>
                  {asg.score !== null && asg.score !== undefined && (
                    <div className="flex justify-between items-center text-emerald-600 font-bold">
                      <span>Awarded Score:</span>
                      <span>{asg.score} / {asg.max_marks}</span>
                    </div>
                  )}
                  {asg.feedback && (
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 text-[11px] italic">
                      " {asg.feedback} "
                    </div>
                  )}

                  <div className="pt-2">
                    {asg.submission_status !== "Submitted" ? (
                      <button
                        onClick={() => handleOpenSubmit(asg)}
                        className="w-full py-2 rounded-xl bg-portal-600 hover:bg-portal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit Work</span>
                      </button>
                    ) : (
                      <div className="text-center py-1.5 text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submitted & Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submission Modal */}
          {selectedAsg && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-portal-600 uppercase tracking-wider">
                      Assignment Submission
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedAsg.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedAsg(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                {successMsg ? (
                  <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Attach Solution Document (PDF / ZIP)
                      </label>
                      <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="e.g. cloud_architecture_sol.pdf"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        required
                      />
                    </div>

                    <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center text-xs text-slate-500">
                      <FileText className="w-8 h-8 text-portal-500 mx-auto mb-1" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Attached: {fileName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Autonomous evaluation scheme compliant</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAsg(null)}
                        className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-2 rounded-xl bg-portal-600 hover:bg-portal-500 text-white text-xs font-bold"
                      >
                        {isSubmitting ? "Uploading..." : "Confirm & Submit"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
