"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IntervalPoint } from "@/lib/simulation";
import { formatAxisKw, formatHourLabel, formatKw } from "@/lib/utils/format";
import { VIZ, tooltipLabelStyle, tooltipStyle } from "@/lib/utils/chartColors";

export function EnergyMixChart({ points, nowHour }: { points: IntervalPoint[]; nowHour: number }) {
  const data = points.map((p) => ({
    hour: p.hour,
    Solar: Math.round(p.solarKw),
    Wind: Math.round(p.windKw),
    Hydro: Math.round(p.hydroKw),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VIZ.solar} stopOpacity={0.35} />
            <stop offset="100%" stopColor={VIZ.solar} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VIZ.wind} stopOpacity={0.35} />
            <stop offset="100%" stopColor={VIZ.wind} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="hydroGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VIZ.hydro} stopOpacity={0.35} />
            <stop offset="100%" stopColor={VIZ.hydro} stopOpacity={0.02} />
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
          labelFormatter={(h) =>
            `${formatHourLabel(h as number)}${(h as number) > nowHour ? " · AI projection" : ""}`
          }
          formatter={(value) => formatKw(Number(value))}
        />
        <Area type="monotone" dataKey="Solar" stackId="1" stroke={VIZ.solar} fill="url(#solarGradient)" strokeWidth={2} isAnimationActive={false} />
        <Area type="monotone" dataKey="Wind" stackId="1" stroke={VIZ.wind} fill="url(#windGradient)" strokeWidth={2} isAnimationActive={false} />
        <Area type="monotone" dataKey="Hydro" stackId="1" stroke={VIZ.hydro} fill="url(#hydroGradient)" strokeWidth={2} isAnimationActive={false} />
        <ReferenceArea x1={nowHour} x2={24} fill={VIZ.axis} fillOpacity={0.05} />
        <ReferenceLine
          x={nowHour}
          stroke={VIZ.brand}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          label={{ value: "Now", position: "insideTopRight", fill: VIZ.brand, fontSize: 11 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
