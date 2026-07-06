import { ScenarioTotals } from "@/lib/simulation";

export type DecisionType =
  | "battery_charge"
  | "battery_discharge"
  | "ev_delay"
  | "ev_resume"
  | "grid_export"
  | "grid_import";

/** One entry on the AI decision timeline — a coordinated VPP action over a time window. */
export interface OptimizationDecision {
  id: string;
  type: DecisionType;
  /** Fractional start/end hours of the action window, e.g. 16 - 21. */
  startHour: number;
  endHour: number;
  /** "6PM - 9PM" style label for display. */
  windowLabel: string;
  title: string;
  /** Why the engine took this action, with real numbers. */
  reason: string;
  /** Average magnitude of the action in kW over its window. */
  avgKw: number;
}

/** Measurable before-AI vs after-AI outcomes for the same simulated day. */
export interface OptimizationComparison {
  before: ScenarioTotals;
  after: ScenarioTotals;
  peakDemandReductionKw: number;
  peakDemandReductionPct: number;
  peakImportReductionKw: number;
  peakImportReductionPct: number;
  gridImportReductionKwh: number;
  gridImportReductionPct: number;
  renewablePctBefore: number;
  renewablePctAfter: number;
  costSavedUsd: number;
  carbonSavedKg: number;
  /** EV energy moved out of the 4-9pm on-peak window into off-peak hours. */
  evShiftedKwh: number;
}
