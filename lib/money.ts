// lib/money.ts

/**
 * Parse various currency input formats to integer cents
 */
export function toCents(input: string): number | null {
  if (!input || input.trim() === '') return 0;
  
  // Remove currency symbols and commas, keep only numbers and decimal points
  const cleaned = input.replace(/[$,\s]/g, '');
  
  // Handle different decimal separators
  const normalized = cleaned.includes(',') && cleaned.split('.')[1]?.length === 2 
    ? cleaned.replace(',', '.') 
    : cleaned.replace(',', '');
  
  const parsed = parseFloat(normalized);
  
  if (isNaN(parsed) || parsed < 0) return null;
  
  // Convert to cents (multiply by 100)
  return Math.round(parsed * 100);
}

/**
 * Format cents back to currency string
 */
export function formatMoneyFromCents(cents?: number | null): string {
  if (cents === null || cents === undefined) return '$0.00';
  
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}
