'use client';

import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import {
  SLOVENIA_CENTER,
  SLOVENIA_BOUNDS,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  TILE_LAYERS,
} from '@/lib/constants';

interface MapContainerProps {
  showHeatmap?: boolean;
  heatmapType?: 'ko' | 'obcine';
  className?: string;
}

export default function MapWrapper({
  showHeatmap = true,
  heatmapType = 'obcine',
  className = '',
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize map with vanilla Leaflet
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any existing map on this container
    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Create new map
    const map = L.map(containerRef.current, {
      center: SLOVENIA_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: SLOVENIA_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: false,
    });

    // Add tile layer
    L.tileLayer(TILE_LAYERS.carto_light.url, {
      attribution: TILE_LAYERS.carto_light.attribution,
    }).addTo(map);

    // Add zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;
    setIsLoading(false);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      geoJsonLayerRef.current = null;
    };
  }, []);

  // Load and display heatmap GeoJSON
  useEffect(() => {
    if (!mapRef.current || !showHeatmap) return;

    const map = mapRef.current;
    const filename = heatmapType === 'ko' ? 'heatmap-ko.geojson' : 'heatmap-obcine.geojson';
    const abortController = new AbortController();
    let isCancelled = false;

    // Remove existing layer
    if (geoJsonLayerRef.current) {
      try {
        map.removeLayer(geoJsonLayerRef.current);
      } catch {
        // Ignore if map already destroyed
      }
      geoJsonLayerRef.current = null;
    }

    // Load GeoJSON
    fetch(`/data/${filename}`, { signal: abortController.signal })
      .then((res) => res.json())
      .then((data) => {
        // Check if component was unmounted or map destroyed
        if (isCancelled || !mapRef.current || !containerRef.current) return;

        const getColor = (price: number | null): string => {
          if (price === null || price === 0) return '#f3f4f6';
          if (price < 1000) return '#dcfce7';
          if (price < 1500) return '#86efac';
          if (price < 2000) return '#4ade80';
          if (price < 2500) return '#22c55e';
          if (price < 3000) return '#16a34a';
          if (price < 4000) return '#15803d';
          if (price < 5000) return '#166534';
          return '#14532d';
        };

        const currentMap = mapRef.current;
        const geoJsonLayer = L.geoJSON(data, {
          style: (feature) => {
            const price = feature?.properties?.medianaCenaM2Stanovanja ||
                         feature?.properties?.medianaCenaM2 ||
                         null;
            return {
              fillColor: getColor(price),
              weight: 1,
              opacity: 0.7,
              color: '#9ca3af',
              fillOpacity: 0.7,
            };
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            const name = props.NAZIV || props.imeKo || props.OB_IME || props.obcina || 'Neznano';
            const priceStanovanja = props.medianaCenaM2Stanovanja;
            const priceHise = props.medianaCenaM2Hise;
            const price = priceStanovanja || props.medianaCenaM2;
            const count = props.steviloTransakcij || props.stevilo || 0;
            const trend = props.trendYoY;
            const vsegaTransakcij = props.vsegaTransakcij || 0;

            // Create slug for link
            const slug = name.toLowerCase()
              .replace(/č/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z')
              .replace(/đ/g, 'd').replace(/ć/g, 'c')
              .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

            // National averages for comparison
            const natAvgStanovanja = 2850;
            const natAvgHise = 1650;
            const compStanovanja = priceStanovanja ? Math.round((priceStanovanja - natAvgStanovanja) / natAvgStanovanja * 100) : null;
            const compHise = priceHise ? Math.round((priceHise - natAvgHise) / natAvgHise * 100) : null;

            // Trend indicator
            const trendHtml = trend !== null && trend !== undefined ? `
              <div style="display: flex; align-items: center; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <span style="font-size: 12px; color: #6b7280;">Letni trend:</span>
                <span style="font-size: 12px; font-weight: 600; color: ${trend > 0 ? '#16a34a' : trend < 0 ? '#dc2626' : '#6b7280'}; background: ${trend > 0 ? '#dcfce7' : trend < 0 ? '#fee2e2' : '#f3f4f6'}; padding: 2px 8px; border-radius: 12px;">
                  ${trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} ${trend > 0 ? '+' : ''}${trend.toFixed(1)}%
                </span>
              </div>
            ` : '';

            // Comparison badge
            const getCompBadge = (comp: number | null) => {
              if (comp === null) return '';
              const color = comp > 0 ? '#dc2626' : comp < 0 ? '#16a34a' : '#6b7280';
              return `<span style="font-size: 10px; color: ${color}; margin-left: 4px;">(${comp > 0 ? '+' : ''}${comp}%)</span>`;
            };

            const popupContent = `
              <div style="min-width: 260px; max-width: 300px;">
                <!-- Header -->
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #059669;">
                  <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #059669 0%, #047857 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-size: 14px;">📍</span>
                  </div>
                  <div>
                    <div style="font-weight: 700; font-size: 15px; color: #111827; line-height: 1.2;">${name}</div>
                    <span style="font-size: 11px; color: #6b7280;">Občina</span>
                  </div>
                </div>

                <!-- Prices -->
                <div style="background: #f9fafb; border-radius: 8px; padding: 10px; margin-bottom: 8px;">
                  <div style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Mediana cene na m²</div>

                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span style="font-size: 12px;">🏢</span>
                      <span style="font-size: 12px; color: #374151;">Stanovanja</span>
                    </div>
                    <div>
                      ${priceStanovanja
                        ? `<span style="font-weight: 700; font-size: 13px; color: #111827;">${Math.round(priceStanovanja).toLocaleString('sl-SI')} €/m²</span>${getCompBadge(compStanovanja)}`
                        : '<span style="font-size: 12px; color: #9ca3af;">—</span>'
                      }
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span style="font-size: 12px;">🏠</span>
                      <span style="font-size: 12px; color: #374151;">Hiše</span>
                    </div>
                    <div>
                      ${priceHise
                        ? `<span style="font-weight: 700; font-size: 13px; color: #111827;">${Math.round(priceHise).toLocaleString('sl-SI')} €/m²</span>${getCompBadge(compHise)}`
                        : '<span style="font-size: 12px; color: #9ca3af;">—</span>'
                      }
                    </div>
                  </div>
                </div>

                <!-- Stats -->
                <div style="display: flex; gap: 6px; margin-bottom: 6px;">
                  <div style="flex: 1; background: #f0fdf4; border-radius: 6px; padding: 6px; text-align: center;">
                    <div style="font-size: 16px; font-weight: 700; color: #059669;">${count.toLocaleString('sl-SI')}</div>
                    <div style="font-size: 9px; color: #6b7280;">transakcij (24-25)</div>
                  </div>
                  <div style="flex: 1; background: #fef3c7; border-radius: 6px; padding: 6px; text-align: center;">
                    <div style="font-size: 16px; font-weight: 700; color: #b45309;">${vsegaTransakcij.toLocaleString('sl-SI')}</div>
                    <div style="font-size: 9px; color: #78350f;">skupaj od 2007</div>
                  </div>
                </div>

                ${trendHtml}

                <!-- Link -->
                <a href="/statistika/${slug}"
                   style="display: block; text-align: center; background: #059669; color: white; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none; margin-top: 10px;"
                   onmouseover="this.style.background='#047857'"
                   onmouseout="this.style.background='#059669'">
                  Več o občini ${name} →
                </a>
              </div>
            `;
            layer.bindPopup(popupContent, { maxWidth: 320 });

            layer.on({
              mouseover: (e) => {
                const l = e.target;
                l.setStyle({ weight: 2, color: '#059669', fillOpacity: 0.9 });
                l.bringToFront();
              },
              mouseout: (e) => {
                if (geoJsonLayerRef.current) {
                  geoJsonLayerRef.current.resetStyle(e.target);
                }
              },
            });
          },
        });

        // Final check before adding to map
        if (!isCancelled && mapRef.current && containerRef.current) {
          geoJsonLayer.addTo(currentMap);
          geoJsonLayerRef.current = geoJsonLayer;
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Failed to load heatmap data:', err);
        }
      });

    return () => {
      isCancelled = true;
      abortController.abort();
      if (geoJsonLayerRef.current && mapRef.current) {
        try {
          mapRef.current.removeLayer(geoJsonLayerRef.current);
        } catch {
          // Ignore cleanup errors
        }
        geoJsonLayerRef.current = null;
      }
    };
  }, [showHeatmap, heatmapType]);

  const containerHeight = className.includes('h-') ? undefined : '600px';

  return (
    <div className={`relative w-full ${className}`} style={{ height: containerHeight }}>
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500">Nalaganje zemljevida...</div>
        </div>
      )}
    </div>
  );
}
