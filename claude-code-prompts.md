# Claude Code Prompts – CeneNepremičnin.com

## Navodila za uporabo

Ta datoteka vsebuje korak-po-korak prompte za Claude Code (terminal). Kopiraj vsak prompt v Claude Code in počakaj da dokonča. Vsak korak gradi na prejšnjem.

**Predpogoji:**
- Node.js 18+ nameščen
- Podatki preneseni (ETN CSV-ji, SiStat, Eurostat, GeoJSON – vse v data/ direktoriju)
- CLAUDE.md v root direktoriju projekta

---

## FAZA 0: Projekt setup

### Prompt 0.1 – Inicializacija Next.js projekta

```
Preberi CLAUDE.md v tem direktoriju.

Inicializiraj Next.js 14 projekt z App Router in TypeScript:
- npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
- Namesti dependencies: react-leaflet leaflet @types/leaflet proj4 @types/proj4 recharts papaparse @types/papaparse react-leaflet-cluster lucide-react
- Nastavi src/app/layout.tsx z slovenskim meta podatki (lang="sl", charset utf-8, title "Cene Nepremičnin | Interaktivni zemljevid cen nepremičnin v Sloveniji")
- Ustvari prazne route strukture po CLAUDE.md: /, /lokacija, /statistika, /statistika/[slug], /prodaje, /lestvice, /lestvice/najdrazje-nepremicnine, /lestvice/najdrazja-stanovanja, /lestvice/najdrazje-hise, /lestvice/najcenejsa-stanovanja-ljubljana, /lestvice/novogradnje, /o-nas, /o-podatkih, /zasebnost, /pogoji-uporabe, /kontakt
- Dodaj Leaflet CSS import v layout.tsx
- Ustvari tsconfig paths: "@/*" → "src/*"
- Ustvari .gitignore ki ignorira data/ direktorij (raw data), node_modules, .next
```

### Prompt 0.2 – Tipi in konstante

```
Preberi CLAUDE.md za tipe in konstante.

Ustvari naslednje datoteke:

1. src/types/transaction.ts – Transaction interface in KOStats interface (kopiraj iz CLAUDE.md)
2. src/types/geojson.ts – Extended GeoJSON Feature types z properties za heatmap
3. src/types/sistat.ts – JsonStat2Response tip za SiStat podatke
4. src/lib/constants.ts – TILE_LAYERS, SLOVENIA_CENTER, SLOVENIA_BOUNDS, DEFAULT_ZOOM, HEATMAP_BREAKS, HEATMAP_COLORS, PROPERTY_TYPES, getColor() (kopiraj iz CLAUDE.md)
5. src/lib/format.ts – formatPrice, formatPricePerM2, formatDate, formatArea (kopiraj iz CLAUDE.md)
6. src/lib/geo.ts – d96ToWgs84() funkcija z proj4 (kopiraj iz CLAUDE.md)
7. src/lib/stats.ts – median(), percentile(), roundTo() utility funkcije

Preveri da vse kompajla z `npx tsc --noEmit`.
```

---

## FAZA 1: Data processing scripts

### Prompt 1.1 – ETN CSV parser

```
Preberi data-gathering-guide.md, posebej sekcijo 1 (GURS ETN) za strukturo CSV datotek, šifrante in filtrirna pravila.

Ustvari scripts/parse-etn.ts:

Naloga: Preberi vse ETN CSV datoteke (2007-2026) iz data/gurs/etn/, filtriraj, joini, pretvori koordinate in shrani kot JSON.

Koraki:
1. Skeniraj data/gurs/etn/ETN_SLO_*_KPP_*/ direktorije
2. Za vsako leto:
   a. Preberi *_KPP_POSLI_*.csv z papaparse (header: true)
   b. Filtriraj POSLI:
      - TRZNOST_POSLA == 1
      - VRSTA_KUPOPRODAJNEGA_POSLA v [1, 2]
      - VRSTA_AKTA == 1
      - POGODBENA_CENA_ODSKODNINA > 0
   c. Preberi *_KPP_DELISTAVB_*.csv
   d. JOIN DELISTAVB na POSLI po ID_POSLA
   e. Za vsak joined zapis:
      - Pretvori E_CENTROID, N_CENTROID iz EPSG:3794 v WGS84 z d96ToWgs84()
      - Validiraj: lat med 45.42-46.88, lon med 13.38-16.61
      - Izračunaj cenaNaM2 = POGODBENA_CENA / PRODANA_UPORABNA_POVRSINA (ali PRODANA_POVRSINA_DELA_STAVBE)
      - Preskoči če ni koordinat, površine, ali cenaNaM2 < 100 ali > 20000
      - Pretvori DATUM_SKLENITVE_POGODBE iz DD.MM.YYYY v YYYY-MM-DD
      - Map VRSTA_DELA_STAVBE na ime z šifranta
   f. Shrani v public/data/transactions/{leto}.json
3. Na koncu izpiši statistiko: skupno transakcij, po letih, po tipih

Uporabi glob za iskanje datotek, papaparse za CSV parsing, proj4 za koordinate.
Datoteke v data/gurs/etn/ imajo strukturo:
  ETN_SLO_{leto}_KPP_{datum}/ETN_SLO_{leto}_KPP_KPP_POSLI_{datum}.csv
  ETN_SLO_{leto}_KPP_{datum}/ETN_SLO_{leto}_KPP_KPP_DELISTAVB_{datum}.csv

Delimiter je vejica (,), encoding UTF-8. Prazna polja so prazni stringi.

Output Transaction format (iz CLAUDE.md src/types/transaction.ts):
{ id, datum, cena, tip, tipNaziv, povrsina, uporabnaPovrsina, cenaNaM2, lat, lon, sifraKo, imeKo, obcina, naslov, letoIzgradnje, novogradnja, steviloSob, nadstropje }

Poženi script z: npx tsx scripts/parse-etn.ts
```

