"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/navigation/Sidebar";
import TopNavbar from "@/components/navigation/TopNavbar";
import { api, getStoredUser } from "@/lib/api";
import { IntegrationStatus, DataImportSummary } from "@/lib/types";
import {
  Shield,
  Upload,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  Users,
  Layers,
  Lock,
  ExternalLink,
  Info
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [integration, setIntegration] = useState<IntegrationStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // CSV Import states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importSummary, setImportSummary] = useState<DataImportSummary | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user.token || user.role !== "admin") {
      router.push("/");
      return;
    }

    Promise.all([
      api.getAdminStats(),
      api.getIntegrationStatus(),
      api.getAuditLogs()
    ]).then(([st, ig, logs]) => {
      setStats(st);
      setIntegration(ig);
      setAuditLogs(logs);
    }).catch(console.error);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setIsUploading(true);
      setCommitResult(null);
      try {
        const summary = await api.previewCSVImport(file);
        setImportSummary(summary);
      } catch (err: any) {
        alert(err.message || "Failed to parse CSV preview");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCommitImport = async () => {
    if (!importSummary || !importSummary.can_import) return;
    setIsCommitting(true);
    try {
      const res = await api.commitImport(importSummary.preview_sample);
      setCommitResult(`Successfully ingested ${res.records_imported} academic records into database.`);
      // Refresh stats & logs
      const [st, logs] = await Promise.all([api.getAdminStats(), api.getAuditLogs()]);
      setStats(st);
      setAuditLogs(logs);
    } catch (err: any) {
      alert(err.message || "Import commit failed");
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="Administrative Portal & Integration Management"
          subtitle="Autonomous system administration, data import schema verification, and integration adapter status"
        />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Enrolled Students</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {stats?.total_students || 3}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">Active Profiles</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Faculty Members</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {stats?.total_faculty || 2}
              </p>
              <span className="text-[10px] text-portal-600 font-semibold">Authorized Instructors</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Courses</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {stats?.total_courses || 8}
              </p>
              <span className="text-[10px] text-purple-600 font-semibold">Theory & Practical</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Audit Log Records</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {stats?.total_audit_logs || auditLogs.length}
              </p>
              <span className="text-[10px] text-slate-500 font-semibold">Security Trails</span>
            </div>
          </div>

          {/* Section: Academic Data Import Module */}
          <div id="import" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-portal-600 uppercase tracking-wider">
                  Administrative Data Ingestion
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Institutional CSV Academic Data Import
                </h3>
                <p className="text-xs text-slate-500">
                  Secure upload with roll number format verification, course code validation, duplicate detection, and pre-commit preview.
                </p>
              </div>

              {importSummary && importSummary.can_import && (
                <button
                  onClick={handleCommitImport}
                  disabled={isCommitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCommitting ? "Committing..." : "Commit Validated Import"}</span>
                </button>
              )}
            </div>

            {commitResult && (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-bold">{commitResult}</span>
              </div>
            )}

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-portal-400 transition-colors">
              <Upload className="w-10 h-10 text-portal-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Upload Institutional Assessment CSV File
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Expected columns: <span className="font-mono text-slate-600 dark:text-slate-300">roll_no, name, course_code, marks, attendance_pct</span>
              </p>

              <label className="mt-4 inline-block px-5 py-2 rounded-xl bg-portal-600 hover:bg-portal-500 text-white font-bold text-xs cursor-pointer shadow-sm transition-all">
                <span>Select CSV File</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {selectedFile && (
                <p className="text-xs font-semibold text-portal-600 mt-2">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {/* Validation Preview Summary */}
            {importSummary && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Total Rows</span>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{importSummary.total_rows}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 uppercase font-bold">Valid Rows</span>
                    <p className="text-lg font-black text-emerald-600">{importSummary.valid_rows}</p>
                  </div>
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200">
                    <span className="text-[10px] text-rose-700 uppercase font-bold">Invalid / Error Rows</span>
                    <p className="text-lg font-black text-rose-600">{importSummary.invalid_rows}</p>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                        <th className="p-2">Row</th>
                        <th className="p-2">Roll Number</th>
                        <th className="p-2">Student Name</th>
                        <th className="p-2">Course Code</th>
                        <th className="p-2">Marks</th>
                        <th className="p-2">Attendance %</th>
                        <th className="p-2">Validation Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {importSummary.preview_sample.map((row) => (
                        <tr key={row.row_number} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-2 text-slate-400 font-mono">{row.row_number}</td>
                          <td className="p-2 font-mono font-bold">{row.roll_no}</td>
                          <td className="p-2">{row.name}</td>
                          <td className="p-2 font-mono font-bold text-portal-600">{row.course_code}</td>
                          <td className="p-2 font-mono">{row.marks ?? "-"}</td>
                          <td className="p-2 font-mono">{row.attendance_pct ?? "-"}%</td>
                          <td className="p-2">
                            {row.is_valid ? (
                              <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Validated</span>
                              </span>
                            ) : (
                              <span className="text-rose-600 font-bold text-[11px] flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>{row.validation_error}</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Section: Samvidha Live Integration Architecture & Config */}
          <div id="integration" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-portal-600 uppercase tracking-wider">
                  Data Provider Adapter Pattern
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Official Samvidha College Integration Readiness
                </h3>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-500">Active Provider: </span>
                <span className="font-bold text-portal-600 dark:text-portal-400">{integration?.active_provider || "Demo Data"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900 space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">1. Demo Data (Active)</h4>
                </div>
                <p className="text-xs text-amber-800/80 dark:text-amber-400 leading-relaxed">
                  Local structured synthetic dataset matching exact autonomous curriculum regulations (R20/R22). Safe for demonstrations without accessing private records.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900 space-y-2">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300">2. Authorized Import</h4>
                </div>
                <p className="text-xs text-blue-800/80 dark:text-blue-400 leading-relaxed">
                  Ingests verified institutional CSV/Excel files into SQLite/PostgreSQL with automatic schema validation and student isolation.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900 space-y-2">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">3. Official Samvidha API</h4>
                </div>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-400 leading-relaxed">
                  Future-ready adapter for official college endpoint. Inactive until college IT administration issues API credentials, client ID, and mutual TLS token.
                </p>
              </div>
            </div>

            {/* Future Integration Protocol Guide */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-portal-600" />
                <span>Mandatory College Provisioning Requirements for Live Activation</span>
              </h5>
              <p>
                In strict compliance with university cybersecurity guidelines, live synchronization with <span className="font-mono text-slate-800 dark:text-slate-200">samvidha.iare.ac.in</span> requires formal institutional approval, a dedicated REST API gateway endpoint, and issued API keys configured in backend environment variables (<span className="font-mono">OFFICIAL_API_BASE_URL</span>, <span className="font-mono">OFFICIAL_API_CLIENT_ID</span>, <span className="font-mono">OFFICIAL_API_SECRET</span>).
              </p>
            </div>
          </div>

          {/* Section: Security Audit Trail */}
          <div id="audit" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-portal-600" />
              <span>System Security Audit Logs & Provenance Trails</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2">Timestamp</th>
                    <th className="p-2">Actor</th>
                    <th className="p-2">Action</th>
                    <th className="p-2">Resource</th>
                    <th className="p-2">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditLogs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2 text-slate-400 font-mono text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-2 font-bold font-mono">{log.username}</td>
                      <td className="p-2">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-2 text-slate-500 font-mono">{log.resource}</td>
                      <td className="p-2 text-slate-600 dark:text-slate-400 max-w-xs truncate">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
