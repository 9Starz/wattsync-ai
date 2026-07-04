export function formatKw(value: number): string {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(2)} MW`;
  return `${Math.round(value)} kW`;
}

export function formatKwh(value: number): string {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(2)} MWh`;
  return `${Math.round(value)} kWh`;
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function formatKg(value: number): string {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(2)} t`;
  return `${Math.round(value)} kg`;
}

export function formatPct(value: number): string {
  return `${value.toFixed(0)}%`;
}

export function formatHourLabel(hour: number): string {
  const h = Math.floor(hour) % 24;
  const m = Math.round((hour - Math.floor(hour)) * 60);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${displayHour}${period}` : `${displayHour}:${m.toString().padStart(2, "0")}${period}`;
}
