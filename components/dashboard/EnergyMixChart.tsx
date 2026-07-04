"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { IntervalPoint } from "@/lib/simulation";
import { formatHourLabel, formatKw } from "@/lib/utils/format";

export function EnergyMixChart({ points }: { points: IntervalPoint[] }) {
  const data = points.map((p) => ({
    hour: p.hour,
    Solar: Math.round(p.solarKw),
    Wind: Math.round(p.windKw),
    Hydro: Math.round(p.hydroKw),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="hydroGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#223047" vertical={false} />
        <XAxis
          dataKey="hour"
          type="number"
          domain={[0, 24]}
          ticks={[0, 4, 8, 12, 16, 20, 24]}
          tickFormatter={(h) => formatHourLabel(h)}
          stroke="#8ca0b8"
          fontSize={11}
          tickLine={false}
        />
        <YAxis stroke="#8ca0b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}`} width={48} />
        <Tooltip
          contentStyle={{ background: "#131c2a", border: "1px solid #223047", borderRadius: 8, fontSize: 12 }}
          labelFormatter={(h) => formatHourLabel(h as number)}
          formatter={(value) => formatKw(Number(value))}
        />
        <Area type="monotone" dataKey="Solar" stackId="1" stroke="#fbbf24" fill="url(#solarGradient)" strokeWidth={1.5} />
        <Area type="monotone" dataKey="Wind" stackId="1" stroke="#38bdf8" fill="url(#windGradient)" strokeWidth={1.5} />
        <Area type="monotone" dataKey="Hydro" stackId="1" stroke="#34d399" fill="url(#hydroGradient)" strokeWidth={1.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
