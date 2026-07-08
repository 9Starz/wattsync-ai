import { getTodaySeries } from "@/lib/simulation";
import { CANDIDATE_SITES } from "./sites";
import {
  CandidateSite,
  CriterionScore,
  FeasibilityReport,
  IntegrationImpact,
  SiteScore,
} from "./types";

/**
 * Project Development Intelligence engine. Benchmark-based, deterministic, and
 * explainable: every score and dollar figure below traces to a stated assumption,
 * the same design principle as the forecasting and optimization engines. This is
 * a development-stage screening aid, not a bankable feasibility study.
 */

// --- Site screening -----------------------------------------------------------

const WEIGHTS = { resource: 0.35, interconnection: 0.25, permitting: 0.2, land: 0.2 };

const PERMIT_SCORE: Record<CandidateSite["permitting"], number> = { low: 95, moderate: 70, high: 40 };

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function scoreSite(site: CandidateSite): CriterionScore[] {
  // Irradiance: 4.5 kWh/m²/day scores 0, 6.5 scores 100 (covers the continental US range)
  const resource = Math.round(clamp01((site.irradiance - 4.5) / 2.0) * 100);
  // Interconnection: every km of new tie-in line adds cost and study risk; 0 km = 100, 12+ km = 0
  const interconnection = Math.round(clamp01(1 - site.substationKm / 12) * 100);
  const permitting = PERMIT_SCORE[site.permitting];
  // Land: cost per MW of capacity, normalized to solar-lease benchmarks
  // ($2k/MW/yr or less = 100, $12k/MW/yr = 0; typical ground leases run $3.5-7k/MW/yr)
  const landCostPerMwYr = (site.landCostPerAcreYr * site.acres) / site.recommendedCapacityMw;
  const land = Math.round(clamp01(1 - (landCostPerMwYr - 2000) / 10000) * 100);

  return [
    {
      label: "Solar resource",
      score: resource,
      weight: WEIGHTS.resource,
      detail: `${site.irradiance.toFixed(1)} kWh/m²/day annual average irradiance`,
    },
    {
      label: "Grid interconnection",
      score: interconnection,
      weight: WEIGHTS.interconnection,
      detail: `${site.substationKm.toFixed(1)} km to nearest substation`,
    },
    {
      label: "Permitting risk",
      score: permitting,
      weight: WEIGHTS.permitting,
      detail: site.permittingNote,
    },
    {
      label: "Land cost & fit",
      score: land,
      weight: WEIGHTS.land,
      detail: `${site.acres} acres at $${site.landCostPerAcreYr.toLocaleString()}/acre/yr → $${Math.round(landCostPerMwYr).toLocaleString()}/MW/yr`,
    },
  ];
}

function summarize(site: CandidateSite, total: number, rank: number): string {
  if (rank === 1)
    return `Best overall: strong ${site.irradiance.toFixed(1)} kWh/m²/day resource with a short ${site.substationKm.toFixed(1)} km tie-in and manageable permitting. Recommended for a ${site.recommendedCapacityMw.toFixed(1)} MW build.`;
  if (site.kind === "rooftop")
    return `Fast, low-risk complement: behind-the-meter with minimal permitting, but roof area caps it at ${site.recommendedCapacityMw.toFixed(1)} MW. Strong phase-2 candidate.`;
  return `Cheapest land and the largest buildable area (${site.recommendedCapacityMw.toFixed(1)} MW), but the ${site.substationKm.toFixed(1)} km interconnection and habitat review push cost and timeline risk up.`;
}

/** Score and rank all candidate sites. Highest total = recommended. */
export function getSiteRanking(): SiteScore[] {
  const scored = CANDIDATE_SITES.map((site) => {
    const criteria = scoreSite(site);
    const total = Math.round(criteria.reduce((sum, c) => sum + c.score * c.weight, 0));
    return { site, criteria, total, rank: 0, summary: "" };
  }).sort((a, b) => b.total - a.total);

  return scored.map((s, i) => ({
    ...s,
    rank: i + 1,
    summary: summarize(s.site, s.total, i + 1),
  }));
}

// --- Feasibility (benchmark economics) -----------------------------------------

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Northern-hemisphere solar seasonality, normalized to average 1.0 */
const MONTHLY_SOLAR_FACTOR = [0.6, 0.72, 0.9, 1.05, 1.18, 1.26, 1.28, 1.2, 1.05, 0.85, 0.65, 0.55];

const PERFORMANCE_RATIO = 0.79; // soiling, wiring, inverter losses
const TRACKING_GAIN = 1.22; // single-axis tracking vs fixed tilt (greenfield only)
const CAPEX_PER_WATT = { greenfield: 1.1, rooftop: 1.45 }; // $/W-dc, 2026 utility benchmarks
const OANDM_PER_KW_YR = 17; // $/kW-yr
const BLENDED_ENERGY_VALUE = 0.13; // $/kWh — avoided on-peak imports + off-peak export credits
const CRF = 0.0858; // capital recovery factor: 7% discount, 25-year life
const GRID_CARBON_T_PER_MWH = 0.4;

