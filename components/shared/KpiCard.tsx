import clsx from "clsx";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: "brand" | "green" | "blue" | "cyan" | "warning" | "neutral";
  trend?: string;
}

const ACCENT_CLASSES: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  brand: "text-brand",
  green: "text-accent-green",
  blue: "text-brand",
  cyan: "text-accent-cyan",
  warning: "text-warning",
  neutral: "text-foreground",
};

export function KpiCard({ label, value, hint, accent = "neutral", trend }: KpiCardProps) {
  return (
    <div className="card-shadow rounded-xl border border-border bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={clsx("mt-2 text-2xl font-extrabold tracking-tight tabular-nums", ACCENT_CLASSES[accent])}>
        {value}
      </p>
      {(hint || trend) && (
        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
          {trend && <span className="font-semibold text-accent-green">{trend}</span>}
          {hint && <span>{hint}</span>}
        </div>
      )}
    </div>
  );
}
