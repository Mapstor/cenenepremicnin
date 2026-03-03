/**
 * ETN CSV Parser
 *
 * Parses ETN (Evidenca trga nepremičnin) CSV files from GURS.
 *
 * CRITICAL: Each ETN folder contains transactions from MANY years, not just that year.
 * The folder year indicates when GURS published the export, not the contract year.
 *
 * Processing strategy:
 * 1. Collect ALL POSLI from ALL folders, dedupe by ID_POSLA keeping latest update
 * 2. Collect ALL DELISTAVB from ALL folders, dedupe by ID_POSLA + STEVILKA_DELA_STAVBE
 * 3. THEN join deduplicated POSLI with deduplicated DELISTAVB
 * 4. Apply filters (TRZNOST_POSLA, etc.)
 * 5. Group by contract year (DATUM_SKLENITVE_POGODBE)
 *
 * Usage: npx tsx scripts/parse-etn.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import proj4 from 'proj4';

// Define EPSG:3794 (D96/TM) - Slovenian national coordinate system
proj4.defs(
  'EPSG:3794',
  '+proj=tmerc +lat_0=0 +lon_0=15 +k=0.9999 +x_0=500000 +y_0=-5000000 +ellps=GRS80 +units=m +no_defs'
);

// Types for CSV rows
interface PosliRow {
  ID_POSLA: string;
  VRSTA_KUPOPRODAJNEGA_POSLA: string;
  DATUM_UVELJAVITVE: string;
  DATUM_SKLENITVE_POGODBE: string;
  DATUM_ZADNJE_SPREMEMBE_POSLA: string;
  POGODBENA_CENA_ODSKODNINA: string;
  VKLJUCENOST_DDV: string;
  STOPNJA_DDV: string;
  VRSTA_AKTA: string;
  TRZNOST_POSLA: string;
  LETO: string;
}

interface DelistavbRow {
  ID_POSLA: string;
  SIFRA_KO: string;
  IME_KO: string;
  OBCINA: string;
  STEVILKA_STAVBE: string;
  STEVILKA_DELA_STAVBE: string;
  NASELJE: string;
  ULICA: string;
  HISNA_STEVILKA: string;
  DODATEK_HS: string;
  STEVILKA_STANOVANJA_ALI_POSLOVNEGA_PROSTORA: string;
  VRSTA_DELA_STAVBE: string;
  LETO_IZGRADNJE_DELA_STAVBE: string;
  NOVOGRADNJA: string;
  PRODANA_POVRSINA: string;
  PRODANA_UPORABNA_POVRSINA_DELA_STAVBE: string;
  PRODANA_POVRSINA_DELA_STAVBE: string;
  NADSTROPJE_DELA_STAVBE: string;
  STEVILO_SOB: string;
  POGODBENA_CENA_DELA_STAVBE: string;
  E_CENTROID: string;
  N_CENTROID: string;
  LETO: string;
}

// Output transaction type
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

// Property type labels (šifrant: VRSTA_DELA_STAVBE)
const PROPERTY_TYPE_LABELS: { [key: number]: string } = {
  1: 'Stanovanjska hiša',
  2: 'Stanovanje',
  3: 'Parkirni prostor',
  4: 'Garaža',
  5: 'Pisarniški prostori',
  6: 'Prostori za poslovanje s strankami',
  7: 'Prostori za zdravstveno dejavnost',
  8: 'Trgovski ali storitveni lokal',
  9: 'Gostinski lokal',
  10: 'Prostori za šport/kulturo/izobraževanje',
  11: 'Industrijski prostori',
  12: 'Turistični nastanitveni objekt',
  13: 'Kmetijski objekt',
  14: 'Tehnični ali pomožni prostori',
  15: 'Drugo',
};

// Slovenia bounding box in WGS84
const SLOVENIA_LAT_MIN = 45.42;
const SLOVENIA_LAT_MAX = 46.88;
const SLOVENIA_LON_MIN = 13.38;
const SLOVENIA_LON_MAX = 16.61;

/**
 * Convert D96/TM (EPSG:3794) coordinates to WGS84 (EPSG:4326)
 */
