/**
 * Build Novogradnje (New Construction) Statistics
 *
 * Analyzes new construction vs. existing property sales.
 * Generates statistics by year, municipality, and property type.
 *
 * Usage: npx tsx scripts/build-novogradnje.ts
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

// Output structure
interface NovogradnjeStats {
  poLetu: {
    [year: string]: {
      skupaj: number;
      novogradnje: number;
      rabljeno: number;
      delezNovogradenj: number;
      medianaCenaM2Novo: number | null;
      medianaCenaM2Rabljeno: number | null;
      razlikaCene: number | null; // % premium for new
    };
  };
  poObcini: {
    obcina: string;
    novogradnje: number;
    rabljeno: number;
    delezNovogradenj: number;
    medianaCenaM2Novo: number | null;
  }[];
  poTipu: {
    stanovanja: { novo: number; rabljeno: number; delez: number };
    hise: { novo: number; rabljeno: number; delez: number };
  };
  starostObProdaji: {
    [bucket: string]: number;
  };
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
 * Calculate median
 */
function median(values: number[]): number | null {
  if (values.length === 0) return null;
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
  const outputPath = path.join(process.cwd(), 'public', 'data', 'novogradnje.json');

  console.log('Loading transactions...');
  const transactions = loadTransactions(transactionsDir);
  console.log(`Loaded ${transactions.length.toLocaleString()} transactions\n`);

  // Filter to stanovanja and hiše only (most relevant for novogradnje analysis)
  const residential = transactions.filter(tx => tx.tip === 1 || tx.tip === 2);
  console.log(`Residential transactions: ${residential.length.toLocaleString()}\n`);

  // === STATS BY YEAR ===
  console.log('Calculating yearly statistics...');
  const poLetu: NovogradnjeStats['poLetu'] = {};

  const byYear: { [year: string]: { novo: Transaction[]; rabljeno: Transaction[] } } = {};

  for (const tx of residential) {
    const year = getYear(tx.datum).toString();
    if (!byYear[year]) byYear[year] = { novo: [], rabljeno: [] };

    if (tx.novogradnja) {
      byYear[year].novo.push(tx);
    } else {
      byYear[year].rabljeno.push(tx);
    }
  }

  for (const [year, data] of Object.entries(byYear).sort()) {
    const skupaj = data.novo.length + data.rabljeno.length;
    const novoMedian = median(data.novo.map(tx => tx.cenaNaM2));
    const rabljenoMedian = median(data.rabljeno.map(tx => tx.cenaNaM2));

    let razlikaCene: number | null = null;
    if (novoMedian !== null && rabljenoMedian !== null && rabljenoMedian > 0) {
      razlikaCene = Math.round(((novoMedian - rabljenoMedian) / rabljenoMedian) * 1000) / 10;
    }

    poLetu[year] = {
      skupaj,
      novogradnje: data.novo.length,
      rabljeno: data.rabljeno.length,
      delezNovogradenj: Math.round((data.novo.length / skupaj) * 1000) / 10,
      medianaCenaM2Novo: novoMedian !== null ? Math.round(novoMedian) : null,
      medianaCenaM2Rabljeno: rabljenoMedian !== null ? Math.round(rabljenoMedian) : null,
      razlikaCene,
    };
  }

  // === STATS BY MUNICIPALITY ===
  console.log('Calculating municipality statistics...');
  const byObcina: { [obcina: string]: { novo: Transaction[]; rabljeno: Transaction[] } } = {};

  for (const tx of residential) {
    if (!byObcina[tx.obcina]) byObcina[tx.obcina] = { novo: [], rabljeno: [] };

    if (tx.novogradnja) {
      byObcina[tx.obcina].novo.push(tx);
    } else {
      byObcina[tx.obcina].rabljeno.push(tx);
    }
  }

  const poObcini = Object.entries(byObcina)
    .map(([obcina, data]) => {
      const skupaj = data.novo.length + data.rabljeno.length;
      const novoMedian = median(data.novo.map(tx => tx.cenaNaM2));

      return {
        obcina,
        novogradnje: data.novo.length,
        rabljeno: data.rabljeno.length,
        delezNovogradenj: Math.round((data.novo.length / skupaj) * 1000) / 10,
        medianaCenaM2Novo: novoMedian !== null ? Math.round(novoMedian) : null,
      };
    })
    .filter(o => o.novogradnje >= 10) // Min threshold
    .sort((a, b) => b.delezNovogradenj - a.delezNovogradenj);

  // === STATS BY PROPERTY TYPE ===
  console.log('Calculating property type statistics...');
  const stanovanja = residential.filter(tx => tx.tip === 2);
  const hise = residential.filter(tx => tx.tip === 1);

  const stanovanjaNovo = stanovanja.filter(tx => tx.novogradnja).length;
  const stanovanjRabljeno = stanovanja.length - stanovanjaNovo;
  const hiseNovo = hise.filter(tx => tx.novogradnja).length;
  const hiseRabljeno = hise.length - hiseNovo;

  const poTipu = {
    stanovanja: {
      novo: stanovanjaNovo,
      rabljeno: stanovanjRabljeno,
      delez: Math.round((stanovanjaNovo / stanovanja.length) * 1000) / 10,
    },
    hise: {
      novo: hiseNovo,
      rabljeno: hiseRabljeno,
      delez: Math.round((hiseNovo / hise.length) * 1000) / 10,
    },
  };

  // === AGE AT SALE DISTRIBUTION ===
  console.log('Calculating age distribution...');
  const starostObProdaji: { [bucket: string]: number } = {
    'Novogradnja (0-2)': 0,
    '3-5 let': 0,
    '6-10 let': 0,
    '11-20 let': 0,
    '21-40 let': 0,
    '41-60 let': 0,
    'Več kot 60 let': 0,
    'Neznano': 0,
  };

  for (const tx of residential) {
    const saleYear = getYear(tx.datum);

    if (tx.letoIzgradnje === null) {
      starostObProdaji['Neznano']++;
    } else {
      const age = saleYear - tx.letoIzgradnje;

      if (age <= 2) {
        starostObProdaji['Novogradnja (0-2)']++;
      } else if (age <= 5) {
        starostObProdaji['3-5 let']++;
      } else if (age <= 10) {
        starostObProdaji['6-10 let']++;
      } else if (age <= 20) {
        starostObProdaji['11-20 let']++;
      } else if (age <= 40) {
        starostObProdaji['21-40 let']++;
      } else if (age <= 60) {
        starostObProdaji['41-60 let']++;
      } else {
        starostObProdaji['Več kot 60 let']++;
      }
    }
  }

  // Build output
  const output: NovogradnjeStats = {
    poLetu,
    poObcini,
    poTipu,
    starostObProdaji,
  };

  // Save output
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nSaved: ${outputPath}`);

  // Print summary
  console.log('\n========== SUMMARY ==========\n');

  console.log('Novogradnje po letih (zadnjih 10 let):');
  const recentYears = Object.entries(poLetu)
    .filter(([year]) => parseInt(year) >= 2015)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

  for (const [year, stats] of recentYears) {
    console.log(
      `  ${year}: ${stats.novogradnje} novogradenj (${stats.delezNovogradenj}%), ` +
        `premija: ${stats.razlikaCene !== null ? `+${stats.razlikaCene}%` : 'N/A'}`
    );
  }

  console.log('\nTop 10 občin po deležu novogradenj:');
  for (const o of poObcini.slice(0, 10)) {
    console.log(`  ${o.obcina}: ${o.delezNovogradenj}% (${o.novogradnje} novogradenj)`);
  }

  console.log('\nPo tipu nepremičnine:');
  console.log(`  Stanovanja: ${poTipu.stanovanja.delez}% novogradenj`);
  console.log(`  Hiše: ${poTipu.hise.delez}% novogradenj`);

  console.log('\nStarost ob prodaji:');
  for (const [bucket, count] of Object.entries(starostObProdaji)) {
    const pct = Math.round((count / residential.length) * 1000) / 10;
    console.log(`  ${bucket}: ${count.toLocaleString()} (${pct}%)`);
  }

  console.log('\n========== DONE ==========\n');
}

main().catch(console.error);