### Prompt 1.2 – ETN parser za zemljišča

```
Preberi data-gathering-guide.md sekcijo 1c (ZEMLJISCA).

Ustvari scripts/parse-etn-zemljisca.ts:

Enako kot parse-etn.ts, ampak za ZEMLJISCA tabelo:
1. Preberi *_KPP_POSLI_*.csv (isti filtri kot prej)
2. Preberi *_KPP_ZEMLJISCA_*.csv
3. JOIN na ID_POSLA
4. Pretvori koordinate, izračunaj cena/m² za zemljišča
5. Map VRSTA_ZEMLJISCA na ime z šifranta
6. Shrani v public/data/transactions-zemljisca/{leto}.json

Ločimo od stavb ker so cene/m² bistveno drugačne in filtriramo posebej na frontendu.
```

### Prompt 1.3 – Agregacija po katastrskih občinah

```
Preberi CLAUDE.md za KOStats interface.

Ustvari scripts/aggregate.ts:

Naloga: Preberi vse public/data/transactions/*.json, agregiraj po SIFRA_KO.

Za vsako katastrsko občino izračunaj:
- medianaCenaM2: mediana vseh cenaNaM2 (zadnji 2 leti)
- medianaCenaM2Stanovanja: mediana za tip=2 (zadnji 2 leti)
- medianaCenaM2Hise: mediana za tip=1 (zadnji 2 leti)
- steviloTransakcij: skupno število (zadnji 2 leti)
- trendYoY: (mediana zadnje leto - mediana prejšnje leto) / mediana prejšnje leto * 100
- cetrtletja: za vsako četrtletje od 2007-Q1: { mediana, stevilo }
  - Četrtletje iz datuma: Q1=jan-mar, Q2=apr-jun, Q3=jul-sep, Q4=okt-dec

Uporabi src/lib/stats.ts za median().

Shrani: public/data/aggregated-ko.json
Shrani tudi: public/data/aggregated-obcine.json (agregiraj po OBCINA polju)

Poženi: npx tsx scripts/aggregate.ts
```

### Prompt 1.4 – GeoJSON heatmap build

```
Ustvari scripts/build-heatmap.ts:

Naloga: Združi aggregated-ko.json z katastrske_obcine_wgs84.geojson.

1. Preberi data/gurs/geojson/katastrske_obcine_wgs84.geojson
2. Preberi public/data/aggregated-ko.json
3. Za vsak GeoJSON feature:
   - Najdi KO_ID (ali KO_SIFRA ali podobno polje – preveri v GeoJSON properties!) ki ustreza sifraKo
   - Dodaj properties: medianaCenaM2, steviloTransakcij, trendYoY, imeKo, obcina
   - Če ni podatkov za to KO, nastavi medianaCenaM2 = null
4. Simplify z mapshaper ali ročno reduciranje koordinatnih decimalov na 5 mest
5. Shrani: public/data/heatmap-ko.geojson

Enako naredi za občine:
- data/gurs/geojson/obcine_wgs84.geojson + aggregated-obcine.json
- public/data/heatmap-obcine.geojson

Za simplifikacijo namesti mapshaper:
  npm install -D mapshaper
  npx mapshaper input.geojson -simplify dp 15% -o output.geojson

POZOR: Katastrske občine GeoJSON je 79MB. Simplify agresivno na <5MB za web.
Za občine GeoJSON (22MB) simplify na <3MB.
```

### Prompt 1.5 – SiStat in Eurostat parser

```
Preberi data-gathering-guide.md sekciji 2 (SiStat) in 3 (Eurostat).

Ustvari scripts/parse-sistat.ts:
1. Preberi data/sistat/data_indeksi_stan_cetrtletno.json (JSON-stat2 format)
2. Parse flat value array z dimenzijami iz metadata
3. Output: array of { quarter: "2024-Q3", category: "Nova stanovanja", region: "Slovenija", value: 142.5 }
4. Shrani: public/data/sistat-indices.json

Ustvari scripts/parse-eurostat.ts:
1. Preberi data/eurostat/hpi_quarterly.json
2. Parse Eurostat JSON-stat format
3. Output: array of { quarter: "2024-Q3", country: "SI", countryName: "Slovenija", value: 185.2 }
4. Shrani: public/data/eurostat-hpi.json

JSON-stat2 format recap:
- data.id = dimension names array
- data.size = dimension sizes array
- data.dimension[name].category.index = { label: index_number }
- data.dimension[name].category.label = { code: human_label }
- data.value = flat array, row-major order
- Index formula: i = i0 * (s1*s2*s3) + i1 * (s2*s3) + i2 * s3 + i3
```

