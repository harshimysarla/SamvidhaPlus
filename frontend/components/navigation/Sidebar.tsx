"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  UserCheck,
  Calendar,
  FileSpreadsheet,
  CheckSquare,
  FileText,
  LogOut,
  Users,
  BarChart3,
  ShieldAlert,
  Upload,
  BookOpen,
  ChevronRight,
  School
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStoredUser, api } from "@/lib/api";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();
  const role = user.role || "student";

  const handleLogout = async () => {
    await api.logout();
    router.push("/");
  };

  const studentLinks = [
    { href: "/student", label: "Academic Overview", icon: LayoutDashboard },
    { href: "/student/records", label: "Semester Records", icon: GraduationCap },
    { href: "/student/analytics", label: "Performance & AI Insights", icon: Sparkles },
    { href: "/student/attendance", label: "Attendance & Margins", icon: UserCheck },
    { href: "/student/timetable", label: "Timetable & Calendar", icon: Calendar },
    { href: "/student/assignments", label: "Coursework & Tasks", icon: CheckSquare },
    { href: "/student/planner", label: "Smart Study Planner", icon: BookOpen },
    { href: "/student/reports", label: "Academic Reports", icon: FileText },
  ];

  const facultyLinks = [
    { href: "/faculty", label: "Faculty Dashboard", icon: LayoutDashboard },
    { href: "/faculty#courses", label: "Assigned Courses", icon: BookOpen },
    { href: "/faculty#risk", label: "Students Support List", icon: ShieldAlert },
    { href: "/faculty/assignments", label: "Manage Assignments", icon: CheckSquare },
  ];

  const adminLinks = [
    { href: "/admin", label: "Admin Console", icon: LayoutDashboard },
    { href: "/admin#import", label: "Data Import (CSV)", icon: Upload },
    { href: "/admin#integration", label: "Samvidha Integration", icon: BarChart3 },
    { href: "/admin#audit", label: "Audit Logs", icon: FileSpreadsheet },
  ];

  const navLinks = role === "admin" ? adminLinks : role === "faculty" ? facultyLinks : studentLinks;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800 bg-slate-950/60 gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
          <Sparkles className="w-5 h-5 text-indigo-200" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-wide text-white">SamvidhaPlus</span>
          <span className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">Academic Intelligence</span>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/30 flex items-center justify-between">
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Session</span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full capitalize bg-portal-900/60 text-portal-300 border border-portal-700/50">
          {role}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/student" && item.href !== "/faculty" && item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-portal-600 text-white shadow-sm shadow-portal-600/20 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-portal-400")} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-portal-400">
            {user.fullName ? user.fullName[0] : "U"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold text-slate-200 truncate">{user.fullName || user.username}</span>
            <span className="text-[11px] text-slate-400 font-mono truncate">{user.rollNo || user.username}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
