#!/bin/bash
# fetch_sistat.sh – Prenesi vse SiStat podatke o nepremičninah
# Poganjaj v Claude Code terminalu ali na svojem računalniku

set -e
mkdir -p data/sistat

echo "=== SiStat PxWeb API – Podatki o nepremičninah ==="
echo ""

# 1. Metadata za vsako tabelo (da vidimo točna imena polj)
echo "[1/8] Metadata: indeksi stanovanjske četrtletno..."
curl -s "https://pxweb.stat.si/SiStatData/api/v1/sl/Data/0419001S.PX" \
  -o data/sistat/meta_indeksi_stan_cetrtletno.json

echo "[2/8] Metadata: indeksi stanovanjske letno..."
curl -s "https://pxweb.stat.si/SiStatData/api/v1/sl/Data/0419005S.PX" \
  -o data/sistat/meta_indeksi_stan_letno.json

echo "[3/8] Metadata: število/vrednost prodaj..."
curl -s "https://pxweb.stat.si/SiStatData/api/v1/sl/Data/0419030S.px" \
  -o data/sistat/meta_prodaje.json

echo "[4/8] Metadata: indeksi poslovne..."
curl -s "https://pxweb.stat.si/SiStatData/api/v1/sl/Data/0419035S.PX" \
  -o data/sistat/meta_indeksi_poslovne.json

sleep 2

# 2. Dejanski podatki (POST requests)
# OPOMBA: "code" vrednosti so iz metadat – če ne deluje,
# najprej poglej meta JSON in popravi code/values

echo "[5/8] Podatki: indeksi stanovanjske četrtletno..."
curl -s -X POST "https://pxweb.stat.si/SiStatData/api/v1/sl/Data/0419001S.PX" \
  -H "Content-Type: application/json" \
  -d '{
    "query": [],
    "response": { "format": "json-stat" }
  }' \
  -o data/sistat/data_indeksi_stan_cetrtletno.json

echo "[6/8] Podatki: indeksi stanovanjske letno..."
curl -s -X POST "https://pxweb.stat.si/SiStatData/api/v1/sl/Data/0419005S.PX" \
  -H "Content-Type: application/json" \
  -d '{
    "query": [],
    "response": { "format": "json-stat" }
  }' \
  -o data/sistat/data_indeksi_stan_letno.json

echo "[7/8] Podatki: število in vrednost prodaj..."
curl -s -X POST "https://pxweb.stat.si/SiStatData/api/v1/sl/Data/0419030S.px" \
  -H "Content-Type: application/json" \
  -d '{
    "query": [],
    "response": { "format": "json-stat" }
  }' \
  -o data/sistat/data_prodaje.json

echo "[8/8] Podatki: indeksi poslovne..."
curl -s -X POST "https://pxweb.stat.si/SiStatData/api/v1/sl/Data/0419035S.PX" \
  -H "Content-Type: application/json" \
  -d '{
    "query": [],
    "response": { "format": "json-stat" }
  }' \
  -o data/sistat/data_indeksi_poslovne.json

echo ""
echo "=== SiStat prenos končan ==="
echo "Datoteke:"
ls -lh data/sistat/
echo ""
echo "OPOMBA: Prazen query [] vrne VSE podatke iz tabele."
echo "Če to ne deluje, odpri meta_*.json in preveri točna imena spremenljivk."
