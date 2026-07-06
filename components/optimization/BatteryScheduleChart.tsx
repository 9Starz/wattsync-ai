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
        <CartesianGrid strokeDasharray="3 3" stroke="#223047" vertical={false} />
        <XAxis
          dataKey="hour"
          ticks={[0, 4, 8, 12, 16, 20]}
          tickFormatter={(h) => formatHourLabel(h)}
          stroke="#8ca0b8"
          fontSize={11}
          tickLine={false}
        />
        <YAxis yAxisId="flow" stroke="#8ca0b8" fontSize={11} tickLine={false} tickFormatter={formatAxisKw} width={52} />
        <YAxis
          yAxisId="soc"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          stroke="#8ca0b8"
          fontSize={11}
          tickLine={false}
          width={40}
        />
        <Tooltip
          cursor={{ fill: "#38bdf8", fillOpacity: 0.12 }}
          contentStyle={{ background: "#131c2a", border: "1px solid #223047", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#e7edf5" }}
          itemStyle={{ color: "#8ca0b8" }}
          labelFormatter={(h) => formatHourLabel(h as number)}
          formatter={(value, name) => {
            if (name === "State of charge") return [`${value}%`, name];
            const v = Number(value);
            return [
              <span key="v" style={{ color: v >= 0 ? "#34d399" : "#38bdf8" }}>{formatKw(Math.abs(v))}</span>,
              v >= 0 ? "charging" : "discharging",
            ];
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine yAxisId="flow" y={0} stroke="#8ca0b8" strokeWidth={1} />
        <Bar yAxisId="flow" dataKey="flow" name="Charge / discharge" fill="#34d399" radius={[3, 3, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.hour} fill={d.flow >= 0 ? "#34d399" : "#38bdf8"} fillOpacity={0.8} />
          ))}
        </Bar>
        <Line yAxisId="soc" dataKey="soc" name="State of charge" stroke="#fbbf24" strokeWidth={2} dot={false} type="monotone" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
