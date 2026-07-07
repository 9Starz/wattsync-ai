import { CandidateSite, DevelopmentStage } from "./types";

/**
 * Candidate sites under screening for the fleet's next solar asset. Static demo data
 * with realistic attributes — in production these come from GIS layers (irradiance
 * rasters, parcel data, substation maps) and county permitting records.
 */
export const CANDIDATE_SITES: CandidateSite[] = [
  {
    id: "site-mesa-flats",
    name: "Mesa Flats",
    location: "Kern County, CA",
    kind: "greenfield",
    irradiance: 5.8,
    acres: 42,
    substationKm: 2.1,
    permitting: "moderate",
    permittingNote: "County conditional-use permit; no protected habitat on parcel",
    landCostPerAcreYr: 850,
    recommendedCapacityMw: 6.0,
  },
  {
    id: "site-northgate-roof",
    name: "Northgate Logistics Rooftop",
    location: "Bakersfield, CA",
    kind: "rooftop",
    irradiance: 5.5,
    acres: 11,
    substationKm: 0.4,
    permitting: "low",
    permittingNote: "Behind-the-meter rooftop; building-permit level review only",
    landCostPerAcreYr: 1900,
    recommendedCapacityMw: 2.4,
  },
  {
    id: "site-cedar-valley",
    name: "Cedar Valley Ridge",
    location: "Tulare County, CA",
    kind: "greenfield",
    irradiance: 5.1,
    acres: 65,
    substationKm: 9.7,
    permitting: "high",
    permittingNote: "Seasonal wetland on parcel edge triggers CEQA habitat review",
    landCostPerAcreYr: 520,
    recommendedCapacityMw: 8.5,
  },
];

/** Standard development roadmap for the recommended site, month offsets from site control. */
export const DEVELOPMENT_STAGES: DevelopmentStage[] = [
  {
    name: "Site control & permitting",
    window: "Months 0–6",
    detail: "Option agreement on the parcel, county conditional-use permit, environmental screening.",
  },
  {
    name: "Interconnection study",
    window: "Months 3–12",
    detail: "Utility feasibility + system impact studies for the 2.1 km tie-in to the Mesa substation.",
  },
  {
    name: "EPC procurement & financing",
    window: "Months 9–14",
    detail: "Fixed-price EPC contract, module/tracker procurement, close construction financing.",
  },
  {
    name: "Construction",
    window: "Months 14–22",
    detail: "Civil works, racking, modules, inverters, substation tie-in.",
  },
  {
    name: "Commissioning & VPP onboarding",
    window: "Months 22–24",
    detail: "Utility witness testing, then the asset joins the WattSync fleet — monitored, forecast, and dispatched from day one.",
  },
];
