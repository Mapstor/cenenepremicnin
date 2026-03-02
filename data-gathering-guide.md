# Nepremičnine Map – Data Gathering Mission

## Pregled: Kaj potrebujemo, od kod, in kako

### Povzetek virov

| # | Vir | Kaj dobiš | Kako | Format | Velikost (ocena) |
|---|------|-----------|------|--------|-------------------|
| 1 | SiStat PxWeb API | Cenovni indeksi (2007–2025), št. prodaj, vrednosti | POST request na API | JSON-stat | ~50 KB |
| 2 | GURS JGP | Surove transakcije ETN (vsaka prodaja od 2007) | Ročen prenos po registraciji | .etn datoteke | ~500 MB+ |
| 3 | GURS WFS | Katastrske občine (poligoni za zemljevid) | GET request na WFS | GeoJSON/GML | ~50 MB |
| 4 | GURS Vrednosti | Posplošene vrednosti nepremičnin | Prenos prek JGP | CSV/XML | ~1 GB+ |
| 5 | Eurostat API | HPI indeks za EU primerjavo | GET request | JSON-stat | ~20 KB |
| 6 | GURS PDF poročila | Povprečne cene €/m² po regijah | Download PDF + ročni extract | PDF | ~20 MB |

---

## 1. SiStat PxWeb API – Cenovni indeksi (PROGRAMATIČNO)

To je najlažji vir. PxWeb API je standarden, dokumentiran, brez registracije.

### 1A. Indeksi cen stanovanjskih nepremičnin – ČETRTLETNO

```bash
# Najprej GET za metadata (katere kategorije/leta so na voljo)
curl -s "https://pxweb.stat.si/SiStatData/api/v1/sl/Data/0419001S.PX" \
  -o metadata_stanovanjske_cetrtletno.json

# Potem POST za podatke – vse kategorije, vsa leta, vsi indeksi
curl -s -X POST "https://pxweb.stat.si/SiStatData/api/v1/sl/Data/0419001S.PX" \
  -H "Content-Type: application/json" \
  -d '{
    "query": [
      {
        "code": "STANOVANJSKE NEPREMICNINE",
        "selection": { "filter": "all", "values": ["*"] }
      },
      {
        "code": "CETRTLETJE",
        "selection": { "filter": "all", "values": ["*"] }
      },
      {
        "code": "INDEKSI",
        "selection": { "filter": "all", "values": ["*"] }
      }
    ],
    "response": { "format": "json-stat" }
  }' \
  -o data_indeksi_stanovanjske_cetrtletno.json
```

**Kaj dobiš:** Indeksi cen za 11 podkategorij (nova stanovanja, rabljena Ljubljana/Maribor/preostala SLO, hiše itd.), četrtletno od Q1 2007. 4 tipe indeksov (QoQ, YoY, baza 2015, baza prejšnje leto).

### 1B. Indeksi cen stanovanjskih nepremičnin – LETNO

```bash
curl -s -X POST "https://pxweb.stat.si/SiStatData/api/v1/sl/Data/0419005S.PX" \
  -H "Content-Type: application/json" \
  -d '{
    "query": [
      { "code": "STANOVANJSKE NEPREMICNINE", "selection": { "filter": "all", "values": ["*"] } },
      { "code": "LETO", "selection": { "filter": "all", "values": ["*"] } },
      { "code": "INDEKSI", "selection": { "filter": "all", "values": ["*"] } }
    ],
    "response": { "format": "json-stat" }
  }' \
  -o data_indeksi_stanovanjske_letno.json
```

### 1C. Število in vrednost prodaj – ČETRTLETNO

```bash
curl -s -X POST "https://pxweb.stat.si/SiStatData/api/v1/sl/Data/0419030S.px" \
  -H "Content-Type: application/json" \
  -d '{
    "query": [
      { "code": "STANOVANJSKE NEPREMICNINE", "selection": { "filter": "all", "values": ["*"] } },
      { "code": "CETRTLETJE", "selection": { "filter": "all", "values": ["*"] } },
      { "code": "MERITVE", "selection": { "filter": "all", "values": ["*"] } }
    ],
    "response": { "format": "json-stat" }
  }' \
  -o data_prodaje_stevilo_vrednost.json
```

**Kaj dobiš:** Število prodanih nepremičnin in skupna vrednost v EUR, po tipih, četrtletno.

### 1D. Indeksi cen POSLOVNIH nepremičnin – ČETRTLETNO

```bash
curl -s -X POST "https://pxweb.stat.si/SiStatData/api/v1/sl/Data/0419035S.PX" \
  -H "Content-Type: application/json" \
  -d '{
    "query": [
      { "code": "POSLOVNE NEPREMICNINE", "selection": { "filter": "all", "values": ["*"] } },
      { "code": "CETRTLETJE", "selection": { "filter": "all", "values": ["*"] } },
      { "code": "INDEKS", "selection": { "filter": "all", "values": ["*"] } }
    ],
    "response": { "format": "json-stat" }
  }' \
  -o data_indeksi_poslovne.json
```