### Prompt 1.6 – Šifranti JSON

```
Ustvari scripts/build-sifranti.ts:

Preberi šifrant CSV iz kateregakoli ETN direktorija (npr. data/gurs/etn/ETN_SLO_2007_KPP_20260301/ETN_SLO_2007_KPP_sifranti_20260301.csv).

Format: ID,SIFRANT,NUMERICNA_VREDNOST,OPIS

Pretvori v JSON lookup objekt:
{
  "vrstaDela": { "1": "Stanovanjska hiša", "2": "Stanovanje", ... },
  "vrstaPosla": { "1": "Prodaja na prostem trgu", ... },
  "trznost": { "1": "Tržen posel", ... },
  "vrstaZemlisca": { "1": "Stavbno z gradbenim dovoljenjem", ... },
  "stopnjaDdv": { "1": "8,5%", ... }
}

Shrani: public/data/sifranti.json
```

### Prompt 1.7 – Rankings / Lestvice

```
Preberi CLAUDE.md sekcijo "Rankings & Leaderboards".

Ustvari scripts/build-rankings.ts:

Preberi vse public/data/transactions/*.json.

Generiraj naslednje ranking JSON-e:

1. public/data/rankings/najdrazje-100.json
   - Top 100 najdražjih nepremičnin (vse transakcije, sortirano po cena DESC)
   - Polja: rank, id, datum, cena, cenaNaM2, tip, tipNaziv, povrsina, naslov, obcina, lat, lon

2. public/data/rankings/najdrazja-stanovanja-100.json
   - Top 100 najdražjih stanovanj (tip=2, sortirano po cena DESC)

3. public/data/rankings/najdrazje-hise-100.json
   - Top 100 najdražjih hiš (tip=1, sortirano po cena DESC)

4. public/data/rankings/najdrazja-cena-m2-100.json
   - Top 100 po ceni na m² (uporabnaPovrsina >= 20m², sortirano po cenaNaM2 DESC)

5. public/data/rankings/najcenejsa-stanovanja-lj.json
   - Za vsako leto 2007-2025: 10 najcenejših stanovanj v Ljubljani (obcina === 'LJUBLJANA', tip=2)
   - Sortirano po cenaNaM2 ASC znotraj leta
   - Format: { [leto]: Transaction[] }

6. public/data/rankings/najdrazje-obcine.json
   - Vse občine rankirane po mediani cena/m² za stanovanja (zadnji 2 leti)
   - Polja: rank, obcina, medianaCenaM2, steviloTransakcij

7. public/data/rankings/najvecje-podrazitve.json
   - Občine z min. 10 transakcijami, rankirane po YoY % spremembi mediane
   - Polja: rank, obcina, medianaTekoceLeto, medianaPrejsnjeLeto, sprememba (%)

Poženi: npx tsx scripts/build-rankings.ts
```

### Prompt 1.8 – Novogradnje statistika

```
Preberi CLAUDE.md sekcijo "New Construction Analysis".

Ustvari scripts/build-novogradnje.ts:

Preberi vse public/data/transactions/*.json.

Generiraj public/data/novogradnje.json z naslednjo strukturo:

{
  "poLetu": {
    "2007": { "skupaj": 5200, "novogradnje": 1100, "delez": 21.2, "medianaCenaM2Novo": 2450, "medianaCenaM2Rabljeno": 1890, "razlika": 29.6 },
    "2008": { ... },
    ...
  },
  "poObcini": {
    "LJUBLJANA": { "novogradnje": 3200, "delez": 28.5, "medianaCenaM2Novo": 3100 },
    ...
  },
  "poTipu": {
    "stanovanja": { "novo": 8900, "rabljeno": 34000, "delez": 20.7 },
    "hise": { "novo": 2100, "rabljeno": 15000, "delez": 12.3 }
  },
  "starostObProdaji": {
    "0-5": 12300,
    "6-10": 8900,
    "11-20": 15600,
    "21-40": 22100,
    "41-60": 11200,
    "60+": 5400,
    "neznano": 3200
  }
}

Logika:
- novogradnja = transaction.novogradnja === true
- starostObProdaji = leto prodaje (iz datum) minus letoIzgradnje
- Ignoriraj transakcije brez letoIzgradnje za starost histogram
- delez = novogradnje / skupaj * 100
- razlika = (medianaNovo - medianaRabljeno) / medianaRabljeno * 100

Poženi: npx tsx scripts/build-novogradnje.ts
```

---

## FAZA 2: Frontend – Map komponente

### Prompt 2.1 – Osnovni MapContainer

