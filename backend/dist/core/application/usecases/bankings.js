"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBankAmount = validateBankAmount;
exports.validateApplyAmount = validateApplyAmount;
/**
 * Bank a positive CB amount (in memory logic / DB adapter will persist)
 * Validates amount positive.
 */
function validateBankAmount(amount) {
    if (amount <= 0)
        throw new Error('Amount must be positive to bank.');
}
/**
 * Apply banked amount - ensures not exceeding available.
 */
function validateApplyAmount(available, amount) {
    if (amount <= 0)
        throw new Error('Amount must be positive to apply.');
    if (available < amount)
        throw new Error('Insufficient banked amount available.');
}
