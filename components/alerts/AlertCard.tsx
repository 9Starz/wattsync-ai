import { Alert } from "@/lib/simulation";
import { SeverityBadge } from "@/components/shared/StatusBadge";

const ALERT_LABEL: Record<Alert["alertType"], string> = {
  low_solar_performance: "Low Solar Performance",
  battery_degradation: "Battery Degradation",
  ev_peak_load: "EV Peak Load",
  wind_abnormality: "Wind Output Abnormality",
  grid_stress: "Grid Stress",
};

export function AlertCard({ alert }: { alert: Alert }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{ALERT_LABEL[alert.alertType]}</p>
        <SeverityBadge severity={alert.severity} />
      </div>
      <p className="mt-1 text-xs text-muted">{alert.assetName}</p>
      <p className="mt-2 text-xs leading-relaxed text-foreground/80">{alert.cause}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-accent-blue">→ {alert.recommendedAction}</p>
    </div>
  );
}