```
Preberi CLAUDE.md za map konfiguracijo (tile layers, center, bounds, zoom).

Ustvari src/components/map/MapContainer.tsx:

- React-leaflet MapContainer z dynamic import (next/dynamic, ssr: false)
- Default center na SLOVENIA_CENTER, zoom SLOVENIA_BOUNDS
- Tile layer: carto_light kot default, toggle za osm in carto_dark
- maxBounds na SLOVENIA_BOUNDS z malo paddinga
- Responsive: full viewport height minus header
- Layer control v desnem kotu za tile layer switching

Ustvari tudi wrapper src/components/map/DynamicMap.tsx ki naredi:
  const Map = dynamic(() => import('./MapContainer'), { ssr: false, loading: () => <div>Nalagam zemljevid...</div> })

Uporabi to v src/app/page.tsx.

POZOR: react-leaflet v4 zahteva "use client" in dynamic import brez SSR.
Leaflet CSS mora biti importan globalno v layout.tsx: import 'leaflet/dist/leaflet.css'
```

### Prompt 2.2 – Choropleth heatmap layer

```
Ustvari src/components/map/HeatmapLayer.tsx:

Naloži public/data/heatmap-obcine.geojson (manjši, za začetek).
Prikaži choropleth z barvno lestvico iz CLAUDE.md (HEATMAP_BREAKS, HEATMAP_COLORS, getColor()).

Za vsak feature/občino:
- fillColor glede na medianaCenaM2 property
- fillOpacity: 0.7
- weight: 1, color: '#666'
- onMouseover: highlight (weight: 3, fillOpacity: 0.9) + tooltip z:
  - Ime občine
  - Mediana cena/m² (formatPricePerM2)
  - Število transakcij
  - Trend YoY (+ ali - %, zelena/rdeča)
- onClick: zoom to bounds + odpri sidebar z detajli

Dodaj legendo v spodnjem levem kotu z barvno lestvico in vrednostmi.

Uporabi react-leaflet GeoJSON component z style in onEachFeature props.
Za tooltip uporabi Leaflet L.tooltip (ne react-leaflet Tooltip – ta je za markerje).

Dodaj toggle za prikaz po občinah ali katastrskih občinah (heatmap-ko.geojson za bolj granularno).
```

### Prompt 2.3 – Transaction markers z clustering

```
Ustvari src/components/map/MarkerCluster.tsx:

Namesti in uporabi react-leaflet-cluster.
Naloži transakcije za zadnje leto iz public/data/transactions/2025.json (ali najnovejše).

Za vsak marker:
- CircleMarker z radijem 5px
- Barva glede na cenaNaM2 (ista barvna lestvica kot heatmap)
- Popup s TransactionPopup komponento

Ustvari src/components/map/TransactionPopup.tsx:
Prikaži v popupu:
- Naslov (ulica, hišna številka, kraj)
- Tip: "Stanovanje" / "Hiša" / itd.
- Cena: formatPrice(cena)
- Površina: formatArea(povrsina)
- Cena/m²: formatPricePerM2(cenaNaM2)
- Datum prodaje: formatDate(datum)
- Leto izgradnje (če obstaja)
- Novogradnja: Da/Ne badge

Lazy loading: Naloži samo podatke za trenutno vidno območje (bounding box filter) ali za izbrano leto.
```

### Prompt 2.4 – Time slider (animacija)

```
Ustvari src/components/map/TimeSlider.tsx:

Range slider od 2007 do 2025 (ali do zadnjega leta s podatki).
Opcija: po letih ali po četrtletjih.

Ko uporabnik premakne slider:
- Heatmap se posodobi z mediananami za izbrano obdobje
- Markerji se filtrirajo na izbrano obdobje
- Animacija: Play/Pause gumb ki avtomatsko premika slider (1 leto/sekundo)

Slider naj bo na dnu zemljevida, čez celotno širino, z letnicami kot oznakami.
Uporabi HTML range input s custom Tailwind styling.

State: year ali [startQuarter, endQuarter]
Emit onChange ki ga MapContainer posreduje HeatmapLayer in MarkerCluster.
```

### Prompt 2.5 – Map controls in filtri

```
Ustvari src/components/map/MapControls.tsx:

Panel na levi strani (ali zgornji vrstici) z:
1. Layer toggle: Heatmap / Markerji / Oboje
2. Granularnost: Občine / Katastrske občine (za heatmap)
3. Property type filter: Stanovanja / Hiše / Poslovni / Vse
4. Prikaz: Mediana cena/m² / Število transakcij / Trend

Ustvari src/components/filters/PropertyTypeFilter.tsx:
- Chip/button group za tipe iz PROPERTY_TYPES konstante
- Multi-select (več tipov hkrati)

Ustvari src/components/filters/PriceRangeFilter.tsx:
- Dual range slider za min/max ceno

Ustvari src/components/filters/DateRangeFilter.tsx:
- Od-do leto selector

Ustvari src/hooks/useFilters.ts:
- useReducer za filter state
- FilterContext provider
- Actions: setPropertyTypes, setPriceRange, setDateRange, setMapLayer, setGranularity
```

