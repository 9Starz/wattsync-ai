"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IntervalPoint } from "@/lib/simulation";
import { formatAxisKw, formatHourLabel, formatKw } from "@/lib/utils/format";

/**
 * EV charging shift: without AI the load spikes with the evening commute; the VPP
 * defers ~35% of on-peak sessions into the cheap overnight window.
 */
export function EvScheduleChart({
  rawPoints,
  aiPoints,
}: {
  rawPoints: IntervalPoint[];
  aiPoints: IntervalPoint[];
}) {
  const data = rawPoints.map((p, i) => ({
    hour: p.hour,
    "Without AI": Math.round(p.evDemandKw),
    "With AI": Math.round(aiPoints[i]?.evDemandKw ?? 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="evAiGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#223047" vertical={false} />
        <XAxis
          dataKey="hour"
          type="number"
          domain={[0, 24]}
          ticks={[0, 4, 8, 12, 16, 20, 24]}
          tickFormatter={(h) => formatHourLabel(h)}
          stroke="#8ca0b8"
          fontSize={11}
          tickLine={false}
        />
        <YAxis stroke="#8ca0b8" fontSize={11} tickLine={false} tickFormatter={formatAxisKw} width={52} />
        <Tooltip
          contentStyle={{ background: "#131c2a", border: "1px solid #223047", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#e7edf5" }}
          labelFormatter={(h) => formatHourLabel(h as number)}
          formatter={(value) => formatKw(Number(value))}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceArea
          x1={16}
          x2={21}
          fill="#fbbf24"
          fillOpacity={0.06}
          label={{ value: "on-peak", position: "insideTop", fill: "#fbbf24", fontSize: 10 }}
        />
        <Line type="monotone" dataKey="Without AI" stroke="#f87171" strokeWidth={2} strokeDasharray="5 4" dot={false} />
        <Area type="monotone" dataKey="With AI" stroke="#38bdf8" strokeWidth={2} fill="url(#evAiGradient)" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
