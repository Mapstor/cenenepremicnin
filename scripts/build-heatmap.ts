/**
 * Build Heatmap GeoJSON
 *
 * Merges aggregated transaction data with GeoJSON boundaries.
 * Simplifies geometry for web performance.
 *
 * Usage: npx tsx scripts/build-heatmap.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// KO aggregated stats (from aggregate.ts)
interface KOStats {
  sifraKo: number;
  imeKo: string;
  obcina: string;
  medianaCenaM2: number | null;
  medianaCenaM2Stanovanja: number | null;
  medianaCenaM2Hise: number | null;
  povprecjeCenaM2: number | null;
  povprecjeCenaM2Stanovanja: number | null;
  povprecjeCenaM2Hise: number | null;
  steviloTransakcij: number;
  trendYoY: number | null;
  cetrtletja: { [quarter: string]: { mediana: number; povprecje: number; stevilo: number } };
}

// Občina aggregated stats
interface ObcinaStats {
  obcina: string;
  medianaCenaM2: number | null;
  medianaCenaM2Stanovanja: number | null;
  medianaCenaM2Hise: number | null;
  povprecjeCenaM2: number | null;
  povprecjeCenaM2Stanovanja: number | null;
  povprecjeCenaM2Hise: number | null;
  steviloTransakcij: number;
  trendYoY: number | null;
  cetrtletja: { [quarter: string]: { mediana: number; povprecje: number; stevilo: number } };
}

/**
 * Extract historical stats from cetrtletja data
 * Returns total transactions and last quarter with data
 */
function getHistoricalStats(cetrtletja: { [quarter: string]: { mediana: number; stevilo: number } } | undefined): {
  vsegaTransakcij: number;
  zadnjaTransakcija: string | null;
  zadnjaCenaM2: number | null;
} {
  if (!cetrtletja || Object.keys(cetrtletja).length === 0) {
    return { vsegaTransakcij: 0, zadnjaTransakcija: null, zadnjaCenaM2: null };
  }

  const quarters = Object.keys(cetrtletja).sort();
  const vsegaTransakcij = Object.values(cetrtletja).reduce((sum, q) => sum + q.stevilo, 0);
  const zadnjaTransakcija = quarters[quarters.length - 1];
  const zadnjaCenaM2 = cetrtletja[zadnjaTransakcija]?.mediana ?? null;

  return { vsegaTransakcij, zadnjaTransakcija, zadnjaCenaM2 };
}

// GeoJSON types
interface GeoJSONFeature {
  type: 'Feature';
  id?: string | number;
  geometry: unknown;
  properties: Record<string, unknown>;
  bbox?: number[];
}

interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
  totalFeatures?: number;
  numberMatched?: number;
  numberReturned?: number;
  crs?: unknown;
  bbox?: number[];
}

/**
 * Round all coordinate numbers to 5 decimal places
 */
function roundCoordinates(geom: unknown): unknown {
  if (Array.isArray(geom)) {
    if (geom.length >= 2 && typeof geom[0] === 'number' && typeof geom[1] === 'number') {
      // This is a coordinate pair
      return geom.map(n => typeof n === 'number' ? Math.round(n * 100000) / 100000 : n);
    }
    // Recurse into nested arrays
    return geom.map(roundCoordinates);
  }
  if (geom && typeof geom === 'object') {
    const obj = geom as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = key === 'coordinates' ? roundCoordinates(value) : value;
    }
    return result;
  }
  return geom;
}

/**
 * Build KO heatmap
 */
