import { computeTotals, getTodaySeries } from "@/lib/simulation";
import { OptimizationComparison } from "./types";

const DT_HOURS = 24 / 96;

/**
 * Before-AI vs after-AI outcomes for today's simulated day. Both variants share the
 * exact same generation/building-demand inputs — the only difference is coordination —
 * so every delta here is attributable to the VPP decision engine.
 */
export function getOptimizationComparison(): OptimizationComparison {
  const { raw, aiOptimized } = getTodaySeries();
  const before = computeTotals(raw);
  const after = computeTotals(aiOptimized);

  // EV energy moved out of the 4-9pm on-peak window.
  let evShiftedKwh = 0;
  for (let i = 0; i < raw.points.length; i++) {
    const r = raw.points[i];
    const a = aiOptimized.points[i];
    if (r.hour >= 16 && r.hour < 21) {
      evShiftedKwh += Math.max(0, r.evDemandKw - a.evDemandKw) * DT_HOURS;
    }
  }

  const pct = (delta: number, base: number) => (base > 0 ? (delta / base) * 100 : 0);

  return {
    before,
    after,
    peakDemandReductionKw: Math.max(0, before.peakDemandKw - after.peakDemandKw),
    peakDemandReductionPct: pct(Math.max(0, before.peakDemandKw - after.peakDemandKw), before.peakDemandKw),
    peakImportReductionKw: Math.max(0, before.peakGridImportKw - after.peakGridImportKw),
    peakImportReductionPct: pct(Math.max(0, before.peakGridImportKw - after.peakGridImportKw), before.peakGridImportKw),
    gridImportReductionKwh: Math.max(0, before.totalGridImportKwh - after.totalGridImportKwh),
    gridImportReductionPct: pct(
      Math.max(0, before.totalGridImportKwh - after.totalGridImportKwh),
      before.totalGridImportKwh
    ),
    renewablePctBefore: before.renewablePct,
    renewablePctAfter: after.renewablePct,
    costSavedUsd: Math.max(0, before.totalCostUsd - after.totalCostUsd),
    carbonSavedKg: Math.max(0, before.totalCarbonKg - after.totalCarbonKg),
    evShiftedKwh: Math.round(evShiftedKwh),
  };
}
