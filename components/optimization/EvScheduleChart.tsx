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
import { VIZ, tooltipLabelStyle, tooltipStyle } from "@/lib/utils/chartColors";

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
            <stop offset="0%" stopColor={VIZ.brand} stopOpacity={0.28} />
            <stop offset="100%" stopColor={VIZ.brand} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={VIZ.gridline} vertical={false} />
        <XAxis
          dataKey="hour"
          type="number"
          domain={[0, 24]}
          ticks={[0, 4, 8, 12, 16, 20, 24]}
          tickFormatter={(h) => formatHourLabel(h)}
          stroke={VIZ.axis}
          fontSize={11}
          tickLine={false}
        />
        <YAxis stroke={VIZ.axis} fontSize={11} tickLine={false} tickFormatter={formatAxisKw} width={52} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          labelFormatter={(h) => formatHourLabel(h as number)}
          formatter={(value) => formatKw(Number(value))}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceArea
          x1={16}
          x2={21}
          fill={VIZ.warning}
          fillOpacity={0.08}
          label={{ value: "on-peak", position: "insideTop", fill: VIZ.warning, fontSize: 10 }}
        />
        <Line type="monotone" dataKey="Without AI" stroke={VIZ.critical} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
        <Area type="monotone" dataKey="With AI" stroke={VIZ.brand} strokeWidth={2.5} fill="url(#evAiGradient)" isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
