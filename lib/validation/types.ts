/** One 15-min interval of a completed day: what we predicted vs what actually happened. */
export interface ValidationPoint {
  hourOfDay: number;
  forecastGenKw: number;
  actualGenKw: number;
  bandLowGenKw: number;
  bandHighGenKw: number;
  forecastDemandKw: number;
  actualDemandKw: number;
}

/** The single biggest miss of the day, explained in plain language. */
export interface ErrorMoment {
  metric: "generation" | "demand";
  hourOfDay: number;
  forecastKw: number;
  actualKw: number;
  /** Signed % the actual came in relative to forecast (negative = below forecast). */
  pctOff: number;
  weather: string;
  explanation: string;
}

/** Accuracy scorecard for one completed day. */
export interface DayValidation {
  dayLabel: string;
  points: ValidationPoint[];
  generationAccuracyPct: number;
  demandAccuracyPct: number;
  overallAccuracyPct: number;
  /** Share of actual readings that landed inside the forecast's confidence band. */
  confidencePct: number;
  largestError: ErrorMoment;
}

export interface AccuracyTrendDay {
  label: string;
  offset: number;
  accuracyPct: number;
}

/** How the forecaster is tracking over time + the feedback loop that keeps it honest. */
export interface LearningStatus {
  daysTracked: number;
  averageAccuracyPct: number;
  bestAccuracyPct: number;
  worstAccuracyPct: number;
  trend: "improving" | "steady" | "variable";
  trendDetail: string;
  trendDays: AccuracyTrendDay[];
}
