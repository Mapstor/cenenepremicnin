# CLAUDE.md – CeneNepremičnin.com

## Project Overview

Interactive web application visualizing Slovenia's real estate market. Single-page map-first experience with heatmaps, transaction feeds, time-series animations, and local price analysis. Rankings, leaderboards, and article-style content pages for SEO.

**Domain:** cenenepremicnin.com
**Brand:** Cene Nepremičnin
**Language:** Slovenian UI, English code/comments
**Monetization:** Raptive display ads
**Mission:** Lepo vizualizirati podatke o nepremičninah v Sloveniji, tako da jih lahko vsak enostavno razume.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Map:** Leaflet via `react-leaflet` (NOT Mapbox – we want free tile layers)
- **Charts:** Recharts for time-series and bar charts
- **Styling:** Tailwind CSS
- **Data processing:** Node.js scripts with `proj4` for coordinate conversion
- **Deployment:** Vercel
- **Analytics:** Plausible or Umami (self-hosted, GDPR compliant)

---

## Project Structure

```
cenenepremicnin/
├── CLAUDE.md                    # This file
├── data/                        # Raw data (gitignored, stored locally)
│   ├── sistat/                  # SiStat API JSON responses
│   ├── eurostat/                # Eurostat HPI JSON
│   ├── gurs/
│   │   ├── geojson/             # WGS84 boundary polygons
│   │   ├── etn/                 # ETN CSV files by year (2007-2026)
│   │   └── pdf/                 # GURS annual/semi-annual reports
│   └── processed/               # Generated JSON for frontend
├── scripts/                     # Data processing scripts
│   ├── parse-etn.ts             # ETN CSV → filtered JSON
│   ├── parse-etn-zemljisca.ts   # Land transactions
│   ├── aggregate.ts             # Per-KO/municipality aggregation
│   ├── build-heatmap.ts         # Merge aggregates into GeoJSON
│   ├── build-rankings.ts        # Generate ranking/leaderboard JSONs
│   ├── build-novogradnje.ts     # New construction stats by year
│   ├── parse-sistat.ts          # JSON-stat2 → time series
│   ├── parse-eurostat.ts        # Eurostat → time series
│   └── simplify-geo.ts          # Simplify GeoJSON for web (mapshaper)
├── public/
│   ├── data/                    # Processed data served statically
│   │   ├── heatmap-ko.geojson   # Choropleth data (~5MB simplified)
│   │   ├── heatmap-obcine.geojson
│   │   ├── transactions/        # Yearly JSON chunks
│   │   │   ├── 2025.json
│   │   │   ├── 2024.json
│   │   │   └── ...
│   │   ├── rankings/
│   │   │   ├── najdrazje-100.json
│   │   │   ├── najcenejsa-stanovanja-ljubljana.json
│   │   │   └── ...
│   │   ├── novogradnje.json     # New construction stats by year
│   │   ├── timeseries.json      # SiStat + Eurostat combined
│   │   └── sifranti.json        # Lookup tables
│   └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Homepage with map
│   │   ├── lokacija/
│   │   │   └── page.tsx         # Address search → radius analysis
│   │   ├── statistika/
│   │   │   ├── page.tsx         # National dashboard
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # Per-municipality (212 pages)
│   │   ├── prodaje/
│   │   │   └── page.tsx         # Transaction feed/timeline
│   │   ├── lestvice/
│   │   │   ├── page.tsx         # Rankings index
│   │   │   ├── najdrazje-nepremicnine/
│   │   │   │   └── page.tsx     # Top 100 most expensive
│   │   │   ├── najcenejsa-stanovanja-ljubljana/
│   │   │   │   └── page.tsx     # Cheapest apartments LJ by year
│   │   │   └── novogradnje/
│   │   │       └── page.tsx     # New construction trends
│   │   ├── o-nas/
│   │   │   └── page.tsx         # About / mission
│   │   ├── o-podatkih/
│   │   │   └── page.tsx         # Data sources, methodology
│   │   ├── zasebnost/
│   │   │   └── page.tsx         # Privacy policy
│   │   ├── pogoji-uporabe/
│   │   │   └── page.tsx         # Terms of use
│   │   └── kontakt/
│   │       └── page.tsx         # Contact page
│   ├── components/
│   │   ├── map/
│   │   │   ├── MapContainer.tsx     # Main Leaflet wrapper
│   │   │   ├── HeatmapLayer.tsx     # Choropleth by KO/municipality
│   │   │   ├── MarkerCluster.tsx    # Transaction markers
│   │   │   ├── TimeSlider.tsx       # Animated 2007→2025 slider
│   │   │   ├── MapControls.tsx      # Layer toggles, filters
│   │   │   └── TransactionPopup.tsx # Popup for individual sale
│   │   ├── charts/
│   │   │   ├── PriceIndexChart.tsx  # SiStat quarterly indices
│   │   │   ├── EUComparisonChart.tsx # Eurostat HPI comparison
│   │   │   ├── VolumeChart.tsx      # Transaction volume over time
│   │   │   ├── PriceDistribution.tsx # Histogram of prices
│   │   │   └── NovogradnjeChart.tsx # New construction over time
│   │   ├── filters/
│   │   │   ├── PropertyTypeFilter.tsx
│   │   │   ├── PriceRangeFilter.tsx
│   │   │   ├── DateRangeFilter.tsx
│   │   │   └── RegionFilter.tsx
│   │   ├── search/
│   │   │   └── AddressSearch.tsx    # Geocode → radius analysis
│   │   ├── layout/
│   │   │   ├── Header.tsx           # Main navigation
│   │   │   ├── MobileMenu.tsx       # Mobile hamburger menu
│   │   │   ├── Footer.tsx           # Links, attribution, mission
│   │   │   └── Sidebar.tsx
│   │   └── ui/                  # Shared UI components
│   ├── lib/
│   │   ├── data.ts              # Data loading utilities
│   │   ├── geo.ts               # Coordinate conversion (proj4)
│   │   ├── stats.ts             # Median, percentile calculations
│   │   ├── format.ts            # Number/date formatting (Slovenian locale)
│   │   └── constants.ts         # Color scales, breakpoints, nav items
│   ├── hooks/
│   │   ├── useMapData.ts        # Fetch and cache GeoJSON
│   │   ├── useTransactions.ts   # Lazy-load transaction chunks
│   │   └── useFilters.ts        # Filter state management
│   └── types/
│       ├── transaction.ts       # Transaction type definitions
│       ├── geojson.ts           # Extended GeoJSON types
│       └── sistat.ts            # SiStat response types
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .gitignore
```

