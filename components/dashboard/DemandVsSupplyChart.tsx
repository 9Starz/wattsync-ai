"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
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

export function DemandVsSupplyChart({ points, nowHour }: { points: IntervalPoint[]; nowHour: number }) {
  const data = points.map((p) => ({
    hour: p.hour,
    Generation: Math.round(p.totalGenerationKw),
    Demand: Math.round(p.totalDemandKw),
    "Grid Import": Math.round(p.gridImportKw),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
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
          labelFormatter={(h) =>
            `${formatHourLabel(h as number)}${(h as number) > nowHour ? " · AI projection" : ""}`
          }
          formatter={(value) => formatKw(Number(value))}
        />
        <Line type="monotone" dataKey="Generation" stroke={VIZ.green} strokeWidth={2.5} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="Demand" stroke={VIZ.demand} strokeWidth={2.5} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="Grid Import" stroke={VIZ.critical} strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
        <ReferenceArea x1={nowHour} x2={24} fill={VIZ.axis} fillOpacity={0.05} />
        <ReferenceLine
          x={nowHour}
          stroke={VIZ.brand}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          label={{ value: "Now", position: "insideTopRight", fill: VIZ.brand, fontSize: 11 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
