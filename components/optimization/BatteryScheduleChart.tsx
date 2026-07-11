"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IntervalPoint } from "@/lib/simulation";
import { formatAxisKw, formatHourLabel, formatKw } from "@/lib/utils/format";
import { VIZ, tooltipItemStyle, tooltipLabelStyle, tooltipStyle } from "@/lib/utils/chartColors";

/**
 * AI battery schedule: bars = charge (green, up) / discharge (blue, down),
 * line on the right axis = resulting state of charge.
 */
export function BatteryScheduleChart({ points }: { points: IntervalPoint[] }) {
  // Hourly buckets keep the bars readable.
  const data: { hour: number; flow: number; soc: number }[] = [];
  for (let h = 0; h < 24; h++) {
    const bucket = points.filter((p) => p.hour >= h && p.hour < h + 1);
    if (bucket.length === 0) continue;
    data.push({
      hour: h,
      flow: Math.round(bucket.reduce((s, p) => s + p.batteryFlowKw, 0) / bucket.length),
      soc: Math.round(bucket.reduce((s, p) => s + p.batterySocPercent, 0) / bucket.length),
    });
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={VIZ.gridline} vertical={false} />
        <XAxis
          dataKey="hour"
          ticks={[0, 4, 8, 12, 16, 20]}
          tickFormatter={(h) => formatHourLabel(h)}
          stroke={VIZ.axis}
          fontSize={11}
          tickLine={false}
        />
        <YAxis yAxisId="flow" stroke={VIZ.axis} fontSize={11} tickLine={false} tickFormatter={formatAxisKw} width={52} />
        <YAxis
          yAxisId="soc"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          stroke={VIZ.axis}
          fontSize={11}
          tickLine={false}
          width={40}
        />
        <Tooltip
          cursor={{ fill: VIZ.brand, fillOpacity: 0.06 }}
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipItemStyle}
          labelFormatter={(h) => formatHourLabel(h as number)}
          formatter={(value, name) => {
            if (name === "State of charge") return [`${value}%`, name];
            const v = Number(value);
            return [
              <span key="v" style={{ color: v >= 0 ? VIZ.green : VIZ.grid }}>{formatKw(Math.abs(v))}</span>,
              v >= 0 ? "charging" : "discharging",
            ];
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine yAxisId="flow" y={0} stroke={VIZ.axis} strokeWidth={1} />
        <Bar yAxisId="flow" dataKey="flow" name="Charge / discharge" fill={VIZ.green} radius={[3, 3, 0, 0]} isAnimationActive={false}>
          {data.map((d) => (
            <Cell key={d.hour} fill={d.flow >= 0 ? VIZ.green : VIZ.grid} fillOpacity={0.85} />
          ))}
        </Bar>
        <Line yAxisId="soc" dataKey="soc" name="State of charge" stroke={VIZ.warning} strokeWidth={2.5} dot={false} type="monotone" isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