function buildKOHeatmap(
  geojsonPath: string,
  aggregatedPath: string,
  outputPath: string
): void {
  console.log('\n=== Building KO Heatmap ===');

  // Load GeoJSON
  console.log(`Loading GeoJSON: ${geojsonPath}`);
  const geojson: GeoJSONCollection = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));
  console.log(`  ${geojson.features.length} features`);

  // Load aggregated data
  console.log(`Loading aggregated data: ${aggregatedPath}`);
  const koStats: KOStats[] = JSON.parse(fs.readFileSync(aggregatedPath, 'utf-8'));
  console.log(`  ${koStats.length} KO stats`);

  // Create lookup map by sifraKo
  const statsMap = new Map<number, KOStats>();
  for (const stat of koStats) {
    statsMap.set(stat.sifraKo, stat);
  }

  // Merge properties
  let matched = 0;
  let unmatched = 0;

  for (const feature of geojson.features) {
    const props = feature.properties;
    const koId = props.KO_ID as number;

    const stat = statsMap.get(koId);
    if (stat) {
      matched++;
      // Add aggregated properties (without cetrtletja to reduce size)
      props.medianaCenaM2 = stat.medianaCenaM2;
      props.medianaCenaM2Stanovanja = stat.medianaCenaM2Stanovanja;
      props.medianaCenaM2Hise = stat.medianaCenaM2Hise;
      props.povprecjeCenaM2 = stat.povprecjeCenaM2;
      props.povprecjeCenaM2Stanovanja = stat.povprecjeCenaM2Stanovanja;
      props.povprecjeCenaM2Hise = stat.povprecjeCenaM2Hise;
      props.steviloTransakcij = stat.steviloTransakcij;
      props.trendYoY = stat.trendYoY;
      props.imeKo = stat.imeKo;
      props.obcina = stat.obcina;

      // Add historical stats (for areas with no recent data)
      const historical = getHistoricalStats(stat.cetrtletja);
      props.vsegaTransakcij = historical.vsegaTransakcij;
      props.zadnjaTransakcija = historical.zadnjaTransakcija;
      props.zadnjaCenaM2 = historical.zadnjaCenaM2;
    } else {
      unmatched++;
      props.medianaCenaM2 = null;
      props.medianaCenaM2Stanovanja = null;
      props.medianaCenaM2Hise = null;
      props.povprecjeCenaM2 = null;
      props.povprecjeCenaM2Stanovanja = null;
      props.povprecjeCenaM2Hise = null;
      props.steviloTransakcij = 0;
      props.trendYoY = null;
      props.vsegaTransakcij = 0;
      props.zadnjaTransakcija = null;
      props.zadnjaCenaM2 = null;
    }

    // Round coordinates to reduce file size
    feature.geometry = roundCoordinates(feature.geometry);

    // Remove unnecessary properties
    delete props.DATUM_SYS;
    delete props.EID_KATASTRSKA_OBCINA;
    delete props.FEATUREID;
    delete feature.bbox;
  }

  console.log(`  Matched: ${matched}, Unmatched: ${unmatched}`);

  // Remove collection-level metadata
  delete geojson.totalFeatures;
  delete geojson.numberMatched;
  delete geojson.numberReturned;
  delete geojson.crs;
  delete geojson.bbox;

  // Save intermediate file
  const tempPath = outputPath.replace('.geojson', '-temp.geojson');
  fs.writeFileSync(tempPath, JSON.stringify(geojson));
  const tempSize = fs.statSync(tempPath).size;
  console.log(`  Temp file size: ${(tempSize / 1024 / 1024).toFixed(2)} MB`);

  // Simplify with mapshaper
  console.log('  Simplifying with mapshaper...');
  try {
    execSync(
      `npx mapshaper "${tempPath}" -simplify dp 10% keep-shapes -o format=geojson "${outputPath}"`,
      { stdio: 'pipe' }
    );
    const finalSize = fs.statSync(outputPath).size;
    console.log(`  Final file size: ${(finalSize / 1024 / 1024).toFixed(2)} MB`);
  } catch (err) {
    console.warn('  Mapshaper failed, using unsimplified version');
    fs.renameSync(tempPath, outputPath);
  }

  // Clean up temp file
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }

  console.log(`  Saved: ${outputPath}`);
}

/**
 * Build Občina heatmap
 */
