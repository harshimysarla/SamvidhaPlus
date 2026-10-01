"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from "recharts";
import { CGPAScenarioTrajectoryItem } from "@/lib/types";

interface ScenarioChartProps {
  currentCgpa: number;
  trajectory: CGPAScenarioTrajectoryItem[];
  targetCgpa?: number;
}

export default function ScenarioChart({ currentCgpa, trajectory, targetCgpa }: ScenarioChartProps) {
  const chartData = trajectory.map((t) => ({
    sgpa: `${t.hypothetical_sgpa.toFixed(1)}`,
    projectedCgpa: t.projected_cgpa,
    delta: t.delta
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="cgpaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
          <XAxis
            dataKey="sgpa"
            label={{ value: "Prospective Next SGPA", position: "insideBottom", offset: -5, fontSize: 11, fill: "#64748b" }}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700">
                    <p className="font-bold text-portal-400">If Next SGPA: {label}</p>
                    <p className="text-slate-200">
                      Projected CGPA: <span className="font-bold text-white">{item.projectedCgpa}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Change: {item.delta >= 0 ? `+${item.delta.toFixed(2)}` : `${item.delta.toFixed(2)}`}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine
            y={currentCgpa}
            stroke="#f59e0b"
            strokeDasharray="3 3"
            label={{ value: `Current (${currentCgpa.toFixed(2)})`, fill: "#d97706", fontSize: 10, position: "insideTopLeft" }}
          />
          {targetCgpa && (
            <ReferenceLine
              y={targetCgpa}
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{ value: `Target (${targetCgpa.toFixed(2)})`, fill: "#059669", fontSize: 10, position: "insideTopRight" }}
            />
          )}
          <Area
            type="monotone"
            dataKey="projectedCgpa"
            stroke="#0284c7"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#cgpaGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
