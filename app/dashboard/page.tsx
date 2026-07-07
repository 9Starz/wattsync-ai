import { TopBar } from "@/components/layout/TopBar";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
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
import { formatHourLabel, formatKg, formatKw, formatPct, formatUsd, formatUsdPerYear } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const data = getDashboardData();
  const alerts = getActiveAlerts();
  const { current } = data;
  const nowHour = getNowHour();
  const forecast = forecastNext24h();
  const recommendations = getRecommendations();

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="VPP Overview" subtitle="Unified view of every clean energy asset in the fleet" />

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Renewable Generation" value={formatKw(current.totalGenerationKw)} accent="green" hint="live" />
          <KpiCard label="Total Demand" value={formatKw(current.totalDemandKw)} accent="blue" hint="building + EV" />
          <KpiCard
            label="Grid Import / Export"
            value={`${formatKw(current.gridImportKw)} / ${formatKw(current.gridExportKw)}`}
            hint="import / export"
          />
          <KpiCard label="EV Charging Load" value={formatKw(current.evDemandKw)} hint="live" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <BatterySocGauge socPercent={current.batterySocPercent} flowKw={current.batteryFlowKw} />
          <KpiCard
            label="Carbon Saved (AI vs. no AI, today)"
            value={formatKg(data.carbonSavedKg)}
            accent="green"
            trend={`${formatPct(data.renewablePctImprovement)} more renewable use`}
          />
          <KpiCard
            label="Cost Saved (AI vs. no AI, today)"
            value={formatUsd(data.costSavedUsd)}
            accent="green"
            trend={`≈ ${formatUsdPerYear(data.costSavedUsd)} run-rate`}
            hint={`-${formatKw(data.peakDemandReductionKw)} peak import`}
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
  );
}
