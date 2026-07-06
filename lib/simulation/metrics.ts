import { CARBON_INTENSITY_KG_PER_KWH, getTodaySeries } from "./generateDaySeries";
import { DaySeries, IntervalPoint } from "./types";

const DT_HOURS = 24 / 96;

export interface ScenarioTotals {
  totalCostUsd: number;
  totalCarbonKg: number;
  totalGridImportKwh: number;
  totalGenerationKwh: number;
  totalDemandKwh: number;
  renewablePct: number;
  peakDemandKw: number;
  peakDemandHour: number;
  peakGridImportKw: number;
  peakGridImportHour: number;
}

export function computeTotals(series: DaySeries): ScenarioTotals {
  let totalCostUsd = 0;
  let totalCarbonKg = 0;
  let totalGridImportKwh = 0;
  let totalGenerationKwh = 0;
  let totalDemandKwh = 0;
  let peakDemandKw = -Infinity;
  let peakDemandHour = 0;
  let peakGridImportKw = -Infinity;
  let peakGridImportHour = 0;

  for (const p of series.points) {
    const importKwh = p.gridImportKw * DT_HOURS;
    const exportKwh = p.gridExportKw * DT_HOURS;
    totalCostUsd += importKwh * p.electricityPrice - exportKwh * p.electricityPrice * 0.6;
    totalCarbonKg += importKwh * CARBON_INTENSITY_KG_PER_KWH;
    totalGridImportKwh += importKwh;
    totalGenerationKwh += p.totalGenerationKw * DT_HOURS;
    totalDemandKwh += p.totalDemandKw * DT_HOURS;
    if (p.totalDemandKw > peakDemandKw) {
      peakDemandKw = p.totalDemandKw;
      peakDemandHour = p.hour;
    }
    if (p.gridImportKw > peakGridImportKw) {
      peakGridImportKw = p.gridImportKw;
      peakGridImportHour = p.hour;
    }
  }

  const renewableUsedKwh = Math.max(0, totalDemandKwh - totalGridImportKwh);
  const renewablePct = totalDemandKwh > 0 ? clampPct((renewableUsedKwh / totalDemandKwh) * 100) : 0;

  return {
    totalCostUsd,
    totalCarbonKg,
    totalGridImportKwh,
    totalGenerationKwh,
    totalDemandKwh,
    renewablePct,
    peakDemandKw,
    peakDemandHour,
    peakGridImportKw,
    peakGridImportHour,
  };
}

function clampPct(v: number) {
  return Math.min(100, Math.max(0, v));
}

/** Current wall-clock time as a fractional hour of the day (e.g. 19.55 for 7:33 PM). */
export function getNowHour(): number {
  return new Date().getHours() + new Date().getMinutes() / 60;
}

export function latestPoint(series: DaySeries): IntervalPoint {
  const nowHour = getNowHour();
  let closest = series.points[0];
  let closestDelta = Infinity;
  for (const p of series.points) {
    const delta = Math.abs(p.hour - nowHour);
    if (delta < closestDelta) {
      closest = p;
      closestDelta = delta;
    }
  }
  return closest;
}

export interface DashboardData {
  raw: DaySeries;
  aiOptimized: DaySeries;
  rawTotals: ScenarioTotals;
  aiTotals: ScenarioTotals;
  current: IntervalPoint;
  carbonSavedKg: number;
  costSavedUsd: number;
  peakDemandReductionKw: number;
  renewablePctImprovement: number;
}

export function getDashboardData(): DashboardData {
  const { raw, aiOptimized } = getTodaySeries();
  const rawTotals = computeTotals(raw);
  const aiTotals = computeTotals(aiOptimized);
  const current = latestPoint(aiOptimized);

  return {
    raw,
    aiOptimized,
    rawTotals,
    aiTotals,
    current,
    carbonSavedKg: Math.max(0, rawTotals.totalCarbonKg - aiTotals.totalCarbonKg),
    costSavedUsd: Math.max(0, rawTotals.totalCostUsd - aiTotals.totalCostUsd),
    peakDemandReductionKw: Math.max(0, rawTotals.peakGridImportKw - aiTotals.peakGridImportKw),
    renewablePctImprovement: aiTotals.renewablePct - rawTotals.renewablePct,
  };
}
