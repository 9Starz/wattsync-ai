export function formatKw(value: number): string {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(2)} MW`;
  return `${Math.round(value)} kW`;
}

export function formatKwh(value: number): string {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(2)} MWh`;
  return `${Math.round(value)} kWh`;
}

/** Malaysian Ringgit, whole-ringgit rounding: 1277 -> "RM1,277", -450 -> "-RM450". */
export function formatRm(value: number): string {
  const rounded = Math.round(value);
  const abs = Math.abs(rounded).toLocaleString("en-US");
  return rounded < 0 ? `-RM${abs}` : `RM${abs}`;
}

/** Annualized run-rate from a daily figure: 1277 -> "RM466K/yr", 3200 -> "RM1.17M/yr". */
export function formatRmPerYear(dailyValue: number): string {
  const yearly = dailyValue * 365;
  if (Math.abs(yearly) >= 1_000_000) return `RM${(yearly / 1_000_000).toFixed(2)}M/yr`;
  return `RM${Math.round(yearly / 1000)}K/yr`;
}

export function formatKg(value: number): string {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(2)} t`;
  return `${Math.round(value)} kg`;
}

export function formatPct(value: number): string {
  return `${value.toFixed(0)}%`;
}

/** Compact axis-tick label for kW values: 2500 -> "2.5MW", 800 -> "800", 0 -> "0". */
export function formatAxisKw(value: number): string {
  if (value === 0) return "0";
  if (Math.abs(value) >= 1000) {
    const mw = value / 1000;
    return `${Number.isInteger(mw) ? mw : mw.toFixed(1)}MW`;
  }
  return `${value}`;
}

export function formatHourLabel(hour: number): string {
  const h = Math.floor(hour) % 24;
  const m = Math.round((hour - Math.floor(hour)) * 60);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${displayHour}${period}` : `${displayHour}:${m.toString().padStart(2, "0")}${period}`;
}
