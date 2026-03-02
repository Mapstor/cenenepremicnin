// Transaction from ETN (Evidenca trga nepremičnin)
export interface Transaction {
  id: number;              // ID_POSLA
  datum: string;           // YYYY-MM-DD (converted from DD.MM.YYYY)
  cena: number;            // EUR
  tip: number;             // VRSTA_DELA_STAVBE (1-15)
  tipNaziv: string;        // "Stanovanje", "Hiša", etc.
  povrsina: number;        // m²
  uporabnaPovrsina: number; // m² (uporabna)
  cenaNaM2: number;        // EUR/m²
  lat: number;             // WGS84
  lon: number;             // WGS84
  sifraKo: number;         // Katastrska občina code
  imeKo: string;           // KO name
  obcina: string;          // Municipality name
  naslov: string;          // Full address
  letoIzgradnje: number | null;
  novogradnja: boolean;
  steviloSob: number | null;
  nadstropje: string | null;
}

// Aggregated stats per Katastrska občina (cadastral community)
export interface KOStats {
  sifraKo: number;
  imeKo: string;
  obcina: string;
  medianaCenaM2: number;        // Overall median
  medianaCenaM2Stanovanja: number;
  medianaCenaM2Hise: number;
  steviloTransakcij: number;
  trendYoY: number;             // % change vs previous year
  zadnjeCetrtletje: string;     // "2025-Q3"
  cetrtletja: {                 // Time series
    [quarter: string]: {
      mediana: number;
      stevilo: number;
    }
  }
}

// Aggregated stats per municipality (občina)
export interface ObcinaStats {
  obcina: string;
  slug: string;
  medianaCenaM2: number;
  medianaCenaM2Stanovanja: number;
  medianaCenaM2Hise: number;
  steviloTransakcij: number;
  trendYoY: number;
  cetrtletja: {
    [quarter: string]: {
      mediana: number;
      stevilo: number;
    }
  }
}

// Land transaction (zemljišče)
export interface ZemljiščeTransaction {
  id: number;
  datum: string;
  cena: number;
  vrstaZemlisca: number;
  vrstaZemliscaNaziv: string;
  povrsina: number;
  cenaNaM2: number;
  lat: number;
  lon: number;
  sifraKo: number;
  imeKo: string;
  obcina: string;
}

// Ranked item for leaderboards
export interface RankedTransaction extends Transaction {
  rank: number;
}

export interface RankedObcina {
  rank: number;
  obcina: string;
  medianaCenaM2: number;
  steviloTransakcij: number;
  trendYoY?: number;
}
