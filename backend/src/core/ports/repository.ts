import { RouteRow, CBRecord } from '../domain/types';

export interface Repository {
  getAllRoutes(): Promise<RouteRow[]>;
  setBaseline(routeId: string): Promise<void>;
  getBaseline(): Promise<RouteRow | null>;
  getOtherRoutes(): Promise<RouteRow[]>;
  upsertCBRecord(record: CBRecord): Promise<void>;
  getCBRecord(shipId: string, year: number): Promise<CBRecord | null>;
  getBankedAmount(shipId: string, year: number): Promise<number>;
  addBankEntry(shipId: string, year: number, amount: number): Promise<void>;
  applyBankEntry(shipId: string, year: number, amount: number): Promise<void>;
}
