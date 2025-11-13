"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MJ_PER_TONNE = exports.TARGET_INTENSITY = void 0;
exports.computeEnergy = computeEnergy;
exports.computeCB = computeCB;
exports.TARGET_INTENSITY = 89.3368; // gCO2e/MJ
exports.MJ_PER_TONNE = 41000; // MJ / tonne
/**
 * Compute energy (MJ)
 */
function computeEnergy(fuelTonnes) {
    return fuelTonnes * exports.MJ_PER_TONNE;
}
/**
 * Compute Compliance Balance in tonnes CO2e
 * cb_tonnes = ((target - actual) * energy) / 1000
 */
function computeCB(targetIntensity, actualIntensity, fuelTonnes) {
    const energy = computeEnergy(fuelTonnes);
    const cb_gco2 = (targetIntensity - actualIntensity) * energy;
    const cb_tonnes = cb_gco2 / 1000.0;
    return cb_tonnes;
}
