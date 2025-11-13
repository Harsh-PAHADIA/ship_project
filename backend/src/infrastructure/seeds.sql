-- Create tables
CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  route_id VARCHAR(16) UNIQUE NOT NULL,
  vessel_type VARCHAR(64) NOT NULL,
  fuel_type VARCHAR(32) NOT NULL,
  year INTEGER NOT NULL,
  ghg_intensity NUMERIC NOT NULL,
  fuel_consumption NUMERIC NOT NULL,
  distance_km NUMERIC,
  total_emissions NUMERIC,
  is_baseline BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS ship_compliance (
  id SERIAL PRIMARY KEY,
  ship_id VARCHAR(64) NOT NULL,
  year INTEGER NOT NULL,
  cb_tonnes NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE (ship_id, year)
);

CREATE TABLE IF NOT EXISTS bank_entries (
  id SERIAL PRIMARY KEY,
  ship_id VARCHAR(64) NOT NULL,
  year INTEGER NOT NULL,
  amount_tonnes NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pools (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pool_members (
  id SERIAL PRIMARY KEY,
  pool_id INTEGER REFERENCES pools(id),
  ship_id VARCHAR(64) NOT NULL,
  cb_before NUMERIC NOT NULL,
  cb_after NUMERIC
);

-- Seed routes (five rows)
INSERT INTO routes (route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance_km, total_emissions, is_baseline)
VALUES
('R001', 'Container', 'HFO', 2024, 91.0, 5000, 12000, 4500, true),
('R002', 'BulkCarrier', 'LNG', 2024, 88.0, 4800, 11500, 4200, false),
('R003', 'Tanker', 'MGO', 2024, 93.5, 5100, 12500, 4700, false),
('R004', 'RoRo', 'HFO', 2025, 89.2, 4900, 11800, 4300, false),
('R005', 'Container', 'LNG', 2025, 90.5, 4950, 11900, 4400, false)
ON CONFLICT (route_id) DO NOTHING;