/** Benchmark screening economics for a site at its recommended capacity. */
export function getFeasibility(site: CandidateSite): FeasibilityReport {
  const tracking = site.kind === "greenfield" ? TRACKING_GAIN : 1.0;
  const capacityFactor = (site.irradiance / 24) * PERFORMANCE_RATIO * tracking;
  const annualYieldMwh = site.recommendedCapacityMw * 8760 * capacityFactor;

  const monthlyYieldMwh = MONTH_LABELS.map((month, i) => ({
    month,
    mwh: Math.round((annualYieldMwh / 12) * MONTHLY_SOLAR_FACTOR[i]),
  }));

  const capexPerWatt = CAPEX_PER_WATT[site.kind];
  const capexUsd = site.recommendedCapacityMw * 1_000_000 * capexPerWatt;
  const annualOandMUsd = site.recommendedCapacityMw * 1000 * OANDM_PER_KW_YR + site.landCostPerAcreYr * site.acres;
  const annualRevenueUsd = annualYieldMwh * 1000 * BLENDED_ENERGY_VALUE;
  const simplePaybackYears = capexUsd / (annualRevenueUsd - annualOandMUsd);
  const lcoeUsdPerMwh = (capexUsd * CRF + annualOandMUsd) / annualYieldMwh;

  return {
    site,
    capacityFactorPct: capacityFactor * 100,
    annualYieldMwh,
    monthlyYieldMwh,
    capexUsd,
    capexPerWatt,
    annualOandMUsd,
    annualRevenueUsd,
    simplePaybackYears,
    lcoeUsdPerMwh,
    annualCo2AvoidedTonnes: annualYieldMwh * GRID_CARBON_T_PER_MWH,
  };
}

// --- VPP integration impact -----------------------------------------------------

const EXISTING_SOLAR_CAPACITY_KW = 4200; // Riverbend Solar Farm
const EXPORT_CREDIT_USD_PER_KWH = 0.08;

/**
 * The planning→operations link: inject the new site's modeled output into today's
 * live simulation and measure what changes. The new site's hourly profile is
 * today's actual solar curve scaled by relative capacity and irradiance.
 */
export function getIntegrationImpact(site: CandidateSite): IntegrationImpact {
  const { aiOptimized } = getTodaySeries();
  const points = aiOptimized.points;
  const hours = 24 / points.length; // interval length in hours

  const scale =
    ((site.recommendedCapacityMw * 1000) / EXISTING_SOLAR_CAPACITY_KW) * (site.irradiance / 5.8);

  let extraGenKwh = 0;
  let importAvoidedKwh = 0;
  let extraExportKwh = 0;
  let importAvoidedValueUsd = 0;
  let exportCreditValueUsd = 0;
  let baseImportKwh = 0;
  let totalDemandKwh = 0;
  let renewableUsedKwh = 0;

  for (const p of points) {
    const extraKw = p.solarKw * scale;
    // The new solar first offsets whatever the fleet is still importing this interval;
    // the rest is surplus the fleet can't self-consume and is exported to the grid.
    const usedKw = Math.min(p.gridImportKw, extraKw);
    const exportedKw = extraKw - usedKw;

    extraGenKwh += extraKw * hours;
    importAvoidedKwh += usedKw * hours;
    extraExportKwh += exportedKw * hours;
    // Import avoidance is worth the live TOU price; export earns the lower credit rate.
    importAvoidedValueUsd += usedKw * hours * p.electricityPrice;
    exportCreditValueUsd += exportedKw * hours * EXPORT_CREDIT_USD_PER_KWH;
    baseImportKwh += p.gridImportKw * hours;
    totalDemandKwh += p.totalDemandKw * hours;
    renewableUsedKwh += (p.totalDemandKw - p.gridImportKw) * hours;
  }

  const renewablePctBefore = (renewableUsedKwh / totalDemandKwh) * 100;
  const renewablePctAfter = ((renewableUsedKwh + importAvoidedKwh) / totalDemandKwh) * 100;

  return {
    extraDailyGenerationKwh: extraGenKwh,
    exportSharePct: extraGenKwh > 0 ? (extraExportKwh / extraGenKwh) * 100 : 0,
    gridImportReductionKwh: importAvoidedKwh,
    gridImportReductionPct: baseImportKwh > 0 ? (importAvoidedKwh / baseImportKwh) * 100 : 0,
    renewablePctBefore,
    renewablePctAfter,
    extraExportKwh,
    exportCreditValueUsd,
    importAvoidedValueUsd,
    dailySavingsUsd: importAvoidedValueUsd + exportCreditValueUsd,
  };
}
