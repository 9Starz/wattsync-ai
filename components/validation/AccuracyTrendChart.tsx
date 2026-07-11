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
import { VIZ, tooltipLabelStyle, tooltipStyle } from "@/lib/utils/chartColors";

/** Daily forecast accuracy over the past week — the evidence the model stays reliable. */
export function AccuracyTrendChart({ days, average }: { days: AccuracyTrendDay[]; average: number }) {
  const data = days.map((d) => ({ label: d.label, accuracy: Math.round(d.accuracyPct * 10) / 10 }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={VIZ.gridline} vertical={false} />
        <XAxis dataKey="label" stroke={VIZ.axis} fontSize={11} tickLine={false} />
        <YAxis
          domain={[80, 100]}
          stroke={VIZ.axis}
          fontSize={11}
          tickLine={false}
          width={38}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(value) => [`${value}%`, "Accuracy"]}
          cursor={{ fill: VIZ.brand, fillOpacity: 0.06 }}
        />
        <ReferenceLine
          y={average}
          stroke={VIZ.axis}
          strokeDasharray="4 4"
          label={{ value: `${average.toFixed(0)}% avg`, position: "insideTopRight", fill: VIZ.axis, fontSize: 10 }}
        />
        <Bar dataKey="accuracy" radius={[3, 3, 0, 0]} isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.accuracy >= average ? VIZ.green : VIZ.warning} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
