/**
 * ETN ZEMLJISCA CSV Parser
 *
 * Parses ETN (Evidenca trga nepremičnin) ZEMLJISCA CSV files from GURS.
 * Filters, joins POSLI with ZEMLJISCA, converts coordinates, and saves as JSON.
 *
 * Usage: npx tsx scripts/parse-etn-zemljisca.ts
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

interface ZemliscaRow {
  ID_POSLA: string;
  SIFRA_KO: string;
  IME_KO: string;
  OBCINA: string;
  PARCELNA_STEVILKA: string;
  VRSTA_ZEMLJISCA: string;
  VRSTA_TRAJNEGA_NASADA: string;
  STAROST_TRAJNEGA_NASADA: string;
  PRODANI_DELEZ_PARCELE: string;
  OPOMBE_O_NEPREMICNINI: string;
  POVRSINA_PARCELE: string;
  POGODBENA_CENA_PARCELE: string;
  STOPNJA_DDV_PARCELE: string;
  E_CENTROID: string;
  N_CENTROID: string;
  LETO: string;
}

// Output transaction type for land
interface LandTransaction {
  id: number;
  datum: string;
  cena: number;
  tip: number;
  tipNaziv: string;
  povrsina: number;
  cenaNaM2: number;
  lat: number;
  lon: number;
  sifraKo: number;
  imeKo: string;
  obcina: string;
  parcela: string;
  prodaniDelez: number;
  trajniNasad: number | null;
  starostNasada: number | null;
}

// Land type labels (šifrant: VRSTA_ZEMLJISCA)
const LAND_TYPE_LABELS: { [key: number]: string } = {
  1: 'Stavbno zemljišče z gradbenim dovoljenjem',
  2: 'Stavbno zemljišče, komunalno opremljeno',
  3: 'Stavbno zemljišče, delno/neopremljeno',
  4: 'Zemljišče za infrastrukturo',
  5: 'Zemljišče pod stavbo/funkcionalno',
  6: 'Cestno/parkirno zemljišče',
  7: 'Kmetijsko zemljišče',
  8: 'Kmetijsko zemljišče s trajnim nasadom',
  9: 'Gozdno zemljišče',
  10: 'Neplodno/vodno/drugo zemljišče',
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
 * Process a single year of ETN ZEMLJISCA data
 */
function processYear(yearDir: string, year: number): LandTransaction[] {
  const files = fs.readdirSync(yearDir);

  // Find POSLI and ZEMLJISCA files
  const posliFile = files.find(f => f.includes('_POSLI_'));
  const zemljiscaFile = files.find(f => f.includes('_ZEMLJISCA_'));

  if (!posliFile || !zemljiscaFile) {
    console.warn(`  Missing POSLI or ZEMLJISCA file for year ${year}`);
    return [];
  }

  console.log(`  Parsing ${posliFile}...`);
  const posli = parseCSV<PosliRow>(path.join(yearDir, posliFile));

  console.log(`  Parsing ${zemljiscaFile}...`);
  const zemljisca = parseCSV<ZemliscaRow>(path.join(yearDir, zemljiscaFile));

  // Filter POSLI (same criteria as DELISTAVB)
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

  // Join with ZEMLJISCA and create transactions
  const transactions: LandTransaction[] = [];
  let skippedNoCoords = 0;
  let skippedOutOfBounds = 0;
  let skippedNoArea = 0;
  let skippedPriceRange = 0;
  let skippedNoMatch = 0;

  for (const zem of zemljisca) {
    const posliRow = posliMap.get(zem.ID_POSLA);
    if (!posliRow) {
      skippedNoMatch++;
      continue;
    }

    // Get coordinates
    const e = parseFloat(zem.E_CENTROID);
    const n = parseFloat(zem.N_CENTROID);

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

    // Get area
    let povrsina = parseFloat(zem.POVRSINA_PARCELE);

    if (isNaN(povrsina) || povrsina <= 0) {
      skippedNoArea++;
      continue;
    }

    // Get price - prefer POGODBENA_CENA_PARCELE if available
    let cena = parseFloat(zem.POGODBENA_CENA_PARCELE);
    if (isNaN(cena) || cena <= 0) {
      cena = parseFloat(posliRow.POGODBENA_CENA_ODSKODNINA);
    }

    if (isNaN(cena) || cena <= 0) {
      continue;
    }

    // Get sold share (PRODANI_DELEZ_PARCELE) - typically 1.0 = 100%
    let prodaniDelez = parseFloat(zem.PRODANI_DELEZ_PARCELE);
    if (isNaN(prodaniDelez) || prodaniDelez <= 0) {
      prodaniDelez = 1;
    }

    // Adjust area and price for partial sales
    const adjustedPovrsina = povrsina * prodaniDelez;

    // Calculate price per m²
    const cenaNaM2 = cena / adjustedPovrsina;

    // Filter extreme outliers for land (different thresholds than buildings)
    // Land prices vary widely: forest ~1-5 €/m², agricultural ~5-30 €/m², building ~50-500+ €/m²
    if (cenaNaM2 < 0.1 || cenaNaM2 > 5000) {
      skippedPriceRange++;
      continue;
    }

    // Get land type
    const tip = parseInt(zem.VRSTA_ZEMLJISCA, 10);
    const tipNaziv = LAND_TYPE_LABELS[tip] || 'Neznano';

    // Get permanent crop info
    const trajniNasad = parseInt(zem.VRSTA_TRAJNEGA_NASADA, 10);
    const starostNasada = parseInt(zem.STAROST_TRAJNEGA_NASADA, 10);

    // Convert date
    const datum = convertDateFormat(posliRow.DATUM_SKLENITVE_POGODBE);

    transactions.push({
      id: parseInt(zem.ID_POSLA, 10),
      datum,
      cena: Math.round(cena),
      tip,
      tipNaziv,
      povrsina: Math.round(adjustedPovrsina * 10) / 10,
      cenaNaM2: Math.round(cenaNaM2 * 100) / 100, // 2 decimals for land (lower prices)
      lat: Math.round(lat * 100000) / 100000,
      lon: Math.round(lon * 100000) / 100000,
      sifraKo: parseInt(zem.SIFRA_KO, 10),
      imeKo: zem.IME_KO,
      obcina: zem.OBCINA,
      parcela: zem.PARCELNA_STEVILKA,
      prodaniDelez: Math.round(prodaniDelez * 1000) / 1000,
      trajniNasad: isNaN(trajniNasad) ? null : trajniNasad,
      starostNasada: isNaN(starostNasada) ? null : starostNasada,
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
  const outputDir = path.join(process.cwd(), 'public', 'data', 'transactions-zemljisca');

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
  console.log(`Total land transactions: ${totalTransactions.toLocaleString()}\n`);

  console.log('By year:');
  for (const [year, data] of Object.entries(stats).sort()) {
    console.log(`  ${year}: ${data.total.toLocaleString()}`);
  }

  console.log('\nBy land type (all years):');
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