---

## Data Architecture

### Raw Data (gitignored, local only)
- `data/gurs/etn/` – 262MB of CSV files (2007-2026)
- `data/gurs/geojson/` – 108MB of boundary GeoJSON (WGS84)
- `data/sistat/` – 20KB of API responses
- `data/eurostat/` – 9KB of API responses
- `data/gurs/pdf/` – 187MB of PDF reports

### Processed Data (committed, served statically via /public/data/)
All processing scripts output to `public/data/`. This data is committed to git and deployed with the app.

### Key Data Types

```typescript
// src/types/transaction.ts
interface Transaction {
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

// Aggregated per-KO for heatmap
interface KOStats {
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
```

---

## Coordinate Systems

**CRITICAL:** All raw GURS data uses EPSG:3794 (D96/TM). Convert to WGS84 (EPSG:4326) for Leaflet.

### In Node.js scripts:
```typescript
import proj4 from 'proj4';

proj4.defs('EPSG:3794',
  '+proj=tmerc +lat_0=0 +lon_0=15 +k=0.9999 +x_0=500000 +y_0=-5000000 +ellps=GRS80 +units=m +no_defs'
);

export function d96ToWgs84(e: number, n: number): [number, number] {
  const [lon, lat] = proj4('EPSG:3794', 'EPSG:4326', [e, n]);
  return [lat, lon];
}
```

### Validation
Slovenia bounding box (WGS84): lat 45.42–46.88, lon 13.38–16.61

---

## ETN Data Filtering Rules

### Include (for market analysis):
- `TRZNOST_POSLA = 1` (Tržen posel)
- `VRSTA_KUPOPRODAJNEGA_POSLA IN (1, 2)` (Prosti trg, Javna dražba)
- `VRSTA_AKTA = 1` (Osnovna pogodba, ne aneksi)
- Has valid E_CENTROID and N_CENTROID
- Has PRODANA_UPORABNA_POVRSINA > 0
- POGODBENA_CENA > 0