### OPOMBA o PxWeb API

- Imena polj (code) so lahko malce drugačna – NAJPREJ poženi GET request za metadata, da vidiš točna imena
- Če POST vrne napako, probaj z `"filter": "item"` namesto `"all"` in podaj specifične values
- API limit: 100 klicev / 10 sekund
- Če hočeš CSV namesto JSON: zamenjaj `"format": "csv"` v response

---

## 2. GURS ETN – Surove transakcije (DELNO ROČNO)

To je tvoj najpomembnejši vir za zemljevid s posameznimi prodajami.

### Kako do podatkov:

1. Odpri https://ipi.eprostor.gov.si/jgp/
2. Registracija NI potrebna za javne podatke
3. Išči: "Evidenca trga nepremičnin" ali "ETN"
4. Prenos kupoprodajnih poslov – razvrščeni po letih (2007, 2008, ... 2025)
5. Datoteke so v ZIP obliki, vsebujejo .etn datoteke (tabelarični format)

### Struktura ETN datotek:

```
ETN_kupoprodajni/
├── {leto}/
│   ├── posli.etn          # Splošni podatki o poslu (ID, datum, cena, tip posla)
│   ├── delistavb.etn      # Deli stavb (stanovanja, pisarne...) s površino, letom gradnje
│   ├── zemljisca.etn      # Zemljišča (parcele) s površino
│   └── stranke.etn        # NE – osebni podatki niso javni
```

### Ključna polja v posli.etn:

- ID posla
- Datum sklenitve pogodbe
- Pogodbena cena (EUR)
- Vrsta posla (prosti trg, dražba, povezani kupec...)
- Katastrska občina (to daje lokacijo!)

### Ključna polja v delistavb.etn:

- ID posla (za join)
- Vrsta dela stavbe (stanovanje, hiša, pisarna, lokal, garaža...)
- Uporabna površina (m²)
- Leto izgradnje
- Katastrska občina, številka stavbe, številka dela stavbe

### Kako parsati:

```python
# parse_etn.py – primer za parsanje ETN datotek
import csv
import json
import os

def parse_etn_file(filepath, delimiter='|'):
    """Parse .etn file (pipe-delimited CSV-like format)"""
    rows = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=delimiter)
        headers = next(reader)
        headers = [h.strip() for h in headers]
        for row in reader:
            if len(row) == len(headers):
                rows.append(dict(zip(headers, [v.strip() for v in row])))
    return headers, rows

# Primer uporabe
for year in range(2007, 2026):
    posli_path = f'ETN_kupoprodajni/{year}/posli.etn'
    deli_path = f'ETN_kupoprodajni/{year}/delistavb.etn'
    
    if os.path.exists(posli_path):
        headers, posli = parse_etn_file(posli_path)
        print(f"{year}: {len(posli)} poslov")
```

### ⚠️ Pomembno:

- Delimiter je verjetno `|` (pipe) ali `\t` (tab) – preveri ko preneseš
- Katastrska občina je številčna šifra – potrebuješ lookup tabelo za ime/koordinate
- Podatki NISO geo-referencirani (ni lat/lon!) – lokacijo dobiš prek katastrske občine
- Za natančno lokacijo bi potreboval join z GURS katastrom (parcele)

---

## 3. GURS WFS – Katastrske občine poligoni (PROGRAMATIČNO)

Za zemljevid potrebuješ meje občin/katastrskih občin. GURS ima javne WFS servise.

### 3A. Katastrske občine (za join z ETN podatki)

```bash
# Seznam katastrskih občin s koordinatami
curl -s "https://ipi.eprostor.gov.si/wfs-si-gurs-kn-osnovni/wfs?\
request=getFeature&\
typename=KATASTRSKE_OBCINE_TABELA&\
outputFormat=application/json&\
count=5000" \
  -o katastrske_obcine.geojson
```

### 3B. Občine (za agregacijo)

```bash
# Meje občin
curl -s "https://ipi.eprostor.gov.si/wfs-si-gurs-rpe/wfs?\
request=getFeature&\
typename=SI.GURS.RPE:OBCINE&\
outputFormat=application/json&\
count=300" \
  -o obcine.geojson
```

### 3C. Statistične regije

```bash
curl -s "https://ipi.eprostor.gov.si/wfs-si-gurs-rpe/wfs?\
request=getFeature&\
typename=SI.GURS.RPE:STATISTICNE_REGIJE&\
outputFormat=application/json&\
count=20" \
  -o statisticne_regije.geojson
```

### OPOMBA:
- WFS servisi so v koordinatnem sistemu D96/TM (EPSG:3794) – za Leaflet potrebuješ WGS84 (EPSG:4326)
- Pretvori z: `ogr2ogr -f GeoJSON -t_srs EPSG:4326 output.geojson input.geojson`
- Ali dodaj `&SRSName=EPSG:4326` v request (če WFS podpira)

