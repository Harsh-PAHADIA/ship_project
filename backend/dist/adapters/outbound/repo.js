"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.repo = void 0;
exports.closeRepo = closeRepo;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let pool = null;
// In-memory fallback data
let inMemoryRoutes = [
    { id: 1, route_id: 'R001', vessel_type: 'Container', fuel_type: 'HFO', year: 2024, ghg_intensity: 91.0, fuel_consumption: 5000, distance_km: 12000, total_emissions: 4500, is_baseline: true },
    { id: 2, route_id: 'R002', vessel_type: 'BulkCarrier', fuel_type: 'LNG', year: 2024, ghg_intensity: 88.0, fuel_consumption: 4800, distance_km: 11500, total_emissions: 4200, is_baseline: false },
    { id: 3, route_id: 'R003', vessel_type: 'Tanker', fuel_type: 'MGO', year: 2024, ghg_intensity: 93.5, fuel_consumption: 5100, distance_km: 12500, total_emissions: 4700, is_baseline: false },
    { id: 4, route_id: 'R004', vessel_type: 'RoRo', fuel_type: 'HFO', year: 2025, ghg_intensity: 89.2, fuel_consumption: 4900, distance_km: 11800, total_emissions: 4300, is_baseline: false },
    { id: 5, route_id: 'R005', vessel_type: 'Container', fuel_type: 'LNG', year: 2025, ghg_intensity: 90.5, fuel_consumption: 4950, distance_km: 11900, total_emissions: 4350, is_baseline: false }
];
let inMemoryCB = [];
let inMemoryBankEntries = [];
const usePostgres = !!process.env.DATABASE_URL;
if (usePostgres) {
    pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
}
exports.repo = {
    async getAllRoutes() {
        if (!usePostgres) {
            return inMemoryRoutes;
        }
        const res = await pool.query('SELECT * FROM routes ORDER BY route_id');
        return res.rows;
    },
    async setBaseline(routeId) {
        if (!usePostgres) {
            inMemoryRoutes = inMemoryRoutes.map(r => ({
                ...r,
                is_baseline: r.route_id === routeId
            }));
            return;
        }
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('UPDATE routes SET is_baseline = false WHERE is_baseline = true');
            await client.query('UPDATE routes SET is_baseline = true WHERE route_id = $1', [routeId]);
            await client.query('COMMIT');
        }
        catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }
        finally {
            client.release();
        }
    },
    async getBaseline() {
        if (!usePostgres) {
            const baseline = inMemoryRoutes.find(r => r.is_baseline);
            return baseline ?? null;
        }
        const res = await pool.query('SELECT * FROM routes WHERE is_baseline = true LIMIT 1');
        return res.rows[0] ?? null;
    },
    async getOtherRoutes() {
        if (!usePostgres) {
            return inMemoryRoutes.filter(r => !r.is_baseline);
        }
        const res = await pool.query('SELECT * FROM routes WHERE is_baseline = false ORDER BY route_id');
        return res.rows;
    },
    async upsertCBRecord(record) {
        if (!usePostgres) {
            const idx = inMemoryCB.findIndex(r => r.ship_id === record.ship_id && r.year === record.year);
            if (idx >= 0) {
                inMemoryCB[idx] = record;
            }
            else {
                inMemoryCB.push(record);
            }
            return;
        }
        await pool.query(`INSERT INTO ship_compliance (ship_id, year, cb_tonnes, created_at)
       VALUES ($1,$2,$3, now())
       ON CONFLICT (ship_id, year) DO UPDATE SET cb_tonnes=EXCLUDED.cb_tonnes, created_at=now()`, [record.ship_id, record.year, record.cb_tonnes]);
    },
    async getCBRecord(shipId, year) {
        if (!usePostgres) {
            const record = inMemoryCB.find(r => r.ship_id === shipId && r.year === year);
            return record ?? null;
        }
        const res = await pool.query('SELECT ship_id, year, cb_tonnes FROM ship_compliance WHERE ship_id=$1 AND year=$2', [shipId, year]);
        if (res.rowCount === 0)
            return null;
        return { ship_id: res.rows[0].ship_id, year: res.rows[0].year, cb_tonnes: parseFloat(res.rows[0].cb_tonnes) };
    },
    async getBankedAmount(shipId, year) {
        if (!usePostgres) {
            const total = inMemoryBankEntries
                .filter(e => e.ship_id === shipId && e.year === year)
                .reduce((sum, e) => sum + e.amount_tonnes, 0);
            return total;
        }
        const res = await pool.query('SELECT COALESCE(SUM(amount_tonnes),0) as total FROM bank_entries WHERE ship_id=$1 AND year=$2', [shipId, year]);
        return parseFloat(res.rows[0].total);
    },
    async addBankEntry(shipId, year, amount) {
        if (!usePostgres) {
            inMemoryBankEntries.push({ ship_id: shipId, year, amount_tonnes: amount });
            return;
        }
        await pool.query('INSERT INTO bank_entries (ship_id, year, amount_tonnes, created_at) VALUES ($1,$2,$3, now())', [shipId, year, amount]);
    },
    async applyBankEntry(shipId, year, amount) {
        if (!usePostgres) {
            inMemoryBankEntries.push({ ship_id: shipId, year, amount_tonnes: -Math.abs(amount) });
            return;
        }
        await pool.query('INSERT INTO bank_entries (ship_id, year, amount_tonnes, created_at) VALUES ($1,$2,$3, now())', [shipId, year, -Math.abs(amount)]);
    }
};
async function closeRepo() {
    if (usePostgres && pool) {
        await pool.end();
    }
}
