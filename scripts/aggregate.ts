/**
 * Aggregation Script
 *
 * Aggregates transaction data by katastrska občina (KO) and municipality (občina).
 * Calculates medians, trends, and quarterly time series.
 *
 * Usage: npx tsx scripts/aggregate.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Transaction type matching parse-etn.ts output
interface Transaction {
  id: number;
  datum: string;
  cena: number;
  tip: number;
  tipNaziv: string;
  povrsina: number;
  uporabnaPovrsina: number;
  cenaNaM2: number;
  lat: number;
  lon: number;
  sifraKo: number;
  imeKo: string;
  obcina: string;
  naslov: string;
  letoIzgradnje: number | null;
  novogradnja: boolean;
  steviloSob: number | null;
  nadstropje: string | null;
}

// Quarterly data point
interface QuarterData {
  mediana: number;
  stevilo: number;
}

// KO aggregated stats
interface KOStats {
  sifraKo: number;
  imeKo: string;
  obcina: string;
  medianaCenaM2: number | null;
  medianaCenaM2Stanovanja: number | null;
  medianaCenaM2Hise: number | null;
  steviloTransakcij: number;
  trendYoY: number | null;
  cetrtletja: { [quarter: string]: QuarterData };
}

// Price range stats
interface PriceRange {
  min: number;
  max: number;
  q1: number;  // 25th percentile
  q3: number;  // 75th percentile
}

// Property type breakdown
interface PropertyBreakdown {
  stanovanja: { stevilo: number; delez: number };
  hise: { stevilo: number; delez: number };
  ostalo: { stevilo: number; delez: number };
}

// Recent transaction (simplified for display)
interface RecentTransaction {
  id: number;
  datum: string;
  cena: number;
  tip: number;
  tipNaziv: string;
  uporabnaPovrsina: number;
  cenaNaM2: number;
  naslov: string;
  novogradnja: boolean;
}

// Občina aggregated stats
interface ObcinaStats {
  obcina: string;
  medianaCenaM2: number | null;
  medianaCenaM2Stanovanja: number | null;
  medianaCenaM2Hise: number | null;
  steviloTransakcij: number;
  trendYoY: number | null;
  cetrtletja: { [quarter: string]: QuarterData };
  // New context fields
  priceRange: PriceRange | null;
  propertyBreakdown: PropertyBreakdown;
  novogradnje: { stevilo: number; delez: number };
  avgPovrsina: number | null;
  busiestQuarter: string | null;
  recentTransactions: RecentTransaction[];
}

// Residential property types (used for chart medians to avoid garage outliers)
const RESIDENTIAL_TYPES = [1, 2]; // 1 = Hiša, 2 = Stanovanje

/**
 * Check if transaction is residential
 */
function isResidential(tx: Transaction): boolean {
  return RESIDENTIAL_TYPES.includes(tx.tip);
}

/**
 * Calculate median of a number array
 */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculate percentile of a number array
 */
function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

/**
 * Calculate price range with quartiles
 */
function calculatePriceRange(prices: number[]): PriceRange | null {
  if (prices.length < 5) return null;
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    q1: Math.round(percentile(prices, 25)),
    q3: Math.round(percentile(prices, 75)),
  };
}

/**
 * Get quarter string from date (YYYY-MM-DD)
 */
function getQuarter(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number);
  const q = Math.ceil(month / 3);
  return `${year}-Q${q}`;
}

/**
 * Get year from date string
 */
function getYear(dateStr: string): number {
  return parseInt(dateStr.split('-')[0], 10);
}

/**
 * Load all transaction JSON files
 */
function loadTransactions(dir: string): Transaction[] {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const allTransactions: Transaction[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const transactions: Transaction[] = JSON.parse(content);
    allTransactions.push(...transactions);
  }

  return allTransactions;
}

/**
 * Group transactions by a key function
 */
function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  }
  return groups;
}

/**
 * Calculate YoY trend (percentage change)
 */
function calculateTrend(lastYearPrices: number[], prevYearPrices: number[]): number | null {
  if (lastYearPrices.length < 3 || prevYearPrices.length < 3) {
    return null; // Not enough data
  }
  const lastMedian = median(lastYearPrices);
  const prevMedian = median(prevYearPrices);
  if (prevMedian === 0) return null;
  return Math.round(((lastMedian - prevMedian) / prevMedian) * 1000) / 10; // 1 decimal
}

