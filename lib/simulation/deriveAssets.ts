import { ASSETS } from "./assets";
import { getTodaySeries } from "./generateDaySeries";
import { latestPoint } from "./metrics";
import { Alert, Asset } from "./types";

/** Maps the current simulated interval onto each static asset's live output/status. */
export function getLiveAssets(): Asset[] {
  const { aiOptimized } = getTodaySeries();
  const p = latestPoint(aiOptimized);

  return ASSETS.map((asset) => {
    let currentOutputKw = 0;
    switch (asset.type) {
      case "solar_farm":
        currentOutputKw = p.solarKw;
        break;
      case "wind_turbine":
        currentOutputKw = p.windKw;
        break;
      case "hydro_plant":
        currentOutputKw = p.hydroKw;
        break;
      case "battery_storage":
        currentOutputKw = Math.abs(p.batteryFlowKw);
        break;
      case "ev_charging_station":
        currentOutputKw = p.evDemandKw;
        break;
      case "smart_building":
        currentOutputKw = p.buildingDemandKw;
        break;
    }

    let status: Asset["status"] = "normal";
    if (asset.healthScore < 80) status = "warning";
    if (asset.healthScore < 65) status = "critical";
    if (asset.type === "solar_farm" && p.weather === "rain" && p.hour > 8 && p.hour < 18) {
      status = status === "critical" ? "critical" : "warning";
    }

    return { ...asset, currentOutputKw, status };
  });
}

export function getActiveAlerts(): Alert[] {
  const assets = getLiveAssets();
  const { aiOptimized } = getTodaySeries();
  const p = latestPoint(aiOptimized);
  const alerts: Alert[] = [];

  const solar = assets.find((a) => a.type === "solar_farm")!;
  const expectedSolarShare = 0.5; // rough midday expectation, only checked in daylight hours
  if (p.hour > 9 && p.hour < 17 && solar.currentOutputKw < solar.capacityKw * expectedSolarShare * 0.4) {
    alerts.push({
      id: "alert-low-solar",
      assetId: solar.id,
      assetName: solar.name,
      alertType: "low_solar_performance",
      severity: "medium",
      cause: `Output at ${Math.round(solar.currentOutputKw)} kW is well below expected midday levels (${p.weather.replace("_", " ")} conditions).`,
      recommendedAction: "Dispatch a technician to inspect for panel soiling or inverter faults; lean on battery/wind to cover the shortfall.",
    });
  }

  const battery = assets.find((a) => a.type === "battery_storage")!;
  if (battery.healthScore < 90) {
    alerts.push({
      id: "alert-battery-degradation",
      assetId: battery.id,
      assetName: battery.name,
      alertType: "battery_degradation",
      severity: battery.healthScore < 80 ? "high" : "low",
      cause: `Health score has drifted to ${battery.healthScore}/100, indicating gradual capacity fade.`,
      recommendedAction: "Schedule a cell-balancing maintenance cycle within the next billing period.",
    });
  }

  const ev = assets.find((a) => a.type === "ev_charging_station")!;
  if (p.hour >= 17 && p.hour < 21 && ev.currentOutputKw > ev.capacityKw * 0.85) {
    alerts.push({
      id: "alert-ev-peak-load",
      assetId: ev.id,
      assetName: ev.name,
      alertType: "ev_peak_load",
      severity: "medium",
      cause: `EV load at ${Math.round(ev.currentOutputKw)} kW is approaching the ${ev.capacityKw} kW station limit during the evening peak.`,
      recommendedAction: "Delay non-urgent charging sessions by 1-2 hours or stagger start times across bays.",
    });
  }

  const wind = assets.find((a) => a.type === "wind_turbine")!;
  if (wind.currentOutputKw > wind.capacityKw * 0.95) {
    alerts.push({
      id: "alert-wind-abnormality",
      assetId: wind.id,
      assetName: wind.name,
      alertType: "wind_abnormality",
      severity: "low",
      cause: `Output at ${Math.round(wind.currentOutputKw)} kW is unusually close to nameplate capacity — verify sensor calibration.`,
      recommendedAction: "Cross-check against local wind speed data and confirm turbine control system readings.",
    });
  }

  if (p.gridImportKw > p.totalDemandKw * 0.55 && (p.hour >= 16 && p.hour < 21)) {
    alerts.push({
      id: "alert-grid-stress",
      assetId: "grid",
      assetName: "Grid Interconnection",
      alertType: "grid_stress",
      severity: "high",
      cause: `Grid import has climbed to ${Math.round(p.gridImportKw)} kW during the on-peak pricing window.`,
      recommendedAction: "Discharge battery reserves and shed/delay flexible EV load to reduce peak import.",
    });
  }

  return alerts;
}
