"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import TopNavbar from "@/components/navigation/TopNavbar";
import ScenarioChart from "@/components/charts/ScenarioChart";
import { api, getStoredUser } from "@/lib/api";
import { PerformanceIndex, SGPAEstimate, CGPAScenarioResult, AcademicRiskResult, StudentProfile } from "@/lib/types";
import { Sparkles, Brain, Award, ShieldAlert, CheckCircle2, AlertTriangle, Layers, Info, Calculator } from "lucide-react";

export default function StudentAnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [perfIndex, setPerfIndex] = useState<PerformanceIndex | null>(null);
  const [sgpaEst, setSgpaEst] = useState<SGPAEstimate | null>(null);
  const [riskData, setRiskData] = useState<AcademicRiskResult | null>(null);
  const [hypoSgpa, setHypoSgpa] = useState<number>(8.5);
  const [scenarioRes, setScenarioRes] = useState<CGPAScenarioResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    const rollNo = user.rollNo || user.username || "21951A0501";

    Promise.all([
      api.getStudentProfile(rollNo),
      api.getPerformanceIndex(rollNo),
      api.getSGPAEstimate(rollNo),
      api.getRiskIndicators(rollNo),
      api.simulateCGPAScenario(rollNo, 8.5)
    ]).then(([p, pi, est, r, sc]) => {
      setProfile(p);
      setPerfIndex(pi);
      setSgpaEst(est);
      setRiskData(r);
      setScenarioRes(sc);
    }).finally(() => setIsLoading(false));
  }, []);

  const handleSgpaSlider = async (val: number) => {
    setHypoSgpa(val);
    const user = getStoredUser();
    const rollNo = user.rollNo || user.username || "21951A0501";
    try {
      const res = await api.simulateCGPAScenario(rollNo, val);
      setScenarioRes(res);
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
          title="Academic Performance & Predictive Intelligence"
          subtitle="Multi-factor Academic Performance Index (API), Explainable AI Insights, and Bayesian SGPA Estimation"
        />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Performance Index Hero */}
          {perfIndex && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-portal-50 dark:bg-portal-950 border border-portal-200 dark:border-portal-800 flex items-center justify-center text-portal-600 dark:text-portal-400">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-portal-600 dark:text-portal-400 uppercase tracking-wider">
                      Academic Performance Index
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                      {perfIndex.index_score} <span className="text-sm font-normal text-slate-500">/ 100</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Rating: <span className="font-bold text-slate-800 dark:text-slate-200">{perfIndex.rating}</span> • Data Completeness: <span className="font-bold text-emerald-600">{perfIndex.data_completeness_pct}%</span>
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 max-w-md bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <Info className="w-4 h-4 text-portal-600" />
                    <span>Configurable Formula & Weights</span>
                  </div>
                  Academic (40%) + Attendance (20%) + Internal Assessments (20%) + Semester Trend (10%) + Credit Progress (10%). Missing components dynamically reweighted to eliminate artificial penalization.
                </div>
              </div>

              {/* Component breakdown cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
                {perfIndex.components.map((comp) => (
                  <div key={comp.name} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                        <span>Weight {(comp.weight * 100).toFixed(0)}%</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          comp.status === "Available" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60" : "bg-amber-50 text-amber-700"
                        }`}>{comp.status}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{comp.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-tight">{comp.description}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Score</span>
                      <span className="text-lg font-black text-portal-600 dark:text-portal-400 font-mono">
                        {comp.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SGPA Bayesian Estimation & Model Card */}
          {sgpaEst && (
            <div className="bg-gradient-to-r from-portal-900 to-slate-900 text-white rounded-2xl p-6 border border-portal-800 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-portal-500/20 text-portal-300 border border-portal-500/30 text-xs font-bold mb-2">
                    <Brain className="w-3.5 h-3.5" />
                    <span>Predictive Semester Intelligence</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">
                    Validated SGPA Estimation for Semester {profile?.current_semester}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Continuous evaluation extrapolation blended with autonomous historical variance.
                  </p>
                </div>

                <div className="text-center sm:text-right bg-slate-950/60 p-4 rounded-xl border border-portal-700/50">
                  <span className="text-[10px] uppercase font-bold text-portal-400">Most Likely SGPA</span>
                  <div className="text-3xl font-black text-white mt-0.5">{sgpaEst.most_likely_sgpa.toFixed(2)}</div>
                  <span className="text-xs font-semibold text-portal-300">
                    Range: {sgpaEst.estimated_sgpa_min.toFixed(2)} – {sgpaEst.estimated_sgpa_max.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/50 border border-portal-800/80">
                  <span className="text-portal-400 font-bold block mb-1">Methodology</span>
                  <p className="text-slate-300 leading-relaxed">{sgpaEst.methodology}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/50 border border-portal-800/80">
                  <span className="text-portal-400 font-bold block mb-1">Underlying Assumptions</span>
                  <p className="text-slate-300 leading-relaxed">{sgpaEst.assumptions[0]}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/50 border border-portal-800/80">
                  <span className="text-portal-400 font-bold block mb-1">Model Limitations</span>
                  <p className="text-slate-300 leading-relaxed">{sgpaEst.limitations}</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic pt-2 border-t border-portal-800/60">
                {sgpaEst.disclaimer}
              </p>
            </div>
          )}

          {/* Interactive What-If Simulator */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-portal-600" />
                  <span>Interactive What-If CGPA Simulator</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Evaluate prospective academic outcomes by dragging the target SGPA slider.
                </p>
              </div>
              <span className="text-sm font-black text-portal-600 dark:text-portal-400 font-mono">
                Simulated SGPA: {hypoSgpa.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <input
                type="range"
                min="6.0"
                max="10.0"
                step="0.05"
                value={hypoSgpa}
                onChange={(e) => handleSgpaSlider(parseFloat(e.target.value))}
                className="w-full accent-portal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>6.00</span>
                <span>7.00</span>
                <span>8.00</span>
                <span>9.00</span>
                <span>10.00</span>
              </div>
            </div>

            {scenarioRes && (
              <ScenarioChart
                currentCgpa={scenarioRes.current_cgpa}
                trajectory={scenarioRes.scenario_trajectory}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
