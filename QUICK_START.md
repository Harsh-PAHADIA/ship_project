# Quick Start Guide — FuelEU Maritime Platform

**Author:** Harshita Pahadia  
**Version:** 1.0  
**Last Updated:** November 13, 2025

---

## 📋 System Overview

The FuelEU Maritime platform consists of two complementary services that work together:

| Component | Technology Stack | Port | Purpose |
|-----------|------------------|------|---------|
| **Backend API** | Node.js + Express + TypeScript | `4000` | RESTful API for compliance operations |
| **Frontend Dashboard** | React + Vite + TailwindCSS | `5174` | Interactive web dashboard |
| **Proxy** | Vite Dev Server | — | Automatically routes `/api/*` to backend |

**Network Flow:**
```
Browser (localhost:5174)
    ↓
Vite Dev Server (proxy rule)
    ↓
Express Backend (localhost:4000/api)
    ↓
In-Memory Database (seeded routes)
```

---

## 🚀 Starting the System (Two Terminals Required)

### Terminal 1: Start Backend

```bash
cd /Users/macbook/Desktop/fuel-eu-maritime/backend
npm run dev
```

Expected output:
```
FuelEU backend running on http://localhost:4000/api
```

The backend will automatically:
- Load seeded route data (5 routes: R001–R005)
- Set R001 as the baseline route
- Listen for API requests

---

### Terminal 2: Start Frontend

```bash
cd /Users/macbook/Desktop/fuel-eu-maritime/frontend
npm run dev
```

Expected output:
```
VITE v5.4.21 ready in 263 ms
➜  Local:   http://localhost:5174/
```

---

## Opening the App

1. **Backend must be running first** (Terminal 1)
2. **Open browser** to `http://localhost:5174`
3. **Frontend will automatically load data** from the backend via the `/api/routes` endpoint

---

## Navigating the Dashboard

### Tab 1: **Routes**
- **View**: Table of all 5 seeded routes (R001–R005)
- **Filters**: Vessel Type, Fuel Type, Year
- **Action**: Click "Set Baseline" button on any row to designate that route as the compliance baseline
- **Note**: R001 starts as the baseline (is_baseline: true)

### Tab 2: **Compare**
- **View**: Comparison table showing baseline route vs others
- **Columns**: Route ID, GHG Intensity, % Difference from baseline, Compliant (✅/❌)
- **Compliance Check**: Routes with GHG ≤ 89.3368 gCO₂e/MJ are compliant

### Tab 3: **Banking**
- **View**: Compliance Balance (CB) display
- **Inputs**: Enter shipId and year to query banking records
- **Actions**: Bank or Apply CB from this route's compliance account
- **Note**: CB = ((target - actual) × fuel_tonnes × 41000) / 1000

### Tab 4: **Pooling**
- **View**: Create compliance pools across multiple vessels
- **Inputs**: Add member ships with their CB before allocation
- **Action**: Click "Create Pool" to run greedy allocation algorithm
- **Result**: Shows new CB values after allocation (surpluses distributed to deficits)

---

## Testing the API Directly (Optional)

### Get all routes:
```bash
curl http://localhost:4000/api/routes
```

### Get comparison (baseline vs others):
```bash
curl http://localhost:4000/api/routes/comparison
```

### Set a route as baseline:
```bash
curl -X POST http://localhost:4000/api/routes/R002/baseline
```

### Create a pool:
```bash
curl -X POST http://localhost:4000/api/pools \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "members": [
      { "shipId": "S001", "cbBefore": 100 },
      { "shipId": "S002", "cbBefore": -50 },
      { "shipId": "S003", "cbBefore": -30 }
    ]
  }'
```

---

## Troubleshooting

### Issue: "Cannot GET /api" or 404 errors

**Solution:**
1. Verify backend is running: `curl http://localhost:4000/api/routes`
2. Check the frontend console for error messages (F12 → Console)
3. Ensure Vite dev server is running on port 5174 (not 5173)

