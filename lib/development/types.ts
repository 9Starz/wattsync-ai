export type PermittingComplexity = "low" | "moderate" | "high";

/** A candidate site under screening for the fleet's next generation asset. */
export interface CandidateSite {
  id: string;
  name: string;
  location: string;
  kind: "greenfield" | "rooftop";
  /** Global horizontal irradiance, kWh/m²/day annual average */
  irradiance: number;
  /** Usable area in acres */
  acres: number;
  /** Distance to the nearest interconnectable substation, km */
  substationKm: number;
  permitting: PermittingComplexity;
  /** What drives the permitting rating, shown to the user */
  permittingNote: string;
  /** Annualized site control cost, $/acre/yr (lease benchmark) */
  landCostPerAcreYr: number;
  /** Buildable capacity given area and mounting type, MW-dc */
  recommendedCapacityMw: number;
}

export interface CriterionScore {
  label: string;
  /** 0-100 */
  score: number;
  weight: number;
  detail: string;
}

export interface SiteScore {
  site: CandidateSite;
  criteria: CriterionScore[];
  /** Weighted 0-100 */
  total: number;
  rank: number;
  summary: string;
}

/** Benchmark-based screening economics for one site at its recommended capacity. */
export interface FeasibilityReport {
  site: CandidateSite;
  capacityFactorPct: number;
  annualYieldMwh: number;
  monthlyYieldMwh: { month: string; mwh: number }[];
  capexUsd: number;
  capexPerWatt: number;
  annualOandMUsd: number;
  annualRevenueUsd: number;
  simplePaybackYears: number;
  lcoeUsdPerMwh: number;
  annualCo2AvoidedTonnes: number;
}

/** What adding the asset would do to the live VPP, computed from today's simulation. */
export interface IntegrationImpact {
  extraDailyGenerationKwh: number;
  /** Share of the new output that is surplus and flows to the grid as export (0-100). */
  exportSharePct: number;
  gridImportReductionKwh: number;
  gridImportReductionPct: number;
  renewablePctBefore: number;
  renewablePctAfter: number;
  extraExportKwh: number;
  /** Value from selling surplus back to the grid at the export credit rate. */
  exportCreditValueUsd: number;
  /** Value from displacing grid imports (small when the fleet is already solar-heavy at midday). */
  importAvoidedValueUsd: number;
  dailySavingsUsd: number;
}

export interface DevelopmentStage {
  name: string;
  window: string;
  detail: string;
}
