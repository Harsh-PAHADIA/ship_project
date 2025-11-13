"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeComparison = computeComparison;
const computeCB_1 = require("./computeCB");
function computeComparison(baselineIntensity, otherIntensity) {
    const percentDiff = ((otherIntensity / baselineIntensity) - 1) * 100;
    const compliant = otherIntensity <= computeCB_1.TARGET_INTENSITY;
    return {
        routeId: '', // filled by caller
        ghgIntensity: otherIntensity,
        percentDiff,
        compliant
    };
}
