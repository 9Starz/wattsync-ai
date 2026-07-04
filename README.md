# WattSync AI — AI-Powered Virtual Power Plant

**Competition track:** AI for Clean Energy — Smart Grid Integration · Clean Energy Asset Monitoring · Long-Term Yield Forecasting · Clean Energy Solutions

## Problem

Grid operators and industrial/campus energy managers juggle solar, wind, hydro, batteries, EV chargers, and building loads as disconnected systems. Nobody has a single view of the whole portfolio, so operators can't see peak-demand risk coming, can't tell which asset is underperforming, and end up buying expensive on-peak grid power that a coordinated system could have avoided.

## Solution

WattSync AI is a Virtual Power Plant (VPP) dashboard that unifies every clean energy asset into one operating picture: live generation/demand, battery and EV optimization decisions, asset health monitoring, and an AI Copilot that can answer plain-English operator questions grounded in the live dashboard state.

## How AI is used

- **Forecasting** — rule-based (structured to be swapped for an ML model later) 24h/7-day generation and demand forecasting, peak-timing and surplus/shortage detection.
- **Optimization** — a battery/EV/grid strategy engine that decides when to charge, discharge, delay EV charging, or export to the grid, with an explicit "before AI / after AI" comparison.
- **Copilot** — an Anthropic Claude-powered chat assistant, grounded in the live dashboard data (assets, KPIs, alerts, optimization results), for natural-language operator Q&A.

## Tech stack

- **Frontend:** Next.js (App Router) + Tailwind CSS + Recharts
- **Backend:** Next.js API routes
- **AI:** Anthropic Claude API
- **Deployment:** Vercel

## Features (current build status)

- [x] **Dashboard overview** — renewable generation, demand, battery SOC, EV load, grid import/export, carbon saved, cost saved, and an AI recommendation card, all backed by a simulated 24h data engine
- [x] **Simulated data engine** — realistic solar/wind/hydro/demand/EV/price curves with a "raw" (no AI) and "AI-optimized" variant for every scenario
- [x] **Asset monitoring alerts** — threshold-based detectors for low solar performance, battery degradation, EV peak load, wind abnormality, and grid stress
- [ ] Asset inventory page, forecasting page, optimization timeline + before/after page, AI Copilot chat, and the scripted demo-story page are scaffolded as placeholders and land in the next build phases

## Demo scenario

At 6pm, building and EV charging demand ramp up together. Without AI, the system has to import expensive on-peak grid electricity. With AI, the battery is pre-charged earlier in the day from renewable surplus, a portion of EV charging is delayed out of the peak window, and the battery discharges during the 4-9pm peak — cutting grid import, cost, and carbon emissions while raising renewable utilization. The dashboard's "Carbon Saved" / "Cost Saved" KPIs and AI Recommendation card reflect this comparison live.

## Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/dashboard`.

```bash
npm run build   # production build, used for Vercel deploys
```

No environment variables or database are required for the current dashboard build — all data comes from an in-process simulation engine (`lib/simulation/`). A future phase wires this up to Supabase and the Anthropic API for the Copilot.
