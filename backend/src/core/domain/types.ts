export type RouteRow = {
  id: number;
  route_id: string;
  vessel_type: string;
  fuel_type: string;
  year: number;
  ghg_intensity: number;
  fuel_consumption: number;
  distance_km: number;
  total_emissions: number;
  is_baseline: boolean;
};

export type CBRecord = {
  ship_id: string;
  year: number;
  cb_tonnes: number;
};
