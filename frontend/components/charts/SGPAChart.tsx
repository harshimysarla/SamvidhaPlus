"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import { SemesterResult } from "@/lib/types";

interface SGPAChartProps {
  data: SemesterResult[];
}

export default function SGPAChart({ data }: SGPAChartProps) {
  const chartData = data.map((item) => ({
    name: `Sem ${item.semester}`,
    SGPA: item.sgpa !== null ? item.sgpa : undefined,
    CGPA: item.cgpa !== null ? item.cgpa : undefined,
    published: item.published
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
          />
          <YAxis
            domain={[4.0, 10.0]}
            ticks={[4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]}
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
                    <p className="font-bold text-portal-400">{label}</p>
                    <p className="text-slate-300">
                      SGPA: <span className="font-semibold text-white">{item.SGPA !== undefined ? item.SGPA.toFixed(2) : "In Progress"}</span>
                    </p>
                    <p className="text-slate-300">
                      CGPA: <span className="font-semibold text-white">{item.CGPA !== undefined ? item.CGPA.toFixed(2) : "In Progress"}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      Status: {item.published ? "Official Published" : "Active Semester"}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "12px", paddingTop: "0px" }}
          />
          <ReferenceLine y={7.0} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "First Class (7.0)", fill: "#94a3b8", fontSize: 10, position: "insideBottomRight" }} />
          <Line
            type="monotone"
            dataKey="SGPA"
            stroke="#0284c7"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#0284c7", strokeWidth: 2, stroke: "#ffffff" }}
            activeDot={{ r: 6, fill: "#0284c7" }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="CGPA"
            stroke="#f59e0b"
            strokeWidth={2.5}
            strokeDasharray="4 2"
            dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#ffffff" }}
            activeDot={{ r: 6, fill: "#f59e0b" }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
