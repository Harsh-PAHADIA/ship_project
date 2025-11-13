export const TARGET_INTENSITY = 89.3368; // gCO2e/MJ
export const MJ_PER_TONNE = 41000; // MJ / tonne
/**
 * Compute energy (MJ)
 */
export function computeEnergy(fuelTonnes: number): number {
  return fuelTonnes * MJ_PER_TONNE;
}

/**
 * Compute Compliance Balance in tonnes CO2e
 * cb_tonnes = ((target - actual) * energy) / 1000
 */
export function computeCB(targetIntensity: number, actualIntensity: number, fuelTonnes: number): number {
  const energy = computeEnergy(fuelTonnes);
  const cb_gco2 = (targetIntensity - actualIntensity) * energy;
  const cb_tonnes = cb_gco2 / 1000.0;
  return cb_tonnes;
}
