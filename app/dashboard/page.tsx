import { Activity, ArrowLeftRight, Leaf, Plug } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { Sparkline } from "@/components/shared/Sparkline";
import { MiniCompareBar } from "@/components/shared/MiniCompareBar";
import { EnergyMixChart } from "@/components/dashboard/EnergyMixChart";
import { DemandVsSupplyChart } from "@/components/dashboard/DemandVsSupplyChart";
import { BatterySocGauge } from "@/components/dashboard/BatterySocGauge";
import { AiRecommendationCard } from "@/components/dashboard/AiRecommendationCard";
import { AlertCard } from "@/components/alerts/AlertCard";
import { AiInsightsRow } from "@/components/dashboard/AiInsightsRow";
import { VppOptimizationRow } from "@/components/dashboard/VppOptimizationRow";
import { forecastNext24h } from "@/lib/forecasting";
import { getRecommendations } from "@/lib/ai/recommendations";
import { getActiveAlerts, getDashboardData, getNowHour } from "@/lib/simulation";
import { formatHourLabel, formatKg, formatKw, formatKwh, formatPct, formatRm, formatRmPerYear } from "@/lib/utils/format";
import { VIZ } from "@/lib/utils/chartColors";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const data = getDashboardData();
  const alerts = getActiveAlerts();
  const { current, rawTotals, aiTotals } = data;
  const nowHour = getNowHour();
  const forecast = forecastNext24h();
  const recommendations = getRecommendations();

  // Today's trend up to now, sampled for a clean sparkline on each headline KPI.
  const pts = data.aiOptimized.points;
  const nowIdx = Math.max(4, Math.min(pts.length, Math.round((nowHour / 24) * pts.length) + 1));
  const trail = pts.slice(0, nowIdx).filter((_, i) => i % 3 === 0);
  const spark = (pick: (p: (typeof pts)[number]) => number) => trail.map(pick);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="VPP Overview" subtitle="Unified view of every clean energy asset in the fleet" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-[1760px] space-y-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label="Renewable Generation"
            value={formatKw(current.totalGenerationKw)}
            accent="green"
            hint="live"
            icon={Leaf}
            footer={<Sparkline data={spark((p) => p.totalGenerationKw)} color={VIZ.green} />}
          />
          <KpiCard
            label="Total Demand"
            value={formatKw(current.totalDemandKw)}
            accent="blue"
            hint="building + EV"
            icon={Activity}
            footer={<Sparkline data={spark((p) => p.totalDemandKw)} color={VIZ.brand} />}
          />
          <KpiCard
            label="Grid Import / Export"
            value={`${formatKw(current.gridImportKw)} / ${formatKw(current.gridExportKw)}`}
            hint="import / export"
            icon={ArrowLeftRight}
            footer={<Sparkline data={spark((p) => p.gridImportKw)} color={VIZ.grid} />}
          />
          <KpiCard
            label="EV Charging Load"
            value={formatKw(current.evDemandKw)}
            hint="live"
            icon={Plug}
            footer={<Sparkline data={spark((p) => p.evDemandKw)} color={VIZ.cyan} />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <BatterySocGauge socPercent={current.batterySocPercent} flowKw={current.batteryFlowKw} />
          <KpiCard
            label="Carbon Saved (AI vs. no AI, today)"
            value={formatKg(data.carbonSavedKg)}
            accent="green"
            trend={`${formatPct(data.renewablePctImprovement)} more renewable use`}
            footer={
              <MiniCompareBar
                before={rawTotals.totalCarbonKg}
                after={aiTotals.totalCarbonKg}
                color={VIZ.green}
                format={formatKg}
              />
            }
          />
          <KpiCard
            label="Cost Saved (AI vs. no AI, today)"
            value={formatRm(data.costSavedUsd)}
            accent="green"
            trend={`≈ ${formatRmPerYear(data.costSavedUsd)} run-rate`}
            hint={`-${formatKw(data.peakDemandReductionKw)} peak import`}
            footer={
              <MiniCompareBar
                before={rawTotals.totalGridImportKwh}
                after={aiTotals.totalGridImportKwh}
                color={VIZ.grid}
                format={formatKwh}
                beforeLabel="Grid import, no AI"
                afterLabel="Grid import, with AI"
              />
            }
          />
        </div>

        <VppOptimizationRow />

        <AiInsightsRow current={current} forecast={forecast} topRecommendation={recommendations[0]} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <SectionCard
            title="Energy Mix (24h)"
            subtitle={`Solar, wind, hydro — actual to ${formatHourLabel(nowHour)}, AI projection beyond`}
            className="xl:col-span-2"
          >
            <EnergyMixChart points={data.aiOptimized.points} nowHour={nowHour} />
          </SectionCard>
          <AiRecommendationCard recommendation={recommendations[0]} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <SectionCard
            title="Demand vs. Supply (24h)"
            subtitle={`Actual to ${formatHourLabel(nowHour)}, AI projection beyond · dashed red = grid import`}
            className="xl:col-span-2"
          >
            <DemandVsSupplyChart points={data.aiOptimized.points} nowHour={nowHour} />
          </SectionCard>
          <SectionCard title="Active Alerts" subtitle={`${alerts.length} needing attention`}>
            <div className="space-y-3">
              {alerts.length === 0 && <p className="text-sm text-muted">No active alerts. Fleet is healthy.</p>}
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </SectionCard>
        </div>
        </div>
      </div>
    </div>
  );
}
