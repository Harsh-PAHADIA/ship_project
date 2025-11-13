"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPool = createPool;
/**
 * Create pool allocations greedily:
 * - total sum must be >= 0
 * - deficits cannot exit worse
 * - surpluses cannot go negative
 */
function createPool(members) {
    const sum = members.reduce((s, m) => s + m.cbBefore, 0);
    if (sum < 0)
        throw new Error('Total adjusted CB of members is negative');
    // copy members and sort
    const byId = new Map(members.map(m => [m.shipId, { ...m }]));
    const surpluses = members.filter(m => m.cbBefore > 0).map(m => ({ ...m }));
    const deficits = members.filter(m => m.cbBefore < 0).map(m => ({ ...m }));
    // sort surpluses desc
    surpluses.sort((a, b) => b.cbBefore - a.cbBefore);
    // deficits sort most negative first (largest need)
    deficits.sort((a, b) => a.cbBefore - b.cbBefore);
    for (const s of surpluses) {
        let available = s.cbBefore;
        for (const d of deficits) {
            if (d.cbBefore >= 0)
                continue;
            const needed = Math.abs(d.cbBefore);
            const transfer = Math.min(available, needed);
            if (transfer <= 0)
                continue;
            d.cbBefore += transfer; // less negative
            available -= transfer;
            if (available <= 1e-9)
                break;
        }
        s.cbBefore = available;
    }
    // build cbAfter map and return
    const result = members.map(m => {
        const inSur = surpluses.find(s => s.shipId === m.shipId);
        const inDef = deficits.find(d => d.shipId === m.shipId);
        const cbAfter = inSur ? inSur.cbBefore : inDef ? inDef.cbBefore : m.cbBefore;
        return { ...m, cbAfter };
    });
    return result;
}
