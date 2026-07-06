import { OptimizationComparison } from "@/lib/optimization";
import { formatKg, formatKw, formatKwh, formatUsd } from "@/lib/utils/format";

interface Row {
  label: string;
  before: string;
  after: string;
  delta: string;
  good: boolean;
}

/** Negative net cost means export credits outearned imports — show that as a credit. */
function formatNetCost(value: number): string {
  return value < 0 ? `${formatUsd(-value)} credit` : formatUsd(value);
}

/** Side-by-side before/after cards — the 60-second judge view of what the AI achieved. */
export function BeforeAfterKpiGrid({ comparison }: { comparison: OptimizationComparison }) {
  const c = comparison;
  const rows: Row[] = [
    {
      label: "Peak Demand",
      before: formatKw(c.before.peakDemandKw),
      after: formatKw(c.after.peakDemandKw),
      delta: `-${c.peakDemandReductionPct.toFixed(0)}%`,
      good: c.peakDemandReductionKw > 0,
    },
    {
      label: "Peak Grid Import",
      before: formatKw(c.before.peakGridImportKw),
      after: formatKw(c.after.peakGridImportKw),
      delta: `-${c.peakImportReductionPct.toFixed(0)}%`,
      good: c.peakImportReductionKw > 0,
    },
    {
      label: "Grid Energy Imported",
      before: formatKwh(c.before.totalGridImportKwh),
      after: formatKwh(c.after.totalGridImportKwh),
      delta: `-${c.gridImportReductionPct.toFixed(0)}%`,
      good: c.gridImportReductionKwh > 0,
    },
    {
      label: "Renewable Utilization",
      before: `${c.renewablePctBefore.toFixed(0)}%`,
      after: `${c.renewablePctAfter.toFixed(0)}%`,
      delta: `+${(c.renewablePctAfter - c.renewablePctBefore).toFixed(0)} pts`,
      good: c.renewablePctAfter >= c.renewablePctBefore,
    },
    {
      // Net of export credits — a well-sized renewable fleet can end the day cash-positive.
      label: "Net Energy Cost",
      before: formatNetCost(c.before.totalCostUsd),
      after: formatNetCost(c.after.totalCostUsd),
      delta: `${formatUsd(c.costSavedUsd)} saved`,
      good: c.costSavedUsd > 0,
    },
    {
      label: "Carbon Emissions",
      before: formatKg(c.before.totalCarbonKg),
      after: formatKg(c.after.totalCarbonKg),
      delta: `-${formatKg(c.carbonSavedKg)}`,
      good: c.carbonSavedKg > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {rows.map((r) => (
        <div key={r.label} className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{r.label}</p>
          <div className="mt-2 space-y-1 text-sm tabular-nums">
            <p className="text-muted">
              <span className="mr-1.5 text-[10px] uppercase">Before</span>
              {r.before}
            </p>
            <p className="text-lg font-semibold text-foreground">
              <span className="mr-1.5 text-[10px] font-normal uppercase text-muted">After</span>
              {r.after}
            </p>
          </div>
          <span
            className={
              r.good
                ? "mt-2 inline-block rounded-full border border-accent-green-dim/40 bg-accent-green-dim/10 px-2 py-0.5 text-[11px] font-medium text-accent-green"
                : "mt-2 inline-block rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted"
            }
          >
            {r.delta}
          </span>
        </div>
      ))}
    </div>
  );
}
