import { TARGET_INTENSITY } from './computeCB';

export type ComparisonResult = {
  routeId: string;
  ghgIntensity: number;
  percentDiff: number;
  compliant: boolean;
};

export function computeComparison(baselineIntensity: number, otherIntensity: number): ComparisonResult {
  const percentDiff = ((otherIntensity / baselineIntensity) - 1) * 100;
  const compliant = otherIntensity <= TARGET_INTENSITY;
  return {
    routeId: '', // filled by caller
    ghgIntensity: otherIntensity,
    percentDiff,
    compliant
  };
}
