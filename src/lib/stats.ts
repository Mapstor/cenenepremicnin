/**
 * Calculate median of an array of numbers
 * @param values - Array of numbers
 * @returns Median value, or 0 if array is empty
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculate percentile of an array of numbers
 * @param values - Array of numbers
 * @param p - Percentile (0-100)
 * @returns Value at percentile, or 0 if array is empty
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  if (p <= 0) return Math.min(...values);
  if (p >= 100) return Math.max(...values);

  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Round number to specified decimal places
 * @param value - Number to round
 * @param decimals - Number of decimal places (default: 0)
 * @returns Rounded number
 */
export function roundTo(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate mean (average) of an array of numbers
 * @param values - Array of numbers
 * @returns Mean value, or 0 if array is empty
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate standard deviation
 * @param values - Array of numbers
 * @returns Standard deviation, or 0 if array is empty
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const squareDiffs = values.map((val) => Math.pow(val - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

/**
 * Calculate year-over-year change percentage
 * @param currentValue - Current period value
 * @param previousValue - Previous period value
 * @returns Percentage change, or 0 if previous value is 0
 */
export function yoyChange(currentValue: number, previousValue: number): number {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
}

/**
 * Group array items by a key
 * @param items - Array of items
 * @param keyFn - Function to extract grouping key
 * @returns Object with grouped items
 */
export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string
): { [key: string]: T[] } {
  return items.reduce(
    (groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    },
    {} as { [key: string]: T[] }
  );
}

/**
 * Count items by a key
 * @param items - Array of items
 * @param keyFn - Function to extract counting key
 * @returns Object with counts
 */
export function countBy<T>(
  items: T[],
  keyFn: (item: T) => string
): { [key: string]: number } {
  return items.reduce(
    (counts, item) => {
      const key = keyFn(item);
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    },
    {} as { [key: string]: number }
  );
}

/**
 * Calculate summary statistics for an array of numbers
 */
export function summarize(values: number[]): {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  p25: number;
  p75: number;
} {
  if (values.length === 0) {
    return {
      count: 0,
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      stdDev: 0,
      p25: 0,
      p75: 0,
    };
  }

  return {
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    mean: mean(values),
    median: median(values),
    stdDev: standardDeviation(values),
    p25: percentile(values, 25),
    p75: percentile(values, 75),
  };
}

/**
 * Check if a value is an outlier using IQR method
 * @param value - Value to check
 * @param values - Array of all values
 * @param multiplier - IQR multiplier (default: 1.5)
 * @returns true if value is an outlier
 */
export function isOutlier(
  value: number,
  values: number[],
  multiplier: number = 1.5
): boolean {
  const q1 = percentile(values, 25);
  const q3 = percentile(values, 75);
  const iqr = q3 - q1;
  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;
  return value < lowerBound || value > upperBound;
}

/**
 * Remove outliers from array using IQR method
 * @param values - Array of numbers
 * @param multiplier - IQR multiplier (default: 1.5)
 * @returns Array with outliers removed
 */
export function removeOutliers(
  values: number[],
  multiplier: number = 1.5
): number[] {
  const q1 = percentile(values, 25);
  const q3 = percentile(values, 75);
  const iqr = q3 - q1;
  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;
  return values.filter((v) => v >= lowerBound && v <= upperBound);
}
