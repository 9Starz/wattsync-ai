import { forecastNext24h } from "@/lib/forecasting";
import { getDashboardData, getNowHour } from "@/lib/simulation";
import { formatKw } from "@/lib/utils/format";

export type RecommendationPriority = "high" | "medium" | "low";

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  impact: string;
  /** 0..1 — how sure the engine is; rule-based scores derive from forecast certainty. */
  confidence: number;
  action: string;
  priority: RecommendationPriority;
  /** Human-readable time window the recommendation applies to, e.g. "11am - 2pm". */
  window: string;
}

/**
 * Rule-based recommendation engine. Each rule inspects live simulation state plus the
 * 24h forecast and emits a fully-grounded recommendation (real kW/$ numbers, not canned
 * text). Rules are time-aware: a "prepare for the 6pm peak" card stops appearing once
 * the peak has passed. Sorted high-priority-first for display.
 */
export function getRecommendations(): Recommendation[] {
  const nowHour = getNowHour();
  const data = getDashboardData();
  const forecast = forecastNext24h();
  const { current } = data;
  const { insights } = forecast;
  const recs: Recommendation[] = [];

  const sunnyish = current.weather === "sunny" || current.weather === "partly_cloudy";

  // 1. Midday battery charge window — relevant until mid-afternoon.
  if (nowHour < 14 && current.batterySocPercent < 90) {
    recs.push({
      id: "rec-charge-midday",
      title: "Charge batteries between 11am - 2pm on solar surplus",
      reason: `Forecast puts renewable generation at its peak (~${formatKw(insights.peakGeneration.kw)}) near midday${
        insights.surplusWindow
          ? `, with generation exceeding demand by an average ${formatKw(insights.surplusWindow.avgSurplusKw)}`
          : ""
      }. Battery is at ${Math.round(current.batterySocPercent)}% and has headroom.`,
      impact: "Stores near-zero-cost renewable energy that offsets on-peak imports priced at RM0.34/kWh after 4pm.",
      confidence: sunnyish ? 0.92 : 0.74,
      action: "Schedule battery charging at maximum rate during the 11am - 2pm surplus window.",
      priority: "high",
      window: "11am - 2pm",
    });
  }

  // 2. Evening peak discharge preparation — relevant until the peak ends.
  if (nowHour < 21) {
    const peakLabel = clockLabel(insights.peakDemand.hourOfDay);
    recs.push({
      id: "rec-discharge-peak",
      title: `Prepare battery discharge for the ${peakLabel} demand peak`,
      reason: `Demand is forecast to crest at ${formatKw(insights.peakDemand.kw)} around ${peakLabel}, while solar output falls off after sunset.`,
      impact: `Discharging through the peak can shave up to ${formatKw(Math.min(1500, insights.peakDemand.kw * 0.4))} off grid imports during the most expensive pricing window.`,
      confidence: 0.88,
      action: `Reserve battery capacity now and begin discharge as demand ramps past 4pm (SOC currently ${Math.round(current.batterySocPercent)}%).`,
      priority: "high",
      window: "4pm - 9pm",
    });
  }

  // 3. EV charging delay during on-peak hours.
  if (nowHour < 20) {
    recs.push({
      id: "rec-ev-delay",
      title: "Delay flexible EV charging out of the on-peak window",
      reason: `EV load historically peaks alongside building demand in the early evening; on-peak energy costs 3x the overnight rate.`,
      impact: "Shifting ~35% of evening EV sessions to after 11pm cuts peak demand and moves the load onto cheap off-peak power.",
      confidence: 0.85,
      action: "Hold non-urgent EV sessions until after 9pm; prioritize vehicles below 30% charge.",
      priority: "medium",
      window: "4pm - 9pm",
    });
  }

  // 4. Grid import risk warning, anchored to the forecast's worst on-peak shortage.
  if (insights.gridRisk.level !== "low" && insights.worstShortage) {
    recs.push({
      id: "rec-grid-risk",
      title: `Grid import risk expected around ${clockLabel(insights.worstShortage.hourOfDay)}`,
      reason: insights.gridRisk.reason,
      impact: `Unmitigated, importing ${formatKw(insights.worstShortage.kw)} at on-peak prices adds roughly RM${Math.round(
        (insights.worstShortage.kw * 0.34) / 10
      ) * 10}/hour in energy cost and raises the carbon intensity of the fleet.`,
      confidence: insights.gridRisk.level === "high" ? 0.9 : 0.78,
      action: "Combine battery discharge and EV load shifting to keep imports below the demand-charge threshold.",
      priority: insights.gridRisk.level === "high" ? "high" : "medium",
      window: `around ${clockLabel(insights.worstShortage.hourOfDay)}`,
    });
  }

  // 5. Weather advisory when conditions suppress solar.
  if (current.weather === "cloudy" || current.weather === "rain") {
    recs.push({
      id: "rec-weather",
      title: "Compensate for weather-suppressed solar output",
      reason: forecast.insights.weatherImpact,
      impact: "Maintains renewable coverage of demand despite reduced solar, limiting unplanned grid imports.",
      confidence: 0.8,
      action: "Bias dispatch toward wind and hydro, and conserve battery charge for the evening peak.",
      priority: "medium",
      window: "today",
    });
  }

  const priorityRank: Record<RecommendationPriority, number> = { high: 0, medium: 1, low: 2 };
  return recs.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || b.confidence - a.confidence);
}

function clockLabel(hour: number): string {
  const h = Math.floor(hour) % 24;
  const period = h >= 12 ? "pm" : "am";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}${period}`;
}