function d96ToWgs84(e: number, n: number): [number, number] {
  const [lon, lat] = proj4('EPSG:3794', 'EPSG:4326', [e, n]);
  return [lat, lon];
}

/**
 * Check if WGS84 coordinates are within Slovenia bounds
 */
function isInSlovenia(lat: number, lon: number): boolean {
  return (
    lat >= SLOVENIA_LAT_MIN &&
    lat <= SLOVENIA_LAT_MAX &&
    lon >= SLOVENIA_LON_MIN &&
    lon <= SLOVENIA_LON_MAX
  );
}

/**
 * Convert DD.MM.YYYY to YYYY-MM-DD
 */
function convertDateFormat(dateStr: string): string {
  if (!dateStr || dateStr.includes('-')) return dateStr;
  const parts = dateStr.split('.');
  if (parts.length !== 3) return dateStr;
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Build full address from components
 */
function buildAddress(row: DelistavbRow): string {
  const parts: string[] = [];

  if (row.ULICA) {
    let addr = row.ULICA;
    if (row.HISNA_STEVILKA) {
      addr += ` ${row.HISNA_STEVILKA}`;
      if (row.DODATEK_HS) {
        addr += row.DODATEK_HS;
      }
    }
    parts.push(addr);
  }

  if (row.NASELJE && row.NASELJE !== row.ULICA) {
    parts.push(row.NASELJE);
  }

  return parts.join(', ') || row.IME_KO || '';
}

/**
 * Parse a single CSV file
 */
function parseCSV<T>(filePath: string): T[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = Papa.parse<T>(content, {
    header: true,
    delimiter: ',',
    skipEmptyLines: true,
    transformHeader: (h) => h.replace(/^\uFEFF/, '').trim(), // Remove BOM
  });

  if (result.errors.length > 0) {
    console.warn(`  Warnings parsing ${path.basename(filePath)}:`, result.errors.slice(0, 3));
  }

  return result.data;
}

/**
 * Main processing function
 */
async function main() {
  const etnDir = path.join(process.cwd(), 'data', 'gurs', 'etn');
  const outputDir = path.join(process.cwd(), 'public', 'data', 'transactions');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Find all ETN year directories
  const dirs = fs.readdirSync(etnDir)
    .filter(d => d.startsWith('ETN_SLO_') && fs.statSync(path.join(etnDir, d)).isDirectory())
    .sort();

  console.log(`Found ${dirs.length} ETN directories\n`);

  // ============================================================
  // STEP 1: Collect ALL POSLI from ALL folders, dedupe by ID_POSLA
  // ============================================================
  console.log('=== STEP 1: Collecting all POSLI records ===\n');

  const allPosliMap = new Map<string, PosliRow & { _updateDate: string }>();
  let totalPosliRaw = 0;

  for (const dir of dirs) {
    const match = dir.match(/ETN_SLO_(\d{4})_/);
    if (!match) continue;

    const folderYear = parseInt(match[1], 10);
    const folderPath = path.join(etnDir, dir);
    const files = fs.readdirSync(folderPath);

    const posliFile = files.find(f => f.includes('_POSLI_'));
    if (!posliFile) {
      console.warn(`  No POSLI file in folder ${folderYear}`);
      continue;
    }

    console.log(`  Loading POSLI from folder ${folderYear}...`);
    const posliData = parseCSV<PosliRow>(path.join(folderPath, posliFile));
    totalPosliRaw += posliData.length;

    let added = 0;
    let updated = 0;

    for (const row of posliData) {
      const id = row.ID_POSLA;
      const updateDate = convertDateFormat(row.DATUM_ZADNJE_SPREMEMBE_POSLA || '');

      const existing = allPosliMap.get(id);
      if (!existing) {
        allPosliMap.set(id, { ...row, _updateDate: updateDate });
        added++;
      } else {
        // Keep the one with latest update date
        if (updateDate > existing._updateDate) {
          allPosliMap.set(id, { ...row, _updateDate: updateDate });
          updated++;
        }
      }
    }

    console.log(`    ${posliData.length} rows, added: ${added}, updated: ${updated}`);
  }

  console.log(`\nTotal raw POSLI rows: ${totalPosliRaw.toLocaleString()}`);
  console.log(`Unique POSLI after dedup: ${allPosliMap.size.toLocaleString()}\n`);

  // ============================================================
  // STEP 2: Collect ALL DELISTAVB from ALL folders, dedupe
  // ============================================================
  console.log('=== STEP 2: Collecting all DELISTAVB records ===\n');

  // Key: ID_POSLA + '_' + STEVILKA_DELA_STAVBE
  const allDelistavbMap = new Map<string, DelistavbRow>();
  let totalDelistavbRaw = 0;

  for (const dir of dirs) {
    const match = dir.match(/ETN_SLO_(\d{4})_/);
    if (!match) continue;

    const folderYear = parseInt(match[1], 10);
    const folderPath = path.join(etnDir, dir);
    const files = fs.readdirSync(folderPath);

    const delistavbFile = files.find(f => f.includes('_DELISTAVB_'));
    if (!delistavbFile) {
      console.warn(`  No DELISTAVB file in folder ${folderYear}`);
      continue;
    }

    console.log(`  Loading DELISTAVB from folder ${folderYear}...`);
    const delistavbData = parseCSV<DelistavbRow>(path.join(folderPath, delistavbFile));
    totalDelistavbRaw += delistavbData.length;

    let added = 0;
    let updated = 0;

    for (const row of delistavbData) {
      // Composite key: ID_POSLA + STEVILKA_DELA_STAVBE
      const key = `${row.ID_POSLA}_${row.STEVILKA_DELA_STAVBE || '0'}`;

      const existing = allDelistavbMap.get(key);
      if (!existing) {
        allDelistavbMap.set(key, row);
        added++;
      } else {
        // For DELISTAVB, prefer newer data (later folders have corrections)
        // We'll just overwrite since later folders are processed last
        allDelistavbMap.set(key, row);
        updated++;
      }
    }

    console.log(`    ${delistavbData.length} rows, added: ${added}, updated: ${updated}`);
  }

  console.log(`\nTotal raw DELISTAVB rows: ${totalDelistavbRaw.toLocaleString()}`);
  console.log(`Unique DELISTAVB after dedup: ${allDelistavbMap.size.toLocaleString()}\n`);

  // ============================================================
  // STEP 3: Filter POSLI and create lookup
  // ============================================================
  console.log('=== STEP 3: Filtering POSLI ===\n');

  const filteredPosliMap = new Map<string, PosliRow>();
  let posliFiltered = 0;
  let posliFilterReasons = {
    trznost: 0,
    vrstaKpp: 0,
    vrstaAkta: 0,
    noCena: 0,
  };

  for (const [id, row] of allPosliMap) {
    const trznost = parseInt(row.TRZNOST_POSLA, 10);
    const vrstaKpp = parseInt(row.VRSTA_KUPOPRODAJNEGA_POSLA, 10);
    const vrstaAkta = parseInt(row.VRSTA_AKTA, 10);
    const cena = parseFloat(row.POGODBENA_CENA_ODSKODNINA);

    // Filter criteria
    if (!(trznost === 1 || trznost === 4 || trznost === 5)) {
      posliFilterReasons.trznost++;
      continue;
    }
    if (!(vrstaKpp === 1 || vrstaKpp === 2)) {
      posliFilterReasons.vrstaKpp++;
      continue;
    }
    if (vrstaAkta !== 1) {
      posliFilterReasons.vrstaAkta++;
      continue;
    }
    if (isNaN(cena) || cena <= 0) {
      posliFilterReasons.noCena++;
      continue;
    }

    filteredPosliMap.set(id, row);
    posliFiltered++;
  }

  console.log(`POSLI after filtering: ${posliFiltered.toLocaleString()} / ${allPosliMap.size.toLocaleString()}`);
  console.log(`  Filtered out - TRZNOST: ${posliFilterReasons.trznost}, VRSTA_KPP: ${posliFilterReasons.vrstaKpp}, VRSTA_AKTA: ${posliFilterReasons.vrstaAkta}, No price: ${posliFilterReasons.noCena}\n`);

  // ============================================================
  // STEP 4: Join DELISTAVB with filtered POSLI
  // ============================================================
  console.log('=== STEP 4: Joining DELISTAVB with POSLI ===\n');

  const transactions: Transaction[] = [];
  let skippedNoMatch = 0;
  let skippedNoCoords = 0;
  let skippedOutOfBounds = 0;
  let skippedNoArea = 0;
  let skippedPriceRange = 0;

  for (const [key, ds] of allDelistavbMap) {
    const posliRow = filteredPosliMap.get(ds.ID_POSLA);
    if (!posliRow) {
      skippedNoMatch++;
      continue;
    }

    // Get coordinates
    const e = parseFloat(ds.E_CENTROID);
    const n = parseFloat(ds.N_CENTROID);

    if (isNaN(e) || isNaN(n) || e === 0 || n === 0) {
      skippedNoCoords++;
      continue;
    }

    // Convert coordinates
    const [lat, lon] = d96ToWgs84(e, n);

    if (!isInSlovenia(lat, lon)) {
      skippedOutOfBounds++;
      continue;
    }

    // Get area - prefer PRODANA_UPORABNA_POVRSINA_DELA_STAVBE
    let uporabnaPovrsina = parseFloat(ds.PRODANA_UPORABNA_POVRSINA_DELA_STAVBE);
    let povrsina = parseFloat(ds.PRODANA_POVRSINA_DELA_STAVBE);

    if (isNaN(povrsina) || povrsina <= 0) {
      povrsina = parseFloat(ds.PRODANA_POVRSINA);
    }
    if (isNaN(uporabnaPovrsina) || uporabnaPovrsina <= 0) {
      uporabnaPovrsina = povrsina;
    }

    if (isNaN(uporabnaPovrsina) || uporabnaPovrsina <= 0) {
      skippedNoArea++;
      continue;
    }

    // Get price - prefer POGODBENA_CENA_DELA_STAVBE if available
    let cena = parseFloat(ds.POGODBENA_CENA_DELA_STAVBE);
    if (isNaN(cena) || cena <= 0) {
      cena = parseFloat(posliRow.POGODBENA_CENA_ODSKODNINA);
    }

    if (isNaN(cena) || cena <= 0) {
      continue;
    }

    // Calculate price per m²
    const cenaNaM2 = cena / uporabnaPovrsina;

    // Filter extreme outliers
    if (cenaNaM2 < 100 || cenaNaM2 > 20000) {
      skippedPriceRange++;
      continue;
    }

    // Get property type
    const tip = parseInt(ds.VRSTA_DELA_STAVBE, 10);
    const tipNaziv = PROPERTY_TYPE_LABELS[tip] || 'Neznano';

    // Get year of construction
    const letoIzgradnje = parseInt(ds.LETO_IZGRADNJE_DELA_STAVBE, 10);

    // Check if new construction
    const novogradnja = ds.NOVOGRADNJA === '1';

    // Get number of rooms
    const steviloSob = parseInt(ds.STEVILO_SOB, 10);

    // Get floor
    const nadstropje = ds.NADSTROPJE_DELA_STAVBE || null;

    // Build address
    const naslov = buildAddress(ds);

    // Convert date
    const datum = convertDateFormat(posliRow.DATUM_SKLENITVE_POGODBE);

    transactions.push({
      id: parseInt(ds.ID_POSLA, 10),
      datum,
      cena: Math.round(cena),
      tip,
      tipNaziv,
      povrsina: Math.round(povrsina * 10) / 10,
      uporabnaPovrsina: Math.round(uporabnaPovrsina * 10) / 10,
      cenaNaM2: Math.round(cenaNaM2),
      lat: Math.round(lat * 100000) / 100000,
      lon: Math.round(lon * 100000) / 100000,
      sifraKo: parseInt(ds.SIFRA_KO, 10),
      imeKo: ds.IME_KO,
      obcina: ds.OBCINA,
      naslov,
      letoIzgradnje: isNaN(letoIzgradnje) ? null : letoIzgradnje,
      novogradnja,
      steviloSob: isNaN(steviloSob) ? null : steviloSob,
      nadstropje,
    });
  }

  console.log(`Joined transactions: ${transactions.length.toLocaleString()}`);
  console.log(`  Skipped - No POSLI match: ${skippedNoMatch.toLocaleString()}`);
  console.log(`  Skipped - No coords: ${skippedNoCoords.toLocaleString()}`);
  console.log(`  Skipped - Out of bounds: ${skippedOutOfBounds.toLocaleString()}`);
  console.log(`  Skipped - No area: ${skippedNoArea.toLocaleString()}`);
  console.log(`  Skipped - Price range: ${skippedPriceRange.toLocaleString()}\n`);

  // ============================================================
  // STEP 5: Deduplicate transactions by ID (same ID can have multiple parts)
  // Actually, we want to KEEP multiple parts for same ID_POSLA
  // But we need to ensure no exact duplicates
  // ============================================================
  console.log('=== STEP 5: Final deduplication ===\n');

  // Create a unique key for each transaction part
  const uniqueTransactions = new Map<string, Transaction>();
  for (const tx of transactions) {
    // Key includes ID and distinguishing features for multi-part transactions
    const key = `${tx.id}_${tx.sifraKo}_${tx.uporabnaPovrsina}_${tx.cena}`;
    if (!uniqueTransactions.has(key)) {
      uniqueTransactions.set(key, tx);
    }
  }

  console.log(`After final dedup: ${uniqueTransactions.size.toLocaleString()} (from ${transactions.length.toLocaleString()})\n`);

  // ============================================================
  // STEP 6: Group by contract year
  // ============================================================
  console.log('=== STEP 6: Grouping by contract year ===\n');

  const byYear = new Map<number, Transaction[]>();

  for (const tx of uniqueTransactions.values()) {
    const year = parseInt(tx.datum.substring(0, 4), 10);

    if (isNaN(year) || year < 2000 || year > 2030) {
      console.warn(`  Invalid year in datum: ${tx.datum} for ID ${tx.id}`);
      continue;
    }

    if (!byYear.has(year)) {
      byYear.set(year, []);
    }
    byYear.get(year)!.push(tx);
  }

  // ============================================================
  // STEP 7: Save each year to JSON
  // ============================================================
  console.log('=== STEP 7: Saving JSON files ===\n');

  const stats: { [year: string]: { total: number; byType: { [type: string]: number } } } = {};
  let totalTransactions = 0;

  const sortedYears = [...byYear.keys()].sort((a, b) => a - b);

  for (const year of sortedYears) {
    const yearTransactions = byYear.get(year)!;

    // Sort by date descending within each year
    yearTransactions.sort((a, b) => b.datum.localeCompare(a.datum));

    // Save to JSON
    const outputPath = path.join(outputDir, `${year}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(yearTransactions, null, 2));
    console.log(`Saved ${year}.json: ${yearTransactions.length.toLocaleString()} transactions`);

    // Collect stats
    const byType: { [type: string]: number } = {};
    for (const tx of yearTransactions) {
      byType[tx.tipNaziv] = (byType[tx.tipNaziv] || 0) + 1;
    }

    stats[year.toString()] = {
      total: yearTransactions.length,
      byType,
    };

    totalTransactions += yearTransactions.length;
  }

  // Print summary
  console.log('\n========== SUMMARY ==========\n');
  console.log(`Total unique transactions: ${totalTransactions.toLocaleString()}\n`);

  console.log('By contract year:');
  for (const [year, data] of Object.entries(stats).sort()) {
    console.log(`  ${year}: ${data.total.toLocaleString()}`);
  }

  console.log('\nBy property type (all years):');
  const totalByType: { [type: string]: number } = {};
  for (const data of Object.values(stats)) {
    for (const [type, count] of Object.entries(data.byType)) {
      totalByType[type] = (totalByType[type] || 0) + count;
    }
  }

  const sortedTypes = Object.entries(totalByType).sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sortedTypes) {
    console.log(`  ${type}: ${count.toLocaleString()}`);
  }

  console.log('\n========== DONE ==========\n');
}

main().catch(console.error);
