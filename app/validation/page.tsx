import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { ForecastVsActualChart } from "@/components/validation/ForecastVsActualChart";
import { AccuracyTrendChart } from "@/components/validation/AccuracyTrendChart";
import { getLearningStatus, getYesterdayValidation } from "@/lib/validation";
import { formatHourLabel } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

const TREND_LABEL: Record<string, string> = {
  improving: "Improving",
  steady: "Steady",
  variable: "Weather-driven",
};

export default function ValidationPage() {
  const v = getYesterdayValidation();
  const learning = getLearningStatus();
  const err = v.largestError;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Forecast Validation"
        subtitle="Why trust the AI? Because yesterday's predictions are scored against what actually happened."
      />
      <div className="border-b border-border bg-surface/30 px-6 py-2 text-[11px] text-muted">
        Each completed day, the forecast is replayed and measured against the fleet's realized output — the gap is
        genuine forecast error, not a target. Accuracy is the share of actual energy correctly predicted.
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* The trust scorecard */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label="Forecast Accuracy"
            value={`${v.overallAccuracyPct.toFixed(0)}%`}
            accent="green"
            hint={`${v.dayLabel.toLowerCase()}'s prediction vs actual`}
          />
          <KpiCard
            label="Confidence Calibration"
            value={`${v.confidencePct.toFixed(0)}%`}
            accent="blue"
            hint="of actual readings landed inside the predicted range"
          />
          <KpiCard
            label="7-Day Average"
            value={`${learning.averageAccuracyPct.toFixed(0)}%`}
            accent="green"
            hint={`held ${learning.worstAccuracyPct.toFixed(0)}–${learning.bestAccuracyPct.toFixed(0)}% across the week`}
          />
          <KpiCard
            label="Largest Miss"
            value={`${err.pctOff < 0 ? "−" : "+"}${Math.abs(err.pctOff).toFixed(0)}%`}
            accent="warning"
            hint={`renewable output at ${formatHourLabel(err.hourOfDay)} — explained below`}
          />
        </div>

        {/* Prediction vs Actual */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SectionCard
            title="Renewable Generation — Predicted vs Actual"
            subtitle={`${v.dayLabel} · shaded band = confidence range · ${v.generationAccuracyPct.toFixed(0)}% accurate`}
          >
            <ForecastVsActualChart points={v.points} metric="generation" />
          </SectionCard>
          <SectionCard
            title="Demand — Predicted vs Actual"
            subtitle={`${v.dayLabel} · building + EV load · ${v.demandAccuracyPct.toFixed(0)}% accurate`}
          >
            <ForecastVsActualChart points={v.points} metric="demand" />
          </SectionCard>
        </div>

        {/* Error explanation */}
        <SectionCard title="What Drove the Largest Miss" subtitle="Every error has a cause the AI can name">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">At {formatHourLabel(err.hourOfDay)}</p>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums text-warning">
                {err.pctOff < 0 ? "−" : "+"}
                {Math.abs(err.pctOff).toFixed(0)}%
              </p>
              <p className="mt-0.5 text-xs text-muted">
                forecast {Math.round(err.forecastKw).toLocaleString()} kW · actual{" "}
                {Math.round(err.actualKw).toLocaleString()} kW · weather: {err.weather}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-muted md:col-span-2">{err.explanation}</p>
          </div>
        </SectionCard>

        {/* Continuous learning */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <SectionCard
            title="Accuracy Over the Week"
            subtitle="Daily prediction accuracy — the reliability track record"
            className="xl:col-span-2"
          >
            <AccuracyTrendChart days={learning.trendDays} average={learning.averageAccuracyPct} />
          </SectionCard>

          <SectionCard title="Continuous Learning" subtitle="How the forecaster stays honest">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-raised/40 px-3 py-2">
                <span className="text-xs uppercase tracking-wide text-muted">Status</span>
                <span className="rounded-full border border-accent-green-dim/40 bg-accent-green-dim/10 px-2 py-0.5 text-xs font-medium text-accent-green">
                  {TREND_LABEL[learning.trend]}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted">{learning.trendDetail}</p>
              <p className="text-xs leading-relaxed text-muted">
                Each day&apos;s realized output feeds back to recalibrate the confidence bands — tighter where the fleet
                is predictable, wider where weather adds risk. The forecaster is rule-based today; this same
                measure-and-correct loop is the training signal for a drop-in ML model, with no change to the pages that
                depend on it.
              </p>
            </div>
          </SectionCard>
        </div>

        {/* The trust close */}
        <SectionCard title="Why an Operator Can Trust the Recommendations" subtitle="The forecast is the foundation everything else stands on">
          <p className="max-w-4xl text-sm leading-relaxed text-muted">
            <span className="font-medium text-foreground">
              Every dispatch decision — when to charge the battery, when to delay EV load, when to discharge for the
              evening peak — is driven by this forecast.
            </span>{" "}
            It held {learning.averageAccuracyPct.toFixed(0)}% accuracy over the past week, and its confidence bands are
            calibrated: when it commits to a range, reality lands inside it {v.confidencePct.toFixed(0)}% of the time. And
            when it does miss, the cause is named, not hidden. That is the difference between a black box and a system an
            operator can act on. See the{" "}
            <Link href="/forecast" className="text-accent-green hover:underline">
              live 24-hour forecast
            </Link>{" "}
            or the{" "}
            <Link href="/optimization" className="text-accent-green hover:underline">
              decisions it drives
            </Link>
            .
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