### Issue: Data not loading in Routes tab

**Solution:**
1. Open browser DevTools (F12)
2. Check Network tab: Look for request to `/api/routes`
3. Check if it shows 200 OK response
4. If error: backend may not be running or CORS may be blocked

### Issue: "Port already in use"

**Solution:**
```bash
# Kill process on port 4000 (backend)
lsof -ti:4000 | xargs kill -9

# Kill process on port 5173/5174 (frontend)
lsof -ti:5173 | xargs kill -9
lsof -ti:5174 | xargs kill -9

# Then start again
```

### Issue: Frontend shows blank page

**Solution:**
1. Hard refresh: `Cmd+Shift+R` (macOS) or `Ctrl+Shift+R` (Windows/Linux)
2. Check browser console for errors
3. Verify backend is responding: `curl http://localhost:4000/api/routes`

---

## Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/routes` | Get all routes |
| POST | `/api/routes/:routeId/baseline` | Set baseline route |
| GET | `/api/routes/comparison` | Get baseline + comparison data |
| GET | `/api/compliance/cb` | Get compliance balance for a ship |
| POST | `/api/banking/bank` | Record CB banking entry |
| POST | `/api/banking/apply` | Apply banked CB to a voyage |
| POST | `/api/pools` | Create a compliance pool |

---

## Seeded Data

### 5 Routes in Database:

| Route ID | Vessel Type | Fuel Type | Year | GHG Intensity | Is Baseline |
|----------|-------------|-----------|------|---------------|-------------|
| R001 | Container | HFO | 2024 | 91.0 | ✅ Yes |
| R002 | BulkCarrier | LNG | 2024 | 88.0 | ❌ No |
| R003 | Tanker | MGO | 2024 | 93.5 | ❌ No |
| R004 | RoRo | HFO | 2025 | 89.2 | ❌ No |
| R005 | Container | LNG | 2025 | 90.5 | ❌ No |

### Target GHG Intensity: **89.3368 gCO₂e/MJ**

---

## Architecture

```
Frontend (React + Vite)              Backend (Node + Express)
├── Routes Tab ────────────────────→ GET /api/routes
├── Compare Tab ───────────────────→ GET /api/routes/comparison
├── Banking Tab ───────────────────→ GET /api/compliance/*
├── Pooling Tab ───────────────────→ POST /api/pools
└── Axios Client ───────────────────→ Vite Proxy → localhost:4000
                                      │
                                      ├── Core Logic (computeCB, createPool)
                                      ├── In-Memory DB (seeded routes, CB records)
                                      └── Express Routes
```

---

## Running Tests

### Backend Tests (Jest + Supertest):
```bash
cd backend
npm test
```

Expected output:
```
 PASS  src/__tests__/usecases.test.ts
 PASS  src/__tests__/routes.int.test.ts

Test Suites: 2 passed, 2 total
Tests: 5 passed, 5 total
```

### Frontend Tests:
```bash
cd frontend
npm run test  # (if configured)
```

---

## Key Features Implemented

✅ **Backend:**
- Hexagonal architecture (ports & adapters)
- Core use-cases: computeCB, computeComparison, createPool
- Express HTTP API with 7 endpoints
- In-memory repository (no DB setup required)
- Full Jest + Supertest test suite

✅ **Frontend:**
- React + TypeScript + Vite
- 4-tab dashboard (Routes, Compare, Banking, Pooling)
- Filters for vessel type, fuel type, year
- Set Baseline functionality
- API client wrapper with all endpoints

✅ **Integration:**
- Vite proxy for seamless `/api` routing
- CORS enabled on backend
- Real-time data loading and refresh

---

## Next Steps

1. Explore the dashboard with the seeded data
2. Try setting different routes as baselines
3. View comparison metrics
4. Create a compliance pool to see allocation
5. Run tests to verify all functionality
6. Review source code in `backend/src` and `frontend/src`

Enjoy! 🚀
