// JSON-stat2 response format from SiStat and Eurostat APIs

export interface JsonStat2Dimension {
  label: string;
  category: {
    index: { [code: string]: number };
    label: { [code: string]: string };
    unit?: { [code: string]: { base: string; decimals: number } };
  };
}

export interface JsonStat2Response {
  version: string;
  class: string;
  label: string;
  source: string;
  updated: string;
  id: string[];
  size: number[];
  dimension: {
    [dimensionId: string]: JsonStat2Dimension;
  };
  value: (number | null)[];
  status?: { [index: string]: string };
  note?: string[];
  link?: {
    alternate?: { type: string; href: string }[];
  };
}

// Parsed time series data point
export interface SiStatDataPoint {
  quarter: string;      // "2024-Q3"
  category: string;     // "Nova stanovanja", "Rabljena stanovanja", etc.
  region: string;       // "Slovenija" or regional name
  value: number | null; // Index value (base 2015=100)
}

// Eurostat HPI data point
export interface EurostatHPIDataPoint {
  quarter: string;      // "2024-Q3"
  country: string;      // "SI", "AT", "HR", etc.
  countryName: string;  // "Slovenija", "Avstrija", "Hrvaška", etc.
  value: number | null; // HPI value (base varies)
}

// Combined time series for frontend
export interface TimeSeriesData {
  sistat: SiStatDataPoint[];
  eurostat: EurostatHPIDataPoint[];
}
