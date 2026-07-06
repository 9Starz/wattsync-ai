import Link from "next/link";
import { KpiCard } from "@/components/shared/KpiCard";
import { getOptimizationComparison, getOptimizationDecisions } from "@/lib/optimization";
import { getNowHour } from "@/lib/simulation";
import { formatKw } from "@/lib/utils/format";

/** Dashboard strip: is the VPP actively coordinating right now, and what has it bought us today? */
export function VppOptimizationRow() {
  const comparison = getOptimizationComparison();
  const decisions = getOptimizationDecisions();
  const nowHour = getNowHour();

  const activeDecision = decisions.find((d) => nowHour >= d.startHour && nowHour < d.endHour);
  const executed = decisions.filter((d) => d.startHour <= nowHour).length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-blue">
          <span>⚡</span> VPP Optimization — AI vs uncoordinated (today)
        </p>
        <Link href="/optimization" className="text-xs font-medium text-accent-green hover:underline">
          View decisions →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Optimization Status"
          value={activeDecision ? "Active" : "Standby"}
          accent={activeDecision ? "green" : "neutral"}
          hint={activeDecision ? activeDecision.title : `${executed} of ${decisions.length} actions executed`}
        />
        <KpiCard
          label="Peak Demand Reduction"
          value={`-${comparison.peakDemandReductionPct.toFixed(0)}%`}
          accent="green"
          hint={`${formatKw(comparison.peakDemandReductionKw)} shaved off the peak`}
        />
        <KpiCard
          label="Peak Import Reduction"
          value={`-${comparison.peakImportReductionPct.toFixed(0)}%`}
          accent="green"
          hint={`${formatKw(comparison.peakImportReductionKw)} less on-peak grid draw`}
        />
        <KpiCard
          label="Renewable Utilization"
          value={`${comparison.renewablePctAfter.toFixed(0)}%`}
          accent="green"
          hint={`vs ${comparison.renewablePctBefore.toFixed(0)}% without AI`}
        />
      </div>
    </div>
  );
}
