"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ForecastPoint } from "@/lib/forecasting";
import { formatAxisKw, formatHourLabel, formatKw } from "@/lib/utils/format";
import { VIZ, tooltipLabelStyle, tooltipStyle } from "@/lib/utils/chartColors";

interface ForecastChartProps {
  points: ForecastPoint[];
  /** Which quantity to plot. */
  metric: "generation" | "demand";
  color: string;
}

/**
 * Forecast line + confidence band. The band is a Recharts range-area (dataKey returns
 * [low, high]) that widens with forecast horizon to visualize growing uncertainty.
 */
export function ForecastChart({ points, metric, color }: ForecastChartProps) {
  const data = points.map((p) => ({
    hoursAhead: p.hoursAhead,
    hourOfDay: p.hourOfDay,
    value: metric === "generation" ? p.generationKw : p.demandKw,
    band:
      metric === "generation"
        ? [p.generationLowKw, p.generationHighKw]
        : [p.demandLowKw, p.demandHighKw],
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={VIZ.gridline} vertical={false} />
        <XAxis
          dataKey="hoursAhead"
          type="number"
          domain={[0, 24]}
          ticks={[0, 4, 8, 12, 16, 20, 24]}
          tickFormatter={(h) => (h === 0 ? "Now" : `+${h}h`)}
          stroke={VIZ.axis}
          fontSize={11}
          tickLine={false}
        />
        <YAxis stroke={VIZ.axis} fontSize={11} tickLine={false} width={52} tickFormatter={formatAxisKw} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          labelFormatter={(h) => {
            const p = data.find((d) => d.hoursAhead === h);
            return p ? `+${(h as number).toFixed(1)}h · ${formatHourLabel(p.hourOfDay)}` : `+${h}h`;
          }}
          formatter={(value, name) => {
            if (name === "band" && Array.isArray(value)) {
              return [`${formatKw(value[0])} - ${formatKw(value[1])}`, "confidence range"];
            }
            return [formatKw(Number(value)), "forecast"];
          }}
        />
        <Area dataKey="band" stroke="none" fill={color} fillOpacity={0.14} isAnimationActive={false} />
        <Line dataKey="value" stroke={color} strokeWidth={2.5} dot={false} type="monotone" isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
