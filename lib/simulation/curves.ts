import { clamp } from "./random";

/** Bell-shaped curve peaking at `peakHour`, zero outside [riseHour, setHour]. */
export function solarBellCurve(hour: number, peakHour = 13, riseHour = 6, setHour = 20): number {
  if (hour <= riseHour || hour >= setHour) return 0;
  const span = setHour - riseHour;
  const x = (hour - riseHour) / span; // 0..1
  const peakX = (peakHour - riseHour) / span;
  const width = 0.32;
  return Math.exp(-((x - peakX) ** 2) / (2 * width * width));
}

/** Two-peak demand curve: morning ramp + larger evening peak. */
export function demandShapeCurve(hour: number): number {
  const morning = Math.exp(-((hour - 8.5) ** 2) / (2 * 2.2 * 2.2)) * 0.65;
  const evening = Math.exp(-((hour - 19) ** 2) / (2 * 2.0 * 2.0)) * 1.0;
  const baseline = 0.32;
  return clamp(baseline + morning + evening, 0.2, 1.15);
}

/** EV charging demand: evening commuter peak + smaller overnight off-peak trickle. */
export function evDemandShapeCurve(hour: number): number {
  const eveningPeak = Math.exp(-((hour - 18.5) ** 2) / (2 * 1.8 * 1.8)) * 1.0;
  const overnight = Math.exp(-((hour - 2) ** 2) / (2 * 3 * 3)) * 0.25;
  return clamp(eveningPeak + overnight + 0.05, 0.03, 1.05);
}

/** Time-of-use electricity price (RM/kWh), peaking with evening demand. */
export function priceShapeCurve(hour: number): number {
  const offPeak = 0.11;
  const midPeak = 0.18;
  const onPeak = 0.34;
  if (hour >= 16 && hour < 21) return onPeak;
  if ((hour >= 7 && hour < 16) || (hour >= 21 && hour < 23)) return midPeak;
  return offPeak;
}

/** Wind has a loose diurnal bias (stronger overnight/evening) plus randomness handled by caller. */
export function windDiurnalBias(hour: number): number {
  return 0.55 + 0.35 * Math.sin(((hour - 3) / 24) * 2 * Math.PI);
}

export function weatherForHour(hour: number, cloudFactor: number): "sunny" | "partly_cloudy" | "cloudy" | "windy" | "rain" {
  if (cloudFactor > 0.75) return "rain";
  if (cloudFactor > 0.5) return "cloudy";
  if (cloudFactor > 0.25) return "partly_cloudy";
  if (hour >= 6 && hour <= 19) return "sunny";
  return "windy";
}
