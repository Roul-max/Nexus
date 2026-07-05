/**
 * Formats a number as INR currency.
 * Assumes the input amount is in the smallest currency unit (e.g., paise) and divides by 100.
 * @param amountInPaise The amount in paise.
 * @returns The formatted currency string (e.g., "₹10,000").
 */
export function formatCurrency(amountInPaise: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amountInPaise / 100);
}