---

## FAZA 3: Frontend – Statistika in ostale strani

### Prompt 3.1 – Statistika dashboard

```
Ustvari src/app/statistika/page.tsx:

Naloži public/data/sistat-indices.json in public/data/eurostat-hpi.json.

Prikaži:
1. Hero sekcija: "Nepremičninski trg Slovenije" z ključnimi številkami:
   - Trenutna mediana cena/m² (stanovanja, Slovenija)
   - YoY sprememba (%)
   - Število transakcij (zadnje leto)

2. Graf 1: PriceIndexChart (Recharts LineChart)
   - Indeksi cen stanovanjskih nepremičnin 2007-2025 po četrtletjih
   - Linije za: Nova stanovanja, Rabljena stanovanja, Skupaj
   - Tooltip z vrednostmi

3. Graf 2: EUComparisonChart (Recharts LineChart)
   - Eurostat HPI za SI, AT, HR, HU, DE, EU27
   - Legenda z zastavicami ali kodami držav

4. Graf 3: VolumeChart (Recharts BarChart)
   - Število transakcij po letih
   - Ločeno stanovanja/hiše

5. Tabela: Top 10 najdražjih občin po mediani cena/m²
   - Podatki iz aggregated-obcine.json

Responsive layout z Tailwind grid. Mobile: grafi eden pod drugim.
```

### Prompt 3.2 – Programmatic per-municipality pages

```
Ustvari src/app/statistika/[slug]/page.tsx:

Dinamična stran za vsako občino.

generateStaticParams(): Preberi aggregated-obcine.json, generiraj slug za vsako občino (slugify: lowercase, č→c, š→s, ž→z, spaces→-).

Na strani prikaži:
1. H1: "Cene nepremičnin – {občina}"
2. Ključne številke: mediana stanovanja, mediana hiše, št. transakcij, trend
3. Graf: Cena/m² po četrtletjih za to občino (iz KOStats.cetrtletja)
4. Tabela zadnjih 20 transakcij v tej občini
5. Primerjava z nacionalnim povprečjem (bar chart)
6. Sosednje občine z linki

Meta tags za SEO:
- title: "Cene nepremičnin {občina} 2025 | CeneNepremičnin.com"
- description: "Povprečna cena stanovanja v {občina} je {cena} €/m². Oglejte si vse prodaje in trende."

To so programmatične SEO strani – 212 občin × unikatni content = 212 indexable pages.
```

### Prompt 3.3 – Transaction feed

```
Ustvari src/app/prodaje/page.tsx:

Feed/timeline zadnjih transakcij.

1. Filtri na vrhu: tip nepremičnine, regija/občina, cenovni razpon
2. Seznam transakcij kot kartice (ne tabela):
   - Naslov
   - Tip + ikona
   - Cena (velik font) + cena/m²
   - Površina, leto izgradnje, št. sob
   - Datum prodaje
   - Mini mapa s pinom (statična slika ali majhen Leaflet)
3. Infinite scroll ali pagination (50 na stran)
4. Sortiranje: Najnovejše / Najdražje / Najcenejše / Največja površina

Podatki: Naloži public/data/transactions/2025.json + 2024.json.
Filtriraj client-side.
```

### Prompt 3.4 – Address search / lokacija

```
Ustvari src/app/lokacija/page.tsx in src/components/search/AddressSearch.tsx:

1. Search bar na vrhu: Vnesi naslov ali kraj
2. Geocoding: Uporabi Nominatim API (free, no key):
   GET https://nominatim.openstreetmap.org/search?q={query}&countrycodes=si&format=json&limit=5
   Dodaj User-Agent header.
3. Ko uporabnik izbere rezultat:
   - Zemljevid se centrira na ta naslov
   - Nariše krog radija 500m in 1km
   - Prikaže vse transakcije znotraj radiusa
   - Izračuna in prikaže:
     - Mediana cena/m² v radiusu (stanovanja, hiše ločeno)
     - Število transakcij
     - Trend
     - Seznam transakcij sortirano po oddaljenosti
4. URL se posodobi: /lokacija?naslov=Ljubljana+Dunajska+100

Za radij filtriranje uporabi Haversine formula iz src/lib/geo.ts.
```

### Prompt 3.5 – Lestvice index + ranking pages

```
Preberi CLAUDE.md sekcijo "Rankings & Leaderboards".

Ustvari src/app/lestvice/page.tsx:
Grid kartic za vsako lestvico. Vsaka kartica:
- Naslov lestvice
- Kratek opis
- Preview: Top 3 vnosi
- Link na podstran

Ustvari src/app/lestvice/najdrazje-nepremicnine/page.tsx:
- H1: "Top 100 najdražjih nepremičnin v Sloveniji"
- Opis: "Lestvica 100 najdražjih prodanih nepremičnin od 2007 do danes."
- Naloži public/data/rankings/najdrazje-100.json
- Prikaži kot oštevilčeno tabelo/seznam:
  #1. Naslov, Občina | Tip | Cena | Površina | €/m² | Datum
- Filter po tipu in letu
- Meta: title, description za SEO

Enako ustvari za:
- /lestvice/najdrazja-stanovanja (najdrazja-stanovanja-100.json)
- /lestvice/najdrazje-hise (najdrazje-hise-100.json)
- /lestvice/najdrazja-cena-m2 (najdrazja-cena-m2-100.json)
- /lestvice/najdrazje-obcine (najdrazje-obcine.json) – tabela občin
- /lestvice/najvecje-podrazitve (najvecje-podrazitve.json) – tabela občin z % spremembo

Uporabi skupno RankingTable komponento ki jo lahko reuseaš.
```