### Exclude:
- `TRZNOST_POSLA IN (2,3,4,5)` – Netržni ali nepreverjeni posli
- `VRSTA_KUPOPRODAJNEGA_POSLA IN (4,5,6,7,8)` – Med povezanimi, lizing, razlastitev
- Transactions without coordinates or surface area
- Extreme outliers: cena_m2 < 100 or cena_m2 > 20000 (for residential)

### Property type mapping (for UI filters):
```typescript
const PROPERTY_TYPES = {
  residential: [1, 2],        // Hiša, Stanovanje
  commercial: [5, 6, 7, 8, 9, 10, 11], // Pisarne, Trgovine, etc.
  parking: [3, 4],            // Parking, Garaža
  other: [12, 13, 14, 15],    // Turistični, Kmetijski, etc.
} as const;
```

---

## Slovenian Locale & Formatting

```typescript
// src/lib/format.ts

export function formatPrice(eur: number): string {
  return new Intl.NumberFormat('sl-SI', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(eur);
  // "155.000 €"
}

export function formatPricePerM2(eur: number): string {
  return `${new Intl.NumberFormat('sl-SI', { maximumFractionDigits: 0 }).format(eur)} €/m²`;
  // "2.450 €/m²"
}

export function formatDate(dateStr: string): string {
  // Input: "2024-03-15" or "15.03.2024"
  const d = new Date(dateStr);
  return d.toLocaleDateString('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' });
  // "15. marec 2024"
}

export function formatArea(m2: number): string {
  return `${new Intl.NumberFormat('sl-SI', { maximumFractionDigits: 1 }).format(m2)} m²`;
  // "68,5 m²"
}
```

---

## Map Configuration

### Tile layers (free, no API key):
```typescript
const TILE_LAYERS = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
  },
  carto_light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB © OpenStreetMap contributors',
  },
  carto_dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB © OpenStreetMap contributors',
  },
};

const SLOVENIA_CENTER: [number, number] = [46.1512, 14.9955];
const SLOVENIA_BOUNDS: [[number, number], [number, number]] = [[45.42, 13.38], [46.88, 16.61]];
const DEFAULT_ZOOM = 8;
```

### Choropleth color scale (€/m²):
```typescript
const HEATMAP_BREAKS = [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000];
const HEATMAP_COLORS = [
  '#ffffcc', '#d9f0a3', '#addd8e', '#78c679',
  '#41ab5d', '#238443', '#006837', '#004529', '#002010'
];

function getColor(cenaNaM2: number): string {
  for (let i = 0; i < HEATMAP_BREAKS.length; i++) {
    if (cenaNaM2 <= HEATMAP_BREAKS[i]) return HEATMAP_COLORS[i];
  }
  return HEATMAP_COLORS[HEATMAP_COLORS.length - 1];
}
```

---

## Performance Considerations

### GeoJSON simplification
Raw katastrske_obcine_wgs84.geojson is 79MB – way too big for web. Simplify:
```bash
npx mapshaper katastrske_obcine_wgs84.geojson \
  -simplify dp 15% \
  -o format=geojson heatmap-ko.geojson
# Target: <5MB
```

### Transaction data chunking
262MB of raw CSV → split processed JSON by year:
```
public/data/transactions/2024.json  (~800KB)
public/data/transactions/2023.json  (~700KB)
...
```
Lazy-load only the years the user needs. Most recent year loads first.

### Marker clustering
Use `react-leaflet-cluster` for 100K+ transaction markers. Show individual markers only at zoom ≥ 14.

---

## Navigation (Main Menu)

### Desktop: Horizontal top nav
```typescript
const NAV_ITEMS = [
  { label: 'Zemljevid', href: '/', icon: 'Map' },
  { label: 'Statistika', href: '/statistika', icon: 'BarChart3' },
  { label: 'Prodaje', href: '/prodaje', icon: 'List' },
  { label: 'Lestvice', href: '/lestvice', icon: 'Trophy',
    children: [
      { label: 'Najdražje nepremičnine', href: '/lestvice/najdrazje-nepremicnine' },
      { label: 'Najcenejša stanovanja v LJ', href: '/lestvice/najcenejsa-stanovanja-ljubljana' },
      { label: 'Novogradnje', href: '/lestvice/novogradnje' },
    ]
  },
  { label: 'Išči lokacijo', href: '/lokacija', icon: 'Search' },
];
```

