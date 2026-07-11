import { Sparkles } from "lucide-react";
import { KpiCard } from "@/components/shared/KpiCard";
import { Forecast24h } from "@/lib/forecasting";
import { IntervalPoint } from "@/lib/simulation";
import { Recommendation } from "@/lib/ai/recommendations";
import { formatHourLabel, formatKw, formatKwh } from "@/lib/utils/format";

const RISK_LABEL = { low: "Low", medium: "Medium", high: "High" };

/**
 * Battery readiness for the evening peak: compares dispatchable energy above the 20%
 * reserve floor against the energy the battery is expected to contribute across the
 * 4-9pm on-peak window.
 */
function batteryReadiness(current: IntervalPoint, forecast: Forecast24h): { label: string; hint: string; ok: boolean } {
  const BATTERY_KWH = 6000;
  const RESERVE_FLOOR_PCT = 20;
  const availableKwh = Math.max(0, ((current.batterySocPercent - RESERVE_FLOOR_PCT) / 100) * BATTERY_KWH);
  // Rough on-peak contribution target: 40% of the forecast peak sustained for ~3 hours.
  const neededKwh = forecast.insights.peakDemand.kw * 0.4 * 3;
  const pct = Math.min(100, Math.round((availableKwh / neededKwh) * 100));
  return {
    label: `${pct}% ready`,
    hint: `${formatKwh(availableKwh)} dispatchable vs ~${formatKwh(neededKwh)} peak need`,
    ok: pct >= 70,
  };
}

export function AiInsightsRow({
  current,
  forecast,
  topRecommendation,
}: {
  current: IntervalPoint;
  forecast: Forecast24h;
  topRecommendation?: Recommendation;
}) {
  const { insights } = forecast;
  const readiness = batteryReadiness(current, forecast);

  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand">
        <Sparkles className="h-3.5 w-3.5 text-accent-cyan" strokeWidth={2.5} /> AI Insights — next 24 hours
      </p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard
          label="Forecasted Peak Demand"
          value={formatKw(insights.peakDemand.kw)}
          accent="blue"
          hint={`around ${formatHourLabel(insights.peakDemand.hourOfDay)}`}
        />
        <KpiCard
          label="Predicted Renewable Balance"
          value={`${insights.netSurplusKwh >= 0 ? "+" : ""}${formatKwh(insights.netSurplusKwh)}`}
          accent={insights.netSurplusKwh >= 0 ? "green" : "warning"}
          hint={insights.netSurplusKwh >= 0 ? "surplus to store/export" : "shortage to cover"}
        />
        <KpiCard
          label="Battery Readiness"
          value={readiness.label}
          accent={readiness.ok ? "green" : "warning"}
          hint={readiness.hint}
        />
        <KpiCard
          label="AI Recommended Action"
          value={topRecommendation ? topRecommendation.window : "Standby"}
          accent="green"
          hint={topRecommendation ? topRecommendation.title : "no action needed right now"}
        />
        <KpiCard
          label="Grid Risk Level"
          value={RISK_LABEL[insights.gridRisk.level]}
          accent={insights.gridRisk.level === "low" ? "green" : "warning"}
          hint={
            insights.worstShortage
              ? `tightest around ${formatHourLabel(insights.worstShortage.hourOfDay)}`
              : "no shortage expected"
          }
        />
      </div>
    </div>
  );
}
