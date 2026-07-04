import { TopBar } from "@/components/layout/TopBar";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { EnergyMixChart } from "@/components/dashboard/EnergyMixChart";
import { DemandVsSupplyChart } from "@/components/dashboard/DemandVsSupplyChart";
import { BatterySocGauge } from "@/components/dashboard/BatterySocGauge";
import { AiRecommendationCard } from "@/components/dashboard/AiRecommendationCard";
import { AlertCard } from "@/components/alerts/AlertCard";
import { getActiveAlerts, getDashboardData } from "@/lib/simulation";
import { formatKg, formatKw, formatPct, formatUsd } from "@/lib/utils/format";

export default function DashboardPage() {
  const data = getDashboardData();
  const alerts = getActiveAlerts();
  const { current } = data;

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
            trend={`-${formatKw(data.peakDemandReductionKw)} peak import`}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <SectionCard title="Energy Mix (24h)" subtitle="Solar, wind, hydro generation" className="xl:col-span-2">
            <EnergyMixChart points={data.aiOptimized.points} />
          </SectionCard>
          <AiRecommendationCard current={current} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <SectionCard title="Demand vs. Supply (24h)" subtitle="AI-optimized scenario, dashed line = grid import" className="xl:col-span-2">
            <DemandVsSupplyChart points={data.aiOptimized.points} />
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
