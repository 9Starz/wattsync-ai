import { IntervalPoint } from "@/lib/simulation";
import { formatKw } from "@/lib/utils/format";

function buildRecommendation(current: IntervalPoint): { headline: string; detail: string } {
  const isOnPeak = current.hour >= 16 && current.hour < 21;
  const isCheapWindow = current.hour >= 9 && current.hour < 16;

  if (isOnPeak) {
    return {
      headline: "Discharging battery to shave the evening peak",
      detail: `Grid import is being held near ${formatKw(current.gridImportKw)} by drawing down the battery array instead of buying on-peak power at $${current.electricityPrice.toFixed(2)}/kWh.`,
    };
  }
  if (isCheapWindow) {
    return {
      headline: "Charging battery from midday renewable surplus",
      detail: `Solar and wind output are being routed into the battery ahead of the 4-9pm peak, avoiding the need to import expensive grid power later.`,
    };
  }
  return {
    headline: "Holding steady — no action needed",
    detail: `Generation and demand are balanced. The optimizer is on standby ahead of the next scheduled charge/discharge window.`,
  };
}

export function AiRecommendationCard({ current }: { current: IntervalPoint }) {
  const { headline, detail } = buildRecommendation(current);

  return (
    <div className="rounded-xl border border-accent-green-dim/30 bg-gradient-to-br from-accent-green-dim/10 via-surface to-surface p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-green/20 text-xs text-accent-green">
          ✦
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-green">AI Recommendation</p>
      </div>
      <p className="mt-3 text-base font-semibold text-foreground">{headline}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{detail}</p>
    </div>
  );
}
