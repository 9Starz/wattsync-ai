import clsx from "clsx";
import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: "brand" | "green" | "blue" | "cyan" | "warning" | "neutral";
  trend?: string;
  /** Optional Lucide icon rendered in a subtle tile at the top-right. */
  icon?: LucideIcon;
  /** Optional micro-visual (sparkline, compare bar) rendered below the metric. */
  footer?: ReactNode;
}

const ACCENT_CLASSES: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  brand: "text-brand",
  green: "text-accent-green",
  blue: "text-brand",
  cyan: "text-accent-cyan",
  warning: "text-warning",
  neutral: "text-foreground",
};

export function KpiCard({ label, value, hint, accent = "neutral", trend, icon: Icon, footer }: KpiCardProps) {
  return (
    <div className="card-shadow flex flex-col rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        {Icon && (
          <span
            className={clsx(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-raised",
              ACCENT_CLASSES[accent]
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
        )}
      </div>
      <p className={clsx("mt-2 text-2xl font-extrabold tracking-tight tabular-nums", ACCENT_CLASSES[accent])}>
        {value}
      </p>
      {(hint || trend) && (
        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
          {trend && <span className="font-semibold text-accent-green">{trend}</span>}
          {hint && <span>{hint}</span>}
        </div>
      )}
      {footer}
    </div>
  );
}
