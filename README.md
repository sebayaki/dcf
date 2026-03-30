**Live site:** [https://sebayaki.github.io/dcf/](https://sebayaki.github.io/dcf/)

# DeFi DCF Dashboard

A static web app that compares major DeFi protocols using **DefiLlama** protocol fees (30-day annualized), **CoinGecko** FDV, and a **DCF-style** model with adjustable assumptions (discount rate, growth, margins, token capture). **Not financial advice** — results are highly sensitive to inputs.

## Stack

- [Vite](https://vitejs.dev/) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) v4
- Data fetched **in the browser** from public APIs (no backend)

## Scripts

```bash
npm install
npm run dev      # local dev (Vite)
npm run build    # production bundle → dist/
npm run preview  # serve dist locally
npm run test
npm run lint
npm run format   # Prettier
```

## Project layout

| Path | Role |
|------|------|
| `src/components/dcf/` | Dashboard UI (table, detail, chart, sliders) |
| `src/hooks/` | `useDeFiDcfDashboard` state and derived data |
| `src/lib/api/` | DefiLlama & CoinGecko HTTP clients |
| `src/lib/` | DCF math, protocol list, `protocolData` loader, `dashboardRows` |
| `src/utils/` | Formatting and `localStorage` helpers |
| `src/tests/` | Vitest specs (import app code via `@/lib/...`) |

## GitHub Pages

Deployment is handled by [`.github/workflows/pages.yml`](.github/workflows/pages.yml) (build → upload `dist/` → GitHub Pages). The site is published at the link above.

To override the asset base path when building (e.g. root hosting), set `VITE_BASE` (see [`vite.config.ts`](vite.config.ts)).
