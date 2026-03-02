// Slovenian locale formatting utilities

/**
 * Format price in EUR with Slovenian locale
 * @example formatPrice(155000) → "155.000 €"
 */
export function formatPrice(eur: number): string {
  return new Intl.NumberFormat('sl-SI', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(eur);
}

/**
 * Format price per square meter
 * @example formatPricePerM2(2450) → "2.450 €/m²"
 */
export function formatPricePerM2(eur: number): string {
  return `${new Intl.NumberFormat('sl-SI', { maximumFractionDigits: 0 }).format(eur)} €/m²`;
}

/**
 * Format date in Slovenian locale
 * @example formatDate("2024-03-15") → "15. marec 2024"
 */
export function formatDate(dateStr: string): string {
  // Handle both YYYY-MM-DD and DD.MM.YYYY formats
  let d: Date;
  if (dateStr.includes('-')) {
    d = new Date(dateStr);
  } else if (dateStr.includes('.')) {
    const [day, month, year] = dateStr.split('.');
    d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else {
    d = new Date(dateStr);
  }
  return d.toLocaleDateString('sl-SI', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format date short (for tables)
 * @example formatDateShort("2024-03-15") → "15. 3. 2024"
 */
export function formatDateShort(dateStr: string): string {
  let d: Date;
  if (dateStr.includes('-')) {
    d = new Date(dateStr);
  } else if (dateStr.includes('.')) {
    const [day, month, year] = dateStr.split('.');
    d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else {
    d = new Date(dateStr);
  }
  return d.toLocaleDateString('sl-SI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format area in square meters
 * @example formatArea(68.5) → "68,5 m²"
 */
export function formatArea(m2: number): string {
  return `${new Intl.NumberFormat('sl-SI', { maximumFractionDigits: 1 }).format(m2)} m²`;
}

/**
 * Format number with Slovenian locale
 * @example formatNumber(12345.67) → "12.345,67"
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('sl-SI', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format percentage
 * @example formatPercent(15.5) → "15,5 %"
 * @example formatPercent(15.5, true) → "+15,5 %"
 */
export function formatPercent(value: number, showSign: boolean = false): string {
  const formatted = new Intl.NumberFormat('sl-SI', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);

  if (showSign && value > 0) {
    return `+${formatted} %`;
  }
  return `${formatted} %`;
}

/**
 * Format year-over-year trend
 * @example formatTrend(5.2) → "+5,2 %"
 * @example formatTrend(-3.1) → "-3,1 %"
 */
export function formatTrend(value: number): string {
  return formatPercent(value, true);
}

/**
 * Convert DD.MM.YYYY to YYYY-MM-DD
 * @example convertDateFormat("15.03.2024") → "2024-03-15"
 */
export function convertDateFormat(dateStr: string): string {
  if (dateStr.includes('-')) return dateStr; // Already ISO format
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Get quarter string from date
 * @example getQuarter("2024-03-15") → "2024-Q1"
 */
export function getQuarter(dateStr: string): string {
  const d = new Date(dateStr.includes('.') ? convertDateFormat(dateStr) : dateStr);
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${q}`;
}

/**
 * Get year from date string
 * @example getYear("2024-03-15") → 2024
 */
export function getYear(dateStr: string): number {
  if (dateStr.includes('-')) {
    return parseInt(dateStr.split('-')[0]);
  } else if (dateStr.includes('.')) {
    return parseInt(dateStr.split('.')[2]);
  }
  return new Date(dateStr).getFullYear();
}
