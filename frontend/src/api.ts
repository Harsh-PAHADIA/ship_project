import axios from 'axios';

export async function getRoutes() {
  const res = await axios.get('/api/routes');
  return res.data;
}

export async function getComparison() {
  const res = await axios.get('/api/routes/comparison');
  return res.data;
}

export async function getCB(shipId: string, year = 2024) {
  const res = await axios.get('/api/compliance/cb', { params: { shipId, year } });
  return res.data;
}

export async function getAdjustedCB(shipId: string, year = 2024) {
  const res = await axios.get('/api/compliance/adjusted-cb', { params: { shipId, year } });
  return res.data;
}

export async function getBanked(shipId: string, year = 2024) {
  const res = await axios.get('/api/banking/records', { params: { shipId, year } });
  return res.data;
}

export async function bank(shipId: string, year: number, amount: number) {
  const res = await axios.post('/api/banking/bank', { shipId, year, amount });
  return res.data;
}

export async function applyBank(shipId: string, year: number, amount: number) {
  const res = await axios.post('/api/banking/apply', { shipId, year, amount });
  return res.data;
}

export async function createPool(year: number, members: any[]) {
  const res = await axios.post('/api/pools', { year, members });
  return res.data;
}

export async function setBaseline(routeId: string) {
  const res = await axios.post(`/api/routes/${routeId}/baseline`);
  return res.data;
}
