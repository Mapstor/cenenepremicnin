import type { Feature, FeatureCollection, Geometry } from 'geojson';

// Properties for KO (katastrska občina) heatmap features
export interface KOHeatmapProperties {
  KO_ID?: number;
  KO_SIFRA?: number;
  KO_MID?: number;
  KO_UIME?: string;
  OB_UIME?: string;
  // Aggregated stats added by build-heatmap.ts
  medianaCenaM2: number | null;
  medianaCenaM2Stanovanja?: number | null;
  medianaCenaM2Hise?: number | null;
  steviloTransakcij: number;
  trendYoY: number | null;
  imeKo?: string;
  obcina?: string;
}

// Properties for municipality (občina) heatmap features
export interface ObcinaHeatmapProperties {
  OB_ID?: number;
  OB_MID?: number;
  OB_UIME?: string;
  OB_SIFRA?: number;
  // Aggregated stats
  medianaCenaM2: number | null;
  medianaCenaM2Stanovanja?: number | null;
  medianaCenaM2Hise?: number | null;
  steviloTransakcij: number;
  trendYoY: number | null;
}

// Extended Feature types for heatmaps
export type KOHeatmapFeature = Feature<Geometry, KOHeatmapProperties>;
export type ObcinaHeatmapFeature = Feature<Geometry, ObcinaHeatmapProperties>;

// FeatureCollection types
export type KOHeatmapCollection = FeatureCollection<Geometry, KOHeatmapProperties>;
export type ObcinaHeatmapCollection = FeatureCollection<Geometry, ObcinaHeatmapProperties>;

// Generic heatmap feature for components
export type HeatmapFeature = KOHeatmapFeature | ObcinaHeatmapFeature;
export type HeatmapCollection = KOHeatmapCollection | ObcinaHeatmapCollection;
