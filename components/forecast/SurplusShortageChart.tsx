"use client";

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ForecastPoint } from "@/lib/forecasting";
import { formatAxisKw, formatHourLabel, formatKw } from "@/lib/utils/format";

/** Hourly renewable surplus (green, above zero) vs shortage (red, below zero). */
export function SurplusShortageChart({ points }: { points: ForecastPoint[] }) {
  // Bucket 15-min points into hourly bars for readability.
  const hourly: { hoursAhead: number; hourOfDay: number; surplus: number }[] = [];
  for (let h = 0; h < 24; h++) {
    const bucket = points.filter((p) => p.hoursAhead >= h && p.hoursAhead < h + 1);
    if (bucket.length === 0) continue;
    const surplus = bucket.reduce((s, p) => s + (p.generationKw - p.demandKw), 0) / bucket.length;
    hourly.push({ hoursAhead: h, hourOfDay: bucket[0].hourOfDay, surplus: Math.round(surplus) });
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={hourly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#223047" vertical={false} />
        <XAxis
          dataKey="hoursAhead"
          ticks={[0, 4, 8, 12, 16, 20]}
          tickFormatter={(h) => (h === 0 ? "Now" : `+${h}h`)}
          stroke="#8ca0b8"
          fontSize={11}
          tickLine={false}
        />
        <YAxis stroke="#8ca0b8" fontSize={11} tickLine={false} width={52} tickFormatter={formatAxisKw} />
        <Tooltip
          cursor={{ fill: "#38bdf8", fillOpacity: 0.12 }}
          contentStyle={{ background: "#131c2a", border: "1px solid #223047", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#e7edf5" }}
          itemStyle={{ color: "#8ca0b8" }}
          labelFormatter={(h) => {
            const p = hourly.find((d) => d.hoursAhead === h);
            return p ? `+${h}h · ${formatHourLabel(p.hourOfDay)}` : `+${h}h`;
          }}
          // Per-bar Cell fills mean Recharts has no series color for the tooltip item and
          // falls back to black — color the item text by sign instead.
          formatter={(value) => {
            const surplus = Number(value) >= 0;
            return [
              <span key="v" style={{ color: surplus ? "#34d399" : "#f87171" }}>{formatKw(Number(value))}</span>,
              surplus ? "surplus" : "shortage",
            ];
          }}
        />
        <ReferenceLine y={0} stroke="#8ca0b8" strokeWidth={1} />
        <Bar dataKey="surplus" fill="#34d399" radius={[3, 3, 0, 0]}>
          {hourly.map((d) => (
            <Cell key={d.hoursAhead} fill={d.surplus >= 0 ? "#34d399" : "#f87171"} fillOpacity={0.75} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
