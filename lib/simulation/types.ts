export type AssetType =
  | "solar_farm"
  | "wind_turbine"
  | "hydro_plant"
  | "battery_storage"
  | "ev_charging_station"
  | "smart_building";

export type AssetStatus = "normal" | "warning" | "critical";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  location: string;
  capacityKw: number;
  capacityKwh?: number;
  currentOutputKw: number;
  healthScore: number;
  status: AssetStatus;
}

export interface IntervalPoint {
  /** ISO timestamp */
  ts: string;
  /** hour of day as a fraction, e.g. 13.5 = 1:30pm, useful for charts */
  hour: number;
  solarKw: number;
  windKw: number;
  hydroKw: number;
  totalGenerationKw: number;
  buildingDemandKw: number;
  evDemandKw: number;
  totalDemandKw: number;
  batterySocPercent: number;
  batteryFlowKw: number; // positive = charging, negative = discharging
  gridImportKw: number;
  gridExportKw: number;
  electricityPrice: number; // RM/kWh
  weather: "sunny" | "partly_cloudy" | "cloudy" | "windy" | "rain";
}

export interface DaySeries {
  variant: "raw" | "ai_optimized";
  points: IntervalPoint[];
}

export interface DashboardSnapshot {
  totalGenerationKw: number;
  totalDemandKw: number;
  batterySocPercent: number;
  evLoadKw: number;
  gridImportKw: number;
  gridExportKw: number;
  carbonSavedKg: number;
  costSavedUsd: number;
  renewablePct: number;
}

export interface Alert {
  id: string;
  assetId: string;
  assetName: string;
  alertType:
    | "low_solar_performance"
    | "battery_degradation"
    | "ev_peak_load"
    | "wind_abnormality"
    | "grid_stress";
  severity: "low" | "medium" | "high" | "critical";
  cause: string;
  recommendedAction: string;
}
