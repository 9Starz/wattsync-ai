"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { VIZ, tooltipLabelStyle, tooltipStyle } from "@/lib/utils/chartColors";

/** Estimated monthly energy production for the recommended solar site, MWh. */
export function MonthlyYieldChart({ data }: { data: { month: string; mwh: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={VIZ.gridline} vertical={false} />
        <XAxis dataKey="month" stroke={VIZ.axis} fontSize={11} tickLine={false} />
        <YAxis
          stroke={VIZ.axis}
          fontSize={11}
          tickLine={false}
          width={52}
          tickFormatter={(v) => `${v.toLocaleString()}`}
          label={{ value: "MWh", angle: -90, position: "insideLeft", fill: VIZ.axis, fontSize: 11 }}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(value) => [`${Number(value).toLocaleString()} MWh`, "Estimated yield"]}
          cursor={{ fill: VIZ.brand, fillOpacity: 0.06 }}
        />
        <Bar dataKey="mwh" fill={VIZ.solar} radius={[3, 3, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
