import clsx from "clsx";

export function BatterySocGauge({ socPercent, flowKw }: { socPercent: number; flowKw: number }) {
  const state = flowKw > 5 ? "Charging" : flowKw < -5 ? "Discharging" : "Idle";
  const stateColor = flowKw > 5 ? "text-accent-blue" : flowKw < -5 ? "text-accent-green" : "text-muted";

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Battery Storage</p>
      <div className="mt-3 flex items-end gap-4">
        <div className="relative h-24 w-12 overflow-hidden rounded-md border border-border bg-surface-raised">
          <div
            className={clsx(
              "absolute bottom-0 left-0 right-0 transition-all",
              socPercent > 60 ? "bg-accent-green" : socPercent > 30 ? "bg-warning" : "bg-critical"
            )}
            style={{ height: `${socPercent}%` }}
          />
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums">{Math.round(socPercent)}%</p>
          <p className={clsx("text-xs font-medium", stateColor)}>
            {state} {state !== "Idle" && `(${Math.round(Math.abs(flowKw))} kW)`}
          </p>
        </div>
      </div>
    </div>
  );
}
