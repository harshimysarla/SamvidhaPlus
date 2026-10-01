"use client";

import React, { useState, useEffect } from "react";
import { Bell, Menu, X, Check, ExternalLink } from "lucide-react";
import DataSourceBadge from "./DataSourceBadge";
import { getStoredUser, api } from "@/lib/api";
import { NotificationItem } from "@/lib/types";

interface TopNavbarProps {
  onToggleSidebar?: () => void;
  title?: string;
  subtitle?: string;
}

export default function TopNavbar({ onToggleSidebar, title = "Dashboard", subtitle }: TopNavbarProps) {
  const user = getStoredUser();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.getNotifications()
      .then((data) => {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      })
      .catch(() => {
        // Fallback demo notifications
        setNotifications([
          {
            id: 1,
            title: "CIE-II Exam Timetable Released",
            message: "Continuous Internal Evaluation II commences from October 24th.",
            category: "exam",
            is_read: false,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Autonomous Portal Synchronized",
            message: "Academic regulations R20/R22 validated with zero discrepancy.",
            category: "info",
            is_read: true,
            created_at: new Date().toISOString()
          }
        ]);
        setUnreadCount(1);
      });
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // update state optimistically
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg md:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: College Banner, Data Source, Notifications & User */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Data Source Badge */}
        <DataSourceBadge />

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Notifications ({unreadCount} Unread)
                </span>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No new academic notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-start gap-2.5 ${
                        !n.is_read ? "bg-portal-50/40 dark:bg-portal-950/20" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {n.title}
                          </h4>
                          {!n.is_read && (
                            <button
                              onClick={() => handleMarkRead(n.id)}
                              className="text-[10px] text-portal-600 dark:text-portal-400 hover:underline flex items-center gap-0.5"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3" />
                              <span>Read</span>
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-portal-600 text-white flex items-center justify-center font-bold text-xs">
            {user.fullName ? user.fullName[0] : "U"}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
              {user.fullName || user.username}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {user.rollNo || user.facultyId || user.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
