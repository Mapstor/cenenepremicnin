#!/usr/bin/env python3
"""
parse_etn.py – Parsanje GURS ETN (Evidenca trga nepremičnin) datotek

Uporaba:
  1. Prenesi ETN podatke z https://ipi.eprostor.gov.si/jgp/
  2. Razširi ZIP datoteke v mapo ETN_kupoprodajni/
  3. Poženi: python3 parse_etn.py

Struktura vhodnih podatkov:
  ETN_kupoprodajni/
  ├── 2007/
  │   ├── posli.etn
  │   ├── delistavb.etn
  │   └── zemljisca.etn
  ├── 2008/
  ...

Izhod: data/etn/transactions.json – vse transakcije z joinanimi podatki
"""

import csv
import json
import os
import sys
from collections import defaultdict

# Prilagodi te poti
ETN_BASE_DIR = "ETN_kupoprodajni"
OUTPUT_DIR = "data/etn"

# Poskusi različne delimiter-je
DELIMITERS = ['|', '\t', ';', ',']

def detect_delimiter(filepath):
    """Zazna delimiter v ETN datoteki"""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        first_line = f.readline()
        for d in DELIMITERS:
            if first_line.count(d) > 2:
                return d
    return '|'  # default

def parse_etn_file(filepath):
    """Parse ena .etn datoteka"""
    if not os.path.exists(filepath):
        return [], []
    
    delimiter = detect_delimiter(filepath)
    rows = []
    headers = []
    
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.reader(f, delimiter=delimiter)
        try:
            headers = next(reader)
            headers = [h.strip().upper() for h in headers]
        except StopIteration:
            return [], []
        
        for row in reader:
            if len(row) >= len(headers):
                record = {}
                for i, h in enumerate(headers):
                    record[h] = row[i].strip() if i < len(row) else ''
                rows.append(record)
    
    return headers, rows

def process_year(year):
    """Procesiraj vse ETN datoteke za eno leto"""
    year_dir = os.path.join(ETN_BASE_DIR, str(year))
    
    if not os.path.exists(year_dir):
        return []
    
    # Parsaj posli
    posli_files = ['posli.etn', 'Posli.etn', 'POSLI.etn']
    posli_data = []
    for pf in posli_files:
        path = os.path.join(year_dir, pf)
        if os.path.exists(path):
            _, posli_data = parse_etn_file(path)
            break
    
    if not posli_data:
        print(f"  {year}: posli.etn ni najden ali je prazen")
        return []
    
    # Parsaj dele stavb
    deli_files = ['delistavb.etn', 'DeliStavb.etn', 'DELISTAVB.etn']
    deli_data = []
    for df in deli_files:
        path = os.path.join(year_dir, df)
        if os.path.exists(path):
            _, deli_data = parse_etn_file(path)
            break
    
    # Indeksiraj dele po ID posla
    deli_by_posel = defaultdict(list)
    id_field_deli = None
    for field in ['ID_POSLA', 'ID_POSEL', 'IDPOSLA', 'ID']:
        if deli_data and field in deli_data[0]:
            id_field_deli = field
            break
    
    if id_field_deli and deli_data:
        for d in deli_data:
            deli_by_posel[d[id_field_deli]].append(d)
    
    # Sestavi transakcije
    transactions = []
    id_field_posli = None
    for field in ['ID_POSLA', 'ID_POSEL', 'IDPOSLA', 'ID']:
        if posli_data and field in posli_data[0]:
            id_field_posli = field
            break
    
    for posel in posli_data:
        tx = {
            'leto': year,
            'raw_posel': posel,
        }
        
        posel_id = posel.get(id_field_posli, '') if id_field_posli else ''
        if posel_id and posel_id in deli_by_posel:
            tx['deli_stavb'] = deli_by_posel[posel_id]
        
        transactions.append(tx)
    
    return transactions

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    if not os.path.exists(ETN_BASE_DIR):
        print(f"NAPAKA: Mapa '{ETN_BASE_DIR}' ne obstaja!")
        print(f"1. Prenesi ETN podatke z https://ipi.eprostor.gov.si/jgp/")
        print(f"2. Razširi v mapo '{ETN_BASE_DIR}/'")
        sys.exit(1)
    
    all_transactions = []
    yearly_stats = {}
    
    for year in range(2007, 2026):
        txs = process_year(year)
        if txs:
            all_transactions.extend(txs)
            yearly_stats[year] = len(txs)
            print(f"  {year}: {len(txs)} transakcij")
    
    # Shrani vse
    output_path = os.path.join(OUTPUT_DIR, 'transactions_all.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_transactions, f, ensure_ascii=False, indent=2)
    
    # Shrani statistiko
    stats_path = os.path.join(OUTPUT_DIR, 'stats.json')
    with open(stats_path, 'w', encoding='utf-8') as f:
        json.dump({
            'total_transactions': len(all_transactions),
            'by_year': yearly_stats,
            'first_record_fields': list(all_transactions[0]['raw_posel'].keys()) if all_transactions else []
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\nSkupno: {len(all_transactions)} transakcij")
    print(f"Shranjeno v: {output_path}")
    print(f"Statistika v: {stats_path}")
    
    # Izpiši strukturo prvega zapisa
    if all_transactions:
        print(f"\nPrimer prvega zapisa (polja):")
        for k, v in all_transactions[0]['raw_posel'].items():
            print(f"  {k}: {v[:50] if isinstance(v, str) else v}")

if __name__ == '__main__':
    main()
