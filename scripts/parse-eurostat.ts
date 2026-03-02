/**
 * Eurostat HPI Parser
 *
 * Parses Eurostat House Price Index data (JSON-stat format).
 * Can fetch fresh data from Eurostat API or parse existing files.
 *
 * Usage: npx tsx scripts/parse-eurostat.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Eurostat JSON-stat2 structure
interface EurostatJsonStat {
  version: string;
  class: string;
  label: string;
  source: string;
  updated: string;
  id: string[];
  size: number[];
  dimension: {
    [key: string]: {
      label: string;
      category: {
        index: { [key: string]: number };
        label: { [key: string]: string };
      };
    };
  };
  value: { [key: string]: number } | number[];
}

// Output record type
interface EurostatHPI {
  quarter: string;      // "2024-Q3"
  country: string;      // "SI"
  countryName: string;  // "Slovenia"
  value: number;        // Index value (2015=100)
}

// Country name mapping
const COUNTRY_NAMES: { [code: string]: string } = {
  'AT': 'Avstrija',
  'BE': 'Belgija',
  'BG': 'Bolgarija',
  'CY': 'Ciper',
  'CZ': 'Češka',
  'DE': 'Nemčija',
  'DK': 'Danska',
  'EE': 'Estonija',
  'EL': 'Grčija',
  'ES': 'Španija',
  'EU27_2020': 'EU-27',
  'FI': 'Finska',
  'FR': 'Francija',
  'HR': 'Hrvaška',
  'HU': 'Madžarska',
  'IE': 'Irska',
  'IT': 'Italija',
  'LT': 'Litva',
  'LU': 'Luksemburg',
  'LV': 'Latvija',
  'MT': 'Malta',
  'NL': 'Nizozemska',
  'PL': 'Poljska',
  'PT': 'Portugalska',
  'RO': 'Romunija',
  'SE': 'Švedska',
  'SI': 'Slovenija',
  'SK': 'Slovaška',
};

// Countries to include (Slovenia + neighbors + major EU economies for comparison)
const COUNTRIES_OF_INTEREST = [
  'SI', // Slovenia
  'AT', // Austria (neighbor)
  'HR', // Croatia (neighbor)
  'HU', // Hungary (neighbor)
  'IT', // Italy (neighbor)
  'DE', // Germany (major economy)
  'EU27_2020', // EU average
];

/**
 * Fetch data from Eurostat API
 */
async function fetchEurostatData(): Promise<EurostatJsonStat> {
  // Eurostat API URL for House Price Index
  // PRC_HPI_Q = quarterly HPI
  // geo = countries (must be separate parameters for each country)
  // unit = I15_Q (index 2015=100 quarterly)
  // purchase = TOTAL
  const baseUrl = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hpi_q';

  // Build URL with multiple geo parameters (Eurostat requires this format)
  const params = new URLSearchParams({
    format: 'JSON',
    lang: 'EN',
    purchase: 'TOTAL',
    unit: 'I15_Q',
    sinceTimePeriod: '2007-Q1',
  });

  // Add each country as separate geo parameter
  for (const geo of COUNTRIES_OF_INTEREST) {
    params.append('geo', geo);
  }

  const url = `${baseUrl}?${params.toString()}`;
  console.log(`Fetching: ${url.substring(0, 100)}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Eurostat API error: ${response.status} ${response.statusText}`);
  }

  const data: EurostatJsonStat = await response.json();
  return data;
}

/**
 * Parse Eurostat JSON-stat format
 */
