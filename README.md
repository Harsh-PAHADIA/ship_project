# FuelEU Maritime — Compliance Platform

**Author:** Harshita Pahadia  
**Version:** 1.0 (Stable Release)  
**Last Updated:** November 13, 2025  
**Status:** ✅ Production Ready

---

## 📋 Project Overview

The **FuelEU Maritime Compliance Platform** is a comprehensive full-stack web application designed to simulate and manage compliance with EU Maritime environmental directives. This platform enables ship operators and compliance officers to:

- **Monitor Routes**: Track vessel routes and their environmental impact
- **Compare Compliance**: Analyze emissions intensity against regulatory baselines
- **Manage Banking**: Track and manage compliance credits over multiple periods
- **Optimize Pooling**: Create compliance pools for multi-vessel fleets to optimize credit allocation

The application follows a **hexagonal (clean) architecture** pattern, ensuring separation of concerns, testability, and maintainability.

---

## 🏗️ Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React)                   │
│           http://localhost:5174                     │
│  ┌────────────────────────────────────────────┐   │
│  │  4-Tab Dashboard (Routes/Compare/Banking)  │   │
│  │  Axios + TypeScript + TailwindCSS          │   │
│  └────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────┘
                   │ CORS + Vite Proxy
                   ↓
┌─────────────────────────────────────────────────────┐
│               Backend (Node.js/Express)             │
│           http://localhost:4000/api                 │
│  ┌────────────────────────────────────────────┐   │
│  │  7 RESTful Endpoints                       │   │
│  │  TypeScript + Jest + Supertest             │   │
│  └────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────┐   │
│  │  Hexagonal Architecture:                   │   │
│  │  • Core: Domain logic & use cases          │   │
│  │  • Adapters: HTTP routes & repositories   │   │
│  │  • Infrastructure: Server setup & DB      │   │
│  └────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │  PostgreSQL / Memory │
        │     Database         │
        └──────────────────────┘
```

### Hexagonal Architecture Pattern

```
fuel-eu-maritime/
│
├── backend/                          # Backend application
│   ├── src/
│   │   ├── core/                    # Domain & business logic
│   │   │   ├── domain/
│   │   │   │   └── types.ts         # Type definitions (RouteRow, CBRecord, etc.)
│   │   │   ├── application/
│   │   │   │   └── usecases/        # Pure business logic
│   │   │   │       ├── computeCB.ts
│   │   │   │       ├── computeComparison.ts
│   │   │   │       ├── createPool.ts
│   │   │   │       └── bankings.ts
│   │   │   └── ports/
│   │   │       └── repository.ts    # Repository interface (contract)
│   │   │
│   │   ├── adapters/                # Framework-specific implementations
│   │   │   ├── inbound/
│   │   │   │   ├── routes.ts        # Express route handlers
│   │   │   │   └── http/            # HTTP middleware & utilities
│   │   │   └── outbound/
│   │   │       ├── repo.ts          # Repository implementation (PostgreSQL + In-Memory)
│   │   │       └── postgres/        # PostgreSQL-specific code
│   │   │
│   │   ├── infrastructure/          # Technical setup
│   │   │   ├── server.ts            # Express app configuration
│   │   │   └── db/
│   │   │       └── seeds.sql        # Database initialization & seed data
│   │   │
│   │   └── __tests__/               # Test suite
│   │       ├── routes.int.test.ts   # API integration tests
│   │       └── usecases.test.ts     # Use case unit tests
│   │
│   ├── package.json                 # Dependencies
│   ├── tsconfig.json                # TypeScript configuration
│   └── jest.config.ts               # Jest test configuration
│
├── frontend/                         # Frontend application
│   ├── src/
│   │   ├── pages/                   # React page components
│   │   │   ├── Routes.tsx           # Routes tab
│   │   │   ├── Compare.tsx          # Compare tab
│   │   │   ├── Banking.tsx          # Banking tab
│   │   │   └── Pooling.tsx          # Pooling tab
│   │   │
│   │   ├── components/
│   │   │   └── Layout.tsx           # Page layout wrapper
│   │   │
│   │   ├── api.ts                   # Axios instance & API calls
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles + TailwindCSS imports
│   │
│   ├── index.html                   # HTML template
│   ├── package.json                 # Dependencies
│   ├── tsconfig.json                # TypeScript configuration
│   ├── vite.config.ts               # Vite configuration with API proxy
│   ├── postcss.config.cjs            # PostCSS configuration
│   └── tailwind.config.cjs           # TailwindCSS configuration
│
└── Documentation (Root Level)
    ├── README.md                    # This file
    ├── QUICK_START.md               # Setup & running instructions
    ├── VERIFICATION_REPORT.md       # Complete verification logs
    ├── PROJECT_COMPLETE.md          # Project summary
    ├── AGENT_WORKFLOW.md            # AI development process
    └── REFLECTION.md                # Lessons learned & analysis
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js** v18+ (with npm)
- **Git** for version control
- **Two terminal windows** (one for backend, one for frontend)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Expected output:
# FuelEU backend running on http://localhost:4000/api
# Backend is ready for requests
```

**Backend Details:**
- Uses `ts-node-dev` for TypeScript compilation & hot reload
- Runs on `http://localhost:4000`
- Includes 5 seeded routes (R001–R005) pre-loaded in memory
- CORS enabled to accept requests from frontend

