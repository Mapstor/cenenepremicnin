#!/bin/bash
# fetch_eurostat.sh – Prenesi Eurostat HPI podatke za EU primerjavo

set -e
mkdir -p data/eurostat

echo "=== Eurostat House Price Index ==="

# Četrtletni HPI – Slovenija + sosednje države + EU povprečja
echo "[1/2] HPI četrtletno..."
curl -s "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hpi_q?\
geo=SI,AT,HR,HU,DE,IT,CZ,SK,EU27_2020,EA20&\
unit=I15_Q&\
purchase=TOTAL&\
sinceTimePeriod=2007-Q1&\
lang=en" \
  -o data/eurostat/hpi_quarterly.json

echo "[2/2] HPI letno..."
curl -s "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hpi_a?\
geo=SI,AT,HR,HU,DE,IT,CZ,SK,EU27_2020,EA20&\
unit=I15_A&\
purchase=TOTAL&\
sinceTimePeriod=2007&\
lang=en" \
  -o data/eurostat/hpi_annual.json

echo ""
echo "=== Eurostat prenos končan ==="
ls -lh data/eurostat/
