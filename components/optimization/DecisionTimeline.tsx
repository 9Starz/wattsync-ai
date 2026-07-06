import clsx from "clsx";
import { DecisionType, OptimizationDecision } from "@/lib/optimization";

const TYPE_STYLE: Record<DecisionType, { label: string; dot: string; chip: string }> = {
  battery_charge: { label: "Battery", dot: "bg-accent-green", chip: "text-accent-green border-accent-green-dim/40 bg-accent-green-dim/10" },
  battery_discharge: { label: "Battery", dot: "bg-accent-blue", chip: "text-accent-blue border-accent-blue-dim/40 bg-accent-blue-dim/10" },
  ev_delay: { label: "EV Fleet", dot: "bg-warning", chip: "text-warning border-warning/40 bg-warning/10" },
  ev_resume: { label: "EV Fleet", dot: "bg-accent-blue", chip: "text-accent-blue border-accent-blue-dim/40 bg-accent-blue-dim/10" },
  grid_export: { label: "Grid", dot: "bg-accent-green", chip: "text-accent-green border-accent-green-dim/40 bg-accent-green-dim/10" },
  grid_import: { label: "Grid", dot: "bg-critical", chip: "text-critical border-critical/40 bg-critical/10" },
};

/** Vertical timeline of the VPP's coordinated decisions across the simulated day. */
export function DecisionTimeline({ decisions }: { decisions: OptimizationDecision[] }) {
  if (decisions.length === 0) {
    return <p className="text-sm text-muted">No coordination actions were required today.</p>;
  }

  return (
    <ol className="relative space-y-5 border-l border-border pl-5">
      {decisions.map((d) => {
        const style = TYPE_STYLE[d.type];
        return (
          <li key={d.id} className="relative">
            <span className={clsx("absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full", style.dot)} />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tabular-nums text-foreground">{d.windowLabel}</span>
              <span className={clsx("rounded-full border px-2 py-0.5 text-[10px] font-medium", style.chip)}>
                {style.label}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-foreground">{d.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">{d.reason}</p>
          </li>
        );
      })}
    </ol>
  );
}
