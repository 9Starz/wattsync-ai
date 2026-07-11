import clsx from "clsx";
import { BatteryCharging, Building2, Plug, Sun, Waves, Wind, type LucideIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Alert, Asset, ASSET_TYPE_LABEL } from "@/lib/simulation";
import { formatKw } from "@/lib/utils/format";

const TYPE_ICON: Record<Asset["type"], LucideIcon> = {
  solar_farm: Sun,
  wind_turbine: Wind,
  hydro_plant: Waves,
  battery_storage: BatteryCharging,
  ev_charging_station: Plug,
  smart_building: Building2,
};

/** Consumption assets draw power rather than generate it — label their kW accordingly. */
const CONSUMES: Asset["type"][] = ["ev_charging_station", "smart_building"];

export function AssetCard({ asset, alert }: { asset: Asset; alert?: Alert }) {
  const utilization = Math.min(100, Math.round((asset.currentOutputKw / asset.capacityKw) * 100));
  const consumes = CONSUMES.includes(asset.type);
  const Icon = TYPE_ICON[asset.type];

  return (
    <div className="card-shadow flex flex-col rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={clsx(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              consumes ? "bg-brand/8 text-brand" : "bg-accent-green/10 text-accent-green"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{asset.name}</p>
            <p className="text-xs text-muted">
              {ASSET_TYPE_LABEL[asset.type]} · {asset.location}
            </p>
          </div>
        </div>
        <StatusBadge status={asset.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">{consumes ? "Current Load" : "Current Output"}</p>
          <p className="mt-0.5 font-semibold tabular-nums text-foreground">{formatKw(asset.currentOutputKw)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">Capacity</p>
          <p className="mt-0.5 font-semibold tabular-nums text-foreground">
            {formatKw(asset.capacityKw)}
            {asset.capacityKwh ? ` · ${(asset.capacityKwh / 1000).toFixed(0)} MWh` : ""}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span>Utilization</span>
          <span className="tabular-nums">{utilization}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/60">
          <div
            className={clsx("h-full rounded-full", consumes ? "bg-accent-blue" : "bg-accent-green")}
            style={{ width: `${utilization}%` }}
          />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span>Health Score</span>
          <span className="tabular-nums">{asset.healthScore}/100</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/60">
          <div
            className={clsx(
              "h-full rounded-full",
              asset.healthScore >= 90 ? "bg-accent-green" : asset.healthScore >= 80 ? "bg-warning" : "bg-critical"
            )}
            style={{ width: `${asset.healthScore}%` }}
          />
        </div>
      </div>

      {alert && (
        <p className="mt-4 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs leading-relaxed text-muted">
          <span className="font-medium text-warning">Active alert:</span> {alert.cause}
        </p>
      )}
    </div>
  );
}
