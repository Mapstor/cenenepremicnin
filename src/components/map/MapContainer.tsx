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
            const name = props.imeKo || props.OB_IME || props.obcina || 'Neznano';
            const price = props.medianaCenaM2Stanovanja || props.medianaCenaM2;
            const count = props.steviloTransakcij || props.stevilo || 0;

            const popupContent = `
              <div style="min-width: 180px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${name}</div>
                ${price ? `<div>Mediana: <strong>${Math.round(price).toLocaleString('sl-SI')} €/m²</strong></div>` : ''}
                ${count ? `<div style="color: #666; font-size: 12px;">${count} transakcij</div>` : ''}
              </div>
            `;
            layer.bindPopup(popupContent);

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
