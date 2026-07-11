/**
 * The single source of truth for chart colors. Every chart in the app pulls from here,
 * so a solar series is always the same amber, grid the same brand blue, etc. — an
 * enterprise data-visualization palette on the light theme.
 */
export const VIZ = {
  // Energy data-viz palette (consistent across every chart)
  solar: "#F4B400",
  wind: "#00C2FF",
  hydro: "#1565C0",
  battery: "#27AE60",
  grid: "#0F4C81",
  demand: "#8E44AD",
  carbon: "#66BB6A",
  forecast: "#34495E",

  // Semantic / brand
  brand: "#0F4C81",
  cyan: "#00C2FF",
  green: "#27AE60",
  warning: "#F39C12",
  critical: "#E74C3C",

  // Light-theme neutrals
  axis: "#64748B",
  gridline: "#E2E8F0",
} as const;

/** Shared executive tooltip styling (light card, soft shadow, slate text). */
export const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 4px 14px rgba(15,23,42,0.08)",
} as const;

export const tooltipLabelStyle = { color: "#1E293B", fontWeight: 600 } as const;
export const tooltipItemStyle = { color: "#334155" } as const;
