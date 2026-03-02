/**
 * ETN CSV Parser
 *
 * Parses ETN (Evidenca trga nepremičnin) CSV files from GURS.
 * Filters, joins POSLI with DELISTAVB, converts coordinates, and saves as JSON.
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
 * Process a single year of ETN data
 */
function processYear(yearDir: string, year: number): Transaction[] {
  const files = fs.readdirSync(yearDir);

  // Find POSLI and DELISTAVB files
  const posliFile = files.find(f => f.includes('_POSLI_'));
  const delistavbFile = files.find(f => f.includes('_DELISTAVB_'));

  if (!posliFile || !delistavbFile) {
    console.warn(`  Missing POSLI or DELISTAVB file for year ${year}`);
    return [];
  }

  console.log(`  Parsing ${posliFile}...`);
  const posli = parseCSV<PosliRow>(path.join(yearDir, posliFile));

  console.log(`  Parsing ${delistavbFile}...`);
  const delistavb = parseCSV<DelistavbRow>(path.join(yearDir, delistavbFile));

  // Filter POSLI
  const filteredPosli = posli.filter(row => {
    const trznost = parseInt(row.TRZNOST_POSLA, 10);
    const vrstaKpp = parseInt(row.VRSTA_KUPOPRODAJNEGA_POSLA, 10);
    const vrstaAkta = parseInt(row.VRSTA_AKTA, 10);
    const cena = parseFloat(row.POGODBENA_CENA_ODSKODNINA);

    return (
      (trznost === 1 || trznost === 4) && // Tržen posel or Neopredeljen posel
      (vrstaKpp === 1 || vrstaKpp === 2) && // Prosti trg or Javna dražba
      vrstaAkta === 1 &&                  // Osnovna pogodba
      cena > 0                            // Has price
    );
  });

  console.log(`  Filtered POSLI: ${filteredPosli.length} / ${posli.length}`);

  // Create lookup map for filtered POSLI
  const posliMap = new Map<string, PosliRow>();
  for (const row of filteredPosli) {
    posliMap.set(row.ID_POSLA, row);
  }

  // Join with DELISTAVB and create transactions
  const transactions: Transaction[] = [];
  let skippedNoCoords = 0;
  let skippedOutOfBounds = 0;
  let skippedNoArea = 0;
  let skippedPriceRange = 0;
  let skippedNoMatch = 0;

  for (const ds of delistavb) {
    const posliRow = posliMap.get(ds.ID_POSLA);
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

    // Get area - prefer PRODANA_UPORABNA_POVRSINA_DELA_STAVBE, fallback to PRODANA_POVRSINA_DELA_STAVBE
    let uporabnaPovrsina = parseFloat(ds.PRODANA_UPORABNA_POVRSINA_DELA_STAVBE);
    let povrsina = parseFloat(ds.PRODANA_POVRSINA_DELA_STAVBE);

    // Also check PRODANA_POVRSINA as another fallback
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

  console.log(`  Skipped - No match: ${skippedNoMatch}, No coords: ${skippedNoCoords}, Out of bounds: ${skippedOutOfBounds}, No area: ${skippedNoArea}, Price range: ${skippedPriceRange}`);
  console.log(`  Valid transactions: ${transactions.length}`);

  return transactions;
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

  const stats: { [year: string]: { total: number; byType: { [type: string]: number } } } = {};
  let totalTransactions = 0;

  for (const dir of dirs) {
    // Extract year from directory name (ETN_SLO_2024_KPP_20260301)
    const match = dir.match(/ETN_SLO_(\d{4})_/);
    if (!match) continue;

    const year = parseInt(match[1], 10);
    console.log(`Processing year ${year}...`);

    const yearPath = path.join(etnDir, dir);
    const transactions = processYear(yearPath, year);

    if (transactions.length === 0) {
      console.log(`  No transactions for year ${year}\n`);
      continue;
    }

    // Save to JSON
    const outputPath = path.join(outputDir, `${year}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(transactions, null, 2));
    console.log(`  Saved to ${outputPath}\n`);

    // Collect stats
    const byType: { [type: string]: number } = {};
    for (const tx of transactions) {
      byType[tx.tipNaziv] = (byType[tx.tipNaziv] || 0) + 1;
    }

    stats[year.toString()] = {
      total: transactions.length,
      byType,
    };

    totalTransactions += transactions.length;
  }

  // Print summary
  console.log('\n========== SUMMARY ==========\n');
  console.log(`Total transactions: ${totalTransactions.toLocaleString()}\n`);

  console.log('By year:');
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
