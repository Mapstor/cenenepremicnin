'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatPrice, formatPricePerM2, formatDateShort } from '@/lib/format';
import { MIN_ZOOM, MAX_ZOOM, TILE_LAYERS } from '@/lib/constants';

interface Transaction {
  id: number;
  datum: string;
  cena: number;
  tip: number;
  tipNaziv: string;
  povrsina: number;
  uporabnaPovrsina: number;
  cenaNaM2: number;
  lat: number;
  lon: number;
  sifraKo: number;
  imeKo: string;
  obcina: string;
  naslov: string;
  letoIzgradnje: number | null;
  novogradnja: boolean;
  steviloSob: number | null;
  nadstropje: string | null;
}

interface TransactionMapProps {
  transaction: Transaction;
  nearbyTransactions: Transaction[];
}

export default function TransactionMap({ transaction, nearbyTransactions }: TransactionMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !transaction) return;

    // Clean up existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: [transaction.lat, transaction.lon],
      zoom: 15,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      zoomControl: false,
    });

    L.tileLayer(TILE_LAYERS.carto_light.url, {
      attribution: TILE_LAYERS.carto_light.attribution,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Main marker (emerald for the transaction)
    const mainIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    L.marker([transaction.lat, transaction.lon], { icon: mainIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-weight: 600; font-size: 14px;">${transaction.naslov || transaction.imeKo}</div>
        <div style="color: #059669; font-weight: 700; font-size: 16px; margin-top: 4px;">
          ${formatPrice(transaction.cena)}
        </div>
        <div style="color: #666; font-size: 12px;">${formatPricePerM2(transaction.cenaNaM2)}</div>
      `, { closeButton: false })
      .openPopup();

    // Nearby transaction markers (smaller, gray)
    nearbyTransactions.forEach(tx => {
      const nearbyIcon = L.divIcon({
        className: 'nearby-marker',
        html: `<div style="
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          border: 2px solid #9ca3af;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          color: #374151;
        ">${Math.round(tx.cenaNaM2 / 100)}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });

      L.marker([tx.lat, tx.lon], { icon: nearbyIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-weight: 500; font-size: 13px;">${tx.naslov || tx.imeKo}</div>
          <div style="color: #059669; font-weight: 600;">${formatPrice(tx.cena)}</div>
          <div style="color: #666; font-size: 12px;">${formatPricePerM2(tx.cenaNaM2)} • ${formatDateShort(tx.datum)}</div>
        `, { closeButton: false });
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [transaction, nearbyTransactions]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[50vh] sm:h-[60vh]"
    />
  );
}
