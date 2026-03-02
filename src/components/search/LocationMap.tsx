'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Transaction } from '@/types/transaction';
import { formatPrice, formatPricePerM2, formatArea, formatDateShort } from '@/lib/format';

interface LocationMapProps {
  center: [number, number];
  radius: number;
  transactions: (Transaction & { distance: number })[];
}

// Custom marker icons
const createPropertyIcon = (type: number) => {
  const color = type === 2 ? '#3B82F6' : type === 1 ? '#F97316' : '#6B7280';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const centerIcon = L.divIcon({
  className: 'center-marker',
  html: `
    <div style="
      width: 16px;
      height: 16px;
      background: #059669;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    "></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function LocationMap({ center, radius, transactions }: LocationMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const centerMarkerRef = useRef<L.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    // Check if container already has a map (Strict Mode double-mount)
    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    mapRef.current = L.map(containerRef.current, {
      center: center,
      zoom: 15,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB © OpenStreetMap contributors',
    }).addTo(mapRef.current);

    markersRef.current = L.layerGroup().addTo(mapRef.current);
    setMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      circleRef.current = null;
      markersRef.current = null;
      centerMarkerRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Update center and radius
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Update center marker
    if (centerMarkerRef.current) {
      centerMarkerRef.current.setLatLng(center);
    } else {
      centerMarkerRef.current = L.marker(center, { icon: centerIcon })
        .bindPopup('<strong>Izbrana lokacija</strong>')
        .addTo(map);
    }

    // Update radius circle
    if (circleRef.current) {
      circleRef.current.setLatLng(center);
      circleRef.current.setRadius(radius);
    } else {
      circleRef.current = L.circle(center, {
        radius: radius,
        color: '#059669',
        fillColor: '#059669',
        fillOpacity: 0.1,
        weight: 2,
      }).addTo(map);
    }

    // Fit bounds to circle - use setTimeout to ensure map is ready
    requestAnimationFrame(() => {
      if (circleRef.current && mapRef.current) {
        try {
          const bounds = circleRef.current.getBounds();
          mapRef.current.fitBounds(bounds, { padding: [20, 20] });
        } catch {
          // Fallback: set view directly
          mapRef.current.setView(center, radius <= 500 ? 16 : radius <= 1000 ? 15 : radius <= 2000 ? 14 : 13);
        }
      }
    });
  }, [center, radius]);

  // Update transaction markers
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    transactions.forEach((tx) => {
      const marker = L.marker([tx.lat, tx.lon], {
        icon: createPropertyIcon(tx.tip),
      });

      const yearBuilt = tx.letoIzgradnje ? `${tx.letoIzgradnje}` : '—';
      const propertyAge = tx.letoIzgradnje ? `${new Date().getFullYear() - tx.letoIzgradnje} let` : '—';
      const isNew = tx.novogradnja ? '<span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-size: 11px;">Novogradnja</span>' : '';
      const floor = tx.nadstropje ? tx.nadstropje : null;
      const rooms = tx.steviloSob ? `${tx.steviloSob} sob` : null;

      const popupContent = `
        <div style="min-width: 240px; max-width: 300px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
            <div style="font-weight: bold;">${tx.tipNaziv}</div>
            ${isNew}
          </div>
          <div style="font-size: 12px; color: #666; margin-bottom: 10px;">${tx.naslov}</div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; font-size: 13px;">
            <div style="color: #666;">Cena:</div>
            <div style="font-weight: 600;">${formatPrice(tx.cena)}</div>

            <div style="color: #666;">Površina:</div>
            <div>${formatArea(tx.uporabnaPovrsina)}</div>

            <div style="color: #666;">Cena/m²:</div>
            <div style="color: #059669; font-weight: 600;">${formatPricePerM2(tx.cenaNaM2)}</div>

            <div style="color: #666;">Datum prodaje:</div>
            <div>${formatDateShort(tx.datum)}</div>

            <div style="color: #666;">Leto izgradnje:</div>
            <div>${yearBuilt}${tx.letoIzgradnje ? ` <span style="color: #999; font-size: 11px;">(${propertyAge})</span>` : ''}</div>

            ${floor ? `<div style="color: #666;">Nadstropje:</div><div>${floor}</div>` : ''}
            ${rooms ? `<div style="color: #666;">Število sob:</div><div>${rooms}</div>` : ''}

            <div style="color: #666;">Razdalja:</div>
            <div>${tx.distance < 1000 ? `${Math.round(tx.distance)} m` : `${(tx.distance / 1000).toFixed(1)} km`}</div>
          </div>

          <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #999;">
            ${tx.imeKo} · ${tx.obcina}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current?.addLayer(marker);
    });
  }, [transactions]);

  return (
    <div ref={containerRef} className="h-[400px] w-full" style={{ zIndex: 1 }} />
  );
}
