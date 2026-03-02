'use client';

import { useEffect, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Layer, PathOptions } from 'leaflet';
import { getColor, HEATMAP_BREAKS, HEATMAP_COLORS } from '@/lib/constants';
import { formatPricePerM2, formatNumber } from '@/lib/format';

// National average prices for comparison (approximate)
const NATIONAL_AVG_STANOVANJA = 2850; // €/m²
const NATIONAL_AVG_HISE = 1650; // €/m²

interface HeatmapProperties {
  // KO properties
  sifraKo?: number;
  imeKo?: string;
  obcina?: string;
  // Obcine properties (from GeoJSON)
  SIFRA?: number;
  NAZIV?: string;
  // Common aggregated properties (recent 2 years)
  medianaCenaM2?: number | null;
  medianaCenaM2Stanovanja?: number | null;
  medianaCenaM2Hise?: number | null;
  steviloTransakcij?: number;
  trendYoY?: number | null;
  // Historical stats (all-time)
  vsegaTransakcij?: number;
  zadnjaTransakcija?: string | null;
  zadnjaCenaM2?: number | null;
}

// Slugify municipality name for URL
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/č/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/đ/g, 'd')
    .replace(/ć/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface HeatmapLayerProps {
  type: 'ko' | 'obcine';
}

export default function HeatmapLayer({ type }: HeatmapLayerProps) {
  const map = useMap();
  const [data, setData] = useState<FeatureCollection<Geometry, HeatmapProperties> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const filename = type === 'ko' ? 'heatmap-ko.geojson' : 'heatmap-obcine.geojson';

    fetch(`/data/${filename}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${filename}`);
        return res.json();
      })
      .then((geojson) => {
        setData(geojson);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading heatmap:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [type]);

  if (loading || !data) return null;
  if (error) {
    console.error('Heatmap error:', error);
    return null;
  }

  const style = (feature: Feature<Geometry, HeatmapProperties> | undefined): PathOptions => {
    if (!feature) return {};
    const price = feature.properties?.medianaCenaM2Stanovanja ?? feature.properties?.medianaCenaM2;
    return {
      fillColor: getColor(price ?? null),
      weight: 1,
      opacity: 0.8,
      color: '#666',
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (
    feature: Feature<Geometry, HeatmapProperties>,
    layer: Layer
  ) => {
    const props = feature.properties;
    const name = props.NAZIV || props.obcina || props.imeKo || 'Neznano';
    const priceStanovanja = props.medianaCenaM2Stanovanja;
    const priceHise = props.medianaCenaM2Hise;
    const transactions = props.steviloTransakcij ?? 0;
    const trend = props.trendYoY;
    const slug = slugify(name);

    // Historical data for areas with no recent transactions
    const vsegaTransakcij = props.vsegaTransakcij ?? 0;
    const zadnjaTransakcija = props.zadnjaTransakcija;
    const zadnjaCenaM2 = props.zadnjaCenaM2;
    const hasHistoricalOnly = transactions === 0 && vsegaTransakcij > 0;

    // Calculate comparison to national average
    const compStanovanja = priceStanovanja ? ((priceStanovanja - NATIONAL_AVG_STANOVANJA) / NATIONAL_AVG_STANOVANJA * 100) : null;
    const compHise = priceHise ? ((priceHise - NATIONAL_AVG_HISE) / NATIONAL_AVG_HISE * 100) : null;

    // YoY trend HTML
    let trendHtml = '';
    if (trend !== null && trend !== undefined) {
      const trendColor = trend > 0 ? '#16a34a' : trend < 0 ? '#dc2626' : '#6b7280';
      const trendBg = trend > 0 ? '#dcfce7' : trend < 0 ? '#fee2e2' : '#f3f4f6';
      const trendSign = trend > 0 ? '+' : '';
      const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
      trendHtml = `
        <div style="display: flex; align-items: center; gap: 6px; padding: 8px 0; border-top: 1px solid #e5e7eb; margin-top: 8px;">
          <span style="font-size: 12px; color: #6b7280;">Letni trend:</span>
          <span style="font-size: 13px; font-weight: 600; color: ${trendColor}; background: ${trendBg}; padding: 2px 8px; border-radius: 12px;">
            ${trendIcon} ${trendSign}${trend.toFixed(1)}%
          </span>
        </div>
      `;
    }

    // Comparison badge
    const getCompBadge = (comp: number | null) => {
      if (comp === null) return '';
      const color = comp > 0 ? '#dc2626' : comp < 0 ? '#16a34a' : '#6b7280';
      const sign = comp > 0 ? '+' : '';
      return `<span style="font-size: 10px; color: ${color}; margin-left: 4px;">(${sign}${comp.toFixed(0)}% od povp.)</span>`;
    };

    // Price category color indicator
    const getPriceIndicator = (price: number | null | undefined) => {
      if (!price) return '';
      const color = getColor(price);
      return `<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color}; margin-right: 6px;"></span>`;
    };

    // Transaction volume indicator
    const getVolumeText = (count: number) => {
      if (count >= 1000) return 'Zelo visok promet';
      if (count >= 500) return 'Visok promet';
      if (count >= 100) return 'Srednji promet';
      if (count >= 20) return 'Nizek promet';
      return 'Zelo nizek promet';
    };
    const volumeText = getVolumeText(transactions);

    const popupContent = `
      <div style="min-width: 280px; max-width: 320px; padding: 4px;">
        <!-- Header -->
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 2px solid #059669;">
          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #059669 0%, #047857 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 16px;">📍</span>
          </div>
          <div>
            <h3 style="font-weight: 700; font-size: 16px; color: #111827; margin: 0; line-height: 1.2;">${name}</h3>
            <span style="font-size: 11px; color: #6b7280;">Občina</span>
          </div>
        </div>

        <!-- Prices Section -->
        <div style="background: #f9fafb; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
          <div style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Mediane cene na m²</div>

          <!-- Stanovanja -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 14px;">🏢</span>
              <span style="font-size: 13px; color: #374151;">Stanovanja</span>
            </div>
            <div style="text-align: right;">
              ${priceStanovanja
                ? `<span style="font-weight: 700; font-size: 14px; color: #111827;">${getPriceIndicator(priceStanovanja)}${formatPricePerM2(priceStanovanja)}</span>${getCompBadge(compStanovanja)}`
                : '<span style="font-size: 13px; color: #9ca3af;">Ni podatkov</span>'
              }
            </div>
          </div>

          <!-- Hiše -->
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 14px;">🏠</span>
              <span style="font-size: 13px; color: #374151;">Hiše</span>
            </div>
            <div style="text-align: right;">
              ${priceHise
                ? `<span style="font-weight: 700; font-size: 14px; color: #111827;">${getPriceIndicator(priceHise)}${formatPricePerM2(priceHise)}</span>${getCompBadge(compHise)}`
                : '<span style="font-size: 13px; color: #9ca3af;">Ni podatkov</span>'
              }
            </div>
          </div>
        </div>

        <!-- Stats Row -->
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          ${hasHistoricalOnly ? `
          <!-- Historical transactions -->
          <div style="flex: 1; background: #fef3c7; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 18px; font-weight: 700; color: #b45309;">${formatNumber(vsegaTransakcij)}</div>
            <div style="font-size: 10px; color: #78350f;">vseh transakcij</div>
          </div>
          <div style="flex: 1; background: #fee2e2; border-radius: 8px; padding: 8px; text-align: center; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 11px; font-weight: 600; color: #991b1b;">Brez nedavnih prodaj</div>
          </div>
          ` : `
          <!-- Recent transactions -->
          <div style="flex: 1; background: #f0fdf4; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${formatNumber(transactions)}</div>
            <div style="font-size: 10px; color: #6b7280;">transakcij (2024–25)</div>
          </div>
          <div style="flex: 1; background: #fef3c7; border-radius: 8px; padding: 8px; text-align: center; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 11px; font-weight: 600; color: #92400e;">${volumeText}</div>
          </div>
          `}
        </div>

        ${trendHtml}

        ${hasHistoricalOnly ? `
        <!-- Historical data notice -->
        <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 10px; margin-top: 8px;">
          <div style="display: flex; align-items: flex-start; gap: 8px;">
            <span style="font-size: 16px;">📊</span>
            <div>
              <div style="font-size: 12px; font-weight: 600; color: #92400e; margin-bottom: 4px;">Zgodovinski podatki</div>
              <div style="font-size: 11px; color: #78350f;">
                V zadnjih 2 letih ni bilo transakcij. Skupaj ${formatNumber(vsegaTransakcij)} prodaj od 2007.
                ${zadnjaTransakcija ? `<br/>Zadnja transakcija: <strong>${zadnjaTransakcija.replace('-Q', ' Q')}</strong>` : ''}
                ${zadnjaCenaM2 ? `<br/>Takratna cena: <strong>${formatPricePerM2(zadnjaCenaM2)}</strong>` : ''}
              </div>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Link to statistics -->
        <a href="/statistika/${slug}"
           style="display: block; text-align: center; background: #059669; color: white; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; margin-top: 10px; transition: background 0.2s;"
           onmouseover="this.style.background='#047857'"
           onmouseout="this.style.background='#059669'">
          Več podrobnosti o občini →
        </a>
      </div>
    `;

    layer.bindPopup(popupContent, {
      className: 'custom-popup',
      maxWidth: 350,
    });

    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 2,
          color: '#333',
          fillOpacity: 0.9,
        });
        target.bringToFront();
      },
      mouseout: (e) => {
        const target = e.target;
        target.setStyle(style(feature));
      },
      click: () => {
        // Could navigate to detail page
      },
    });
  };

  return (
    <>
      <GeoJSON
        key={type}
        data={data}
        style={style}
        onEachFeature={onEachFeature}
      />
      <Legend />
    </>
  );
}

function Legend() {
  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control bg-white rounded-lg shadow-lg p-3 m-3">
        <h4 className="text-sm font-semibold mb-2">Cena na m²</h4>
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
          <div className="flex items-center gap-2 mt-1 pt-1 border-t">
            <div
              className="w-5 h-4 rounded"
              style={{ backgroundColor: '#cccccc' }}
            />
            <span className="text-xs text-gray-500">Ni podatkov</span>
          </div>
        </div>
      </div>
    </div>
  );
}
