import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { SiteScoreCard } from "@/components/development/SiteScoreCard";
import { MonthlyYieldChart } from "@/components/development/MonthlyYieldChart";
import {
  DEVELOPMENT_STAGES,
  getFeasibility,
  getIntegrationImpact,
  getSiteRanking,
} from "@/lib/development";
import { formatKwh, formatPct, formatUsd } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default function DevelopmentPage() {
  const ranking = getSiteRanking();
  const top = ranking[0];
  const feasibility = getFeasibility(top.site);
  const impact = getIntegrationImpact(top.site);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Project Development"
        subtitle="Where to build next, how big, and what it's worth — the lifecycle starts here"
      />
      <div className="border-b border-border bg-surface/30 px-6 py-2 text-[11px] text-muted">
        Benchmark-based screening on simulated data — every score and dollar figure traces to a stated assumption. A
        development-stage decision aid, not a bankable feasibility study.
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Sites Screened" value={`${ranking.length}`} hint="GIS + permitting + grid criteria" />
          <KpiCard
            label="Recommended Site"
            value={top.site.name}
            accent="green"
            hint={`score ${top.total}/100 · ${top.site.location}`}
          />
          <KpiCard
            label="Recommended Build"
            value={`${top.site.recommendedCapacityMw.toFixed(1)} MW`}
            accent="blue"
            hint={`${Math.round(feasibility.annualYieldMwh).toLocaleString()} MWh/yr · ${feasibility.capacityFactorPct.toFixed(0)}% capacity factor`}
          />
          <KpiCard
            label="Simple Payback"
            value={`${feasibility.simplePaybackYears.toFixed(1)} yrs`}
            accent="green"
            hint={`LCOE $${feasibility.lcoeUsdPerMwh.toFixed(0)}/MWh`}
          />
        </div>

        <SectionCard
          title="Site Screening"
          subtitle="Three candidates, four weighted criteria — every score explained"
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {ranking.map((r) => (
              <SiteScoreCard key={r.site.id} ranked={r} />
            ))}
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <SectionCard
            title={`Estimated Monthly Yield — ${top.site.name}`}
            subtitle={`${top.site.recommendedCapacityMw.toFixed(1)} MW single-axis tracking · ${top.site.irradiance.toFixed(1)} kWh/m²/day · performance ratio 0.79`}
            className="xl:col-span-2"
          >
            <MonthlyYieldChart data={feasibility.monthlyYieldMwh} />
          </SectionCard>

          <SectionCard title="Screening Economics" subtitle="2026 utility-scale benchmarks">
            <div className="space-y-3 text-sm">
              {[
                {
                  label: "CAPEX",
                  value: formatUsd(feasibility.capexUsd),
                  note: `$${feasibility.capexPerWatt.toFixed(2)}/W installed`,
                },
                {
                  label: "Annual energy value",
                  value: formatUsd(feasibility.annualRevenueUsd),
                  note: "avoided on-peak imports + export credits at $0.13/kWh blended",
                },
                {
                  label: "Annual O&M + land",
                  value: formatUsd(feasibility.annualOandMUsd),
                  note: "$17/kW-yr O&M benchmark + site lease",
                },
                {
                  label: "Simple payback",
                  value: `${feasibility.simplePaybackYears.toFixed(1)} years`,
                  note: `LCOE $${feasibility.lcoeUsdPerMwh.toFixed(0)}/MWh at 7% / 25 yr`,
                },
                {
                  label: "CO₂ avoided",
                  value: `${Math.round(feasibility.annualCo2AvoidedTonnes).toLocaleString()} t/yr`,
                  note: "at 0.4 t/MWh grid intensity",
                },
              ].map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-3 border-b border-border/60 pb-2.5 last:border-0 last:pb-0">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">{row.label}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted/80">{row.note}</p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums text-foreground">{row.value}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="VPP Integration Impact"
          subtitle={`What today's live fleet would look like with ${top.site.name} online — the new site's modeled output injected into today's actual simulation`}
        >
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              label="Extra Clean Generation"
              value={formatKwh(impact.extraDailyGenerationKwh)}
              accent="green"
              hint="new midday solar added to today's fleet output"
            />
            <KpiCard
              label="Exported to Grid"
              value={formatKwh(impact.extraExportKwh)}
              accent="blue"
              hint={`${impact.exportSharePct.toFixed(0)}% of the new output — surplus the fleet can't self-consume`}
            />
            <KpiCard
              label="Grid Imports Avoided"
              value={formatKwh(impact.gridImportReductionKwh)}
              accent="neutral"
              hint={`only -${formatPct(impact.gridImportReductionPct)} — the fleet already imports near-zero at midday`}
            />
            <KpiCard
              label="Added Value / Day"
              value={formatUsd(impact.dailySavingsUsd)}
              accent="green"
              hint={`${formatUsd(impact.exportCreditValueUsd)} export credit + ${formatUsd(impact.importAvoidedValueUsd)} import savings`}
            />
          </div>

          <div className="mt-4 rounded-lg border border-border bg-surface-raised/40 p-4 text-xs leading-relaxed text-muted">
            <span className="font-medium text-foreground">Why the split matters.</span> {top.site.name} adds{" "}
            {top.site.recommendedCapacityMw.toFixed(1)} MW of midday solar to a fleet whose existing 4.2 MW array already
            drives grid imports to near-zero around noon. So{" "}
            <span className="text-foreground">{impact.exportSharePct.toFixed(0)}% of the new output is surplus</span> — it
            flows to the grid as export at the $0.08/kWh credit rate rather than displacing the $0.34/kWh on-peak import
            price, which is why the added value is export-led, not import-led. That&apos;s the signal a planner wants{" "}
            <span className="text-foreground">before</span> construction: the next asset should pair battery storage or
            target the evening peak, where the fleet still buys from the grid.{" "}
            <Link href="/dashboard" className="text-accent-green hover:underline">
              See the live fleet it would join →
            </Link>
          </div>
        </SectionCard>

        <SectionCard
          title="Development Roadmap"
          subtitle="Site control to VPP onboarding in ~24 months"
        >
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {DEVELOPMENT_STAGES.map((stage, i) => (
              <li key={stage.name} className="relative rounded-xl border border-border bg-surface-raised/40 p-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-green-dim/15 text-xs font-semibold text-accent-green">
                    {i + 1}
                  </span>
                  <span className="text-[11px] font-medium tabular-nums text-muted">{stage.window}</span>
                </div>
                <p className="mt-2.5 text-sm font-semibold text-foreground">{stage.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{stage.detail}</p>
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>
    </div>
  );
}
