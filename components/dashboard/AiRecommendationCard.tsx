import { Sparkles } from "lucide-react";
import { Recommendation } from "@/lib/ai/recommendations";

/**
 * Featured card for the engine's top recommendation: title, grounded reason, impact,
 * suggested action, and a confidence meter. Falls back to a "holding steady" state
 * when the engine has nothing actionable (e.g. late night).
 */
export function AiRecommendationCard({ recommendation }: { recommendation?: Recommendation }) {
  return (
    <div className="card-shadow rounded-xl border border-accent-cyan/25 bg-gradient-to-br from-accent-cyan/5 via-surface to-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-cyan/15 text-accent-cyan">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">AI Recommendation</p>
        </div>
        {recommendation && (
          <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-medium text-muted">
            {recommendation.window}
          </span>
        )}
      </div>

      {recommendation ? (
        <>
          <p className="mt-3 text-base font-semibold text-foreground">{recommendation.title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{recommendation.reason}</p>

          <div className="mt-3 space-y-2 border-t border-border/60 pt-3 text-sm">
            <p className="text-muted">
              <span className="font-medium text-accent-blue">Impact:</span> {recommendation.impact}
            </p>
            <p className="text-muted">
              <span className="font-medium text-accent-green">Action:</span> {recommendation.action}
            </p>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span>Confidence</span>
              <span className="font-medium text-foreground">{Math.round(recommendation.confidence * 100)}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full rounded-full bg-accent-green"
                style={{ width: `${Math.round(recommendation.confidence * 100)}%` }}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-base font-semibold text-foreground">Holding steady — no action needed</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Generation and demand are balanced. The optimizer is on standby ahead of the next scheduled
            charge/discharge window.
          </p>
        </>
      )}
    </div>
  );
}
