/**
 * Build Rankings JSON
 *
 * Generates ranking/leaderboard JSON files for various property metrics.
 * Creates "najdražje", "najcenejše", and trend-based rankings.
 *
 * Usage: npx tsx scripts/build-rankings.ts
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

// Ranked item for output
interface RankedTransaction {
  rank: number;
  id: number;
  datum: string;
  cena: number;
  tip: number;
  tipNaziv: string;
  povrsina: number;
  cenaNaM2: number;
  obcina: string;
  naslov: string;
  leto: number;
}

// Občina stats from aggregation
interface ObcinaStats {
  obcina: string;
  medianaCenaM2: number | null;
  medianaCenaM2Stanovanja: number | null;
  medianaCenaM2Hise: number | null;
  steviloTransakcij: number;
  trendYoY: number | null;
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
 * Extract year from date string
 */
function getYear(dateStr: string): number {
  return parseInt(dateStr.split('-')[0], 10);
}

/**
 * Convert transaction to ranked item
 */
function toRankedItem(tx: Transaction, rank: number): RankedTransaction {
  return {
    rank,
    id: tx.id,
    datum: tx.datum,
    cena: tx.cena,
    tip: tx.tip,
    tipNaziv: tx.tipNaziv,
    povrsina: tx.uporabnaPovrsina || tx.povrsina,
    cenaNaM2: tx.cenaNaM2,
    obcina: tx.obcina,
    naslov: tx.naslov,
    leto: getYear(tx.datum),
  };
}

/**
 * Calculate median
 */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Main function
 */
