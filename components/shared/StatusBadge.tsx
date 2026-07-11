import clsx from "clsx";
import { AssetStatus } from "@/lib/simulation";

const STATUS_STYLES: Record<AssetStatus, string> = {
  normal: "bg-accent-green-dim/10 text-accent-green border-accent-green-dim/40",
  warning: "bg-warning/10 text-warning border-warning/40",
  critical: "bg-critical/10 text-critical border-critical/40",
};

const STATUS_LABEL: Record<AssetStatus, string> = {
  normal: "Normal",
  warning: "Warning",
  critical: "Critical",
};

export function StatusBadge({ status }: { status: AssetStatus }) {
  return (
    <span className={clsx("rounded-full border px-2.5 py-0.5 text-[11px] font-medium", STATUS_STYLES[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-brand/10 text-brand border-brand/30",
  medium: "bg-warning/10 text-warning border-warning/40",
  high: "bg-warning/15 text-warning border-warning/50",
  critical: "bg-critical/10 text-critical border-critical/40",
};

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span className={clsx("rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize", SEVERITY_STYLES[severity])}>
      {severity}
    </span>
  );
}