### Frontend Setup

```bash
# Navigate to frontend directory (in another terminal)
cd frontend

# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Expected output:
# VITE v7.2.2 ready in 150 ms
# Local: http://localhost:5174/
```

**Frontend Details:**
- Uses Vite for ultra-fast builds and hot module replacement
- Runs on `http://localhost:5174`
- Automatically proxies `/api/*` requests to backend
- Includes TailwindCSS for responsive UI styling

### Access the Application

1. Ensure **backend is running first** (Terminal 1)
2. Ensure **frontend is running** (Terminal 2)
3. Open browser to `http://localhost:5174`
4. Dashboard will automatically load 5 seeded routes from the backend

---

## 🧪 Testing

### Backend Unit & Integration Tests

```bash
cd backend

# Run all tests with Jest
npm run test

# Expected output:
# PASS  src/__tests__/routes.int.test.ts
# PASS  src/__tests__/usecases.test.ts
#
# Test Suites: 2 passed, 2 total
# Tests:       5 passed, 5 total
```

**Test Coverage:**
- ✅ `computeEnergy()` - Energy conversion (tonne → MJ)
- ✅ `computeComparison()` - Baseline comparison & compliance flag
- ✅ `createPool()` - Greedy allocation algorithm
- ✅ GET `/api/routes` - Route retrieval
- ✅ GET `/api/routes/comparison` - Compliance comparison

### Linting

```bash
cd backend
npm run lint
```

---

## 📡 API Specification

### Base URL
```
http://localhost:4000/api
```

### Endpoints

#### 1. Get All Routes
```http
GET /api/routes
```
**Response (200):**
```json
[
  {
    "route_id": "R001",
    "vessel_type": "Container",
    "fuel_type": "HFO",
    "year": 2024,
    "ghg_intensity": 91.0,
    "fuel_tonnes": 100,
    "is_baseline": true
  },
  ...
]
```

#### 2. Get Comparison Data
```http
GET /api/routes/comparison
```
**Response (200):**
```json
{
  "baseline": { "route_id": "R001", "ghg_intensity": 91.0, ... },
  "comparisons": [
    {
      "route_id": "R002",
      "ghg_intensity": 88.0,
      "pct_diff": -3.3,
      "is_compliant": true
    },
    ...
  ]
}
```

#### 3. Set Baseline Route
```http
POST /api/routes/:routeId/baseline
```
**Response (204):** No content  
**Effect:** Updates `is_baseline` flag for specified route

#### 4. Calculate Compliance Balance
```http
GET /api/compliance/cb?shipId=SHIP001&year=2024
```
**Response (200):**
```json
{
  "ship_id": "SHIP001",
  "year": 2024,
  "cb_balance": 12500.5
}
```

#### 5. Get Adjusted Compliance Balance
```http
GET /api/compliance/adjusted-cb?shipId=SHIP001&year=2024
```
**Response (200):**
```json
{
  "adjusted_cb": 15000.0,
  "adjustments_applied": [...],
  "timestamp": "2024-11-13T10:30:00Z"
}
```

#### 6. Banking Operations
```http
GET /api/banking/:shipId
POST /api/banking/:shipId/credit
POST /api/banking/:shipId/debit
```

#### 7. Create Compliance Pool
```http
POST /api/pools
Content-Type: application/json

{
  "pool_name": "European Fleet 2024",
  "member_ships": [
    { "ship_id": "SHIP001", "cb": 5000 },
    { "ship_id": "SHIP002", "cb": -3000 }
  ]
}
```
**Response (200):**
```json
{
  "pool_id": "POOL001",
  "allocations": [
    { "ship_id": "SHIP001", "cb": 1000 },
    { "ship_id": "SHIP002", "cb": 1000 }
  ]
}
```

---

## 📊 Key Concepts & Constants

### Target GHG Intensity
```
Target: 89.3368 gCO₂e/MJ
```
Routes with GHG intensity ≤ 89.3368 are considered **compliant** ✅