### Prompt 3.6 – Najcenejša stanovanja Ljubljana

```
Ustvari src/app/lestvice/najcenejsa-stanovanja-ljubljana/page.tsx:

- H1: "Najcenejša stanovanja v Ljubljani po letih"
- Naloži public/data/rankings/najcenejsa-stanovanja-lj.json
- Za vsako leto (2007-2025) prikaži sekcijo:
  - H2: "{leto}" z medianaCountryM2 za kontekst
  - Tabela 10 najcenejših stanovanj v LJ za to leto
  - Polja: Naslov, Površina, Cena, €/m², Datum
- Na vrhu: summary graf – mediana najcenejših 10 stanovanj po letih (kako se je "najcenejše" spremenilo)
- SEO: "najcenejša stanovanja ljubljana", "ugodna stanovanja ljubljana"
```

### Prompt 3.7 – Novogradnje stran

```
Preberi CLAUDE.md sekcijo "New Construction Analysis".

Ustvari src/app/lestvice/novogradnje/page.tsx:

Naloži public/data/novogradnje.json.

Prikaži:
1. Hero: "Novogradnje v Sloveniji – Statistika 2007–2025"
   - Skupno število prodanih novogradenj
   - Trenutni delež novogradenj v vseh prodajah

2. Graf 1 (Recharts BarChart): Prodaje novogradenj vs rabljenega po letih
   - Stacked ali grouped bar chart
   - Dve barvi: novo (modra), rabljeno (siva)

3. Graf 2 (Recharts LineChart): Delež novogradenj (%) po letih
   - Enostavna linija od 2007 do 2025

4. Graf 3 (Recharts LineChart): Cenovna premija novogradenj
   - Dve liniji: mediana cena/m² novogradnje vs rabljeno
   - Tooltip z % razliko

5. Graf 4 (Recharts BarChart horizontal): Top 20 občin po deležu novogradenj
   - Horizontalne vrstice

6. Graf 5 (Recharts BarChart): Starost nepremičnin ob prodaji
   - Bucketi: 0-5 let, 6-10, 11-20, 21-40, 41-60, 60+
   - Histogram

Responsive layout. Vsak graf z naslovom in kratkim opisom.
SEO meta: "novogradnje slovenija", "cena novogradnje", "kje se gradi v sloveniji"
```

### Prompt 3.8 – O podatkih stran

```
Ustvari src/app/o-podatkih/page.tsx:

Statična stran z:
1. Viri podatkov (z linki):
   - GURS Evidenca trga nepremičnin
   - Statistični urad RS
   - Eurostat
   - OpenStreetMap

2. Atribucija (OBVEZNO):
   "Vir: Geodetska uprava Republike Slovenije, Evidenca trga nepremičnin, 2007–2026"
   "Vir: Statistični urad Republike Slovenije, SI-STAT podatkovni portal"
   "Vir: Eurostat, House Price Index (prc_hpi_q)"
   "Kartografska podlaga: © OpenStreetMap contributors"

3. Metodologija:
   - Katere transakcije so vključene (tržni posli, prosti trg)
   - Kako se računa cena/m²
   - Kaj pomeni mediana
   - Omejitve podatkov

4. Pogostost posodabljanja
```

### Prompt 3.9 – Statične strani (O nas, Zasebnost, Pogoji, Kontakt)

```
Preberi CLAUDE.md sekcijo "Footer" za vsebino statičnih strani.

Ustvari naslednje strani:

1. src/app/o-nas/page.tsx:
   - H1: "O nas"
   - Tekst: "Naša misija je lepo vizualizirati podatke o nepremičninah v Sloveniji, tako da jih lahko vsak enostavno razume."
   - Dodaj: "Vsi podatki so javno dostopni in brezplačni. Stran je neodvisna in ni povezana z nobeno nepremičninsko agencijo."
   - Kratka sekcija o tem kaj stran ponuja (zemljevid, statistika, lestvice, itd.)

2. src/app/zasebnost/page.tsx:
   - H1: "Politika zasebnosti"
   - GDPR compliant text:
     - Ne zbiramo osebnih podatkov uporabnikov
     - Uporabljamo Plausible analytics (brez piškotkov, GDPR compliant)
     - Raptive prikaže oglase ki lahko uporabljajo piškotke tretjih oseb
     - Kontakt za vprašanja: info@cenenepremicnin.com
   - Datum zadnje posodobitve

3. src/app/pogoji-uporabe/page.tsx:
   - H1: "Pogoji uporabe"
   - Podatki so informativne narave in ne predstavljajo cenitve
   - Ne odgovarjamo za točnost ali popolnost podatkov
   - Podatki iz javnih virov (GURS, SURS, Eurostat)
   - Prepovedano avtomatizirano zbiranje podatkov brez dovoljenja
   - Vsebina zaščitena z avtorskim pravom

4. src/app/kontakt/page.tsx:
   - H1: "Kontakt"
   - Email: info@cenenepremicnin.com (mailto link)
   - Kontaktni obrazec (ime, email, sporočilo) – uporabi Formspree ali samo mailto
   - Odzivni čas: do 48 ur

Vse strani naj imajo konsistenten layout z max-width prose containerjem.
```

