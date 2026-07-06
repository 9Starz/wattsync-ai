import { getDaySeries, getNowHour, IntervalPoint } from "@/lib/simulation";
import { Forecast24h, ForecastInsights, ForecastPoint, GridRiskLevel } from "./types";

const POINTS_PER_DAY = 96; // mirrors the simulation's 15-minute resolution
const DT_HOURS = 24 / POINTS_PER_DAY;

/**
 * Rule-based next-24h forecaster.
 *
 * Strategy: "persistence + physics" — tomorrow looks like the seeded simulation of
 * tomorrow (same generator, next calendar seed), smoothed to look like a model output
 * rather than a noisy actual, with uncertainty bands that widen the further out we
 * predict. That gives a forecast that is *consistent* with what the simulation will
 * actually produce, so the demo story holds together.
 *
 * A real ML model (e.g. gradient-boosted trees on weather + calendar features) would
 * replace only this function — the Forecast24h shape is the contract callers depend on.
 */
export function ruleBasedForecast(): Forecast24h {
  const nowHour = getNowHour();
  const today = getDaySeries(0).raw.points;
  const tomorrow = getDaySeries(1).raw.points;

  // Stitch the next 24h of "ground truth" from today's remainder + tomorrow's start.
  const startIdx = Math.min(POINTS_PER_DAY - 1, Math.round(nowHour / DT_HOURS));
  const horizon: IntervalPoint[] = [
    ...today.slice(startIdx),
    ...tomorrow.slice(0, startIdx),
  ];

  const smoothedGen = movingAverage(horizon.map((p) => p.totalGenerationKw), 5);
  const smoothedDemand = movingAverage(horizon.map((p) => p.totalDemandKw), 5);

  const points: ForecastPoint[] = horizon.map((p, i) => {
    const hoursAhead = i * DT_HOURS;
    // Uncertainty grows with horizon: ±5% now, ±20% a full day out.
    const band = 0.05 + 0.15 * (hoursAhead / 24);
    const generationKw = smoothedGen[i];
    const demandKw = smoothedDemand[i];
    return {
      hoursAhead,
      hourOfDay: p.hour,
      generationKw: Math.round(generationKw),
      generationLowKw: Math.round(generationKw * (1 - band)),
      generationHighKw: Math.round(generationKw * (1 + band)),
      solarKw: Math.round(p.solarKw),
      windKw: Math.round(p.windKw),
      hydroKw: Math.round(p.hydroKw),
      demandKw: Math.round(demandKw),
      demandLowKw: Math.round(demandKw * (1 - band)),
      demandHighKw: Math.round(demandKw * (1 + band)),
      weather: p.weather,
    };
  });

  return {
    points,
    insights: deriveInsights(points),
    generatedAtHour: nowHour,
    source: "rule_based",
  };
}

function deriveInsights(points: ForecastPoint[]): ForecastInsights {
  let peakDemand = points[0];
  let peakGeneration = points[0];
  let worstShortagePoint: ForecastPoint | null = null;
  let worstShortageKw = 0;
  let netSurplusKwh = 0;

  for (const p of points) {
    if (p.demandKw > peakDemand.demandKw) peakDemand = p;
    if (p.generationKw > peakGeneration.generationKw) peakGeneration = p;
    const surplus = p.generationKw - p.demandKw;
    netSurplusKwh += surplus * DT_HOURS;
    if (surplus < worstShortageKw) {
      worstShortageKw = surplus;
      worstShortagePoint = p;
    }
  }

  return {
    peakDemand: { hoursAhead: peakDemand.hoursAhead, hourOfDay: peakDemand.hourOfDay, kw: peakDemand.demandKw },
    peakGeneration: {
      hoursAhead: peakGeneration.hoursAhead,
      hourOfDay: peakGeneration.hourOfDay,
      kw: peakGeneration.generationKw,
    },
    netSurplusKwh: Math.round(netSurplusKwh),
    surplusWindow: findSurplusWindow(points),
    worstShortage: worstShortagePoint
      ? {
          hoursAhead: worstShortagePoint.hoursAhead,
          hourOfDay: worstShortagePoint.hourOfDay,
          kw: Math.round(-worstShortageKw),
        }
      : null,
    gridRisk: assessGridRisk(points),
    weatherImpact: explainWeatherImpact(points),
  };
}