function parseEurostatJsonStat(data: EurostatJsonStat): EurostatHPI[] {
  const records: EurostatHPI[] = [];

  // Get dimensions
  const geoDim = data.dimension.geo;
  const timeDim = data.dimension.time;

  if (!geoDim || !timeDim) {
    console.warn('Missing geo or time dimension');
    return records;
  }

  const geoIndex = geoDim.category.index;
  const geoLabels = geoDim.category.label;
  const timeIndex = timeDim.category.index;

  // Get dimension positions for index calculation
  const dimOrder = data.id;
  const sizes = data.size;

  // Find positions of geo and time in dimensions
  const geoPos = dimOrder.indexOf('geo');
  const timePos = dimOrder.indexOf('time');

  if (geoPos === -1 || timePos === -1) {
    console.warn('Cannot find geo or time dimension position');
    return records;
  }

  // Calculate strides for each dimension
  const strides: number[] = [];
  let stride = 1;
  for (let i = sizes.length - 1; i >= 0; i--) {
    strides[i] = stride;
    stride *= sizes[i];
  }

  // Values can be object (sparse) or array (dense)
  const values = data.value;
  const isObject = typeof values === 'object' && !Array.isArray(values);

  // Sort geo codes and time periods
  const geoCodes = Object.entries(geoIndex).sort((a, b) => a[1] - b[1]).map(e => e[0]);
  const timePeriods = Object.entries(timeIndex).sort((a, b) => a[1] - b[1]).map(e => e[0]);

  console.log(`  Countries: ${geoCodes.length}`);
  console.log(`  Time periods: ${timePeriods.length}`);

  // Iterate through all combinations
  for (const geo of geoCodes) {
    const geoIdx = geoIndex[geo];
    const countryName = COUNTRY_NAMES[geo] || geoLabels[geo] || geo;

    for (const time of timePeriods) {
      const timeIdx = timeIndex[time];

      // Calculate flat index
      // Index = sum of (dimIdx * stride) for each dimension
      // Other dimensions (freq, purchase, unit) are typically size 1
      let flatIdx = 0;
      for (let d = 0; d < dimOrder.length; d++) {
        if (dimOrder[d] === 'geo') {
          flatIdx += geoIdx * strides[d];
        } else if (dimOrder[d] === 'time') {
          flatIdx += timeIdx * strides[d];
        }
        // Other dims assumed to be 0 (first/only value)
      }

      let value: number | undefined;
      if (isObject) {
        value = (values as { [key: string]: number })[flatIdx.toString()];
      } else {
        value = (values as number[])[flatIdx];
      }

      if (value !== undefined && value !== null) {
        records.push({
          quarter: time,
          country: geo,
          countryName,
          value: Math.round(value * 100) / 100,
        });
      }
    }
  }

  return records;
}

/**
 * Main function
 */
