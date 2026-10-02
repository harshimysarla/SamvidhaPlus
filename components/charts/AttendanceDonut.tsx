"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { CheckCircle, AlertTriangle, AlertOctagon } from "lucide-react";

interface AttendanceDonutProps {
  percentage: number;
  totalAttended: number;
  totalConducted: number;
  regularThreshold?: number;
  condonationThreshold?: number;
}

export default function AttendanceDonut({
  percentage,
  totalAttended,
  totalConducted,
  regularThreshold = 75.0,
  condonationThreshold = 65.0
}: AttendanceDonutProps) {
  const missedClasses = Math.max(0, totalConducted - totalAttended);
  const data = [
    { name: "Attended", value: totalAttended },
    { name: "Missed", value: missedClasses }
  ];

  let statusColor = "#10b981"; // Emerald
  let StatusIcon = CheckCircle;
  let statusText = "Compliant (Regular)";

  if (percentage < condonationThreshold) {
    statusColor = "#ef4444"; // Rose
    StatusIcon = AlertOctagon;
    statusText = "Critical (Detention Risk)";
  } else if (percentage < regularThreshold) {
    statusColor = "#f59e0b"; // Amber
    StatusIcon = AlertTriangle;
    statusText = "Condonation Bracket";
  }

  const COLORS = [statusColor, "#e2e8f0"];

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {percentage.toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Overall Attendance
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold" style={{ color: statusColor }}>
        <StatusIcon className="w-4 h-4" />
        <span>{statusText}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 w-full max-w-xs text-center border-t border-slate-100 dark:border-slate-800 pt-3">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Attended</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{totalAttended} / {totalConducted}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Req. Threshold</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{regularThreshold}%</p>
        </div>
      </div>
    </div>
  );
}
