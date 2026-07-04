import { ASSETS } from "./assets";
import {
  demandShapeCurve,
  evDemandShapeCurve,
  priceShapeCurve,
  solarBellCurve,
  weatherForHour,
  windDiurnalBias,
} from "./curves";
import { clamp, createRng, gaussianNoise } from "./random";
import { DaySeries, IntervalPoint } from "./types";

const SOLAR_CAPACITY = ASSETS.find((a) => a.type === "solar_farm")!.capacityKw;
const WIND_CAPACITY = ASSETS.find((a) => a.type === "wind_turbine")!.capacityKw;
const HYDRO_CAPACITY = ASSETS.find((a) => a.type === "hydro_plant")!.capacityKw;
const BUILDING_PEAK_DEMAND = ASSETS.find((a) => a.type === "smart_building")!.capacityKw;
const EV_PEAK_DEMAND = ASSETS.find((a) => a.type === "ev_charging_station")!.capacityKw;
const BATTERY_CAPACITY_KWH = ASSETS.find((a) => a.type === "battery_storage")!.capacityKwh!;
const BATTERY_POWER_KW = ASSETS.find((a) => a.type === "battery_storage")!.capacityKw;

export const CARBON_INTENSITY_KG_PER_KWH = 0.4; // grid-average emissions factor
const POINTS_PER_DAY = 96; // 15-minute resolution
const DT_HOURS = 24 / POINTS_PER_DAY;

interface BaseInputs {
  hour: number;
  solarKw: number;
  windKw: number;
  hydroKw: number;
  buildingDemandKw: number;
  electricityPrice: number;
  weather: IntervalPoint["weather"];
}

function generateBaseCurves(seed: number): BaseInputs[] {
  const rng = createRng(seed);
  const cloudFactor = clamp(0.2 + gaussianNoise(rng, 0.15), 0, 1);

  return Array.from({ length: POINTS_PER_DAY }, (_, i) => {
    const hour = (i * 24) / POINTS_PER_DAY;

    const solarShape = solarBellCurve(hour);
    const solarKw = clamp(
      SOLAR_CAPACITY * solarShape * (1 - cloudFactor * 0.6) + gaussianNoise(rng, SOLAR_CAPACITY * 0.02),
      0,
      SOLAR_CAPACITY
    );

    const windBase = WIND_CAPACITY * windDiurnalBias(hour);
    const windKw = clamp(windBase + gaussianNoise(rng, WIND_CAPACITY * 0.18), 0, WIND_CAPACITY);

    const hydroKw = clamp(
      HYDRO_CAPACITY * 0.72 + gaussianNoise(rng, HYDRO_CAPACITY * 0.03),
      HYDRO_CAPACITY * 0.5,
      HYDRO_CAPACITY
    );

    const buildingDemandKw = clamp(
      BUILDING_PEAK_DEMAND * demandShapeCurve(hour) + gaussianNoise(rng, BUILDING_PEAK_DEMAND * 0.03),
      BUILDING_PEAK_DEMAND * 0.15,
      BUILDING_PEAK_DEMAND * 1.1
    );

    const electricityPrice = priceShapeCurve(hour);
    const weather = weatherForHour(hour, cloudFactor);

    return { hour, solarKw, windKw, hydroKw, buildingDemandKw, electricityPrice, weather };
  });
}

/**
 * "Raw" (no AI) EV load follows driver behavior directly (evening commuter peak).
 * Battery passively trickle-charges from any generation surplus and otherwise sits idle
 * — i.e. nobody is actively timing it against price or demand.
 */
function buildRawVariant(base: BaseInputs[], seed: number): IntervalPoint[] {
  const rng = createRng(seed + 1);
  let soc = 55; // starting state of charge, percent

  return base.map((b) => {
    const evDemandKw = clamp(
      EV_PEAK_DEMAND * evDemandShapeCurve(b.hour) + gaussianNoise(rng, EV_PEAK_DEMAND * 0.04),
      EV_PEAK_DEMAND * 0.02,
      EV_PEAK_DEMAND * 1.05
    );

    const totalGenerationKw = b.solarKw + b.windKw + b.hydroKw;
    const totalDemandKw = b.buildingDemandKw + evDemandKw;
    const surplusKw = totalGenerationKw - totalDemandKw;

    // Passive behavior: trickle charge on surplus, otherwise idle (no discharge to help peak).
    let batteryFlowKw = 0;
    if (surplusKw > 0 && soc < 95) {
      batteryFlowKw = Math.min(surplusKw, BATTERY_POWER_KW * 0.3);
    }
    const socDeltaPercent = (batteryFlowKw * DT_HOURS * 100) / BATTERY_CAPACITY_KWH;
    soc = clamp(soc + socDeltaPercent, 5, 100);

    const netKw = totalGenerationKw - totalDemandKw - batteryFlowKw;
    const gridImportKw = netKw < 0 ? -netKw : 0;
    const gridExportKw = netKw > 0 ? netKw : 0;

    return {
      ts: hourToIso(b.hour),
      hour: b.hour,
      solarKw: b.solarKw,
      windKw: b.windKw,
      hydroKw: b.hydroKw,
      totalGenerationKw,
      buildingDemandKw: b.buildingDemandKw,
      evDemandKw,
      totalDemandKw,
      batterySocPercent: soc,
      batteryFlowKw,
      gridImportKw,
      gridExportKw,
      electricityPrice: b.electricityPrice,
      weather: b.weather,
    };
  });
}

