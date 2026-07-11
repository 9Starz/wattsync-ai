import clsx from "clsx";
import { Sparkles } from "lucide-react";
import { SiteScore } from "@/lib/development";

/** One candidate site with its weighted screening scores — the #1 site is highlighted. */
export function SiteScoreCard({ ranked }: { ranked: SiteScore }) {
  const { site, criteria, total, rank, summary } = ranked;
  const recommended = rank === 1;

  return (
    <div
      className={clsx(
        "card-shadow flex flex-col rounded-xl border p-5",
        recommended
          ? "border-accent-green/40 bg-gradient-to-br from-accent-green/8 via-surface to-surface"
          : "border-border bg-surface"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{site.name}</p>
          <p className="text-xs text-muted">
            {site.location} · {site.kind === "rooftop" ? "rooftop" : "greenfield"} ·{" "}
            {site.recommendedCapacityMw.toFixed(1)} MW buildable
          </p>
        </div>
        {recommended ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-accent-green/50 bg-accent-green/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-green">
            <Sparkles className="h-3 w-3" strokeWidth={2.5} /> AI recommended
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-border bg-surface-raised/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
            #{rank}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={clsx("text-3xl font-semibold tabular-nums", recommended ? "text-accent-green" : "text-foreground")}>
          {total}
        </span>
        <span className="text-xs text-muted">/ 100 weighted score</span>
      </div>

      <div className="mt-4 space-y-3">
        {criteria.map((c) => (
          <div key={c.label}>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-foreground">
                {c.label} <span className="text-muted">· {Math.round(c.weight * 100)}%</span>
              </span>
              <span className="tabular-nums text-muted">{c.score}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-raised">
              <div
                className={clsx(
                  "h-full rounded-full",
                  c.score >= 70 ? "bg-accent-green" : c.score >= 45 ? "bg-warning" : "bg-critical"
                )}
                style={{ width: `${c.score}%` }}
              />
            </div>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">{c.detail}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted">{summary}</p>
    </div>
  );
}
