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
import { formatHourLabel, formatKw } from "@/lib/utils/format";

export function DemandVsSupplyChart({ points, nowHour }: { points: IntervalPoint[]; nowHour: number }) {
  const data = points.map((p) => ({
    hour: p.hour,
    Generation: Math.round(p.totalGenerationKw),
    Demand: Math.round(p.totalDemandKw),
    "Grid Import": Math.round(p.gridImportKw),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
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
        <YAxis stroke="#8ca0b8" fontSize={11} tickLine={false} width={48} />
        <Tooltip
          contentStyle={{ background: "#131c2a", border: "1px solid #223047", borderRadius: 8, fontSize: 12 }}
          labelFormatter={(h) =>
            `${formatHourLabel(h as number)}${(h as number) > nowHour ? " · AI projection" : ""}`
          }
          formatter={(value) => formatKw(Number(value))}
        />
        <Line type="monotone" dataKey="Generation" stroke="#34d399" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Demand" stroke="#38bdf8" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Grid Import" stroke="#f87171" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
        <ReferenceArea x1={nowHour} x2={24} fill="#0b1220" fillOpacity={0.55} />
        <ReferenceLine
          x={nowHour}
          stroke="#34d399"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          label={{ value: "Now", position: "insideTopRight", fill: "#34d399", fontSize: 11 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
