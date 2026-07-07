"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/** Estimated monthly energy production for the recommended site, MWh. */
export function MonthlyYieldChart({ data }: { data: { month: string; mwh: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#223047" vertical={false} />
        <XAxis dataKey="month" stroke="#8ca0b8" fontSize={11} tickLine={false} />
        <YAxis
          stroke="#8ca0b8"
          fontSize={11}
          tickLine={false}
          width={52}
          tickFormatter={(v) => `${v.toLocaleString()}`}
          label={{ value: "MWh", angle: -90, position: "insideLeft", fill: "#8ca0b8", fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{ background: "#131c2a", border: "1px solid #223047", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#e7edf5" }}
          formatter={(value) => [`${Number(value).toLocaleString()} MWh`, "Estimated yield"]}
          cursor={{ fill: "#22304733" }}
        />
        <Bar dataKey="mwh" fill="#34d399" radius={[3, 3, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
