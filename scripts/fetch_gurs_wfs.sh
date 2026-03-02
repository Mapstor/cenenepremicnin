#!/bin/bash
# fetch_gurs_wfs.sh – Prenesi GURS prostorske podatke (meje občin, katastrskih občin)

set -e
mkdir -p data/gurs/geojson

echo "=== GURS WFS – Prostorski podatki ==="

# 1. Capabilities (da vidiš katere sloje so na voljo)
echo "[1/5] WFS Capabilities za kataster..."
curl -s "https://ipi.eprostor.gov.si/wfs-si-gurs-kn-osnovni/wfs?request=getCapabilities" \
  -o data/gurs/capabilities_kn.xml

echo "[2/5] WFS Capabilities za RPE (prostorske enote)..."
curl -s "https://ipi.eprostor.gov.si/wfs-si-gurs-rpe/wfs?request=getCapabilities" \
  -o data/gurs/capabilities_rpe.xml

# 2. Katastrske občine (za join z ETN podatki)
echo "[3/5] Katastrske občine (tabela – brez geometrije, hitro)..."
curl -s "https://ipi.eprostor.gov.si/wfs-si-gurs-kn-osnovni/wfs?\
request=getFeature&\
typename=KATASTRSKE_OBCINE_TABELA&\
outputFormat=application/json&\
count=3000" \
  -o data/gurs/geojson/katastrske_obcine.json

# 3. Občine z geometrijo (za Leaflet prikaz)
# OPOMBA: Lahko je velik file – 212 občin s poligoni
echo "[4/5] Občine s poligoni..."
curl -s "https://ipi.eprostor.gov.si/wfs-si-gurs-rpe/wfs?\
request=getFeature&\
typename=SI.GURS.RPE:OBCINE&\
outputFormat=application/json&\
count=300" \
  -o data/gurs/geojson/obcine.geojson

# 4. Statistične regije
echo "[5/5] Statistične regije..."
curl -s "https://ipi.eprostor.gov.si/wfs-si-gurs-rpe/wfs?\
request=getFeature&\
typename=SI.GURS.RPE:STATISTICNE_REGIJE&\
outputFormat=application/json&\
count=20" \
  -o data/gurs/geojson/regije.geojson

echo ""
echo "=== GURS WFS prenos končan ==="
ls -lh data/gurs/geojson/

echo ""
echo "OPOMBA: Koordinate so v EPSG:3794 (D96/TM)."
echo "Za Leaflet (EPSG:4326 / WGS84) pretvori z:"
echo "  ogr2ogr -f GeoJSON -s_srs EPSG:3794 -t_srs EPSG:4326 obcine_wgs84.geojson obcine.geojson"
echo ""
echo "Ali namesti ogr2ogr:"
echo "  sudo apt-get install gdal-bin"
