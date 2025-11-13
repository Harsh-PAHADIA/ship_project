# AI Agent Workflow Log

This document captures how GitHub Copilot was used throughout the Fuel EU Maritime project to accelerate development.

---

## Agents Used

- **GitHub Copilot** (inline code completions and suggestions in VS Code)

---

## Prompts & Outputs

### 1. Backend: Hexagonal Architecture Setup

**Prompt:**
```
Generate a minimal hexagonal architecture structure for a Node.js + TypeScript backend.
Include core domain, application usecases, ports, and adapters (inbound HTTP and outbound postgres).
Use Express for the inbound adapter and pg for the outbound adapter.
```

**Output Generated:**
Copilot suggested folder structure (core/domain, core/application/usecases, core/ports, adapters/inbound, adapters/outbound).
I customized by adding an in-memory fallback to repo.ts for local testing without a database.

### 2. Core Use-Cases: CB Computation

**Prompt:**
```
Write a TypeScript function computeCB(targetIntensity, actualIntensity, fuelTonnes) that:
- Returns compliance balance in tonnes CO2e.
- Formula: ((target - actual) × energy) / 1000, where energy = fuelTonnes × 41000.
- Include TARGET_INTENSITY = 89.3368 as a constant.
```

**Output Generated:**
```typescript
export const TARGET_INTENSITY = 89.3368;
export const MJ_PER_TONNE = 41000;
export function computeCB(targetIntensity, actualIntensity, fuelTonnes) {
  const energy = computeEnergy(fuelTonnes);
  const cb_gco2 = (targetIntensity - actualIntensity) * energy;
   # AI Agent Workflow Log

  This document captures how GitHub Copilot was used throughout the Fuel EU Maritime project to accelerate development, what was validated manually, and lessons learned.

  ---

  ## Agents Used

  - GitHub Copilot (inline completions and code suggestions)

  ---

  ## Prompts & Key Outputs

  Below are representative prompts used during the project and the type of outputs produced by the agent. These examples show how Copilot was used for scaffolding and where manual verification was required.

  ### Backend scaffolding
  Prompt: "Generate a minimal hexagonal architecture structure for a Node.js + TypeScript backend..."
  Outcome: Folder structure and initial route/use-case stubs. I added an in-memory repository fallback for local dev.

  ### computeCB function
  Prompt: "Write computeCB(targetIntensity, actualIntensity, fuelTonnes) with TARGET_INTENSITY=89.3368 and MJ_PER_TONNE=41000"
  Outcome: Copilot suggested the core formula; I verified and adjusted units (gCO2e → tonnes) and added tests.

  ### Greedy pool allocation
  Prompt: "Write createPool(members) allocating surplus to deficits greedily..."
  Outcome: Copilot produced a correct algorithm outline; I validated behavior with test vectors (sum conservation, constraints respected).

  ### Frontend scaffolding
  Prompt: "Generate a React component with tabs: Routes, Compare, Banking, Pooling"
  Outcome: Tab state and conditional rendering were scaffolded; I implemented API wiring and detailed UI manually.

  ---
# AI Agent Workflow — Fuel EU Maritime

Version: 1.0
Date: 2025-11-13

This document is an engineering-oriented AI workflow log describing how automated coding agents and developer tools were used during the Fuel EU Maritime project. It records prompts used, code scaffolding produced by agents, manual corrections, validation steps, and lessons learned. The content is written from the developer's perspective and is suitable for academic or industrial review.

## Agents and Tools Used

- GitHub Copilot — primary code/completion generator for scaffolding, functions, and tests.
- Visual Studio Code IntelliSense and auto-imports — quick import suggestions and completions.
- TypeScript compiler (`tsc --noEmit`) — strict type validation.
- Jest + Supertest — unit and integration test runner.
- Node / npm / Vite — frontend dev/build tools.
- TailwindCSS — styling utilities (pinned to a working version where necessary).
- Git (CLI) — branch/commit management.

Each entry below describes a project stage, the prompt used, the generated artifact(s), manual edits, reasons for edits, and validation steps.

## 1. Backend — Domain Layer and Use-cases

### 1.1 Prompt (domain & use-case scaffolding)

"Generate a minimal hexagonal architecture for a Node.js + TypeScript backend. Include core/domain types, application/usecases, ports (repository interface), and adapters (inbound Express, outbound Postgres). Use strict TypeScript types and add an in-memory repository fallback for local testing."

### 1.2 Generated scaffolding (representative)

Copilot produced folder and file stubs such as:

- `core/domain/types.ts` — domain types (Route, BankingRecord, PoolMember)
- `core/application/usecases/computeCB.ts` — computeCB signature
- `core/application/usecases/createPool.ts` — createPool signature
- `core/ports/repository.ts` — Repository interface
- `adapters/inbound/routes.ts` — Express route handlers
- `adapters/outbound/repo.ts` — Postgres-backed repository (scaffold)

Example generated interface (trimmed):

```ts
// core/ports/repository.ts
export interface Repository {
  listRoutes(): Promise<Route[]>;
  getRoute(id: string): Promise<Route | null>;
  savePool(pool: Pool): Promise<void>;
}
```

### 1.3 Manual review & corrections

- Fixed import paths (Copilot sometimes inserted relative paths that didn't match the repo layout).
- Replaced loose types and `any` with strict domain types (Route, PoolMember, BankingRecord).
- Implemented an in-memory fallback in `adapters/outbound/repo.ts` so local tests run without Postgres.

Why these corrections: Copilot generates plausible code but cannot infer the repository's exact file layout or strict types; the in-memory fallback was necessary to run tests in environments without a DB.

### 1.4 Validation

- Ran `npx tsc --noEmit` to catch typing and import errors.
- Wrote unit tests for core use-cases (Jest) and ran them.

## 2. computeCB — Compliance Balance Formula

### 2.1 Prompt

"Write a TypeScript function computeCB(targetIntensity, actualIntensity, fuelTonnes) that returns compliance balance in tonnes CO2e. Use constants: TARGET_INTENSITY = 89.3368 (gCO2e/MJ), MJ_PER_TONNE = 41000. Provide units conversion comments."

### 2.2 Generated code (final, validated)

```ts
// core/application/usecases/computeCB.ts
export const TARGET_INTENSITY = 89.3368; // gCO2e per MJ
export const MJ_PER_TONNE = 41000; // MJ per tonne of fuel

