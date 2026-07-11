"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ValidationPoint } from "@/lib/validation";
import { formatAxisKw, formatHourLabel, formatKw } from "@/lib/utils/format";
import { VIZ, tooltipLabelStyle, tooltipStyle } from "@/lib/utils/chartColors";

/**
 * Prediction vs Actual for one completed day. Shaded band = the confidence range the
 * forecast drew; dashed line = what we predicted; solid line = what actually happened.
 * When the solid line stays inside the band, the forecast was well-calibrated.
 */
export function ForecastVsActualChart({
  points,
  metric,
}: {
  points: ValidationPoint[];
  metric: "generation" | "demand";
}) {
  const isGen = metric === "generation";
  const color = isGen ? VIZ.green : VIZ.demand;

  const data = points.map((p) => ({
    hour: p.hourOfDay,
    forecast: isGen ? p.forecastGenKw : p.forecastDemandKw,
    actual: isGen ? p.actualGenKw : p.actualDemandKw,
    band: isGen ? [p.bandLowGenKw, p.bandHighGenKw] : undefined,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
          formatter={(value, name) => [formatKw(Number(value)), name === "actual" ? "Actual" : "Forecast"]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {isGen && (
          <Area
            type="monotone"
            dataKey="band"
            name="Confidence range"
            stroke="none"
            fill={color}
            fillOpacity={0.14}
            isAnimationActive={false}
            tooltipType="none"
          />
        )}
        <Line
          type="monotone"
          dataKey="forecast"
          name="Forecast"
          stroke={VIZ.forecast}
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