---

## FAZA 4: Navigation, Layout, Footer, Ads

### Prompt 4.1 – Header in navigacija

```
Preberi CLAUDE.md sekcijo "Navigation (Main Menu)".

Ustvari src/components/layout/Header.tsx:

Desktop:
- Sticky header, bel background, subtilen shadow na spodnji strani
- Levo: Logo "Cene Nepremičnin" (text-xl font-bold, temna barva). Lahko dodaš majhno SVG ikono hiše pred tekstom.
- Desno: Horizontalna navigacija z NAV_ITEMS iz CLAUDE.md
- "Lestvice" ima dropdown (hover na desktop) z sub-items:
  - Najdražje nepremičnine
  - Najcenejša stanovanja v LJ
  - Novogradnje
- Aktivna stran ima vizualni indikator (underline ali barva)
- Ikone iz lucide-react poleg vsakega nav itema (Map, BarChart3, List, Trophy, Search)

Mobile:
- Levo: Logo
- Desno: Hamburger ikona (Menu iz lucide-react)
- Klik odpre MobileMenu komponento

Ustvari src/components/layout/MobileMenu.tsx:
- Full-screen overlay ali slide-in drawer z desne
- Vsi nav items vertikalno
- Lestvice expandable (klik razširi sub-items)
- Na dnu: O nas, Kontakt, Zasebnost, Pogoji uporabe
- X gumb za zapiranje
- Animacija: slide-in z Tailwind transition

POZOR: Uporabi "use client" za interaktivne komponente (dropdown, mobile menu).
```

### Prompt 4.2 – Footer

```
Preberi CLAUDE.md sekcijo "Footer".

Ustvari src/components/layout/Footer.tsx:

Layout: Temnejši background (gray-900 ali slate-800), bel tekst.

1. Zgornji del: 3-stolpčni grid (mobile: 1 stolpec)
   - Stolpec "Raziskuj": Zemljevid cen, Statistika, Zadnje prodaje, Lestvice
   - Stolpec "O strani": O nas, O podatkih, Kontakt
   - Stolpec "Pravno": Politika zasebnosti, Pogoji uporabe

2. Srednji del: Misija
   "Naša misija je lepo vizualizirati podatke o nepremičninah v Sloveniji, tako da jih lahko vsak enostavno razume."

3. Spodnji del (border-top, manjši tekst):
   - Levo: "© 2025 CeneNepremičnin.com. Vsi podatki so javno dostopni."
   - Desno: info@cenenepremicnin.com
   - Pod tem: Atribucija virov v majhnem tekstu:
     "Vir: GURS, SURS, Eurostat | Kartografska podlaga: © OpenStreetMap"
```

### Prompt 4.3 – Layout integration

```
Posodobi src/app/layout.tsx:

- Dodaj Header in Footer komponenti
- Meta tags:
  - title: "Cene Nepremičnin | Interaktivni zemljevid cen nepremičnin v Sloveniji"
  - description: "Raziskujte cene nepremičnin v Sloveniji na interaktivnem zemljevidu. Podatki o prodajah stanovanj, hiš in zemljišč od 2007 do danes."
  - og:title, og:description, og:image, og:url
  - twitter:card, twitter:title, twitter:description
  - canonical URL: https://cenenepremicnin.com
- Raptive ad script placeholder v <head>
- Plausible analytics: <script defer data-domain="cenenepremicnin.com" src="https://plausible.io/js/script.js"></script>
- lang="sl"
- Body: flex flex-col min-h-screen
  - Header (sticky)
  - main (flex-grow): children
  - Footer
- Za homepage (map): main nima padding, full height
- Za ostale strani: main ima py-8 px-4 max-w-7xl mx-auto
```

---

## FAZA 5: Optimizacija in deploy

### Prompt 5.1 – Performance optimizacija

```
Optimiziraj projekt:

1. GeoJSON lazy loading:
   - Naloži heatmap-obcine.geojson samo ko je heatmap aktiven
   - Naloži heatmap-ko.geojson samo ko uporabnik preklopi na KO granularnost
   - Uporabi useSWR ali React.lazy

2. Transaction chunking:
   - Naloži samo trenutno leto na začetku
   - Ko uporabnik scrolls/filtrira nazaj, naloži starejša leta on-demand

3. GeoJSON simplifikacija:
   - Preveri da so heatmap fajli pod 5MB
   - Če ne, simplify bolj agresivno z mapshaper

4. Image optimization:
   - next/image za vse slike
   - Leaflet tile preloading za Slovenijo bounds

5. Bundle size:
   - Preveri z `npx next build` + analyze
   - Leaflet in recharts naj bodo lazy loaded

6. Lighthouse audit:
   - Target: 90+ Performance, 95+ SEO
   - Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
```

