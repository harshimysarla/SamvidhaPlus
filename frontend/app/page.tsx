"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  School,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  Users,
  Shield,
  AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";
import DataSourceBadge from "@/components/navigation/DataSourceBadge";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roleRequested, setRoleRequested] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg("Please enter both username/roll number and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await api.login(username.trim(), password, roleRequested);
      if (data.role === "student") {
        router.push("/student");
      } else if (data.role === "faculty") {
        router.push("/faculty");
      } else if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/student");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials or unauthorized account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (u: string, p: string, r: string) => {
    setUsername(u);
    setPassword(p);
    setRoleRequested(r);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-portal-950 text-slate-100 flex flex-col justify-between">
      {/* Top Banner */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-portal-500 to-portal-700 flex items-center justify-center shadow-lg shadow-portal-500/20">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base tracking-wide text-white">
              INSTITUTE OF AERONAUTICAL ENGINEERING
            </h1>
            <p className="text-[11px] text-portal-400 font-medium">
              Autonomous College • Permanent Affiliation with JNTUH • NAAC 'A+' Grade
            </p>
          </div>
        </div>
        <div className="hidden sm:block">
          <DataSourceBadge />
        </div>
      </header>

      {/* Main Login Body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero & Portal Intro */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Academic Performance Analysis & Guidance</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Samvidha<span className="text-indigo-400">Plus</span>
            </h2>

            <p className="text-base font-medium text-indigo-200/90 italic">
              "Understand Your Performance. Predict Your Progress. Shape Your Future."
            </p>

            <p className="text-sm text-slate-300 leading-relaxed">
              Transforming raw academic records into actionable intelligence with continuous CIE analysis,
              Bayesian SGPA estimation with uncertainty bounds, attendance recovery pathways, and smart study planning.
            </p>

            {/* Three EDP Core Pillars */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs font-extrabold text-indigo-400 mb-1">1. UNDERSTAND</div>
                <p className="text-[11px] text-slate-400">CIE marks, lab evaluations, attendance margins & degree audit.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs font-extrabold text-sky-400 mb-1">2. PREDICT</div>
                <p className="text-[11px] text-slate-400">Bounded Bayesian SGPA projection with verified error metrics.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs font-extrabold text-emerald-400 mb-1">3. IMPROVE</div>
                <p className="text-[11px] text-slate-400">Personalized study planner, recovery plans & mentoring.</p>
              </div>
            </div>

            {/* Quick Demo One-Click Selectors */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Quick Demo Switcher (Instant Load):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectDemo("21951A0501", "DemoPass@123", "student")}
                  className="px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-portal-900/60 border border-slate-700 hover:border-portal-500 text-left transition-all text-xs"
                >
                  <span className="block font-bold text-white">21951A0501</span>
                  <span className="text-[10px] text-portal-300">Sem 7 CSE (High Performer)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDemo("22951A0542", "DemoPass@123", "student")}
                  className="px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500 text-left transition-all text-xs"
                >
                  <span className="block font-bold text-white">22951A0542</span>
                  <span className="text-[10px] text-rose-300">Sem 5 CSE (Support Needed)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDemo("FAC001", "DemoPass@123", "faculty")}
                  className="px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-indigo-950/60 border border-slate-700 hover:border-indigo-500 text-left transition-all text-xs"
                >
                  <span className="block font-bold text-white">FAC001</span>
                  <span className="text-[10px] text-indigo-300">Dr. K. Srinivas (Faculty)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDemo("ADMIN01", "AdminPass@123", "admin")}
                  className="px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-amber-950/60 border border-slate-700 hover:border-amber-500 text-left transition-all text-xs"
                >
                  <span className="block font-bold text-white">ADMIN01</span>
                  <span className="text-[10px] text-amber-300">Admin Console</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDemo("22951A6601", "DemoPass@123", "student")}
                  className="px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500 text-left transition-all text-xs"
                >
                  <span className="block font-bold text-white">22951A6601</span>
                  <span className="text-[10px] text-emerald-300">Sem 5 AIML (Sneha)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Login Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-slate-950/80">
              <div className="mb-6">
                <span className="text-xs uppercase font-extrabold text-portal-400 tracking-wider">
                  Secure Academic Authentication
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Sign In to SAIP
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your university roll number or faculty credentials
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Role Switcher */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Account Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRoleRequested("student")}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                        roleRequested === "student"
                          ? "bg-portal-600 text-white border-portal-500 shadow-md shadow-portal-600/30"
                          : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white"
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleRequested("faculty")}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                        roleRequested === "faculty"
                          ? "bg-portal-600 text-white border-portal-500 shadow-md shadow-portal-600/30"
                          : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Faculty</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleRequested("admin")}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                        roleRequested === "admin"
                          ? "bg-portal-600 text-white border-portal-500 shadow-md shadow-portal-600/30"
                          : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white"
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </button>
                  </div>
                </div>

                {/* Username / Roll Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {roleRequested === "student" ? "Roll Number / Hall Ticket" : "Username / Faculty ID"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={roleRequested === "student" ? "e.g. 21951A0501" : "e.g. FAC001 / ADMIN01"}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-portal-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-portal-500 focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-portal-600 focus:ring-portal-500"
                    />
                    <span>Remember this session</span>
                  </label>
                  <span className="text-[11px] text-portal-400 cursor-pointer hover:underline" onClick={() => handleSelectDemo("21951A0501", "DemoPass@123", "student")}>
                    Use demo password
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-portal-600 to-portal-500 hover:from-portal-500 hover:to-portal-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-portal-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Authenticate & Enter Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Security Note */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
                <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Argon2id password hashing • JWT session verification • Strict student data isolation</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-slate-800/60 bg-slate-950/40 text-center text-xs text-slate-500">
        <p>Smart Academic Intelligence Portal (SAIP) • Inspired by Samvidha (samvidha.iare) • Autonomous Curriculum R20/R22</p>
      </footer>
    </div>
  );
}