/**
 * Aggregate by katastrska občina
 */
function aggregateByKO(transactions: Transaction[], currentYear: number): KOStats[] {
  const lastTwoYears = [currentYear, currentYear - 1];
  const trendYears = { last: currentYear - 1, prev: currentYear - 2 }; // Use completed years

  // Group by sifraKo
  const byKO = groupBy(transactions, tx => tx.sifraKo.toString());

  const stats: KOStats[] = [];

  for (const [sifraKoStr, koTransactions] of byKO) {
    const sifraKo = parseInt(sifraKoStr, 10);
    const firstTx = koTransactions[0];

    // Filter for last 2 years
    const recentTx = koTransactions.filter(tx => lastTwoYears.includes(getYear(tx.datum)));

    // Calculate medians
    const allPrices = recentTx.map(tx => tx.cenaNaM2);
    const stanovanjaPrices = recentTx.filter(tx => tx.tip === 2).map(tx => tx.cenaNaM2);
    const hisePrices = recentTx.filter(tx => tx.tip === 1).map(tx => tx.cenaNaM2);

    // Calculate trend (completed years)
    const lastYearTx = koTransactions.filter(tx => getYear(tx.datum) === trendYears.last);
    const prevYearTx = koTransactions.filter(tx => getYear(tx.datum) === trendYears.prev);
    const trend = calculateTrend(
      lastYearTx.map(tx => tx.cenaNaM2),
      prevYearTx.map(tx => tx.cenaNaM2)
    );

    // Calculate quarterly data for residential properties only
    // (excludes garages/parking which have extreme €/m² values that skew medians)
    const residentialTx = koTransactions.filter(isResidential);
    const byQuarter = groupBy(residentialTx, tx => getQuarter(tx.datum));
    const cetrtletja: { [quarter: string]: QuarterData } = {};
    for (const [quarter, qTx] of byQuarter) {
      cetrtletja[quarter] = {
        mediana: Math.round(median(qTx.map(tx => tx.cenaNaM2))),
        stevilo: qTx.length,
      };
    }

    stats.push({
      sifraKo,
      imeKo: firstTx.imeKo,
      obcina: firstTx.obcina,
      medianaCenaM2: allPrices.length >= 3 ? Math.round(median(allPrices)) : null,
      medianaCenaM2Stanovanja: stanovanjaPrices.length >= 3 ? Math.round(median(stanovanjaPrices)) : null,
      medianaCenaM2Hise: hisePrices.length >= 3 ? Math.round(median(hisePrices)) : null,
      steviloTransakcij: recentTx.length,
      trendYoY: trend,
      cetrtletja,
    });
  }

  return stats.sort((a, b) => b.steviloTransakcij - a.steviloTransakcij);
}

/**
 * Aggregate by občina (municipality)
 */
