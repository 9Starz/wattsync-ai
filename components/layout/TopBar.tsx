export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const now = new Date();
  const timeLabel = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface/40 px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 text-right">
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-foreground">{timeLabel}</p>
          <p className="text-[11px] text-muted">{dateLabel}</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-accent-green-dim/40 bg-accent-green-dim/10 px-3 py-1 text-xs font-medium text-accent-green">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-green animate-pulse" />
          Live Simulation
        </span>
      </div>
    </header>
  );
}
