# FuelEU Frontend (minimal scaffold)

This frontend is a minimal Vite + React + TypeScript + Tailwind scaffold for the FuelEU Maritime dashboard.

Quick start:

1. cd frontend
2. npm install
3. npm run dev

The dev server proxies `/api` to `http://localhost:4000` (see `vite.config.ts`).

Files created:
- `index.html`, `src/main.tsx`, `src/App.tsx`, `src/pages/Routes.tsx`, `src/index.css`
- Tailwind + PostCSS config

Next steps:
- Install dependencies (`npm i`) and run dev server.
- Implement more tabs: Compare, Banking, Pooling.
- Add charts (recharts or chart.js) and improved forms.
 - Implementations included in scaffold:
	 - `src/pages/Compare.tsx` — comparison table + simple bar visual
	 - `src/pages/Banking.tsx` — CB + bank/apply flows
	 - `src/pages/Pooling.tsx` — create pool UI (manual members entry)

Notes:
 - Run `npm install` in the frontend directory to fetch dependencies (React, axios, tailwind).
 - The dev server proxies `/api` to `http://localhost:4000`.