function aggregateByObcina(transactions: Transaction[], currentYear: number): ObcinaStats[] {
  const lastTwoYears = [currentYear, currentYear - 1];
  const trendYears = { last: currentYear - 1, prev: currentYear - 2 };

  // Group by obcina
  const byObcina = groupBy(transactions, tx => tx.obcina);

  const stats: ObcinaStats[] = [];

  for (const [obcina, obcinaTransactions] of byObcina) {
    // Filter for last 2 years
    const recentTx = obcinaTransactions.filter(tx => lastTwoYears.includes(getYear(tx.datum)));

    // Calculate medians
    const allPrices = recentTx.map(tx => tx.cenaNaM2);
    const stanovanjaPrices = recentTx.filter(tx => tx.tip === 2).map(tx => tx.cenaNaM2);
    const hisePrices = recentTx.filter(tx => tx.tip === 1).map(tx => tx.cenaNaM2);

    // Calculate trend
    const lastYearTx = obcinaTransactions.filter(tx => getYear(tx.datum) === trendYears.last);
    const prevYearTx = obcinaTransactions.filter(tx => getYear(tx.datum) === trendYears.prev);
    const trend = calculateTrend(
      lastYearTx.map(tx => tx.cenaNaM2),
      prevYearTx.map(tx => tx.cenaNaM2)
    );

    // Calculate quarterly data for residential properties only
    // (excludes garages/parking which have extreme €/m² values that skew medians)
    const residentialTx = obcinaTransactions.filter(isResidential);
    const byQuarter = groupBy(residentialTx, tx => getQuarter(tx.datum));
    const cetrtletja: { [quarter: string]: QuarterData } = {};
    for (const [quarter, qTx] of byQuarter) {
      cetrtletja[quarter] = {
        mediana: Math.round(median(qTx.map(tx => tx.cenaNaM2))),
        stevilo: qTx.length,
      };
    }

    // === NEW CONTEXT DATA ===

    // Price range for residential properties (recent 2 years)
    const recentResidentialPrices = recentTx.filter(isResidential).map(tx => tx.cenaNaM2);
    const priceRange = calculatePriceRange(recentResidentialPrices);

    // Property type breakdown (recent 2 years)
    const stanovanjaTx = recentTx.filter(tx => tx.tip === 2);
    const hiseTx = recentTx.filter(tx => tx.tip === 1);
    const ostaloTx = recentTx.filter(tx => tx.tip !== 1 && tx.tip !== 2);
    const totalRecent = recentTx.length || 1; // avoid division by zero
    const propertyBreakdown: PropertyBreakdown = {
      stanovanja: {
        stevilo: stanovanjaTx.length,
        delez: Math.round((stanovanjaTx.length / totalRecent) * 100),
      },
      hise: {
        stevilo: hiseTx.length,
        delez: Math.round((hiseTx.length / totalRecent) * 100),
      },
      ostalo: {
        stevilo: ostaloTx.length,
        delez: Math.round((ostaloTx.length / totalRecent) * 100),
      },
    };

    // New construction stats (recent 2 years, residential only)
    const recentResidential = recentTx.filter(isResidential);
    const novogradnjeTx = recentResidential.filter(tx => tx.novogradnja);
    const totalResidentialRecent = recentResidential.length || 1;
    const novogradnje = {
      stevilo: novogradnjeTx.length,
      delez: Math.round((novogradnjeTx.length / totalResidentialRecent) * 100),
    };

    // Average property size (residential, recent 2 years)
    const recentResidentialSizes = recentResidential.map(tx => tx.uporabnaPovrsina);
    const avgPovrsina = recentResidentialSizes.length >= 3
      ? Math.round(recentResidentialSizes.reduce((a, b) => a + b, 0) / recentResidentialSizes.length)
      : null;

    // Busiest quarter (most residential transactions)
    let busiestQuarter: string | null = null;
    let maxQuarterTx = 0;
    for (const [quarter, data] of Object.entries(cetrtletja)) {
      if (data.stevilo > maxQuarterTx) {
        maxQuarterTx = data.stevilo;
        busiestQuarter = quarter;
      }
    }

    // Recent transactions (last 10 residential sales, sorted by date descending)
    const recentTransactions: RecentTransaction[] = recentResidential
      .sort((a, b) => b.datum.localeCompare(a.datum))
      .slice(0, 10)
      .map(tx => ({
        id: tx.id,
        datum: tx.datum,
        cena: tx.cena,
        tip: tx.tip,
        tipNaziv: tx.tipNaziv,
        uporabnaPovrsina: tx.uporabnaPovrsina,
        cenaNaM2: tx.cenaNaM2,
        naslov: tx.naslov,
        novogradnja: tx.novogradnja,
      }));

    stats.push({
      obcina,
      medianaCenaM2: allPrices.length >= 3 ? Math.round(median(allPrices)) : null,
      medianaCenaM2Stanovanja: stanovanjaPrices.length >= 3 ? Math.round(median(stanovanjaPrices)) : null,
      medianaCenaM2Hise: hisePrices.length >= 3 ? Math.round(median(hisePrices)) : null,
      steviloTransakcij: recentTx.length,
      trendYoY: trend,
      cetrtletja,
      // New context fields
      priceRange,
      propertyBreakdown,
      novogradnje,
      avgPovrsina,
      busiestQuarter,
      recentTransactions,
    });
  }

  return stats.sort((a, b) => b.steviloTransakcij - a.steviloTransakcij);
}

