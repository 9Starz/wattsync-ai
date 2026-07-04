import clsx from "clsx";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: "green" | "blue" | "warning" | "neutral";
  trend?: string;
}

const ACCENT_CLASSES: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  green: "text-accent-green",
  blue: "text-accent-blue",
  warning: "text-warning",
  neutral: "text-foreground",
};

export function KpiCard({ label, value, hint, accent = "neutral", trend }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm shadow-black/10">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={clsx("mt-2 text-2xl font-semibold tabular-nums", ACCENT_CLASSES[accent])}>{value}</p>
      {(hint || trend) && (
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          {trend && <span className="font-medium text-accent-green">{trend}</span>}
          {hint && <span>{hint}</span>}
        </div>
      )}
    </div>
  );
}