/**
 * Compute compliance balance in tonnes CO2e.
 * Formula: CB (gCO2e) = (targetIntensity - actualIntensity) * energy(MJ)
 * energy(MJ) = fuelTonnes * MJ_PER_TONNE
 * Convert gCO2e to tonnes: divide by 1_000_000 (g -> tonnes) OR divide by 1000 if energy units already produce g -> tonnes logic used
 */
export function computeCB(actualIntensity: number, fuelTonnes: number, targetIntensity = TARGET_INTENSITY): number {
  const energyMJ = fuelTonnes * MJ_PER_TONNE; // MJ
  const delta_gCO2_per_MJ = targetIntensity - actualIntensity; // gCO2e / MJ
  const cb_gCO2 = delta_gCO2_per_MJ * energyMJ; // gCO2e
  const cb_tonnes = cb_gCO2 / 1_000_000; // convert grams to tonnes
  return cb_tonnes; // positive => under target (credit), negative => over target (debit)
}
```

Notes: There are two common unit conventions; tests and seeds used in this project expect grams -> tonnes using 1,000,000 g/tonne conversion. That convention was validated with sample route data.

### 2.3 Manual corrections

- Ensured the g -> tonne conversion was consistently applied across code and tests.
- Added param order and defaults to make function ergonomics consistent with call sites.

### 2.4 Validation

- Unit tests covering: zero delta, positive credits, negative credits. All assertions validated using seeded data.

## 3. createPool — Greedy Allocation Algorithm

### 3.1 Prompt

"Write a TypeScript function createPool(members) that allocates surplus compliance balance (positive CB) to members with deficits (negative CB) using a greedy algorithm. Ensure no member's CB goes below original deficit and sum of CBs is conserved. Return members with cbAfter set."

### 3.2 Generated code (final, validated)

```ts
// core/application/usecases/createPool.ts
export interface PoolMember { id: string; cbBefore: number; cbAfter?: number }

