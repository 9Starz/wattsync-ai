"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IntervalPoint } from "@/lib/simulation";
import { formatAxisKw, formatHourLabel, formatKw } from "@/lib/utils/format";

/**
 * The "money chart": grid import without AI vs with AI over the same day.
 * The shaded band marks the 4-9pm on-peak price window where imports hurt most.
 */
export function BeforeAfterImportChart({
  rawPoints,
  aiPoints,
}: {
  rawPoints: IntervalPoint[];
  aiPoints: IntervalPoint[];
}) {
  const data = rawPoints.map((p, i) => ({
    hour: p.hour,
    "Before AI": Math.round(p.gridImportKw),
    "After AI": Math.round(aiPoints[i]?.gridImportKw ?? 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
          label={{ value: "on-peak $0.34/kWh", position: "insideTop", fill: "#fbbf24", fontSize: 10 }}
        />
        <Line type="monotone" dataKey="Before AI" stroke="#f87171" strokeWidth={2} strokeDasharray="5 4" dot={false} />
        <Line type="monotone" dataKey="After AI" stroke="#34d399" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
