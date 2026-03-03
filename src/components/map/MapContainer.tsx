'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  SLOVENIA_CENTER,
  SLOVENIA_BOUNDS,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  TILE_LAYERS,
  getColor,
  HEATMAP_BREAKS,
  HEATMAP_COLORS,
  HEATMAP_NO_DATA_COLOR,
} from '@/lib/constants';
import { Transaction } from '@/types/transaction';
import { createMarkerClusterLayer, loadTransactions } from './MarkerCluster';
import { MapViewMode } from './MapControls';
import { useFilters, PROPERTY_TYPE_CODES } from '@/hooks/useFilters';

interface MapContainerProps {
  showHeatmap?: boolean;
  heatmapType?: 'ko' | 'obcine';
  viewMode?: MapViewMode;
  selectedYear?: number | null;
  className?: string;
}

interface AggregatedData {
  [key: string]: {
    cetrtletja?: {
      [quarter: string]: {
        mediana: number;
        stevilo: number;
      };
    };
  };
}

export default function MapWrapper({
  showHeatmap = true,
  heatmapType = 'obcine',
  viewMode = 'heatmap',
  selectedYear = null,
  className = '',
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const loadedYearsRef = useRef<Set<number>>(new Set());
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData | null>(null);

  // Get filter state
  const { state: filterState, getSelectedTypeCodes } = useFilters();

  // Filter transactions based on filter state
  const filteredTransactions = useMemo(() => {
    if (transactions.length === 0) return [];

    const typeCodes = getSelectedTypeCodes();
    const { startYear, endYear } = filterState.dateRange;
    const { min: minPrice, max: maxPrice } = filterState.priceRange;

    return transactions.filter((tx) => {
      // Filter by property type
      if (!typeCodes.includes(tx.tip)) return false;

      // Filter by date range
      const txYear = new Date(tx.datum).getFullYear();
      if (txYear < startYear || txYear > endYear) return false;

      // Filter by price range (price per m²)
      if (tx.cenaNaM2 < minPrice || tx.cenaNaM2 > maxPrice) return false;

      return true;
    });
  }, [transactions, filterState, getSelectedTypeCodes]);

  // Initialize map with vanilla Leaflet
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any existing map on this container
    if ((containerRef.current as HTMLDivElement & { _leaflet_id?: string })._leaflet_id) {
      delete (containerRef.current as HTMLDivElement & { _leaflet_id?: string })._leaflet_id;
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
      closePopupOnClick: false,
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
      markerClusterRef.current = null;
    };
  }, []);

  // Load transactions when markers mode is enabled or date filter changes
  useEffect(() => {
    if (viewMode === 'heatmap') return;

    const { startYear, endYear } = filterState.dateRange;
    const loadedYears = loadedYearsRef.current;

    // Determine which years need to be loaded
    const yearsNeeded: number[] = [];
    for (let year = startYear; year <= endYear; year++) {
      if (!loadedYears.has(year)) {
        yearsNeeded.push(year);
      }
    }

    // If all years are already loaded, nothing to do
    if (yearsNeeded.length === 0) return;

    // Load initial years (2025, 2026) first if nothing loaded yet
    if (loadedYears.size === 0) {
      const initialYears = [2026, 2025].filter(y => y >= startYear && y <= endYear);
      const additionalYears = yearsNeeded.filter(y => !initialYears.includes(y));

      // Load initial years immediately
      const loadInitial = async () => {
        setTransactionsLoading(true);
        const data = await loadTransactions(initialYears);
        setTransactions(data);
        initialYears.forEach(y => loadedYearsRef.current.add(y));
        setTransactionsLoading(false);

        // Load additional years if needed (in background after initial load)
        if (additionalYears.length > 0) {
          setTransactionsLoading(true);
          const additionalData = await loadTransactions(additionalYears);
          setTransactions(prev => [...prev, ...additionalData]);
          additionalYears.forEach(y => loadedYearsRef.current.add(y));
          setTransactionsLoading(false);
        }
      };
      loadInitial();
    } else {
      // Load additional years on demand when date filter changes
      const loadAdditional = async () => {
        setTransactionsLoading(true);
        const additionalData = await loadTransactions(yearsNeeded);
        setTransactions(prev => [...prev, ...additionalData]);
        yearsNeeded.forEach(y => loadedYearsRef.current.add(y));
        setTransactionsLoading(false);
      };
      loadAdditional();
    }
  }, [viewMode, filterState.dateRange.startYear, filterState.dateRange.endYear]);

  // Manage marker cluster layer
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const showMarkers = viewMode === 'markers' || viewMode === 'both';

    // Always remove existing marker cluster layer when filters change
    if (markerClusterRef.current) {
      try {
        map.removeLayer(markerClusterRef.current);
      } catch {
        // Ignore cleanup errors
      }
      markerClusterRef.current = null;
    }

    // Don't create layer if markers are not needed or no transactions
    if (!showMarkers || filteredTransactions.length === 0) {
      return;
    }

    // Create marker cluster layer with filtered transactions
    const clusterLayer = createMarkerClusterLayer({
      map,
      transactions: filteredTransactions,
      minZoomForMarkers: 14,
    });
    clusterLayer.addTo(map);
    markerClusterRef.current = clusterLayer;
  }, [viewMode, filteredTransactions]);

  // Load aggregated data for year-based filtering
  useEffect(() => {
    const aggFilename = heatmapType === 'ko' ? 'aggregated-ko.json' : 'aggregated-obcine.json';
    fetch(`/data/${aggFilename}`)
      .then((res) => res.json())
      .then((data) => {
        // Convert array to lookup object by name (uppercase for case-insensitive matching)
        const lookup: AggregatedData = {};
        if (Array.isArray(data)) {
          data.forEach((item: { obcina?: string; imeKo?: string; cetrtletja?: Record<string, { mediana: number; stevilo: number }> }) => {
            const key = (item.obcina || item.imeKo || '').toUpperCase();
            if (key) lookup[key] = item;
          });
        }
        setAggregatedData(lookup);
      })
      .catch((err) => {
        console.warn('Failed to load aggregated data:', err);
      });
  }, [heatmapType]);

  // Calculate year median from quarterly data
  const getYearMedian = (cetrtletja: Record<string, { mediana: number; stevilo: number }> | undefined, year: number): number | null => {
    if (!cetrtletja) return null;

    // Get all quarters for the year (e.g., "2024-Q1", "2024-Q2", etc.)
    const yearQuarters = Object.entries(cetrtletja).filter(([q]) => q.startsWith(`${year}-`));

    if (yearQuarters.length === 0) return null;

    // Calculate weighted average of quarterly medians
    let totalValue = 0;
    let totalCount = 0;

    for (const [, data] of yearQuarters) {
      if (data.mediana > 0 && data.stevilo > 0) {
        totalValue += data.mediana * data.stevilo;
        totalCount += data.stevilo;
      }
    }

    return totalCount > 0 ? Math.round(totalValue / totalCount) : null;
  };

  // Load and display heatmap GeoJSON
  useEffect(() => {
    const showHeatmapLayer = viewMode === 'heatmap' || viewMode === 'both';

    if (!mapRef.current || !showHeatmap || !showHeatmapLayer) {
      // Remove existing layer if heatmap not needed
      if (geoJsonLayerRef.current && mapRef.current) {
        try {
          mapRef.current.removeLayer(geoJsonLayerRef.current);
        } catch {
          // Ignore cleanup errors
        }
        geoJsonLayerRef.current = null;
      }
      return;
    }

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

        // Use imported getColor from constants.ts (green-to-red gradient)
        // Filter out areas outside price range (show as light gray)
        const getColorWithFilter = (price: number | null): string => {
          if (price === null || price === 0) return HEATMAP_NO_DATA_COLOR;
          if (price < filterState.priceRange.min || price > filterState.priceRange.max) {
            return '#e5e7eb';
          }
          return getColor(price);
        };

        const currentMap = mapRef.current;
        const geoJsonLayer = L.geoJSON(data, {
          interactive: true,
          style: (feature) => {
            const props = feature?.properties;
            const name = props?.NAZIV || props?.imeKo || props?.OB_IME || props?.obcina || '';

            let price: number | null = null;

            // If year is selected and we have aggregated data, use year-specific median
            if (selectedYear !== null && aggregatedData && name) {
              const aggEntry = aggregatedData[name.toUpperCase()];
              if (aggEntry?.cetrtletja) {
                price = getYearMedian(aggEntry.cetrtletja, selectedYear);
              }
            }

            // Fall back to cumulative median if no year-specific data
            if (price === null) {
              price = props?.medianaCenaM2Stanovanja || props?.medianaCenaM2 || null;
            }

            return {
              fillColor: getColorWithFilter(price),
              weight: 1,
              opacity: 0.7,
              color: '#9ca3af',
              fillOpacity: 0.7,
            };
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            const name = props.NAZIV || props.imeKo || props.OB_IME || props.obcina || 'Neznano';

            // Get year-specific or cumulative data
            let priceStanovanja = props.medianaCenaM2Stanovanja;
            let priceHise = props.medianaCenaM2Hise;
            let count = props.steviloTransakcij || props.stevilo || 0;
            let yearLabel = '2024-25';

            // If year is selected, try to get year-specific data
            if (selectedYear !== null && aggregatedData && name) {
              const aggEntry = aggregatedData[name.toUpperCase()];
              if (aggEntry?.cetrtletja) {
                const yearMedian = getYearMedian(aggEntry.cetrtletja, selectedYear);
                if (yearMedian !== null) {
                  priceStanovanja = yearMedian;
                  // Calculate year-specific transaction count
                  const yearQuarters = Object.entries(aggEntry.cetrtletja)
                    .filter(([q]) => q.startsWith(`${selectedYear}-`));
                  count = yearQuarters.reduce((sum, [, d]) => sum + (d.stevilo || 0), 0);
                }
                yearLabel = String(selectedYear);
              }
            }

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

            // Click handler for popup
            layer.on('click', function(e) {
              // Prevent click from propagating to map (which might close popup)
              L.DomEvent.stopPropagation(e);

              const popupContent = `
                <div style="min-width: 240px; max-width: 300px; font-family: system-ui, -apple-system, sans-serif;">
                  <h3 style="font-weight: 700; font-size: 16px; color: #111827; margin: 0 0 8px; padding-bottom: 8px; border-bottom: 2px solid #059669;">${name}</h3>

                  <div style="margin-bottom: 8px;">
                    <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Mediana stanovanja:</div>
                    <div style="font-size: 18px; font-weight: 700; color: #059669;">
                      ${priceStanovanja ? Math.round(priceStanovanja).toLocaleString('sl-SI') + ' €/m²' : 'Ni podatkov'}
                    </div>
                    ${compStanovanja !== null ? `<div style="font-size: 11px; color: ${compStanovanja > 0 ? '#dc2626' : '#16a34a'};">${compStanovanja > 0 ? '+' : ''}${compStanovanja}% od povprečja</div>` : ''}
                  </div>

                  <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    <div style="flex: 1; background: #f0fdf4; border-radius: 6px; padding: 6px; text-align: center;">
                      <div style="font-size: 14px; font-weight: 700; color: #059669;">${count.toLocaleString('sl-SI')}</div>
                      <div style="font-size: 9px; color: #6b7280;">transakcij (${yearLabel})</div>
                    </div>
                    <div style="flex: 1; background: #fef3c7; border-radius: 6px; padding: 6px; text-align: center;">
                      <div style="font-size: 14px; font-weight: 700; color: #b45309;">${vsegaTransakcij.toLocaleString('sl-SI')}</div>
                      <div style="font-size: 9px; color: #78350f;">od 2007</div>
                    </div>
                  </div>

                  ${trend !== null && trend !== undefined ? `
                  <div style="font-size: 12px; margin-bottom: 8px;">
                    Trend: <span style="font-weight: 600; color: ${trend > 0 ? '#16a34a' : trend < 0 ? '#dc2626' : '#6b7280'};">${trend > 0 ? '↑ +' : trend < 0 ? '↓ ' : '→ '}${trend.toFixed(1)}%</span>
                  </div>
                  ` : ''}

                  <a href="/statistika/${slug}" style="display: block; text-align: center; background: #059669; color: white; padding: 8px; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none;">
                    Več o občini →
                  </a>
                </div>
              `;

              // Use mapRef.current to ensure we have the current map reference
              const map = mapRef.current;
              if (map) {
                L.popup({
                  maxWidth: 320,
                  closeButton: true,
                })
                  .setLatLng(e.latlng)
                  .setContent(popupContent)
                  .openOn(map);
              }
            });

            // Hover effects only
            layer.on('mouseover', function (e) {
              const l = e.target;
              l.setStyle({ weight: 2, color: '#059669', fillOpacity: 0.9 });
              l.bringToFront();
            });

            layer.on('mouseout', function (e) {
              if (geoJsonLayerRef.current) {
                geoJsonLayerRef.current.resetStyle(e.target);
              }
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
  }, [showHeatmap, heatmapType, viewMode, selectedYear, aggregatedData, filterState.priceRange]);

  const containerHeight = className.includes('h-') ? undefined : '600px';

  return (
    <div className={`relative w-full ${className}`} style={{ height: containerHeight }}>
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ touchAction: 'manipulation' }}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center pointer-events-none">
          <div className="text-gray-500">Nalaganje zemljevida...</div>
        </div>
      )}
      {/* Loading indicator for transactions */}
      {(viewMode === 'markers' || viewMode === 'both') && transactionsLoading && (
        <div className="absolute bottom-20 left-4 z-[1000] bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600">Nalaganje prodaj...</span>
        </div>
      )}
      {/* Legend */}
      {(viewMode === 'heatmap' || viewMode === 'both') && !isLoading && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
          <h4 className="text-sm font-semibold mb-2 text-gray-800">Stanovanja €/m²</h4>
          <div className="space-y-1">
            {HEATMAP_BREAKS.map((breakpoint, i) => (
              <div key={breakpoint} className="flex items-center gap-2">
                <div
                  className="w-5 h-4 rounded"
                  style={{ backgroundColor: HEATMAP_COLORS[i] }}
                />
                <span className="text-xs text-gray-600">
                  {i === 0
                    ? `< ${breakpoint} €`
                    : `${HEATMAP_BREAKS[i - 1]}–${breakpoint} €`}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-4 rounded"
                style={{ backgroundColor: HEATMAP_COLORS[HEATMAP_COLORS.length - 1] }}
              />
              <span className="text-xs text-gray-600">
                {`> ${HEATMAP_BREAKS[HEATMAP_BREAKS.length - 1]} €`}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-200">
              <div
                className="w-5 h-4 rounded"
                style={{ backgroundColor: HEATMAP_NO_DATA_COLOR }}
              />
              <span className="text-xs text-gray-500">Ni podatkov</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
