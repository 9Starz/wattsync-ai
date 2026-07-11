/**
 * Tiny inline trend line for a KPI tile — an SVG area+line, no axes or labels.
 * Pure/deterministic, so it renders on the server with the rest of the card.
 */
export function Sparkline({ data, color, height = 34 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return null;

  const w = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const y = (v: number) => height - 2 - ((v - min) / range) * (height - 4);

  const line = data.map((v, i) => `${i === 0 ? "M" : "L"}${(i * stepX).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${w},${height} L0,${height} Z`;
  const gid = `spark-${color.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="mt-3 h-8 w-full" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
