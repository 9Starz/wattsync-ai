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
import { VIZ, tooltipLabelStyle, tooltipStyle } from "@/lib/utils/chartColors";

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
          label={{ value: "on-peak RM0.34/kWh", position: "insideTop", fill: VIZ.warning, fontSize: 10 }}
        />
        {/* No draw-in animation: this chart is the demo's money shot and must be complete the instant the page paints */}
        <Line type="monotone" dataKey="Before AI" stroke={VIZ.critical} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="After AI" stroke={VIZ.green} strokeWidth={2.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
