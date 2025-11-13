import express from 'express';
import { repo } from '../outbound/repo';
import { computeCB, TARGET_INTENSITY } from '../../core/application/usecases/computeCB';
import { createPool } from '../../core/application/usecases/createPool';

const router = express.Router();

// GET /api (root)
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    service: 'Fuel EU Maritime Compliance API',
    endpoints: [
      { method: 'GET', path: '/routes', description: 'Get all routes' },
      { method: 'POST', path: '/routes/:routeId/baseline', description: 'Set baseline route' },
      { method: 'GET', path: '/routes/comparison', description: 'Get comparison data' },
      { method: 'GET', path: '/compliance/cb', description: 'Get compliance balance' },
      { method: 'GET', path: '/compliance/adjusted-cb', description: 'Get adjusted CB' },
      { method: 'GET', path: '/banking/records', description: 'Get banking records' },
      { method: 'POST', path: '/banking/bank', description: 'Record banking entry' },
      { method: 'POST', path: '/banking/apply', description: 'Apply banked CB' },
      { method: 'POST', path: '/pools', description: 'Create compliance pool' }
    ]
  });
});

// GET /api/routes
router.get('/routes', async (req, res) => {
  const routes = await repo.getAllRoutes();
  res.json(routes);
});

// POST /api/routes/:routeId/baseline
router.post('/routes/:routeId/baseline', async (req, res) => {
  const { routeId } = req.params;
  await repo.setBaseline(routeId);
  res.status(204).send();
});

// GET /api/routes/comparison
router.get('/routes/comparison', async (req, res) => {
  const baseline = await repo.getBaseline();
  if (!baseline) return res.status(404).json({ message: 'No baseline set' });
  const others = await repo.getOtherRoutes();
  const comparisons = others.map((o: any) => {
    const percentDiff = ((o.ghg_intensity / baseline.ghg_intensity) - 1) * 100;
    const compliant = o.ghg_intensity <= TARGET_INTENSITY;
    return {
      routeId: o.route_id,
      ghgIntensity: o.ghg_intensity,
      percentDiff,
      compliant
    };
  });
  res.json({ baseline, comparisons });
});

// GET /api/compliance/cb
router.get('/compliance/cb', async (req, res) => {
  const shipId = String(req.query.shipId || req.query.routeId || '');
  const year = Number(req.query.year || 2024);
  if (!shipId) return res.status(400).json({ message: 'shipId or routeId required' });

  const routes = await repo.getAllRoutes();
  const r = routes.find((x: any) => x.route_id === shipId && x.year === year);
  if (!r) return res.status(404).json({ message: 'Route not found for shipId/year' });

  const cb = computeCB(TARGET_INTENSITY, r.ghg_intensity, r.fuel_consumption);
  await repo.upsertCBRecord({ ship_id: shipId, year, cb_tonnes: cb });
  res.json({ shipId, year, cb_tonnes: cb });
});

// GET /api/compliance/adjusted-cb
router.get('/compliance/adjusted-cb', async (req, res) => {
  const shipId = String(req.query.shipId || '');
  const year = Number(req.query.year || 2024);
  if (!shipId) return res.status(400).json({ message: 'shipId required' });
  const cbRec = await repo.getCBRecord(shipId, year);
  const bank = await repo.getBankedAmount(shipId, year);
  const cbBefore = cbRec ? cbRec.cb_tonnes : 0;
  const adjusted = cbBefore + bank;
  res.json({ shipId, year, cb_before: cbBefore, banked: bank, cb_after: adjusted });
});

// Banking endpoints
router.get('/banking/records', async (req, res) => {
  const shipId = String(req.query.shipId || '');
  const year = Number(req.query.year || 2024);
  if (!shipId) return res.status(400).json({ message: 'shipId required' });
  const bank = await repo.getBankedAmount(shipId, year);
  res.json({ shipId, year, banked: bank });
});

router.post('/banking/bank', express.json(), async (req, res) => {
  const { shipId, year, amount } = req.body;
  if (!shipId || !year || typeof amount !== 'number') return res.status(400).json({ message: 'shipId, year, amount required' });
  if (amount <= 0) return res.status(400).json({ message: 'Amount must be > 0' });
  await repo.addBankEntry(shipId, year, amount);
  res.status(201).json({ shipId, year, banked: await repo.getBankedAmount(shipId, year) });
});

router.post('/banking/apply', express.json(), async (req, res) => {
  const { shipId, year, amount } = req.body;
  if (!shipId || !year || typeof amount !== 'number') return res.status(400).json({ message: 'shipId, year, amount required' });
  const available = await repo.getBankedAmount(shipId, year);
  if (amount > available) return res.status(400).json({ message: 'Insufficient banked amount' });
  await repo.applyBankEntry(shipId, year, amount);
  res.status(200).json({ shipId, year, applied: amount, banked: await repo.getBankedAmount(shipId, year) });
});

// POST /api/pools
router.post('/pools', express.json(), async (req, res) => {
  const { year, members } = req.body;
  if (!Array.isArray(members) || typeof year !== 'number') return res.status(400).json({ message: 'year and members required' });

  try {
    const result = createPool(members);
    res.json({ year, members: result, sum: result.reduce((s: any, m: any) => s + (m.cbAfter || 0), 0) });
  } catch (err: any) {
    res.status(400).json({ message: err.message || String(err) });
  }
});

export default router;
