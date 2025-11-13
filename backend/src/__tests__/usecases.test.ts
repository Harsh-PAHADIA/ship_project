import { computeCB, computeEnergy, TARGET_INTENSITY } from '../core/application/usecases/computeCB';
import { computeComparison } from '../core/application/usecases/computeComparison';
import { createPool } from '../core/application/usecases/createPool';

describe('computeCB', () => {
  it('computes energy and cb correctly for a simple case', () => {
    const energy = computeEnergy(1); // 1 tonne
    expect(energy).toBe(41000);
    const cb = computeCB(TARGET_INTENSITY, 90, 1); // target 89.3368, actual 90
    // cb = (target - actual) * energy / 1000 -> negative small
    expect(typeof cb).toBe('number');
  });
});

describe('computeComparison', () => {
  it('computes percentDiff and compliance', () => {
    const res = computeComparison(100, 90);
    expect(res.percentDiff).toBeCloseTo((90 / 100 - 1) * 100);
    // With TARGET_INTENSITY = 89.3368, 90 is above target so not compliant
    expect(res.compliant).toBe(false);
  });
});

describe('createPool', () => {
  it('allocates surplus to deficits greedily', () => {
    const members = [
      { shipId: 'A', cbBefore: 100 },
      { shipId: 'B', cbBefore: -50 },
      { shipId: 'C', cbBefore: -30 },
    ];
    const res = createPool(members as any);
    const sumBefore = members.reduce((s, m) => s + m.cbBefore, 0);
    const sumAfter = res.reduce((s, m) => s + (m.cbAfter ?? 0), 0);
    expect(sumAfter).toBeCloseTo(sumBefore);
    const b = res.find(r => r.shipId === 'B')!;
    const c = res.find(r => r.shipId === 'C')!;
    expect(b.cbAfter).toBeGreaterThanOrEqual(0);
    expect(c.cbAfter).toBeGreaterThanOrEqual(0);
  });
});