/** Longest contiguous stretch where forecast generation exceeds forecast demand. */
function findSurplusWindow(points: ForecastPoint[]): ForecastInsights["surplusWindow"] {
  let best: { start: number; end: number; total: number; count: number } | null = null;
  let run: { start: number; end: number; total: number; count: number } | null = null;

  for (const p of points) {
    const surplus = p.generationKw - p.demandKw;
    if (surplus > 0) {
      if (!run) run = { start: p.hourOfDay, end: p.hourOfDay, total: 0, count: 0 };
      run.end = p.hourOfDay;
      run.total += surplus;
      run.count += 1;
      if (!best || run.count > best.count) best = run;
    } else {
      run = null;
    }
  }

  if (!best || best.count < 4) return null; // ignore blips under an hour
  return {
    startHourOfDay: best.start,
    endHourOfDay: best.end,
    avgSurplusKw: Math.round(best.total / best.count),
  };
}

/** Grid risk = how deep the forecast shortage runs during the 4-9pm on-peak price window. */
function assessGridRisk(points: ForecastPoint[]): { level: GridRiskLevel; reason: string } {
  let onPeakShortageKw = 0;
  let atHour = 18;
  for (const p of points) {
    if (p.hourOfDay >= 16 && p.hourOfDay < 21) {
      const shortage = p.demandKw - p.generationKw;
      if (shortage > onPeakShortageKw) {
        onPeakShortageKw = shortage;
        atHour = p.hourOfDay;
      }
    }
  }

  const label = formatClock(atHour);
  if (onPeakShortageKw > 1200) {
    return {
      level: "high",
      reason: `Forecast demand outruns renewables by ~${Math.round(onPeakShortageKw)} kW around ${label}, deep into the on-peak price window.`,
    };
  }
  if (onPeakShortageKw > 400) {
    return {
      level: "medium",
      reason: `A moderate ~${Math.round(onPeakShortageKw)} kW shortage is expected around ${label}; battery dispatch should cover most of it.`,
    };
  }
  return {
    level: "low",
    reason: "Renewable generation covers most of the evening peak; minimal on-peak grid import expected.",
  };
}

/** Summarizes daylight weather modes into a one-liner about solar/wind impact. */
function explainWeatherImpact(points: ForecastPoint[]): string {
  const daylight = points.filter((p) => p.hourOfDay >= 8 && p.hourOfDay <= 18);
  if (daylight.length === 0) return "No daylight hours in the forecast window.";

  const counts = new Map<string, number>();
  for (const p of daylight) counts.set(p.weather, (counts.get(p.weather) ?? 0) + 1);
  const dominant = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];

  const peakSolar = Math.max(...points.map((p) => p.solarKw));
  const avgWind = Math.round(points.reduce((s, p) => s + p.windKw, 0) / points.length);

  switch (dominant) {
    case "sunny":
      return `Clear skies expected through daylight hours — solar should ramp to ~${Math.round(peakSolar)} kW around midday, making 11am-2pm the cheapest window to charge storage.`;
    case "partly_cloudy":
      return `Passing clouds will put a modest dent in solar (peaking near ${Math.round(peakSolar)} kW); wind averaging ~${avgWind} kW helps smooth the dips.`;
    case "cloudy":
      return `Overcast conditions suppress solar output (peak only ~${Math.round(peakSolar)} kW), so the VPP leans harder on wind (~${avgWind} kW avg) and hydro baseload.`;
    case "rain":
      return `Rain sharply cuts solar (peak ~${Math.round(peakSolar)} kW) — expect heavier reliance on hydro baseload, wind (~${avgWind} kW avg), and stored energy.`;
    default:
      return `Breezy conditions favor wind generation (~${avgWind} kW avg) alongside a solar peak near ${Math.round(peakSolar)} kW.`;
  }
}

function movingAverage(values: number[], window: number): number[] {
  const half = Math.floor(window / 2);
  return values.map((_, i) => {
    const start = Math.max(0, i - half);
    const end = Math.min(values.length, i + half + 1);
    let sum = 0;
    for (let j = start; j < end; j++) sum += values[j];
    return sum / (end - start);
  });
}

function formatClock(hour: number): string {
  const h = Math.floor(hour) % 24;
  const period = h >= 12 ? "pm" : "am";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}${period}`;
}