---

## 4. Eurostat API – EU primerjava (PROGRAMATIČNO)

```bash
# House Price Index, četrtletno, vse EU države
curl -s "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hpi_q?\
geo=SI,AT,HR,HU,DE,IT,EU27_2020,EA20&\
unit=I15_Q&\
purchase=TOTAL&\
sinceTimePeriod=2007-Q1&\
lang=en" \
  -o eurostat_hpi_quarterly.json

# Letni podatki
curl -s "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hpi_a?\
geo=SI,AT,HR,HU,DE,IT,EU27_2020,EA20&\
unit=I15_A&\
purchase=TOTAL&\
sinceTimePeriod=2007&\
lang=en" \
  -o eurostat_hpi_annual.json
```

---

## 5. GURS Posplošene vrednosti (ROČNO)

Bulk download vseh posplošenih vrednosti (modelska ocena tržne vrednosti vsake nepremičnine v SLO).

1. Odpri https://ipi.eprostor.gov.si/jgp/
2. Išči: posplošene vrednosti ali evidence vrednotenja
3. Prenos za celo Slovenijo (brez lastnikov fizičnih oseb – GDPR)
4. Podatki so v CSV ali XML

### Alternativa: WFS servis

```bash
# Preizkusi capabilities
curl -s "https://ipi.eprostor.gov.si/wfs-si-gurs-ev/wfs?\
request=getCapabilities" \
  -o ev_capabilities.xml
```

Preveri katere sloje ponuja – morda so posplošene vrednosti dostopne prek WFS.

---

## 6. GURS PDF poročila (ROČNO + PARSING)

Letna poročila vsebujejo dragocenosti ki jih API nima: povprečne cene €/m² po mestih in regijah.

### Download vseh poročil:

```bash
# Letna poročila 2007-2024
for year in $(seq 2007 2024); do
  curl -s -o "porocilo_${year}.pdf" \
    "https://www.e-prostor.gov.si/fileadmin/Podrocja/Trg_vrednosti_nep/Trg_nepremicnin/Porocila_o_trgu_nepremicnin/${year}/Letno_porocilo_za_leto_${year}.pdf"
  echo "Downloaded: ${year}"
  sleep 1
done
```

### Ekstrakcija tabel iz PDF:

```bash
pip install tabula-py camelot-py
```

```python
# extract_pdf_tables.py
import tabula
import pandas as pd

for year in range(2007, 2025):
    try:
        tables = tabula.read_pdf(
            f'porocilo_{year}.pdf',
            pages='all',
            multiple_tables=True,
            encoding='utf-8'
        )
        for i, table in enumerate(tables):
            table.to_csv(f'extracted/porocilo_{year}_table_{i}.csv', index=False)
        print(f"{year}: {len(tables)} tabel")
    except Exception as e:
        print(f"{year}: napaka – {e}")
```

⚠️ PDF parsing je nezanesljiv – tabele bodo verjetno potrebovale ročno čiščenje.

---

## Prioritetni vrstni red za data gathering

### Faza 1 – MVP (dovolj za delujoč prototip)

1. ✅ **SiStat API** (vse 4 tabele) – 5 min, 4 curl ukazi
2. ✅ **GURS WFS katastrske občine** – 5 min, 1 curl ukaz  
3. ✅ **Eurostat HPI** – 2 min, 2 curl ukaza

### Faza 2 – Polna funkcionalnost

4. ⚠️ **GURS ETN transakcije** – ROČNO prenos z JGP portala, potem parsing
5. ⚠️ **GURS občine/regije GeoJSON** – WFS curl ukazi

### Faza 3 – Premium features

6. ⚠️ **GURS posplošene vrednosti** – ROČNO prenos, veliko podatkov
7. ⚠️ **PDF poročila parsing** – ročno čiščenje potrebno

---

## Naslednji koraki

Ko imaš podatke lokalno, pripravi za Claude Code:

```
nepremicnine-map/
├── data/
│   ├── sistat/
│   │   ├── indeksi_stanovanjske_cetrtletno.json
│   │   ├── indeksi_stanovanjske_letno.json
│   │   ├── prodaje_stevilo_vrednost.json
│   │   └── indeksi_poslovne.json
│   ├── gurs/
│   │   ├── katastrske_obcine.geojson
│   │   ├── obcine.geojson
│   │   └── etn/           # parsane transakcije
│   │       ├── 2007.json
│   │       ├── ...
│   │       └── 2025.json
│   ├── eurostat/
│   │   ├── hpi_quarterly.json
│   │   └── hpi_annual.json
│   └── geojson/
│       ├── obcine_wgs84.geojson
│       └── regije_wgs84.geojson
├── scripts/
│   ├── fetch_sistat.sh
│   ├── fetch_eurostat.sh
│   ├── parse_etn.py
│   ├── convert_coordinates.sh
│   └── extract_pdf_tables.py
├── docs/
│   └── DATA_SOURCES.md
└── README.md
```