async function main() {
  const eurostatDir = path.join(process.cwd(), 'data', 'eurostat');
  const outputDir = path.join(process.cwd(), 'public', 'data');

  // Ensure directories exist
  if (!fs.existsSync(eurostatDir)) {
    fs.mkdirSync(eurostatDir, { recursive: true });
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('=== Parsing Eurostat HPI Data ===\n');

  let data: EurostatJsonStat;

  // Try to load existing file first
  const cachedPath = path.join(eurostatDir, 'hpi_quarterly_cached.json');

  // Check if cached file exists and is recent (less than 7 days old)
  let useCache = false;
  if (fs.existsSync(cachedPath)) {
    const stats = fs.statSync(cachedPath);
    const ageMs = Date.now() - stats.mtimeMs;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays < 7) {
      console.log(`Using cached data (${ageDays.toFixed(1)} days old)`);
      useCache = true;
    } else {
      console.log(`Cache is ${ageDays.toFixed(1)} days old, fetching fresh data...`);
    }
  }

  if (useCache) {
    const content = fs.readFileSync(cachedPath, 'utf-8');
    data = JSON.parse(content);
  } else {
    try {
      data = await fetchEurostatData();
      // Save to cache
      fs.writeFileSync(cachedPath, JSON.stringify(data, null, 2));
      console.log(`Cached to: ${cachedPath}\n`);
    } catch (error) {
      console.error('Failed to fetch from Eurostat API:', error);

      // Try to use any existing cached data as fallback
      if (fs.existsSync(cachedPath)) {
        console.log('Using existing cache as fallback...');
        const content = fs.readFileSync(cachedPath, 'utf-8');
        data = JSON.parse(content);
      } else {
        console.error('No cached data available. Please check your internet connection.');
        process.exit(1);
      }
    }
  }

  // Parse the data
  console.log('Parsing JSON-stat data...');
  const records = parseEurostatJsonStat(data);

  if (records.length === 0) {
    console.error('No records parsed. The API response may be empty.');
    process.exit(1);
  }

  console.log(`Parsed ${records.length} records`);

  // Sort by quarter and country
  records.sort((a, b) => {
    const quarterCmp = a.quarter.localeCompare(b.quarter);
    if (quarterCmp !== 0) return quarterCmp;
    return a.country.localeCompare(b.country);
  });

  // Save full data
  const fullOutputPath = path.join(outputDir, 'eurostat-hpi-full.json');
  fs.writeFileSync(fullOutputPath, JSON.stringify(records, null, 2));
  console.log(`\nSaved full data: ${fullOutputPath}`);

  // Create Slovenia-only time series (most useful for frontend)
  const sloveniaData = records.filter(r => r.country === 'SI');
  const sloveniaOutputPath = path.join(outputDir, 'eurostat-hpi-si.json');
  fs.writeFileSync(sloveniaOutputPath, JSON.stringify(sloveniaData, null, 2));
  console.log(`Saved Slovenia data: ${sloveniaOutputPath}`);

  // Create comparison dataset (Slovenia vs EU average)
  interface ComparisonRow {
    quarter: string;
    SI: number | null;
    EU27_2020: number | null;
    AT: number | null;
    HR: number | null;
  }

  const quarters = [...new Set(records.map(r => r.quarter))].sort();
  const comparison: ComparisonRow[] = [];

  for (const quarter of quarters) {
    const quarterRecords = records.filter(r => r.quarter === quarter);
    const si = quarterRecords.find(r => r.country === 'SI');
    const eu = quarterRecords.find(r => r.country === 'EU27_2020');
    const at = quarterRecords.find(r => r.country === 'AT');
    const hr = quarterRecords.find(r => r.country === 'HR');

    comparison.push({
      quarter,
      SI: si?.value ?? null,
      EU27_2020: eu?.value ?? null,
      AT: at?.value ?? null,
      HR: hr?.value ?? null,
    });
  }

  const comparisonOutputPath = path.join(outputDir, 'eurostat-hpi.json');
  fs.writeFileSync(comparisonOutputPath, JSON.stringify(comparison, null, 2));
  console.log(`Saved comparison data: ${comparisonOutputPath}`);

  // Print summary
  console.log('\n========== SUMMARY ==========\n');
  console.log(`Total records: ${records.length}`);
  console.log(`Countries: ${[...new Set(records.map(r => r.country))].join(', ')}`);
  console.log(`Quarters: ${quarters.length} (${quarters[0]} to ${quarters[quarters.length - 1]})`);

  // Show recent Slovenia values
  console.log('\nRecent Slovenia HPI values (2015=100):');
  const recentSI = sloveniaData.slice(-8);
  for (const r of recentSI) {
    const change = r.value - 100;
    console.log(`  ${r.quarter}: ${r.value.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(1)}% vs 2015)`);
  }

  // Compare with EU
  console.log('\nLatest comparison (vs EU-27):');
  const latest = comparison[comparison.length - 1];
  if (latest) {
    console.log(`  ${latest.quarter}:`);
    console.log(`    Slovenija: ${latest.SI?.toFixed(1) ?? 'N/A'}`);
    console.log(`    EU-27:     ${latest.EU27_2020?.toFixed(1) ?? 'N/A'}`);
    console.log(`    Avstrija:  ${latest.AT?.toFixed(1) ?? 'N/A'}`);
    console.log(`    Hrvaška:   ${latest.HR?.toFixed(1) ?? 'N/A'}`);
  }

  console.log('\n========== DONE ==========\n');
}

main().catch(console.error);
