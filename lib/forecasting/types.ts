import { IntervalPoint } from "@/lib/simulation";

/** One 15-minute forecast interval, up to 24 hours ahead of "now". */
export interface ForecastPoint {
  /** Hours ahead of now (0..24), the chart x-axis. */
  hoursAhead: number;
  /** Wall-clock hour of day at the forecast target (0..24, wraps past midnight). */
  hourOfDay: number;
  generationKw: number;
  generationLowKw: number;
  generationHighKw: number;
  solarKw: number;
  windKw: number;
  hydroKw: number;
  demandKw: number;
  demandLowKw: number;
  demandHighKw: number;
  weather: IntervalPoint["weather"];
}

export type GridRiskLevel = "low" | "medium" | "high";

export interface ForecastInsights {
  /** Predicted demand peak within the next 24h. */
  peakDemand: { hoursAhead: number; hourOfDay: number; kw: number };
  /** Predicted generation peak within the next 24h. */
  peakGeneration: { hoursAhead: number; hourOfDay: number; kw: number };
  /** Net renewable energy balance over the next 24h (generation - demand), kWh. */
  netSurplusKwh: number;
  /** Largest contiguous surplus window (generation exceeds demand). */
  surplusWindow: { startHourOfDay: number; endHourOfDay: number; avgSurplusKw: number } | null;
  /** Deepest shortage moment (demand exceeds generation) and when it lands. */
  worstShortage: { hoursAhead: number; hourOfDay: number; kw: number } | null;
  /** Risk of leaning on expensive grid imports during the evening on-peak window. */
  gridRisk: { level: GridRiskLevel; reason: string };
  /** Plain-English explanation of how weather shapes today's forecast. */
  weatherImpact: string;
}

export interface Forecast24h {
  points: ForecastPoint[];
  insights: ForecastInsights;
  /** Wall-clock fractional hour the forecast was generated at. */
  generatedAtHour: number;
  /** Which engine produced this forecast — lets the UI label rule-based vs ML output. */
  source: "rule_based" | "ml_model";
}
