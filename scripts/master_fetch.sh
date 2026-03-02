#!/bin/bash
# master_fetch.sh – Zaženi vse data gathering skripte po vrsti
#
# Poganjaj v Claude Code terminalu:
#   chmod +x scripts/*.sh
#   bash scripts/master_fetch.sh

set -e

echo "=============================================="
echo "  NEPREMIČNINE MAP – DATA GATHERING"
echo "=============================================="
echo ""

# Ustvari strukturo
mkdir -p data/{sistat,eurostat,gurs/geojson,gurs/etn}

# Faza 1: API podatki (programatično)
echo "▸ FAZA 1: API podatki"
echo "──────────────────────"

echo ""
echo "→ SiStat (cenovni indeksi, prodaje)..."
bash scripts/fetch_sistat.sh
echo ""

echo "→ Eurostat (EU primerjava HPI)..."
bash scripts/fetch_eurostat.sh
echo ""

echo "→ GURS WFS (občine, regije, katastrske občine)..."
bash scripts/fetch_gurs_wfs.sh
echo ""

echo "▸ FAZA 1 KONČANA ✓"
echo ""

# Faza 2: Preveri kaj smo dobili
echo "▸ PREGLED REZULTATOV"
echo "──────────────────────"
echo ""
echo "SiStat:"
for f in data/sistat/*.json; do
  size=$(wc -c < "$f" 2>/dev/null || echo "0")
  if [ "$size" -gt 100 ]; then
    echo "  ✓ $(basename $f) – ${size} bytes"
  else
    echo "  ✗ $(basename $f) – PRAZNO ali napaka!"
  fi
done

echo ""
echo "Eurostat:"
for f in data/eurostat/*.json; do
  size=$(wc -c < "$f" 2>/dev/null || echo "0")
  if [ "$size" -gt 100 ]; then
    echo "  ✓ $(basename $f) – ${size} bytes"
  else
    echo "  ✗ $(basename $f) – PRAZNO ali napaka!"
  fi
done

echo ""
echo "GURS GeoJSON:"
for f in data/gurs/geojson/*; do
  size=$(wc -c < "$f" 2>/dev/null || echo "0")
  if [ "$size" -gt 100 ]; then
    echo "  ✓ $(basename $f) – ${size} bytes"
  else
    echo "  ✗ $(basename $f) – PRAZNO ali napaka!"
  fi
done

echo ""
echo "=============================================="
echo "  NASLEDNJI KORAKI (ROČNO)"
echo "=============================================="
echo ""
echo "1. GURS ETN transakcije:"
echo "   → Odpri https://ipi.eprostor.gov.si/jgp/"
echo "   → Prenesi kupoprodajne posle (vsa leta)"
echo "   → Razširi v mapo ETN_kupoprodajni/"
echo "   → Poženi: python3 scripts/parse_etn.py"
echo ""
echo "2. Pretvori koordinate za Leaflet:"
echo "   → sudo apt-get install gdal-bin"
echo "   → ogr2ogr -f GeoJSON -s_srs EPSG:3794 -t_srs EPSG:4326 \\"
echo "       data/gurs/geojson/obcine_wgs84.geojson \\"
echo "       data/gurs/geojson/obcine.geojson"
echo ""
echo "3. Ko imaš vse podatke, začni z razvojem:"
echo "   → Odpri Claude Code"
echo "   → Daj mu data-gathering-guide.md za kontekst"
echo "   → Začni z Next.js + Leaflet prototipom"
