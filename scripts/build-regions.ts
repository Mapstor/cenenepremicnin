/**
 * Build Regional Aggregates
 *
 * Aggregates municipality data into 12 statistical regions of Slovenia.
 *
 * Usage: npx tsx scripts/build-regions.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Slovenia's 12 statistical regions with their municipalities
// Municipality names are in uppercase to match the data
const REGION_MAPPING: Record<string, string[]> = {
  'Pomurska': [
    'APAČE', 'BELTINCI', 'CANKOVA', 'ČRENŠOVCI', 'DOBROVNIK', 'GORNJA RADGONA',
    'GORNJI PETROVCI', 'GRAD', 'HODOŠ', 'KOBILJE', 'KRIŽEVCI', 'KUZMA', 'LENDAVA',
    'LJUTOMER', 'MORAVSKE TOPLICE', 'MURSKA SOBOTA', 'ODRANCI', 'PUCONCI',
    'RADENCI', 'RAZKRIŽJE', 'ROGAŠOVCI', 'SVETI JURIJ OB ŠČAVNICI', 'ŠALOVCI',
    'TIŠINA', 'TURNIŠČE', 'VELIKA POLANA', 'VERŽEJ'
  ],
  'Podravska': [
    'BENEDIKT', 'CERKVENJAK', 'DESTRNIK', 'DORNAVA', 'DUPLEK', 'GORIŠNICA',
    'HAJDINA', 'HOČE-SLIVNICA', 'JURŠINCI', 'KIDRIČEVO', 'KUNGOTA', 'LENART',
    'LOVRENC NA POHORJU', 'MAJŠPERK', 'MAKOLE', 'MARIBOR', 'MARKOVCI',
    'MIKLAVŽ NA DRAVSKEM POLJU', 'OPLOTNICA', 'ORMOŽ', 'PESNICA', 'PODLEHNIK',
    'POLJČANE', 'PTUJ', 'RAČE-FRAM', 'RUŠE', 'SELNICA OB DRAVI', 'SLOVENSKA BISTRICA',
    'STARŠE', 'SVETA ANA', 'SVETA TROJICA V SLOVENSKIH GORICAH', 'SVETI ANDRAŽ V SLOVENSKIH GORICAH',
    'SVETI JURIJ V SLOVENSKIH GORICAH', 'SVETI TOMAŽ', 'ŠENTILJ', 'TRNOVSKA VAS',
    'VIDEM', 'ZAVRČ', 'ŽETALE', 'CIRKULANE', 'SREDIŠČE OB DRAVI',
    'SV. TROJICA V SLOV. GORICAH', 'SVETI JURIJ V SLOV. GORICAH', 'SVETI ANDRAŽ V SLOV. GORICAH'
  ],
  'Koroška': [
    'ČRNA NA KOROŠKEM', 'DRAVOGRAD', 'MEŽICA', 'MISLINJA', 'MUTA', 'PODVELKA',
    'PREVALJE', 'RADLJE OB DRAVI', 'RAVNE NA KOROŠKEM', 'RIBNICA NA POHORJU',
    'SLOVENJ GRADEC', 'VUZENICA'
  ],
  'Savinjska': [
    'BRASLOVČE', 'CELJE', 'DOBJE', 'DOBRNA', 'GORNJI GRAD', 'KOZJE', 'LAŠKO',
    'LJUBNO', 'LUČE', 'MOZIRJE', 'NAZARJE', 'PODČETRTEK', 'POLZELA', 'PREBOLD',
    'REČICA OB SAVINJI', 'ROGAŠKA SLATINA', 'ROGATEC', 'ŠENTJUR', 'ŠMARJE PRI JELŠAH',
    'ŠMARTNO OB PAKI', 'SOLČAVA', 'ŠTORE', 'TABOR', 'VELENJE', 'VITANJE', 'VOJNIK',
    'VRANSKO', 'ZREČE', 'ŽALEC', 'ŠOŠTANJ', 'SLOVENSKE KONJICE'
  ],
  'Zasavska': [
    'HRASTNIK', 'LITIJA', 'TRBOVLJE', 'ZAGORJE OB SAVI'
  ],
  'Posavska': [
    'BISTRICA OB SOTLI', 'BREŽICE', 'KOSTANJEVICA NA KRKI', 'KRŠKO', 'RADEČE', 'SEVNICA'
  ],
  'Jugovzhodna Slovenija': [
    'ČRNOMELJ', 'DOLENJSKE TOPLICE', 'KOČEVJE', 'KOSTEL', 'LOŠKI POTOK', 'METLIKA',
    'MIRNA', 'MIRNA PEČ', 'MOKRONOG-TREBELNO', 'NOVO MESTO', 'OSILNICA', 'RIBNICA',
    'SEMIČ', 'SODRAŽICA', 'STRAŽA', 'ŠENTJERNEJ', 'ŠENTRUPERT', 'ŠKOCJAN',
    'ŠMARJEŠKE TOPLICE', 'TREBNJE', 'ŽUŽEMBERK'
  ],
  'Osrednjeslovenska': [
    'BOROVNICA', 'BREZOVICA', 'DOBREPOLJE', 'DOBROVA-POLHOV GRADEC', 'DOL PRI LJUBLJANI',
    'DOMŽALE', 'GROSUPLJE', 'HORJUL', 'IG', 'IVANČNA GORICA', 'KAMNIK', 'KOMENDA',
    'LJUBLJANA', 'LOG-DRAGOMER', 'LOGATEC', 'LUKOVICA', 'MEDVODE', 'MENGEŠ',
    'MORAVČE', 'ŠKOFLJICA', 'ŠMARTNO PRI LITIJI', 'TRZIN', 'VELIKE LAŠČE',
    'VODICE', 'VRHNIKA'
  ],
  'Gorenjska': [
    'BLED', 'BOHINJ', 'CERKLJE NA GORENJSKEM', 'GORENJA VAS-POLJANE', 'GORJE',
    'JESENICE', 'JEZERSKO', 'KRANJ', 'KRANJSKA GORA', 'NAKLO', 'PREDDVOR',
    'RADOVLJICA', 'ŠENČUR', 'ŠKOFJA LOKA', 'TRŽIČ', 'ŽELEZNIKI', 'ŽIRI', 'ŽIROVNICA'
  ],
  'Primorsko-notranjska': [
    'BLOKE', 'CERKNICA', 'ILIRSKA BISTRICA', 'LOŠKA DOLINA', 'PIVKA', 'POSTOJNA'
  ],
  'Goriška': [
    'AJDOVŠČINA', 'BOVEC', 'BRDA', 'CERKLJANSKO', 'CERKNO', 'IDRIJA', 'KANAL', 'KOBARID',
    'MIREN-KOSTANJEVICA', 'NOVA GORICA', 'RENČE-VOGRSKO', 'ŠEMPETER-VRTOJBA',
    'TOLMIN', 'VIPAVA'
  ],
  'Obalno-kraška': [
    'ANKARAN', 'DIVAČA', 'HRPELJE-KOZINA', 'IZOLA', 'KOMEN', 'KOPER', 'PIRAN', 'SEŽANA'
  ]
};

// Create reverse mapping: municipality -> region
const MUNICIPALITY_TO_REGION: Record<string, string> = {};
for (const [region, municipalities] of Object.entries(REGION_MAPPING)) {
  for (const municipality of municipalities) {
    MUNICIPALITY_TO_REGION[municipality] = region;
  }
}

interface ObcinaStats {
  obcina: string;
  medianaCenaM2: number | null;
  medianaCenaM2Stanovanja: number | null;
  medianaCenaM2Hise: number | null;
  steviloTransakcij: number;
  trendYoY: number | null;
}

interface RegionStats {
  regija: string;
  medianaCenaM2Stanovanja: number | null;
  medianaCenaM2Hise: number | null;
  steviloTransakcij: number;
  trendYoY: number | null;
  steviloObcin: number;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function weightedAverage(values: { value: number; weight: number }[]): number {
  const filtered = values.filter(v => v.value > 0 && v.weight > 0);
  if (filtered.length === 0) return 0;
  const totalWeight = filtered.reduce((sum, v) => sum + v.weight, 0);
  const weightedSum = filtered.reduce((sum, v) => sum + v.value * v.weight, 0);
  return Math.round(weightedSum / totalWeight);
}

async function main() {
  const inputPath = path.join(process.cwd(), 'public', 'data', 'aggregated-obcine.json');
  const outputPath = path.join(process.cwd(), 'public', 'data', 'aggregated-regije.json');

  console.log('Loading municipality data...');
  const content = fs.readFileSync(inputPath, 'utf-8');
  const obcinaStats: ObcinaStats[] = JSON.parse(content);
  console.log(`Loaded ${obcinaStats.length} municipalities\n`);

  // Group by region
  const regionData: Record<string, ObcinaStats[]> = {};
  let unmapped = 0;

  for (const obcina of obcinaStats) {
    const region = MUNICIPALITY_TO_REGION[obcina.obcina];
    if (region) {
      if (!regionData[region]) {
        regionData[region] = [];
      }
      regionData[region].push(obcina);
    } else {
      unmapped++;
      // Try to find closest match
      console.log(`  Warning: Unmapped municipality: ${obcina.obcina}`);
    }
  }

  console.log(`Mapped ${obcinaStats.length - unmapped} / ${obcinaStats.length} municipalities\n`);

  // Calculate regional aggregates
  const regionStats: RegionStats[] = [];

  for (const [regija, municipalities] of Object.entries(regionData)) {
    // Calculate weighted averages based on transaction count
    const stanovanjaPrices = municipalities
      .filter(m => m.medianaCenaM2Stanovanja !== null && m.steviloTransakcij > 0)
      .map(m => ({ value: m.medianaCenaM2Stanovanja!, weight: m.steviloTransakcij }));

    const hisePrices = municipalities
      .filter(m => m.medianaCenaM2Hise !== null && m.steviloTransakcij > 0)
      .map(m => ({ value: m.medianaCenaM2Hise!, weight: m.steviloTransakcij }));

    // Total transactions
    const totalTransakcij = municipalities.reduce((sum, m) => sum + m.steviloTransakcij, 0);

    // Weighted average trend
    const trends = municipalities
      .filter(m => m.trendYoY !== null && m.steviloTransakcij >= 10)
      .map(m => ({ value: m.trendYoY!, weight: m.steviloTransakcij }));

    const avgTrend = trends.length >= 2
      ? Math.round(weightedAverage(trends) * 10) / 10
      : null;

    regionStats.push({
      regija,
      medianaCenaM2Stanovanja: stanovanjaPrices.length >= 2 ? weightedAverage(stanovanjaPrices) : null,
      medianaCenaM2Hise: hisePrices.length >= 2 ? weightedAverage(hisePrices) : null,
      steviloTransakcij: totalTransakcij,
      trendYoY: avgTrend,
      steviloObcin: municipalities.length
    });
  }

  // Sort by price (highest first)
  regionStats.sort((a, b) => (b.medianaCenaM2Stanovanja || 0) - (a.medianaCenaM2Stanovanja || 0));

  // Save output
  fs.writeFileSync(outputPath, JSON.stringify(regionStats, null, 2));
  console.log(`Saved: ${outputPath}\n`);

  // Print summary
  console.log('========== REGIONAL SUMMARY ==========\n');
  console.log('Regija                        | Stanovanja | Hiše    | Trend  | Transakcij');
  console.log('-'.repeat(80));

  for (const r of regionStats) {
    const name = r.regija.padEnd(30);
    const stan = r.medianaCenaM2Stanovanja ? `${r.medianaCenaM2Stanovanja.toLocaleString()} €/m²` : '-';
    const hise = r.medianaCenaM2Hise ? `${r.medianaCenaM2Hise.toLocaleString()} €/m²` : '-';
    const trend = r.trendYoY !== null ? `${r.trendYoY > 0 ? '+' : ''}${r.trendYoY.toFixed(1)}%` : '-';
    console.log(`${name} | ${stan.padEnd(10)} | ${hise.padEnd(7)} | ${trend.padEnd(6)} | ${r.steviloTransakcij.toLocaleString()}`);
  }

  console.log('\n========== DONE ==========\n');
}

main().catch(console.error);