async function main() {
  const transactionsDir = path.join(process.cwd(), 'public', 'data', 'transactions');
  const aggregatedPath = path.join(process.cwd(), 'public', 'data', 'aggregated-obcine.json');
  const outputDir = path.join(process.cwd(), 'public', 'data', 'rankings');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Loading transactions...');
  const transactions = loadTransactions(transactionsDir);
  console.log(`Loaded ${transactions.length.toLocaleString()} transactions\n`);

  console.log('Loading aggregated data...');
  const obcinaStats: ObcinaStats[] = JSON.parse(fs.readFileSync(aggregatedPath, 'utf-8'));
  console.log(`Loaded ${obcinaStats.length} občina stats\n`);

  // === RANKING 1: Najdražje nepremičnine (Top 100 by total price) ===
  // Deduplicate by transaction ID (same sale can have multiple building parts)
  console.log('Building: najdrazje-100.json');
  const seenIds = new Set<number>();
  const najdrazje100 = transactions
    .sort((a, b) => b.cena - a.cena)
    .filter(tx => {
      if (seenIds.has(tx.id)) return false;
      seenIds.add(tx.id);
      return true;
    })
    .slice(0, 100)
    .map((tx, i) => toRankedItem(tx, i + 1));

  fs.writeFileSync(
    path.join(outputDir, 'najdrazje-100.json'),
    JSON.stringify(najdrazje100, null, 2)
  );
  console.log(`  Top price: ${najdrazje100[0].cena.toLocaleString()} EUR`);

  // === RANKING 2: Najdražja stanovanja (Top 100 apartments) ===
  console.log('Building: najdrazja-stanovanja-100.json');
  const najdrazjaStanovanja = transactions
    .filter(tx => tx.tip === 2)
    .sort((a, b) => b.cena - a.cena)
    .slice(0, 100)
    .map((tx, i) => toRankedItem(tx, i + 1));

  fs.writeFileSync(
    path.join(outputDir, 'najdrazja-stanovanja-100.json'),
    JSON.stringify(najdrazjaStanovanja, null, 2)
  );
  console.log(`  Top apartment: ${najdrazjaStanovanja[0].cena.toLocaleString()} EUR`);

  // === RANKING 3: Najdražje hiše (Top 100 houses) ===
  console.log('Building: najdrazje-hise-100.json');
  const najdrazjeHise = transactions
    .filter(tx => tx.tip === 1)
    .sort((a, b) => b.cena - a.cena)
    .slice(0, 100)
    .map((tx, i) => toRankedItem(tx, i + 1));

  fs.writeFileSync(
    path.join(outputDir, 'najdrazje-hise-100.json'),
    JSON.stringify(najdrazjeHise, null, 2)
  );
  console.log(`  Top house: ${najdrazjeHise[0].cena.toLocaleString()} EUR`);

  // === RANKING 3b: Najdražji poslovni prostori (Top 100 commercial) ===
  // tip 5-11: Pisarniški, Poslovanje s strankami, Zdravstvo, Trgovski, Gostinski, Šport/kultura, Industrijski
  console.log('Building: najdrazji-poslovni-100.json');
  const poslovniTipi = [5, 6, 7, 8, 9, 10, 11];
  const seenIdsPoslovni = new Set<number>();
  const najdrazjiPoslovni = transactions
    .filter(tx => poslovniTipi.includes(tx.tip))
    .sort((a, b) => b.cena - a.cena)
    .filter(tx => {
      if (seenIdsPoslovni.has(tx.id)) return false;
      seenIdsPoslovni.add(tx.id);
      return true;
    })
    .slice(0, 100)
    .map((tx, i) => toRankedItem(tx, i + 1));

  fs.writeFileSync(
    path.join(outputDir, 'najdrazji-poslovni-100.json'),
    JSON.stringify(najdrazjiPoslovni, null, 2)
  );
  console.log(`  Top commercial: ${najdrazjiPoslovni[0]?.cena.toLocaleString() || 0} EUR`);

  // === RANKING 3c: Najdražje garaže in parkirišča (Top 100) ===
  // tip 3-4: Parkirni prostor, Garaža
  console.log('Building: najdrazje-garaze-100.json');
  const seenIdsGaraze = new Set<number>();
  const najdrazjeGaraze = transactions
    .filter(tx => tx.tip === 3 || tx.tip === 4)
    .sort((a, b) => b.cena - a.cena)
    .filter(tx => {
      if (seenIdsGaraze.has(tx.id)) return false;
      seenIdsGaraze.add(tx.id);
      return true;
    })
    .slice(0, 100)
    .map((tx, i) => toRankedItem(tx, i + 1));

  fs.writeFileSync(
    path.join(outputDir, 'najdrazje-garaze-100.json'),
    JSON.stringify(najdrazjeGaraze, null, 2)
  );
  console.log(`  Top parking/garage: ${najdrazjeGaraze[0]?.cena.toLocaleString() || 0} EUR`);

  // === RANKING 3d: Najdražji turistični in kmetijski objekti (Top 100) ===
  // tip 12-13: Turistični nastanitveni objekt, Kmetijski objekt
  console.log('Building: najdrazji-turisticni-kmetijski-100.json');
  const seenIdsTuristKmet = new Set<number>();
  const najdrazjiTuristKmet = transactions
    .filter(tx => tx.tip === 12 || tx.tip === 13)
    .sort((a, b) => b.cena - a.cena)
    .filter(tx => {
      if (seenIdsTuristKmet.has(tx.id)) return false;
      seenIdsTuristKmet.add(tx.id);
      return true;
    })
    .slice(0, 100)
    .map((tx, i) => toRankedItem(tx, i + 1));

  fs.writeFileSync(
    path.join(outputDir, 'najdrazji-turisticni-kmetijski-100.json'),
    JSON.stringify(najdrazjiTuristKmet, null, 2)
  );
  console.log(`  Top tourist/agricultural: ${najdrazjiTuristKmet[0]?.cena.toLocaleString() || 0} EUR`);

  // === RANKING 4: Najvišja cena na m² (Top 100) ===
  console.log('Building: najvisja-cena-m2-100.json');
  const najvisjaCenaM2 = transactions
    .filter(tx => tx.uporabnaPovrsina >= 20) // Exclude tiny units
    .sort((a, b) => b.cenaNaM2 - a.cenaNaM2)
    .slice(0, 100)
    .map((tx, i) => toRankedItem(tx, i + 1));

  fs.writeFileSync(
    path.join(outputDir, 'najvisja-cena-m2-100.json'),
    JSON.stringify(najvisjaCenaM2, null, 2)
  );
  console.log(`  Top price/m²: ${najvisjaCenaM2[0].cenaNaM2.toLocaleString()} EUR/m²`);

  // === RANKING 5: Najcenejša stanovanja v Ljubljani po letih ===
  console.log('Building: najcenejsa-stanovanja-ljubljana.json');
  const ljubljanaStanovanja = transactions.filter(
    tx => tx.tip === 2 && tx.obcina === 'LJUBLJANA'
  );

  // Group by year
  const byYear: { [year: string]: Transaction[] } = {};
  for (const tx of ljubljanaStanovanja) {
    const year = getYear(tx.datum).toString();
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(tx);
  }

  // Get cheapest 10 per year, sorted by price per m²
  const najcenejsaLj: { [year: string]: RankedTransaction[] } = {};
  for (const [year, txs] of Object.entries(byYear)) {
    if (parseInt(year) < 2015) continue; // Only recent years
    najcenejsaLj[year] = txs
      .sort((a, b) => a.cenaNaM2 - b.cenaNaM2)
      .slice(0, 10)
      .map((tx, i) => toRankedItem(tx, i + 1));
  }

  fs.writeFileSync(
    path.join(outputDir, 'najcenejsa-stanovanja-ljubljana.json'),
    JSON.stringify(najcenejsaLj, null, 2)
  );
  console.log(`  Years covered: ${Object.keys(najcenejsaLj).sort().join(', ')}`);

  // === RANKING 6: Najdražje občine (by median apartment price/m²) ===
  console.log('Building: najdrazje-obcine.json');
  const najdrazjeObcine = obcinaStats
    .filter(o => o.medianaCenaM2Stanovanja !== null && o.steviloTransakcij >= 10)
    .sort((a, b) => (b.medianaCenaM2Stanovanja || 0) - (a.medianaCenaM2Stanovanja || 0))
    .slice(0, 50)
    .map((o, i) => ({
      rank: i + 1,
      obcina: o.obcina,
      medianaCenaM2: o.medianaCenaM2Stanovanja,
      steviloTransakcij: o.steviloTransakcij,
    }));

  fs.writeFileSync(
    path.join(outputDir, 'najdrazje-obcine.json'),
    JSON.stringify(najdrazjeObcine, null, 2)
  );
  console.log(`  Top občina: ${najdrazjeObcine[0].obcina} (${najdrazjeObcine[0].medianaCenaM2} EUR/m²)`);

  // === RANKING 7: Najcenejše občine ===
  console.log('Building: najcenejse-obcine.json');
  const najcenejseObcine = obcinaStats
    .filter(o => o.medianaCenaM2Stanovanja !== null && o.steviloTransakcij >= 10)
    .sort((a, b) => (a.medianaCenaM2Stanovanja || 0) - (b.medianaCenaM2Stanovanja || 0))
    .slice(0, 50)
    .map((o, i) => ({
      rank: i + 1,
      obcina: o.obcina,
      medianaCenaM2: o.medianaCenaM2Stanovanja,
      steviloTransakcij: o.steviloTransakcij,
    }));

  fs.writeFileSync(
    path.join(outputDir, 'najcenejse-obcine.json'),
    JSON.stringify(najcenejseObcine, null, 2)
  );
  console.log(`  Cheapest občina: ${najcenejseObcine[0].obcina} (${najcenejseObcine[0].medianaCenaM2} EUR/m²)`);

  // === RANKING 8: Največje podražitve (YoY trend) ===
  console.log('Building: najvecje-podrazitve.json');
  const najvecjePodrazitve = obcinaStats
    .filter(o => o.trendYoY !== null && o.steviloTransakcij >= 20)
    .sort((a, b) => (b.trendYoY || 0) - (a.trendYoY || 0))
    .slice(0, 30)
    .map((o, i) => ({
      rank: i + 1,
      obcina: o.obcina,
      trendYoY: o.trendYoY,
      medianaCenaM2: o.medianaCenaM2,
      steviloTransakcij: o.steviloTransakcij,
    }));

  fs.writeFileSync(
    path.join(outputDir, 'najvecje-podrazitve.json'),
    JSON.stringify(najvecjePodrazitve, null, 2)
  );
  console.log(`  Biggest increase: ${najvecjePodrazitve[0].obcina} (+${najvecjePodrazitve[0].trendYoY}%)`);

  // === RANKING 9: Največji padci cen ===
  console.log('Building: najvecji-padci.json');
  const najvecjiPadci = obcinaStats
    .filter(o => o.trendYoY !== null && o.steviloTransakcij >= 20)
    .sort((a, b) => (a.trendYoY || 0) - (b.trendYoY || 0))
    .slice(0, 30)
    .map((o, i) => ({
      rank: i + 1,
      obcina: o.obcina,
      trendYoY: o.trendYoY,
      medianaCenaM2: o.medianaCenaM2,
      steviloTransakcij: o.steviloTransakcij,
    }));

  fs.writeFileSync(
    path.join(outputDir, 'najvecji-padci.json'),
    JSON.stringify(najvecjiPadci, null, 2)
  );
  console.log(`  Biggest decrease: ${najvecjiPadci[0].obcina} (${najvecjiPadci[0].trendYoY}%)`);

  // === RANKING 10: Yearly stats summary ===
  console.log('Building: letna-statistika.json');
  const yearlyByTip: { [year: string]: { [tip: string]: Transaction[] } } = {};

  for (const tx of transactions) {
    const year = getYear(tx.datum).toString();
    if (!yearlyByTip[year]) yearlyByTip[year] = {};
    const tipKey = tx.tip === 1 ? 'hise' : tx.tip === 2 ? 'stanovanja' : 'drugo';
    if (!yearlyByTip[year][tipKey]) yearlyByTip[year][tipKey] = [];
    yearlyByTip[year][tipKey].push(tx);
  }

  const letnaStatistika = Object.entries(yearlyByTip)
    .map(([year, byTip]) => ({
      leto: parseInt(year),
      stanovanja: {
        stevilo: byTip.stanovanja?.length || 0,
        medianaCenaM2: byTip.stanovanja
          ? Math.round(median(byTip.stanovanja.map(tx => tx.cenaNaM2)))
          : null,
      },
      hise: {
        stevilo: byTip.hise?.length || 0,
        medianaCenaM2: byTip.hise
          ? Math.round(median(byTip.hise.map(tx => tx.cenaNaM2)))
          : null,
      },
      skupaj: (byTip.stanovanja?.length || 0) + (byTip.hise?.length || 0) + (byTip.drugo?.length || 0),
    }))
    .sort((a, b) => a.leto - b.leto);

  fs.writeFileSync(
    path.join(outputDir, 'letna-statistika.json'),
    JSON.stringify(letnaStatistika, null, 2)
  );
  console.log(`  Years: ${letnaStatistika[0].leto} - ${letnaStatistika[letnaStatistika.length - 1].leto}`);

  // Print summary
  console.log('\n========== SUMMARY ==========\n');
  console.log('Generated ranking files:');
  const files = fs.readdirSync(outputDir);
  for (const file of files) {
    const size = fs.statSync(path.join(outputDir, file)).size;
    console.log(`  ${file} (${(size / 1024).toFixed(1)} KB)`);
  }

  console.log('\n========== DONE ==========\n');
}

main().catch(console.error);
