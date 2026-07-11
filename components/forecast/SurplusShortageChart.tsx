"use client";

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ForecastPoint } from "@/lib/forecasting";
import { formatAxisKw, formatHourLabel, formatKw } from "@/lib/utils/format";
import { VIZ, tooltipItemStyle, tooltipLabelStyle, tooltipStyle } from "@/lib/utils/chartColors";

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
        <CartesianGrid strokeDasharray="3 3" stroke={VIZ.gridline} vertical={false} />
        <XAxis
          dataKey="hoursAhead"
          ticks={[0, 4, 8, 12, 16, 20]}
          tickFormatter={(h) => (h === 0 ? "Now" : `+${h}h`)}
          stroke={VIZ.axis}
          fontSize={11}
          tickLine={false}
        />
        <YAxis stroke={VIZ.axis} fontSize={11} tickLine={false} width={52} tickFormatter={formatAxisKw} />
        <Tooltip
          cursor={{ fill: VIZ.brand, fillOpacity: 0.06 }}
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipItemStyle}
          labelFormatter={(h) => {
            const p = hourly.find((d) => d.hoursAhead === h);
            return p ? `+${h}h · ${formatHourLabel(p.hourOfDay)}` : `+${h}h`;
          }}
          // Per-bar Cell fills mean Recharts has no series color for the tooltip item and
          // falls back to black — color the item text by sign instead.
          formatter={(value) => {
            const surplus = Number(value) >= 0;
            return [
              <span key="v" style={{ color: surplus ? VIZ.green : VIZ.critical }}>{formatKw(Number(value))}</span>,
              surplus ? "surplus" : "shortage",
            ];
          }}
        />
        <ReferenceLine y={0} stroke={VIZ.axis} strokeWidth={1} />
        <Bar dataKey="surplus" fill={VIZ.green} radius={[3, 3, 0, 0]} isAnimationActive={false}>
          {hourly.map((d) => (
            <Cell key={d.hoursAhead} fill={d.surplus >= 0 ? VIZ.green : VIZ.critical} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
