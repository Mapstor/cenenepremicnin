// Map tile layers (free, no API key required)
export const TILE_LAYERS = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  carto_light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CartoDB</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  carto_dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CartoDB</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
} as const;

// Slovenia map defaults
export const SLOVENIA_CENTER: [number, number] = [46.1512, 14.9955];
export const SLOVENIA_BOUNDS: [[number, number], [number, number]] = [
  [45.42, 13.38], // Southwest corner
  [46.88, 16.61], // Northeast corner
];
export const DEFAULT_ZOOM = 9;
export const MIN_ZOOM = 7;
export const MAX_ZOOM = 18;

// Choropleth color scale for €/m² (YlGn color scheme)
export const HEATMAP_BREAKS = [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000];
export const HEATMAP_COLORS = [
  '#ffffcc', // < 500
  '#d9f0a3', // 500-1000
  '#addd8e', // 1000-1500
  '#78c679', // 1500-2000
  '#41ab5d', // 2000-2500
  '#238443', // 2500-3000
  '#006837', // 3000-4000
  '#004529', // 4000-5000
  '#002010', // > 5000
];

// Get color for price per m²
export function getColor(cenaNaM2: number | null): string {
  if (cenaNaM2 === null) return '#cccccc'; // No data
  for (let i = 0; i < HEATMAP_BREAKS.length; i++) {
    if (cenaNaM2 <= HEATMAP_BREAKS[i]) return HEATMAP_COLORS[i];
  }
  return HEATMAP_COLORS[HEATMAP_COLORS.length - 1];
}

// Property type codes from ETN VRSTA_DELA_STAVBE
export const PROPERTY_TYPES = {
  residential: [1, 2],              // 1: Hiša, 2: Stanovanje
  commercial: [5, 6, 7, 8, 9, 10, 11], // Pisarne, Trgovine, etc.
  parking: [3, 4],                  // 3: Garaža, 4: Parkirno mesto
  other: [12, 13, 14, 15],          // Turistični, Kmetijski, etc.
} as const;

// Property type labels (Slovenian)
export const PROPERTY_TYPE_LABELS: { [key: number]: string } = {
  1: 'Stanovanjska hiša',
  2: 'Stanovanje',
  3: 'Garaža',
  4: 'Parkirno mesto',
  5: 'Pisarna',
  6: 'Trgovina',
  7: 'Gostinski lokal',
  8: 'Industrijski objekt',
  9: 'Skladišče',
  10: 'Delavnica',
  11: 'Drug poslovni prostor',
  12: 'Turistični objekt',
  13: 'Kmetijski objekt',
  14: 'Drug stanovanjski objekt',
  15: 'Drugo',
};

// Navigation items
export const NAV_ITEMS = [
  { label: 'Zemljevid', href: '/', icon: 'Map' },
  { label: 'Statistika', href: '/statistika', icon: 'BarChart3' },
  { label: 'Prodaje', href: '/prodaje', icon: 'List' },
  {
    label: 'Lestvice',
    href: '/lestvice',
    icon: 'Trophy',
    children: [
      { label: 'Najdražje nepremičnine', href: '/lestvice/najdrazje-nepremicnine' },
      { label: 'Najdražja stanovanja', href: '/lestvice/najdrazja-stanovanja' },
      { label: 'Najdražje hiše', href: '/lestvice/najdrazje-hise' },
      { label: 'Najcenejša stanovanja v LJ', href: '/lestvice/najcenejsa-stanovanja-ljubljana' },
      { label: 'Novogradnje', href: '/lestvice/novogradnje' },
    ],
  },
  { label: 'Išči lokacijo', href: '/lokacija', icon: 'Search' },
] as const;

// Footer configuration
export const FOOTER = {
  mission:
    'Naša misija je lepo vizualizirati podatke o nepremičninah v Sloveniji, tako da jih lahko vsak enostavno razume.',
  columns: [
    {
      title: 'Raziskuj',
      links: [
        { label: 'Zemljevid cen', href: '/' },
        { label: 'Statistika', href: '/statistika' },
        { label: 'Zadnje prodaje', href: '/prodaje' },
        { label: 'Lestvice', href: '/lestvice' },
      ],
    },
    {
      title: 'O strani',
      links: [
        { label: 'O nas', href: '/o-nas' },
        { label: 'O podatkih', href: '/o-podatkih' },
        { label: 'Kontakt', href: '/kontakt' },
      ],
    },
    {
      title: 'Pravno',
      links: [
        { label: 'Politika zasebnosti', href: '/zasebnost' },
        { label: 'Pogoji uporabe', href: '/pogoji-uporabe' },
      ],
    },
  ],
  contact: 'info@cenenepremicnin.com',
  attribution: [
    'Vir: Geodetska uprava RS, Evidenca trga nepremičnin, 2007–2026',
    'Vir: Statistični urad RS, SI-STAT',
    'Vir: Eurostat, House Price Index',
    '© OpenStreetMap contributors',
  ],
  copyright: '© 2025 CeneNepremičnin.com. Vsi podatki so javno dostopni.',
} as const;

// Data years range
export const DATA_YEAR_START = 2007;
export const DATA_YEAR_END = 2026;

// Trend colors
export const TREND_COLORS = {
  positive: '#16a34a', // green-600
  negative: '#dc2626', // red-600
  neutral: '#6b7280',  // gray-500
} as const;