function buildObcinaHeatmap(
  geojsonPath: string,
  aggregatedPath: string,
  outputPath: string
): void {
  console.log('\n=== Building Občina Heatmap ===');

  // Load GeoJSON
  console.log(`Loading GeoJSON: ${geojsonPath}`);
  const geojson: GeoJSONCollection = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));
  console.log(`  ${geojson.features.length} features`);

  // Load aggregated data
  console.log(`Loading aggregated data: ${aggregatedPath}`);
  const obcinaStats: ObcinaStats[] = JSON.parse(fs.readFileSync(aggregatedPath, 'utf-8'));
  console.log(`  ${obcinaStats.length} občina stats`);

  // Create lookup map by normalized name
  const normalizeObcinaName = (name: string): string => {
    return name.toUpperCase().trim();
  };

  const statsMap = new Map<string, ObcinaStats>();
  for (const stat of obcinaStats) {
    statsMap.set(normalizeObcinaName(stat.obcina), stat);
  }

  // Merge properties
  let matched = 0;
  let unmatched = 0;
  const unmatchedNames: string[] = [];

  for (const feature of geojson.features) {
    const props = feature.properties;
    const naziv = props.NAZIV as string;

    const stat = statsMap.get(normalizeObcinaName(naziv));
    if (stat) {
      matched++;
      // Add aggregated properties (without cetrtletja)
      props.medianaCenaM2 = stat.medianaCenaM2;
      props.medianaCenaM2Stanovanja = stat.medianaCenaM2Stanovanja;
      props.medianaCenaM2Hise = stat.medianaCenaM2Hise;
      props.povprecjeCenaM2 = stat.povprecjeCenaM2;
      props.povprecjeCenaM2Stanovanja = stat.povprecjeCenaM2Stanovanja;
      props.povprecjeCenaM2Hise = stat.povprecjeCenaM2Hise;
      props.steviloTransakcij = stat.steviloTransakcij;
      props.trendYoY = stat.trendYoY;

      // Add historical stats (for municipalities with no recent data)
      const historical = getHistoricalStats(stat.cetrtletja);
      props.vsegaTransakcij = historical.vsegaTransakcij;
      props.zadnjaTransakcija = historical.zadnjaTransakcija;
      props.zadnjaCenaM2 = historical.zadnjaCenaM2;
    } else {
      unmatched++;
      unmatchedNames.push(naziv);
      props.medianaCenaM2 = null;
      props.medianaCenaM2Stanovanja = null;
      props.medianaCenaM2Hise = null;
      props.povprecjeCenaM2 = null;
      props.povprecjeCenaM2Stanovanja = null;
      props.povprecjeCenaM2Hise = null;
      props.steviloTransakcij = 0;
      props.trendYoY = null;
      props.vsegaTransakcij = 0;
      props.zadnjaTransakcija = null;
      props.zadnjaCenaM2 = null;
    }

    // Round coordinates
    feature.geometry = roundCoordinates(feature.geometry);

    // Remove unnecessary properties
    delete props.DATUM_SYS;
    delete props.EID_OBCINA;
    delete props.FEATUREID;
    delete props.OZNAKA_MESTNE_OBCINE;
    delete props.NAZIV_DJ;
    delete feature.bbox;
  }

  console.log(`  Matched: ${matched}, Unmatched: ${unmatched}`);
  if (unmatchedNames.length > 0 && unmatchedNames.length <= 10) {
    console.log(`  Unmatched names: ${unmatchedNames.join(', ')}`);
  }

  // Remove collection-level metadata
  delete geojson.totalFeatures;
  delete geojson.numberMatched;
  delete geojson.numberReturned;
  delete geojson.crs;
  delete geojson.bbox;

  // Save intermediate file
  const tempPath = outputPath.replace('.geojson', '-temp.geojson');
  fs.writeFileSync(tempPath, JSON.stringify(geojson));
  const tempSize = fs.statSync(tempPath).size;
  console.log(`  Temp file size: ${(tempSize / 1024 / 1024).toFixed(2)} MB`);

  // Simplify with mapshaper
  console.log('  Simplifying with mapshaper...');
  try {
    execSync(
      `npx mapshaper "${tempPath}" -simplify dp 15% keep-shapes -o format=geojson "${outputPath}"`,
      { stdio: 'pipe' }
    );
    const finalSize = fs.statSync(outputPath).size;
    console.log(`  Final file size: ${(finalSize / 1024 / 1024).toFixed(2)} MB`);
  } catch (err) {
    console.warn('  Mapshaper failed, using unsimplified version');
    fs.renameSync(tempPath, outputPath);
  }

  // Clean up temp file
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }

  console.log(`  Saved: ${outputPath}`);
}

/**
 * Main function
 */
async function main() {
  const gursGeoDir = path.join(process.cwd(), 'data', 'gurs', 'geojson');
  const aggregatedDir = path.join(process.cwd(), 'public', 'data');
  const outputDir = path.join(process.cwd(), 'public', 'data');

  // Build KO heatmap
  buildKOHeatmap(
    path.join(gursGeoDir, 'katastrske_obcine_wgs84.geojson'),
    path.join(aggregatedDir, 'aggregated-ko.json'),
    path.join(outputDir, 'heatmap-ko.geojson')
  );

  // Build Občina heatmap
  buildObcinaHeatmap(
    path.join(gursGeoDir, 'obcine_wgs84.geojson'),
    path.join(aggregatedDir, 'aggregated-obcine.json'),
    path.join(outputDir, 'heatmap-obcine.geojson')
  );

  console.log('\n========== DONE ==========\n');
}

main().catch(console.error);
