"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/development", label: "Development", icon: "◈" },
  { href: "/assets", label: "Assets", icon: "⚡" },
  { href: "/forecast", label: "Forecast", icon: "☷" },
  { href: "/validation", label: "Validation", icon: "✓" },
  { href: "/optimization", label: "Optimization", icon: "⚙" },
  { href: "/copilot", label: "Copilot", icon: "✦" },
  { href: "/demo", label: "Demo Story", icon: "▶" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-surface/60 px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-green to-accent-blue text-sm font-bold text-[#04140f]">
          W
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight">WattSync AI</p>
          <p className="text-[11px] leading-tight text-muted">Virtual Power Plant</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-surface-raised text-foreground shadow-inner shadow-black/20 ring-1 ring-border"
                  : "text-muted hover:bg-surface-raised/60 hover:text-foreground"
              )}
            >
              <span className="w-4 text-center text-accent-green">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-lg border border-border bg-surface-raised/60 p-3 text-[11px] text-muted">
        Simulated demo data. AI Copilot answers are grounded in the live dashboard state.
      </div>
    </aside>
  );
}

/** Compact horizontal nav for small screens, where the sidebar is hidden. */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="scrollbar-thin sticky top-0 z-20 flex gap-1 overflow-x-auto border-b border-border bg-background/95 px-3 py-2 backdrop-blur md:hidden">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-accent-green-dim/50 bg-accent-green-dim/10 text-accent-green"
                : "border-border text-muted hover:text-foreground"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
