import { TopBar } from "@/components/layout/TopBar";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { ForecastChart } from "@/components/forecast/ForecastChart";
import { SurplusShortageChart } from "@/components/forecast/SurplusShortageChart";
import { forecastNext24h } from "@/lib/forecasting";
import { formatHourLabel, formatKw, formatKwh } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

const RISK_ACCENT = { low: "green", medium: "warning", high: "warning" } as const;
const RISK_LABEL = { low: "Low", medium: "Medium", high: "High" };

export default function ForecastPage() {
  const forecast = forecastNext24h();
  const { insights } = forecast;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Forecast" subtitle="Next 24 hours — rule-based engine, ML-ready interface" />

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label="Predicted Peak Demand"
            value={formatKw(insights.peakDemand.kw)}
            accent="blue"
            hint={`around ${formatHourLabel(insights.peakDemand.hourOfDay)}`}
          />
          <KpiCard
            label="Predicted Peak Generation"
            value={formatKw(insights.peakGeneration.kw)}
            accent="green"
            hint={`around ${formatHourLabel(insights.peakGeneration.hourOfDay)}`}
          />
          <KpiCard
            label="24h Renewable Balance"
            value={`${insights.netSurplusKwh >= 0 ? "+" : ""}${formatKwh(insights.netSurplusKwh)}`}
            accent={insights.netSurplusKwh >= 0 ? "green" : "warning"}
            hint={insights.netSurplusKwh >= 0 ? "net surplus expected" : "net shortage expected"}
          />
          <KpiCard
            label="Grid Import Risk"
            value={RISK_LABEL[insights.gridRisk.level]}
            accent={RISK_ACCENT[insights.gridRisk.level]}
            hint={
              insights.worstShortage
                ? `tightest around ${formatHourLabel(insights.worstShortage.hourOfDay)}`
                : "no shortage window"
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SectionCard
            title="Renewable Generation Forecast"
            subtitle="Solar + wind + hydro, shaded band = confidence range"
          >
            <ForecastChart points={forecast.points} metric="generation" color="#34d399" />
          </SectionCard>
          <SectionCard title="Energy Demand Forecast" subtitle="Buildings + EV charging, shaded band = confidence range">
            <ForecastChart points={forecast.points} metric="demand" color="#38bdf8" />
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <SectionCard
            title="Renewable Surplus / Shortage"
            subtitle="Hourly forecast balance — green = surplus to store or export, red = shortage to cover"
            className="xl:col-span-2"
          >
            <SurplusShortageChart points={forecast.points} />
          </SectionCard>

          <div className="space-y-4">
            <SectionCard title="Weather Impact" subtitle="How conditions shape this forecast">
              <p className="text-sm leading-relaxed text-muted">{insights.weatherImpact}</p>
            </SectionCard>
            <SectionCard title="Grid Risk Assessment" subtitle={`${RISK_LABEL[insights.gridRisk.level]} risk`}>
              <p className="text-sm leading-relaxed text-muted">{insights.gridRisk.reason}</p>
              {insights.surplusWindow && (
                <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-muted">
                  Best storage window: generation exceeds demand by an average{" "}
                  <span className="text-accent-green">{formatKw(insights.surplusWindow.avgSurplusKw)}</span> between{" "}
                  {formatHourLabel(insights.surplusWindow.startHourOfDay)} and{" "}
                  {formatHourLabel(insights.surplusWindow.endHourOfDay)}.
                </p>
              )}
            </SectionCard>
          </div>
        </div>

        <p className="text-xs text-muted">
          Forecast source: {forecast.source === "rule_based" ? "rule-based engine (persistence + physics model)" : "ML model"} ·
          generated at {formatHourLabel(forecast.generatedAtHour)} · confidence bands widen with horizon
        </p>
      </div>
    </div>
  );
}