/**
 * "AI-optimized" variant: pre-charges the battery from cheap/renewable surplus during the day,
 * delays a portion of EV charging out of the 4pm-9pm on-peak window, and discharges the battery
 * to shave the evening peak — the core "before/after" demo story.
 */
function buildAiOptimizedVariant(base: BaseInputs[], seed: number): IntervalPoint[] {
  const rng = createRng(seed + 2);
  let soc = 55;

  // Shift 35% of on-peak (4pm-9pm) EV demand into the preceding off-peak window (11pm-6am next/earlier).
  const rawEvByHour = base.map((b) => EV_PEAK_DEMAND * evDemandShapeCurve(b.hour));
  const shiftedEv = [...rawEvByHour];
  const onPeakIdx: number[] = [];
  const offPeakIdx: number[] = [];
  base.forEach((b, i) => {
    if (b.hour >= 16 && b.hour < 21) onPeakIdx.push(i);
    else if (b.hour >= 23 || b.hour < 6) offPeakIdx.push(i);
  });
  const shiftFraction = 0.35;
  onPeakIdx.forEach((i) => {
    const shiftedAmount = rawEvByHour[i] * shiftFraction;
    shiftedEv[i] -= shiftedAmount;
    const target = offPeakIdx[Math.floor((i / onPeakIdx.length) * offPeakIdx.length)] ?? offPeakIdx[0];
    if (target !== undefined) shiftedEv[target] += shiftedAmount;
  });

  return base.map((b, i) => {
    const evDemandKw = clamp(
      shiftedEv[i] + gaussianNoise(rng, EV_PEAK_DEMAND * 0.02),
      EV_PEAK_DEMAND * 0.02,
      EV_PEAK_DEMAND * 1.05
    );

    const totalGenerationKw = b.solarKw + b.windKw + b.hydroKw;
    const totalDemandKw = b.buildingDemandKw + evDemandKw;
    const surplusKw = totalGenerationKw - totalDemandKw;
    const isOnPeak = b.hour >= 16 && b.hour < 21;
    const isCheapSurplusWindow = b.hour >= 9 && b.hour < 16;

    let batteryFlowKw = 0;
    if (isOnPeak && soc > 20) {
      // Discharge aggressively to shave the evening peak.
      batteryFlowKw = -Math.min(BATTERY_POWER_KW, totalDemandKw * 0.4, ((soc - 20) / 100) * BATTERY_CAPACITY_KWH / DT_HOURS);
    } else if (isCheapSurplusWindow && soc < 95) {
      // Charge aggressively from midday renewable surplus, whether or not there's a literal surplus,
      // up to available generation headroom.
      const chargeTarget = Math.min(BATTERY_POWER_KW, Math.max(surplusKw, BATTERY_POWER_KW * 0.5));
      batteryFlowKw = Math.max(0, chargeTarget);
    } else if (surplusKw > 0 && soc < 95) {
      batteryFlowKw = Math.min(surplusKw, BATTERY_POWER_KW * 0.3);
    }

    const socDeltaPercent = (batteryFlowKw * DT_HOURS * 100) / BATTERY_CAPACITY_KWH;
    soc = clamp(soc + socDeltaPercent, 5, 100);

    const netKw = totalGenerationKw - totalDemandKw - batteryFlowKw;
    const gridImportKw = netKw < 0 ? -netKw : 0;
    const gridExportKw = netKw > 0 ? netKw : 0;

    return {
      ts: hourToIso(b.hour),
      hour: b.hour,
      solarKw: b.solarKw,
      windKw: b.windKw,
      hydroKw: b.hydroKw,
      totalGenerationKw,
      buildingDemandKw: b.buildingDemandKw,
      evDemandKw,
      totalDemandKw,
      batterySocPercent: soc,
      batteryFlowKw,
      gridImportKw,
      gridExportKw,
      electricityPrice: b.electricityPrice,
      weather: b.weather,
    };
  });
}

function hourToIso(hour: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  d.setMinutes(Math.round(hour * 60));
  return d.toISOString();
}

let cache: { raw: DaySeries; aiOptimized: DaySeries } | null = null;

/** Generates (and memoizes) today's raw + AI-optimized 24h series with a stable seed. */
export function getTodaySeries(): { raw: DaySeries; aiOptimized: DaySeries } {
  if (cache) return cache;
  const seed = new Date().getFullYear() * 10000 + (new Date().getMonth() + 1) * 100 + new Date().getDate();
  const base = generateBaseCurves(seed);
  cache = {
    raw: { variant: "raw", points: buildRawVariant(base, seed) },
    aiOptimized: { variant: "ai_optimized", points: buildAiOptimizedVariant(base, seed) },
  };
  return cache;
}
