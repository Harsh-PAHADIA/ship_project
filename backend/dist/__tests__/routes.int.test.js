"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("../adapters/inbound/routes"));
const repo_1 = require("../adapters/outbound/repo");
describe('HTTP routes (integration)', () => {
    let app;
    beforeAll(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use('/api', routes_1.default);
    });
    it('GET /api/routes returns array', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/routes');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });
    it('GET /api/routes/comparison returns baseline and comparisons', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/routes/comparison');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('baseline');
        expect(res.body).toHaveProperty('comparisons');
    });
    afterAll(async () => {
        // ensure any DB pools are closed to allow Jest to exit
        await (0, repo_1.closeRepo)();
    });
});
