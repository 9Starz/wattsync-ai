/**
 * Slim two-row before/after bar for a KPI tile: the "without AI" baseline (muted) over
 * the "with AI" result (accent). The visible gap is the improvement — fills the card
 * with a meaningful micro-visual while reinforcing the before/after story.
 */
export function MiniCompareBar({
  before,
  after,
  color,
  format,
  beforeLabel = "Without AI",
  afterLabel = "With AI",
}: {
  before: number;
  after: number;
  color: string;
  format: (v: number) => string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const max = Math.max(before, after, 1);

  return (
    <div className="mt-3 space-y-2">
      <Row label={beforeLabel} value={format(before)} pct={(before / max) * 100} tone="muted" />
      <Row label={afterLabel} value={format(after)} pct={(after / max) * 100} color={color} />
    </div>
  );
}

function Row({
  label,
  value,
  pct,
  color,
  tone,
}: {
  label: string;
  value: string;
  pct: number;
  color?: string;
  tone?: "muted";
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-muted">
        <span>{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-raised">
        <div
          className={tone === "muted" ? "h-full rounded-full bg-slate-300" : "h-full rounded-full"}
          style={{ width: `${Math.max(2, pct)}%`, background: tone === "muted" ? undefined : color }}
        />
      </div>
    </div>
  );
}
