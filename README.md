# FuelEU Maritime — Compliance Module (Scaffold)


## Overview
This repository implements a minimal Fuel EU Maritime compliance module (frontend + backend) using a hexagonal architecture. The goal is to provide the Routes/Compare/Banking/Pooling functionality required by the assignment.


## Architecture
- Core: domain entities, use-cases, and ports (framework-agnostic)
- Adapters: inbound (HTTP / React UI) and outbound (Postgres)
- Frontend: React + TypeScript + TailwindCSS
- Backend: Node.js + TypeScript + Express


## Quick start (local development)
### Backend
1. `cd backend`
2. `npm install`
3. Configure `.env` with DATABASE_URL
4. Run migrations & seed (see `src/infrastructure/db/seeds`)
5. `npm run dev` (nodemon / ts-node)


### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`


## Tests
- `cd backend && npm run test`
- `cd frontend && npm run test`


## Notes
- Target intensity constant: **89.3368 gCO₂e/MJ**
- Energy conversion: `fuel_tonnes * 41000 (MJ/t)`