import { ruleBasedForecast } from "./forecastEngine";
import { Forecast24h } from "./types";

export * from "./types";

/**
 * The forecasting seam: every caller (pages, API routes, copilot, recommendations)
 * imports THIS function, never the engine directly. Swapping the rule-based engine
 * for a trained ML model later means changing only this file's delegation —
 * no caller changes required.
 */
export function forecastNext24h(): Forecast24h {
  return ruleBasedForecast();
}
