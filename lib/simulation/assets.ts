import { Asset } from "./types";

// Static demo fleet for the VPP. Capacities/health are hand-tuned to read as
// a believable mid-size industrial park / smart-city portfolio.
export const ASSETS: Asset[] = [
  {
    id: "solar-01",
    name: "Riverbend Solar Farm",
    type: "solar_farm",
    location: "Riverbend, CA",
    capacityKw: 4200,
    currentOutputKw: 0,
    healthScore: 96,
    status: "normal",
  },
  {
    id: "wind-01",
    name: "Highland Ridge Wind Turbine",
    type: "wind_turbine",
    location: "Highland Ridge, CA",
    capacityKw: 2500,
    currentOutputKw: 0,
    healthScore: 91,
    status: "normal",
  },
  {
    id: "hydro-01",
    name: "Clearwater Hydro Plant",
    type: "hydro_plant",
    location: "Clearwater, CA",
    capacityKw: 1800,
    currentOutputKw: 0,
    healthScore: 98,
    status: "normal",
  },
  {
    id: "battery-01",
    name: "Central Battery Array",
    type: "battery_storage",
    location: "Industrial Park East",
    capacityKw: 1500,
    capacityKwh: 6000,
    currentOutputKw: 0,
    healthScore: 89,
    status: "normal",
  },
  {
    id: "ev-01",
    name: "Park Ave EV Charging Hub",
    type: "ev_charging_station",
    location: "Industrial Park West",
    capacityKw: 900,
    currentOutputKw: 0,
    healthScore: 94,
    status: "normal",
  },
  {
    id: "building-01",
    name: "Meridian Smart Building Complex",
    type: "smart_building",
    location: "Downtown Campus",
    capacityKw: 3000,
    currentOutputKw: 0,
    healthScore: 92,
    status: "normal",
  },
];

export const ASSET_TYPE_LABEL: Record<Asset["type"], string> = {
  solar_farm: "Solar Farm",
  wind_turbine: "Wind Turbine",
  hydro_plant: "Hydro Plant",
  battery_storage: "Battery Storage",
  ev_charging_station: "EV Charging Station",
  smart_building: "Smart Building",
};
