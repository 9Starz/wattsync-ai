import { TopBar } from "@/components/layout/TopBar";
import { SectionCard } from "@/components/shared/SectionCard";
import { BeforeAfterKpiGrid } from "@/components/optimization/BeforeAfterKpiGrid";
import { BeforeAfterImportChart } from "@/components/optimization/BeforeAfterImportChart";
import { BatteryScheduleChart } from "@/components/optimization/BatteryScheduleChart";
import { EvScheduleChart } from "@/components/optimization/EvScheduleChart";
import { DecisionTimeline } from "@/components/optimization/DecisionTimeline";
import { getOptimizationComparison, getOptimizationDecisions } from "@/lib/optimization";
import { getTodaySeries } from "@/lib/simulation";
import { formatKwh } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

const DECISION_RULES = [
  "Charge batteries when renewable generation exceeds demand",
  "Discharge batteries during the evening peak instead of importing",
  "Delay flexible EV charging out of peak grid stress windows",
  "Export excess renewables when batteries are full",
  "Import from the grid only when storage and renewables can't cover demand",
];

export default function OptimizationPage() {
  const comparison = getOptimizationComparison();
  const decisions = getOptimizationDecisions();
  const { raw, aiOptimized } = getTodaySeries();

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="AI Optimization"
        subtitle="Same assets, same day — with and without VPP coordination"
      />

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <BeforeAfterKpiGrid comparison={comparison} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <SectionCard
            title="Grid Import — Before vs After AI"
            subtitle="Dashed red = uncoordinated assets, green = VPP-coordinated. Shaded band = on-peak pricing."
            className="xl:col-span-2"
          >
            <BeforeAfterImportChart rawPoints={raw.points} aiPoints={aiOptimized.points} />
          </SectionCard>

          <SectionCard title="How the Decision Engine Works" subtitle="Five coordination rules, applied every 15 minutes">
            <ol className="space-y-3">
              {DECISION_RULES.map((rule, i) => (
                <li key={rule} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-green-dim/15 text-[11px] font-semibold text-accent-green">
                    {i + 1}
                  </span>
                  {rule}
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted">
              {formatKwh(comparison.evShiftedKwh)} of EV charging was shifted out of the on-peak window today. All
              results use simulated data — no SCADA/meter integration in this MVP.
            </p>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SectionCard
            title="Battery Schedule (AI-coordinated)"
            subtitle="Green bars = charging, blue bars = discharging, amber line = state of charge"
          >
            <BatteryScheduleChart points={aiOptimized.points} />
          </SectionCard>
          <SectionCard
            title="EV Charging Shift"
            subtitle="The VPP defers flexible sessions from the evening peak into cheap overnight hours"
          >
            <EvScheduleChart rawPoints={raw.points} aiPoints={aiOptimized.points} />
          </SectionCard>
        </div>

        <SectionCard
          title="AI Decision Timeline"
          subtitle={`${decisions.length} coordinated actions across today's simulated day`}
        >
          <DecisionTimeline decisions={decisions} />
        </SectionCard>
      </div>
    </div>
  );
}
