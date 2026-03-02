/**
 * SiStat JSON-stat2 Parser
 *
 * Parses SI-STAT quarterly housing price indices (JSON-stat format).
 * Extracts time series data for visualization.
 *
 * Usage: npx tsx scripts/parse-sistat.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// JSON-stat2 dataset structure
// Note: SiStat puts id/size arrays inside dimension object, not at dataset level
interface JsonStatDataset {
  dataset: {
    dimension: {
      [key: string]: {
        label: string;
        category: {
          index: { [key: string]: number };
          label: { [key: string]: string };
        };
      };
    } & {
      id: string[];
      size: number[];
    };
    value: (number | null)[];
    label: string;
    source: string;
    updated: string;
  };
}

// Output record type
interface SiStatIndex {
  quarter: string;        // "2024-Q3"
  indexType: string;      // "QoQ", "YoY", "Base2015"
  indexTypeLabel: string; // Full Slovenian label
  value: number | null;
}

// Index type mapping (from šifrant)
const INDEX_TYPE_MAP: { [key: string]: string } = {
  '1': 'QoY',      // Četrtletje / zadnje četrtletje prejšnjega leta
  '2': 'QoQ',      // Četrtletje / prejšnje četrtletje
  '3': 'YoY',      // Četrtletje / isto četrtletje prejšnjega leta
  '4': 'Base2015', // Četrtletje / povprečje četrtletij leta 2015
};

/**
 * Convert SiStat quarter format (2024Q3) to ISO format (2024-Q3)
 */
function normalizeQuarter(quarter: string): string {
  // 2024Q3 -> 2024-Q3
  if (quarter.includes('Q') && !quarter.includes('-')) {
    return quarter.replace('Q', '-Q');
  }
  return quarter;
}

/**
 * Parse SiStat JSON-stat2 format
 */
function parseSiStatJsonStat(filePath: string): SiStatIndex[] {
  console.log(`Parsing: ${path.basename(filePath)}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  const data: JsonStatDataset = JSON.parse(content);
  const dataset = data.dataset;

  // Get dimension info (id and size are inside dimension object in SiStat format)
  const dimObj = dataset.dimension as { id: string[]; size: number[]; [key: string]: unknown };
  const dimensions = dimObj.id;
  const sizes = dimObj.size;
  const values = dataset.value;

  console.log(`  Dimensions: ${dimensions.join(', ')}`);
  console.log(`  Sizes: ${sizes.join(' × ')} = ${values.length} values`);

  // Build dimension lookup arrays
  const dimCategories: { [dim: string]: string[] } = {};
  for (const dimName of dimensions) {
    const dim = dataset.dimension[dimName];
    const indexMap = dim.category.index;
    // Sort by index value to get correct order
    const sortedKeys = Object.entries(indexMap)
      .sort((a, b) => a[1] - b[1])
      .map(entry => entry[0]);
    dimCategories[dimName] = sortedKeys;
  }

  // Parse flat value array into records
  const records: SiStatIndex[] = [];

  // For this dataset: dimensions are [ČETRTLETJE, INDEKS]
  // Values are in row-major order: first all indices for Q1, then all for Q2, etc.
  const quarterDim = dimensions[0]; // ČETRTLETJE
  const indexDim = dimensions[1];   // INDEKS
  const quarters = dimCategories[quarterDim];
  const indices = dimCategories[indexDim];

  let valueIdx = 0;
  for (let q = 0; q < quarters.length; q++) {
    for (let i = 0; i < indices.length; i++) {
      const value = values[valueIdx];
      const quarter = quarters[q];
      const indexCode = indices[i];

      const indexTypeLabel = dataset.dimension[indexDim].category.label[indexCode];
      const indexType = INDEX_TYPE_MAP[indexCode] || indexCode;

      records.push({
        quarter: normalizeQuarter(quarter),
        indexType,
        indexTypeLabel,
        value: value !== null ? Math.round(value * 100) / 100 : null,
      });

      valueIdx++;
    }
  }

  console.log(`  Parsed ${records.length} records`);
  return records;
}

/**
 * Main function
 */
async function main() {
  const sistatDir = path.join(process.cwd(), 'data', 'sistat');
  const outputDir = path.join(process.cwd(), 'public', 'data');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('=== Parsing SiStat Data ===\n');

  // Parse quarterly indices
  const quarterlyPath = path.join(sistatDir, 'data_indeksi_stan_cetrtletno.json');
  if (!fs.existsSync(quarterlyPath)) {
    console.error(`File not found: ${quarterlyPath}`);
    console.error('Please download SiStat data first.');
    process.exit(1);
  }

  const quarterlyData = parseSiStatJsonStat(quarterlyPath);

  // Filter to just the most useful index types for visualization
  // Base2015 is the absolute index (2015=100), most useful for charts
  // YoY is year-over-year change, useful for trend analysis
  const base2015Data = quarterlyData.filter(r => r.indexType === 'Base2015');
  const yoyData = quarterlyData.filter(r => r.indexType === 'YoY');

  // Create combined output structure
  interface TimeSeries {
    quarter: string;
    base2015: number | null;
    yoy: number | null;
  }

  const combined: TimeSeries[] = [];
  const quarterSet = new Set(quarterlyData.map(r => r.quarter));

  for (const quarter of Array.from(quarterSet).sort()) {
    const base = base2015Data.find(r => r.quarter === quarter);
    const yoy = yoyData.find(r => r.quarter === quarter);

    combined.push({
      quarter,
      base2015: base?.value ?? null,
      yoy: yoy?.value ?? null,
    });
  }

  // Save full data
  const fullOutputPath = path.join(outputDir, 'sistat-indices-full.json');
  fs.writeFileSync(fullOutputPath, JSON.stringify(quarterlyData, null, 2));
  console.log(`\nSaved full data: ${fullOutputPath}`);

  // Save combined time series (most useful for frontend)
  const outputPath = path.join(outputDir, 'sistat-indices.json');
  fs.writeFileSync(outputPath, JSON.stringify(combined, null, 2));
  console.log(`Saved time series: ${outputPath}`);

  // Print summary
  console.log('\n========== SUMMARY ==========\n');
  console.log(`Total records: ${quarterlyData.length}`);
  console.log(`Quarters: ${quarterSet.size} (${Array.from(quarterSet).sort()[0]} to ${Array.from(quarterSet).sort().pop()})`);
  console.log(`Index types: ${[...new Set(quarterlyData.map(r => r.indexType))].join(', ')}`);

  // Show recent values
  console.log('\nRecent Base2015 index values:');
  const recentBase = combined.slice(-8);
  for (const r of recentBase) {
    console.log(`  ${r.quarter}: ${r.base2015?.toFixed(2) ?? 'N/A'} (YoY: ${r.yoy !== null ? (r.yoy >= 100 ? '+' : '') + (r.yoy - 100).toFixed(1) + '%' : 'N/A'})`);
  }

  console.log('\n========== DONE ==========\n');
}

main().catch(console.error);