export function createPool(members: PoolMember[]): PoolMember[] {
  // copy input
  const result = members.map(m => ({ ...m, cbAfter: m.cbBefore }));

  // separate surpluses and deficits
  const surpluses = result.filter(m => m.cbAfter! > 0).sort((a, b) => b.cbAfter! - a.cbAfter!);
  const deficits = result.filter(m => m.cbAfter! < 0).sort((a, b) => a.cbAfter! - b.cbAfter!);

  for (const s of surpluses) {
    let remaining = s.cbAfter!;
    if (remaining <= 0) continue;
    for (const d of deficits) {
      if (remaining <= 0) break;
      const needed = Math.abs(d.cbAfter!); // positive amount to cover
      const transfer = Math.min(remaining, needed);
      d.cbAfter = d.cbAfter! + transfer; // reduces deficit (less negative)
      remaining -= transfer;
    }
    s.cbAfter = remaining; // leftover surplus
  }

  return result;
}
```

### 3.3 Manual review & edge-cases handled

- Corrected sorting order after testing with symmetric cases.
- Ensured floating point precision handled by rounding only in output presentation, not during allocation.

Edge cases: total sum negative (pool impossible) — in this implementation, allocation runs but sum remains negative; production code should validate total >= 0 before committing a pool.

### 3.4 Validation

- Unit tests with various vectors: [100, -50, -30] → expected [20, 0, 0]; conservation checked.

## 4. Repository Interface & Outbound Adapter

### 4.1 Prompt

"Generate a Repository interface for routes/pools and an outbound adapter that implements it using pg and an in-memory fallback. Provide async signatures for list/get/save operations." 

### 4.2 Generated interface (example)

```ts
export interface Repository {
  listRoutes(): Promise<Route[]>;
  getRoute(id: string): Promise<Route | null>;
  savePool(pool: Pool): Promise<Pool>;
}
```

### 4.3 Manual edits

- Implemented concrete in-memory storage and seed data.
- Added defensive null checks and converted DB numeric types to JS numbers.

### 4.4 Validation

- Integration tests use the in-memory repo to run HTTP-level tests (Supertest) without requiring Postgres.

## 5. Inbound Adapter — Express Routing

### 5.1 Prompt

"Scaffold Express routing for /api: GET /routes, GET /routes/comparison, POST /pools, POST /routes/:id/baseline. Use the application use-cases for business logic and return JSON responses."

### 5.2 Generated route example

```ts
// adapters/inbound/routes.ts
import express from 'express';
import { repository } from '../outbound/repo';
import { computeCB, createPool } from '../../core/application/usecases';

const router = express.Router();

router.get('/routes', async (req, res) => {
  const routes = await repository.listRoutes();
  res.json({ data: routes });
});

router.post('/pools', async (req, res) => {
  const members = req.body.members;
  const pool = createPool(members);
  await repository.savePool(pool);
  res.status(201).json(pool);
});

export default router;
```

### 5.3 Manual corrections

- Added input validation (schema or runtime checks) to guard against malformed payloads.
- Standardized response shape: { ok: boolean, data?: any, error?: string }.

### 5.4 Validation

- Supertest integration tests hit these routes against the app instance using the in-memory repo. Confirmed status codes and response shapes.

## 6. Frontend — React Pages and UI Patterns

### 6.1 Prompt (frontend scaffolding)

"Generate a Vite + React + TypeScript page skeleton with a top-level tabbed navigation that loads pages: Routes, Compare, Banking, Pooling. Use Tailwind classes for simple layout. Provide an API client wrapper using axios for /api endpoints."

### 6.2 Generated structure

- `src/App.tsx` — tab state and conditional page imports
- `src/pages/Routes.tsx`, `Compare.tsx`, `Banking.tsx`, `Pooling.tsx` — page components
- `src/api.ts` — axios client with helpers: getRoutes, getComparison, createPool, setBaseline, getCB, bank

Example React tabs scaffold:

```tsx
// src/App.tsx (excerpt)
const tabs = ['Routes', 'Compare', 'Banking', 'Pooling'] as const;
const [active, setActive] = useState<typeof tabs[number]>('Routes');

