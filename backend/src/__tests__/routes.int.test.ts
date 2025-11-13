import request from 'supertest';
import express from 'express';
import routes from '../adapters/inbound/routes';
import { closeRepo } from '../adapters/outbound/repo';

describe('HTTP routes (integration)', () => {
  let app: express.Express;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', routes);
  });

  it('GET /api/routes returns array', async () => {
    const res = await request(app).get('/api/routes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/routes/comparison returns baseline and comparisons', async () => {
    const res = await request(app).get('/api/routes/comparison');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('baseline');
    expect(res.body).toHaveProperty('comparisons');
  });

  afterAll(async () => {
    // ensure any DB pools are closed to allow Jest to exit
    await closeRepo();
  });
});