### Mobile: Hamburger → full-screen overlay or slide-in drawer
- Logo (left) + Hamburger (right) in header
- Menu opens with all items + footer links (O nas, Kontakt, etc.)
- Current page highlighted

### Design:
- Sticky header, white background, subtle bottom shadow
- Logo: "Cene Nepremičnin" text logo (bold weight, dark color) or simple SVG house icon + text
- Active nav item: underline or colored indicator
- Dropdown for Lestvice: hover on desktop, tap on mobile
- Icons from lucide-react (Map, BarChart3, List, Trophy, Search)

---

## Footer

```typescript
const FOOTER = {
  mission: "Naša misija je lepo vizualizirati podatke o nepremičninah v Sloveniji, tako da jih lahko vsak enostavno razume.",
  columns: [
    {
      title: "Raziskuj",
      links: [
        { label: "Zemljevid cen", href: "/" },
        { label: "Statistika", href: "/statistika" },
        { label: "Zadnje prodaje", href: "/prodaje" },
        { label: "Lestvice", href: "/lestvice" },
      ]
    },
    {
      title: "O strani",
      links: [
        { label: "O nas", href: "/o-nas" },
        { label: "O podatkih", href: "/o-podatkih" },
        { label: "Kontakt", href: "/kontakt" },
      ]
    },
    {
      title: "Pravno",
      links: [
        { label: "Politika zasebnosti", href: "/zasebnost" },
        { label: "Pogoji uporabe", href: "/pogoji-uporabe" },
      ]
    }
  ],
  contact: "info@cenenepremicnin.com",
  attribution: [
    "Vir: Geodetska uprava RS, Evidenca trga nepremičnin, 2007–2026",
    "Vir: Statistični urad RS, SI-STAT",
    "Vir: Eurostat, House Price Index",
    "© OpenStreetMap contributors"
  ],
  copyright: "© 2025 CeneNepremičnin.com. Vsi podatki so javno dostopni."
};
```

### Static pages content:

**/o-nas:** Naša misija je lepo vizualizirati podatke o nepremičninah v Sloveniji, tako da jih lahko vsak enostavno razume. Vsi podatki so javno dostopni in brezplačni. Stran je neodvisna in ni povezana z nobeno nepremičninsko agencijo.

**/kontakt:** Email: info@cenenepremicnin.com. Preprost kontakt form (ime, email, sporočilo) – uporabi Formspree ali Resend.

**/zasebnost (Politika zasebnosti):** GDPR compliant. Ne zbiramo osebnih podatkov. Uporabljamo Plausible analytics (brez piškotkov). Raptive prikaže oglase (tretji piškotki). Povezava na Raptive privacy policy.

**/pogoji-uporabe (Pogoji uporabe):** Podatki so informativne narave. Ne odgovarjamo za točnost. Podatki iz javnih virov (GURS, SURS, Eurostat). Prepovedano je scraping za komercialne namene brez dovoljenja.

---

## Rankings & Leaderboards (Content Pages)

### Data processing (scripts/build-rankings.ts)

From processed transaction data, generate ranking JSONs:

```typescript
// Rankings to generate:
interface RankingConfig {
  slug: string;
  title: string;
  description: string;
  query: (transactions: Transaction[]) => RankedItem[];
}

const RANKINGS: RankingConfig[] = [
  {
    slug: 'najdrazje-nepremicnine',
    title: 'Top 100 najdražjih nepremičnin v Sloveniji',
    description: 'Lestvica 100 najdražjih prodanih nepremičnin vseh časov (2007–2026)',
    query: (tx) => tx
      .sort((a, b) => b.cena - a.cena)
      .slice(0, 100)
  },
  {
    slug: 'najdrazja-stanovanja',
    title: 'Top 100 najdražjih stanovanj',
    description: 'Najdražja prodana stanovanja v Sloveniji',
    query: (tx) => tx
      .filter(t => t.tip === 2)
      .sort((a, b) => b.cena - a.cena)
      .slice(0, 100)
  },
  {
    slug: 'najdrazje-hise',
    title: 'Top 100 najdražjih hiš',
    description: 'Najdražje prodane hiše v Sloveniji',
    query: (tx) => tx
      .filter(t => t.tip === 1)
      .sort((a, b) => b.cena - a.cena)
      .slice(0, 100)
  },
  {
    slug: 'najdrazja-cena-m2',
    title: 'Top 100 najvišjih cen na m²',
    description: 'Nepremičnine z najvišjo ceno na kvadratni meter',
    query: (tx) => tx
      .filter(t => t.uporabnaPovrsina >= 20) // Exclude tiny units
      .sort((a, b) => b.cenaNaM2 - a.cenaNaM2)
      .slice(0, 100)
  },
  {
    slug: 'najcenejsa-stanovanja-ljubljana',
    title: 'Najcenejša stanovanja v Ljubljani po letih',
    description: 'Najbolj ugodna stanovanja prodana v Ljubljani vsako leto',
    query: (tx) => {
      // Group by year, filter LJ, get cheapest 10 per year
      const years = groupBy(tx.filter(t => t.tip === 2 && t.obcina === 'LJUBLJANA'), 'leto');
      return Object.entries(years).flatMap(([year, txs]) =>
        txs.sort((a, b) => a.cenaNaM2 - b.cenaNaM2).slice(0, 10).map(t => ({ ...t, year }))
      );
    }
  },
  {
    slug: 'najdrazje-obcine',
    title: 'Najdražje občine v Sloveniji',
    description: 'Občine z najvišjo mediano cene na m² za stanovanja',
    query: (tx) => {
      // Aggregate median cena/m2 per municipality, rank
    }
  },
  {
    slug: 'najvecje-podrazitve',
    title: 'Občine z največjimi podražitvami',
    description: 'Kje so se cene nepremičnin najbolj zvišale v zadnjem letu',
    query: (tx) => {
      // YoY trend per municipality, rank by highest increase
    }
  },
];
```