return (
  <div>
    <nav>{tabs.map(t => <button onClick={() => setActive(t)}>{t}</button>)}</nav>
    <main>
      {active === 'Routes' && <RoutesPage />}
      {active === 'Compare' && <ComparePage />}
      {active === 'Banking' && <BankingPage />}
      {active === 'Pooling' && <PoolingPage />}
    </main>
  </div>
)
```

### 6.3 Manual work & corrections

- Hooked API functions to UI controls (filters, Set Baseline button, Create Pool form).
- Added loading/disabled states and optimistic UI behavior for actions like Set Baseline.
- Added accessibility attributes and keyboard focus management for tab navigation.

Why: Copilot created the skeleton; business requirements (filter options, baseline actions) required manual wiring and UX polish.

### 6.4 Validation

- Ran `npx tsc --noEmit` to validate types.
- Manual verification in the browser (dev server) and basic smoke tests on endpoints.

## 7. Jest Test Scaffolding and Integration Tests

### 7.1 Prompt

"Generate Jest unit tests for computeCB, createPool, and Supertest integration tests for GET /api/routes and POST /api/pools. Use the in-memory repo for integration tests." 

### 7.2 Generated test example

```ts
// __tests__/computeCB.test.ts
import { computeCB } from '../../core/application/usecases/computeCB';

test('computeCB returns zero for equal intensities', () => {
  expect(computeCB(89.3368, 1)).toBeCloseTo(0, 6);
});
```

Integration (Supertest):

```ts
// __tests__/routes.int.test.ts
import request from 'supertest';
import { app } from '../../infrastructure/server';

test('GET /api/routes', async () => {
  const res = await request(app).get('/api/routes');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.data)).toBe(true);
});
```

### 7.3 Manual adjustments

- Corrected test assertions when business constants (TARGET_INTENSITY) implied different boolean results.
- Added setup/teardown to reset in-memory repo state between tests.

### 7.4 Validation

- Ran Jest test suite locally; all core tests passed. Integration tests validated route shapes and error paths.

## 8. Hallucinations, Incorrect Paths and Notable Errors

Examples of agent mistakes and how they were addressed:

- Import path hallucination: Copilot suggested imports like `../../outbound/postgres/repo` where the repo file was `adapters/outbound/repo.ts`. Fix: search-based refactoring and `tsc` checks.
- Non-existent package versions: suggested Tailwind versions that caused `ETARGET` on `npm install`. Fix: pin to stable Tailwind (3.3.6) and update `postcss.config.cjs`.
- Loose types: Copilot used `any` or inferred broad types. Fix: replace with domain-specific interfaces and run `tsc` until clean.
- Off-by-units in formulas: some generated code mixed g/tonne conversions. Fix: standardize on g->tonne conversion and test with seeded data.

Documenting these hallucinations helped avoid shipping latent bugs.

## 9. Where the AI Saved Time

- Scaffolding: file/folder layout, React tab skeleton, Express route stubs.
- Boilerplate: axios wrappers, simple DTO interfaces, Jest test skeletons.
- Rapid prototyping: quick iteration on algorithm outlines (computeCB, createPool) that accelerated the meat of implementation.

## 10. Where the AI Struggled or Hallucinated

- Project-specific import paths and repo layout.
- Precise numeric units and domain constants (g vs tonnes conversions).
- Dependency version accuracy (npm package versions).
- Complex business rules requiring global reasoning (pool validation when sum < 0).

## 11. Manual Engineering Required

- Type correctness: replacing `any` with explicit types and ensuring public API contracts.
- Validation and error handling across network boundaries.
- UX polish: loading states, confirm dialogs, accessibility.
- CI and security remediation: resolving npm audit warnings (upgrading Vite) and pinning Node versions in CI workflows.

## 12. Best Practices Followed While Using AI

1. Immediate type-checking: run `npx tsc --noEmit` after generated changes.
2. Write tests for generated business logic before trusting outputs.
3. Add an in-memory fallback to adapters for deterministic local testing.
4. Use small commits and feature branches for iterative review.
5. Validate dependency suggestions against known-good versions and pin when necessary.

## 13. Key Lessons Learned

- Treat Copilot as a productivity multiplier for patterns, not an oracle for domain correctness.
- Always add programmatic validation and unit tests for generated algorithmic code.
- Keep an authoritative source of domain units/constants (e.g., MJ_PER_TONNE) and reference it across code/tests.

## 14. Final Summary of AI Assistance

The AI agent significantly reduced boilerplate and scaffolding time and accelerated the initial implementation of algorithms and UI skeletons. However, successful delivery required careful manual review, type tightening, unit/integration tests, and dependency management. This workflow used Copilot productively as an assistant while preserving engineering rigor via TypeScript strict mode, Jest tests, and CI validations.

---

Prepared by: Harshita Pahadia (Project Developer)


For questions about specific prompts, patches, or tests, see the repository history and test suites under `backend/src/__tests__` and `frontend/src`.
