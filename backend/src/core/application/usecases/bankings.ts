export type BankEntry = {
  shipId: string;
  year: number;
  amount_tonnes: number;
  created_at?: string;
};

/**
 * Bank a positive CB amount (in memory logic / DB adapter will persist)
 * Validates amount positive.
 */
export function validateBankAmount(amount: number) {
  if (amount <= 0) throw new Error('Amount must be positive to bank.');
}

/**
 * Apply banked amount - ensures not exceeding available.
 */
export function validateApplyAmount(available: number, amount: number) {
  if (amount <= 0) throw new Error('Amount must be positive to apply.');
  if (available < amount) throw new Error('Insufficient banked amount available.');
}
