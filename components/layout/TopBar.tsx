export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const now = new Date();
  const timeLabel = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 text-right">
        <div className="hidden sm:block">
          <p className="font-numeric text-sm font-semibold text-foreground">{timeLabel}</p>
          <p className="text-[11px] text-muted">{dateLabel}</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-semibold text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan animate-pulse" />
          Live Simulation
        </span>
      </div>
    </header>
  );
}