/**
 * Main aggregation function
 */
async function main() {
  const transactionsDir = path.join(process.cwd(), 'public', 'data', 'transactions');
  const outputDir = path.join(process.cwd(), 'public', 'data');

  console.log('Loading transactions...');
  const transactions = loadTransactions(transactionsDir);
  console.log(`Loaded ${transactions.length.toLocaleString()} transactions\n`);

  // Determine current year from most recent transaction
  let currentYear = 2020;
  for (const tx of transactions) {
    const year = getYear(tx.datum);
    if (year > currentYear) currentYear = year;
  }
  console.log(`Current year (for aggregation): ${currentYear}\n`);

  // Aggregate by KO
  console.log('Aggregating by katastrska občina...');
  const koStats = aggregateByKO(transactions, currentYear);
  console.log(`  ${koStats.length} katastrske občine`);

  // Aggregate by občina
  console.log('Aggregating by občina...');
  const obcinaStats = aggregateByObcina(transactions, currentYear);
  console.log(`  ${obcinaStats.length} občine`);

  // Save outputs
  const koOutputPath = path.join(outputDir, 'aggregated-ko.json');
  fs.writeFileSync(koOutputPath, JSON.stringify(koStats, null, 2));
  console.log(`\nSaved: ${koOutputPath}`);

  const obcinaOutputPath = path.join(outputDir, 'aggregated-obcine.json');
  fs.writeFileSync(obcinaOutputPath, JSON.stringify(obcinaStats, null, 2));
  console.log(`Saved: ${obcinaOutputPath}`);

  // Print summary stats
  console.log('\n========== SUMMARY ==========\n');

  // KO stats
  const kosWithData = koStats.filter(ko => ko.medianaCenaM2 !== null);
  console.log(`Katastrske občine z dovolj podatki: ${kosWithData.length} / ${koStats.length}`);

  // Top 10 KO by price
  console.log('\nTop 10 KO po mediani cene/m² (stanovanja):');
  const topKoStanovanja = koStats
    .filter(ko => ko.medianaCenaM2Stanovanja !== null)
    .sort((a, b) => (b.medianaCenaM2Stanovanja || 0) - (a.medianaCenaM2Stanovanja || 0))
    .slice(0, 10);
  for (const ko of topKoStanovanja) {
    console.log(`  ${ko.imeKo}, ${ko.obcina}: ${ko.medianaCenaM2Stanovanja?.toLocaleString()} €/m² (${ko.steviloTransakcij} transakcij)`);
  }

  // Občina stats
  const obcineWithData = obcinaStats.filter(o => o.medianaCenaM2 !== null);
  console.log(`\nObčine z dovolj podatki: ${obcineWithData.length} / ${obcinaStats.length}`);

  // Top 10 občine by price
  console.log('\nTop 10 občin po mediani cene/m² (stanovanja):');
  const topObcineStanovanja = obcinaStats
    .filter(o => o.medianaCenaM2Stanovanja !== null)
    .sort((a, b) => (b.medianaCenaM2Stanovanja || 0) - (a.medianaCenaM2Stanovanja || 0))
    .slice(0, 10);
  for (const o of topObcineStanovanja) {
    console.log(`  ${o.obcina}: ${o.medianaCenaM2Stanovanja?.toLocaleString()} €/m² (${o.steviloTransakcij} transakcij)`);
  }

  // Biggest YoY increases
  console.log('\nNajvečje podražitve (YoY) - občine:');
  const biggestIncreases = obcinaStats
    .filter(o => o.trendYoY !== null && o.steviloTransakcij >= 20)
    .sort((a, b) => (b.trendYoY || 0) - (a.trendYoY || 0))
    .slice(0, 10);
  for (const o of biggestIncreases) {
    const sign = (o.trendYoY || 0) >= 0 ? '+' : '';
    console.log(`  ${o.obcina}: ${sign}${o.trendYoY?.toFixed(1)}%`);
  }

  console.log('\n========== DONE ==========\n');
}

main().catch(console.error);