### Prompt 5.2 – SEO in sitemap

```
Ustvari:

1. src/app/sitemap.ts:
   - Generiraj sitemap z vsemi statičnimi stranmi
   - Dodaj vseh 212 /statistika/[slug] strani
   - Dodaj vse /lestvice/* strani
   - Priority: / = 1.0, /statistika = 0.9, /lestvice/* = 0.8, /statistika/[slug] = 0.7
   - Base URL: https://cenenepremicnin.com

2. src/app/robots.ts:
   - Allow all
   - Sitemap: https://cenenepremicnin.com/sitemap.xml

3. Structured data (JSON-LD) za homepage:
   - @type: WebApplication
   - name: Cene Nepremičnin
   - url: https://cenenepremicnin.com
   - description: Interaktivni zemljevid cen nepremičnin v Sloveniji

4. Za vsako /statistika/[slug] stran:
   - Unique title, description, h1
   - Schema.org @type: Dataset za structured data

5. Za lestvice strani:
   - Schema.org @type: ItemList za rankirane seznam
```

### Prompt 5.3 – Vercel deploy

```
Pripravi za deployment:

1. next.config.js:
   - output: 'standalone' (za Vercel)
   - images: { unoptimized: true } (če ni Vercel Image Optimization)

2. Preveri da so vsi public/data/ fajli pod Vercel limit (max 50MB per file)
   - Če heatmap-ko.geojson presega, simplify naprej

3. Environment variables v .env.local za Raptive in Plausible

4. Build test: npm run build – brez errorjev

5. Deploy: vercel --prod

6. Post-deploy:
   - Preveri vse route-e
   - Preveri og:image deluje
   - Preveri sitemap.xml
   - Submit sitemap v Google Search Console
```

---

## FAZA 6: Bonus features (po MVP)

### Prompt 6.1 – Primerjava dveh lokacij
```
Dodaj /primerjava stran kjer uporabnik izbere 2 občini in primerja:
- Mediana cena/m² (stanovanja, hiše)
- Trend
- Časovni graf obeh na istem chartu
- Tabela razlik
```

### Prompt 6.2 – Email digest (weekly)
```
Ustvari API route /api/subscribe ki shrani email v database (Supabase ali Turso).
Tedenski email z novimi transakcijami za izbrano regijo.
Uporabi Resend za pošiljanje.
```

### Prompt 6.3 – Cenovni kalkulator
```
Dodaj /kalkulator stran:
- Vnesi: tip nepremičnine, površina, lokacija (občina), leto izgradnje
- Output: ocenjena tržna vrednost na podlagi mediane za podobne nepremičnine
- Prikaži tudi razpon (25. - 75. percentil)
- Disclaimer: "To ni cenitev, ampak statistična ocena na podlagi preteklih prodaj"
```

---

## Zaporedje izvajanja

```
FAZA 0: Setup (30 min)
  0.1 → 0.2

FAZA 1: Data processing (2-3 ure)
  1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8

FAZA 2: Map (3-4 ure)
  2.1 → 2.2 → 2.3 → 2.4 → 2.5

FAZA 3: Pages (4-5 ur)
  3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 3.7 → 3.8 → 3.9

FAZA 4: Navigation + Layout (1-2 uri)
  4.1 → 4.2 → 4.3

FAZA 5: Deploy (1 ura)
  5.1 → 5.2 → 5.3

FAZA 6: Bonus (po potrebi)
  6.1, 6.2, 6.3
```

---

## Debugging tipi

### Leaflet SSR error
```
Error: window is not defined
→ Rešitev: dynamic(() => import('./MapContainer'), { ssr: false })
```

### proj4 not finding EPSG:3794
```
→ Rešitev: Definiraj ročno s proj4.defs() PRED uporabo (glej CLAUDE.md geo.ts)
```

### GeoJSON ne prikaže na mapi
```
→ Preveri: Koordinate morajo biti [lon, lat] v GeoJSON (ne [lat, lon]!)
→ Preveri: CRS mora biti WGS84. Če je še D96/TM, poligoni bodo nekje v Afriki.
```

### Papaparse vrne undefined polja
```
→ Preveri: header: true, delimiter: ','
→ ETN CSV ima header z UTF-8 BOM – uporabi: transformHeader: (h) => h.replace(/^\uFEFF/, '')
```

### Heatmap memory issues (79MB GeoJSON)
```
→ Rešitev: Simplify z mapshaper na <5MB
→ Ali: Uporabi TopoJSON (20-30% manjši od GeoJSON)
→ Ali: Tile GeoJSON z tippecanoe za vector tiles
```