### Energy Conversion
```
Energy (MJ) = Fuel Mass (tonnes) × 41,000 MJ/tonne
```
Standard conversion factor for maritime fuels.

### Compliance Balance Formula
```
CB = ((Target - Actual GHG) × Fuel Tonnes × 41,000) / 1,000
```
- Positive CB = Surplus (can be banked or shared)
- Negative CB = Deficit (must be offset by banking or pooling)

### Greedy Allocation Algorithm
For pooling, deficits are fulfilled in order of magnitude:
1. Sort members by CB (deficit first)
2. Allocate surpluses to largest deficits
3. Ensure total CB is conserved

---

## 🛠️ Development Workflow

### Making Changes

1. **Backend Changes:**
   ```bash
   # Edit files in src/
   # Hot reload automatically applies changes
   # Run tests before committing
   npm run test
   ```

2. **Frontend Changes:**
   ```bash
   # Edit files in src/
   # Vite hot module replacement updates UI instantly
   # Browser refreshes automatically
   ```

3. **Database/Seeds:**
   ```bash
   # Edit src/infrastructure/db/seeds.sql
   # Restart backend to reload seed data
   # (Ctrl+C then npm run dev)
   ```

### Building for Production

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
npm run preview  # Preview production build locally
```

---

## 🔒 Security & Code Quality

- **TypeScript:** Full type safety across all files
- **CORS:** Configured for localhost development
- **Error Handling:** Comprehensive try-catch blocks & validation
- **ESLint:** Code quality linter for backend
- **Jest:** Unit & integration test framework

---

## 📦 Dependencies Summary

### Backend Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.1.0 | HTTP framework |
| typescript | ^5.9.3 | Type-safe JavaScript |
| ts-node-dev | ^2.0.0 | Hot reload development |
| jest | ^29.7.0 | Testing framework |
| pg | ^8.16.3 | PostgreSQL driver |
| cors | ^2.8.5 | Cross-origin requests |

### Frontend Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI framework |
| vite | ^7.2.2 | Build tool & dev server |
| axios | ^1.4.0 | HTTP client |
| tailwindcss | ^3.3.6 | Utility-first CSS framework |
| typescript | ^5.9.3 | Type-safe JavaScript |

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 4000 is in use
lsof -i :4000
# Kill process if needed
kill -9 <PID>

# Or use a different port:
PORT=5000 npm run dev
```

### Frontend can't reach backend
- Ensure backend is running on `http://localhost:4000`
- Check browser console for CORS errors
- Verify vite.config.ts has correct proxy configuration

### Tests failing
```bash
cd backend
npm run test -- --verbose
# Shows detailed test output
```

### Clear cache and reinstall
```bash
# Backend
rm -rf node_modules package-lock.json
npm install

# Frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation

- **QUICK_START.md** - Detailed setup & API testing guide
- **VERIFICATION_REPORT.md** - Complete verification logs & test results
- **PROJECT_COMPLETE.md** - Project summary & metrics
- **AGENT_WORKFLOW.md** - AI-assisted development documentation
- **REFLECTION.md** - Lessons learned & technical insights

---

## 🎯 Features

### ✅ Routes Management
- View all vessel routes with environmental data
- Filter by vessel type, fuel type, year
- Set any route as compliance baseline
- Real-time GHG intensity display

### ✅ Compliance Comparison
- Compare routes against baseline
- Calculate percentage difference in GHG intensity
- Automatic compliance flagging (✅/❌)
- Target intensity: 89.3368 gCO₂e/MJ

### ✅ Compliance Banking
- Track compliance credits by ship & year
- Bank surplus credits for future periods
- Query historical banking records
- Calculate adjusted balances with interventions

### ✅ Fleet Pooling
- Create multi-vessel compliance pools
- Automatic credit allocation using greedy algorithm
- Optimize fleet-wide compliance
- Ensure CB conservation across pools

---

## 🚢 About FuelEU Maritime

The **FuelEU Maritime Regulation** (EU 2023/1805) requires shipping companies to reduce carbon intensity of their fleet. This platform simulates key compliance mechanisms:

- **GHG Intensity Reduction:** Progressive year-on-year targets
- **Compliance Banking:** Carry forward surplus credits
- **Pooling Mechanisms:** Fleet-wide compliance optimization
- **Reporting Requirements:** Full audit trail of compliance records

---

## 📞 Support

For questions or issues:
1. Check QUICK_START.md for common solutions
2. Review VERIFICATION_REPORT.md for technical details
3. Consult REFLECTION.md for architectural insights

---

**Happy shipping! ⚓**