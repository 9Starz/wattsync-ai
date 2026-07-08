import { Asset } from "./types";

// Static demo fleet for the VPP. Capacities/health are hand-tuned to read as
// a believable mid-size industrial park / smart-city portfolio.
export const ASSETS: Asset[] = [
  {
    id: "solar-01",
    name: "Kedah Large Scale Solar Park",
    type: "solar_farm",
    location: "Kuala Ketil, Kedah",
    capacityKw: 4200,
    currentOutputKw: 0,
    healthScore: 96,
    status: "normal",
  },
  {
    id: "wind-01",
    name: "Kudat Wind Pilot Project",
    type: "wind_turbine",
    location: "Kudat, Sabah",
    capacityKw: 2500,
    currentOutputKw: 0,
    healthScore: 91,
    status: "normal",
  },
  {
    id: "hydro-01",
    name: "Bakun Hydro Plant",
    type: "hydro_plant",
    location: "Belaga, Sarawak",
    capacityKw: 1800,
    currentOutputKw: 0,
    healthScore: 98,
    status: "normal",
  },
  {
    id: "battery-01",
    name: "Cyberjaya Battery Energy Storage System",
    type: "battery_storage",
    location: "Cyberjaya, Selangor",
    capacityKw: 1500,
    capacityKwh: 6000,
    currentOutputKw: 0,
    healthScore: 89,
    status: "normal",
  },
  {
    id: "ev-01",
    name: "Putrajaya EV Fast Charging Hub",
    type: "ev_charging_station",
    location: "Putrajaya",
    capacityKw: 900,
    currentOutputKw: 0,
    healthScore: 94,
    status: "normal",
  },
  {
    id: "building-01",
    name: "TRX Smart Commercial District",
    type: "smart_building",
    location: "Tun Razak Exchange, Kuala Lumpur",
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
