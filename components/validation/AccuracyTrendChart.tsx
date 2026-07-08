"use client";

import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AccuracyTrendDay } from "@/lib/validation";

/** Daily forecast accuracy over the past week — the evidence the model stays reliable. */
export function AccuracyTrendChart({ days, average }: { days: AccuracyTrendDay[]; average: number }) {
  const data = days.map((d) => ({ label: d.label, accuracy: Math.round(d.accuracyPct * 10) / 10 }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#223047" vertical={false} />
        <XAxis dataKey="label" stroke="#8ca0b8" fontSize={11} tickLine={false} />
        <YAxis
          domain={[80, 100]}
          stroke="#8ca0b8"
          fontSize={11}
          tickLine={false}
          width={38}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{ background: "#131c2a", border: "1px solid #223047", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#e7edf5" }}
          formatter={(value) => [`${value}%`, "Accuracy"]}
          cursor={{ fill: "#22304733" }}
        />
        <ReferenceLine
          y={average}
          stroke="#8ca0b8"
          strokeDasharray="4 4"
          label={{ value: `${average.toFixed(0)}% avg`, position: "insideTopRight", fill: "#8ca0b8", fontSize: 10 }}
        />
        <Bar dataKey="accuracy" radius={[3, 3, 0, 0]} isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.accuracy >= average ? "#34d399" : "#fbbf24"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