### Page template (/lestvice/[slug])
Each ranking page:
1. H1: title
2. Description paragraph
3. Numbered table/list with:
   - Rank (#1, #2, ...)
   - Naslov / Lokacija
   - Tip (Stanovanje/Hiša/...)
   - Cena (formatPrice)
   - Površina (formatArea)
   - Cena/m² (formatPricePerM2)
   - Datum prodaje
4. Filter controls (by year, by type)
5. SEO meta: unique title + description per ranking

### /lestvice index page
Grid of ranking cards with title, description, and preview (top 3).

---

## New Construction Analysis (Novogradnje)

### Data available in ETN:
- `NOVOGRADNJA`: 0=Ne, 1=Da (in DELISTAVB table)
- `LETO_IZGRADNJE_DELA_STAVBE`: Construction year
- `GRADBENA_FAZA`: Construction phase (1-6)

### Processing (scripts/build-novogradnje.ts)
```typescript
interface NovogradnjeStats {
  poLetu: {
    [year: string]: {
      skupaj: number;          // Total sales
      novogradnje: number;     // New construction sales
      delez: number;           // % new construction
      medianaCenaM2Novo: number;
      medianaCenaM2Rabljeno: number;
      razlika: number;         // % premium for new
    }
  };
  poObcini: {
    [obcina: string]: {
      novogradnje: number;
      delez: number;
      medianaCenaM2Novo: number;
    }
  };
  poTipu: {
    stanovanja: { novo: number; rabljeno: number; delez: number };
    hise: { novo: number; rabljeno: number; delez: number };
  };
  starostObProdaji: {
    // Distribution: how old are properties when sold
    [bucket: string]: number;  // "0-5 let": 2340, "6-10 let": 1890, ...
  };
}
```

### Charts on /lestvice/novogradnje page:
1. **Prodaje novogradenj po letih** – Bar chart: novogradnje vs rabljene po letih
2. **Delež novogradenj** – Line chart: % novogradenj v vseh prodajah 2007-2025
3. **Cenovna premija novogradenj** – Line chart: mediana cena/m² novo vs rabljeno
4. **Kje se gradi** – Horizontal bar chart: top 20 občin po deležu novogradenj
5. **Starost ob prodaji** – Histogram: koliko let stare so nepremičnine ko se prodajo

### SEO:
- "novogradnje slovenija statistika"
- "koliko novogradenj se proda"
- "cena novogradnje vs rabljeno"
- "kje se gradi v sloveniji"

---

## SEO Strategy

### Target keywords:
- "cene nepremičnin slovenija" (2,900/mo)
- "cene stanovanj ljubljana" (1,300/mo)
- "nepremičninski trg slovenija" (720/mo)
- "cena na kvadratni meter [mesto]" (long-tail × 212 občin)
- "koliko stanejo stanovanja v [mestu]"
- "najdražje nepremičnine slovenija" (new)
- "najcenejša stanovanja ljubljana" (new)
- "novogradnje slovenija" (new)
- "cena novogradnje vs rabljeno" (new)

### URL structure:
```
/                                        → Interaktivni zemljevid cen nepremičnin
/lokacija?naslov=Ljubljana               → Cene nepremičnin v bližini naslova
/statistika                              → Statistika nepremičninskega trga
/statistika/ljubljana                    → Cene nepremičnin Ljubljana (× 212 občin)
/prodaje                                 → Zadnje prodaje nepremičnin
/lestvice                                → Indeks lestvic
/lestvice/najdrazje-nepremicnine         → Top 100 najdražjih
/lestvice/najdrazja-stanovanja           → Top 100 najdražjih stanovanj
/lestvice/najdrazje-hise                 → Top 100 najdražjih hiš
/lestvice/najdrazja-cena-m2             → Top 100 po ceni na m²
/lestvice/najcenejsa-stanovanja-ljubljana → Najcenejša stanovanja LJ po letih
/lestvice/najdrazje-obcine              → Najdražje občine
/lestvice/najvecje-podrazitve           → Občine z največjim rastom cen
/lestvice/novogradnje                    → Novogradnje statistika
/o-nas                                   → O nas / misija
/o-podatkih                              → Viri podatkov in metodologija
/zasebnost                               → Politika zasebnosti
/pogoji-uporabe                          → Pogoji uporabe
/kontakt                                 → Kontakt
```

### Per-municipality pages (programmatic):
Generate `/statistika/[slug]` for each of 212 municipalities. Each page:
- H1: "Cene nepremičnin – [Občina]"
- Median price/m² for stanovanja and hiše
- Price chart over time
- Recent transactions table
- Comparison to national average
- Neighboring municipalities

---

## Coding Conventions

- **TypeScript strict mode** – no `any` types
- **Component naming:** PascalCase, one component per file
- **Data files:** camelCase for JSON keys
- **Comments:** English
- **UI text:** Slovenian (hardcoded, no i18n needed)
- **Formatting:** Prettier with defaults
- **Imports:** Absolute paths via `@/` alias
- **State management:** React Context + useReducer for filter state. No Redux.
- **Data fetching:** Static JSON files via fetch() in useEffect or useSWR. No API routes needed (all data is pre-processed).

---

## Environment Variables

```env
# .env.local (not committed)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=cenenepremicnin.com
NEXT_PUBLIC_SITE_URL=https://cenenepremicnin.com
NEXT_PUBLIC_CONTACT_EMAIL=info@cenenepremicnin.com

# Raptive ad script (injected in layout.tsx <head>)
NEXT_PUBLIC_RAPTIVE_SITE_ID=xxx
```

---

## Build & Deploy

```bash
# Development
npm run dev

# Process data (run manually when new ETN data arrives)
npx tsx scripts/parse-etn.ts
npx tsx scripts/parse-etn-zemljisca.ts
npx tsx scripts/aggregate.ts
npx tsx scripts/build-heatmap.ts
npx tsx scripts/build-rankings.ts
npx tsx scripts/build-novogradnje.ts
npx tsx scripts/parse-sistat.ts
npx tsx scripts/parse-eurostat.ts

# Build for production
npm run build

# Deploy
vercel --prod
```

---

## Attribution (required on /o-podatkih page)

```
Vir: Geodetska uprava Republike Slovenije, Evidenca trga nepremičnin, 2007–2026
Vir: Statistični urad Republike Slovenije, SI-STAT podatkovni portal
Vir: Eurostat, House Price Index (prc_hpi_q)
Kartografska podlaga: © OpenStreetMap contributors
```

## Contact

- Email: info@cenenepremicnin.com
- Domain: cenenepremicnin.com
