'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatPricePerM2 } from '@/lib/format';
import { Building, Home } from 'lucide-react';

interface QuarterData {
  mediana: number;
  povprecje: number;
  stevilo: number;
}

interface QuarterDataByType {
  stanovanja: QuarterData | null;
  hise: QuarterData | null;
}

interface MunicipalityData {
  obcina: string;
  medianaCenaM2: number;
  medianaCenaM2Stanovanja: number;
  medianaCenaM2Hise: number;
  steviloTransakcij: number;
  trendYoY: number;
  cetrtletja: Record<string, QuarterData>;
  cetrtletjaPoTipu?: Record<string, QuarterDataByType>;
}

interface MunicipalityPriceChartProps {
  obcina: string;
  className?: string;
}

interface ChartDataPoint {
  quarter: string;
  mediana: number | null;
  povprecje: number | null;
  stevilo: number;
}

// Minimum transactions required to show a data point
const MIN_TRANSACTIONS = 3;

export default function MunicipalityPriceChart({
  obcina,
  className = '',
}: MunicipalityPriceChartProps) {
  const [stanovanjadata, setStanovanjaData] = useState<ChartDataPoint[]>([]);
  const [hiseData, setHiseData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/aggregated-obcine.json')
      .then((res) => res.json())
      .then((json: MunicipalityData[]) => {
        const municipality = json.find(
          (m) => m.obcina.toLowerCase() === obcina.toLowerCase()
        );

        if (!municipality) {
          setError('Občina ni najdena');
          setLoading(false);
          return;
        }

        // Use new per-type data if available, otherwise fall back to combined
        const hasPerTypeData = municipality.cetrtletjaPoTipu && Object.keys(municipality.cetrtletjaPoTipu).length > 0;

        if (hasPerTypeData && municipality.cetrtletjaPoTipu) {
          // Process stanovanja data
          const stanovanjaPts = Object.entries(municipality.cetrtletjaPoTipu)
            .map(([quarter, data]) => ({
              quarter,
              mediana: data.stanovanja && data.stanovanja.stevilo >= MIN_TRANSACTIONS
                ? data.stanovanja.mediana
                : null,
              povprecje: data.stanovanja && data.stanovanja.stevilo >= MIN_TRANSACTIONS
                ? data.stanovanja.povprecje
                : null,
              stevilo: data.stanovanja?.stevilo || 0,
            }))
            .sort((a, b) => a.quarter.localeCompare(b.quarter));

          // Process hiše data
          const hisePts = Object.entries(municipality.cetrtletjaPoTipu)
            .map(([quarter, data]) => ({
              quarter,
              mediana: data.hise && data.hise.stevilo >= MIN_TRANSACTIONS
                ? data.hise.mediana
                : null,
              povprecje: data.hise && data.hise.stevilo >= MIN_TRANSACTIONS
                ? data.hise.povprecje
                : null,
              stevilo: data.hise?.stevilo || 0,
            }))
            .sort((a, b) => a.quarter.localeCompare(b.quarter));

          setStanovanjaData(stanovanjaPts);
          setHiseData(hisePts);
        } else {
          // Fall back to combined data (old format)
          const chartData = Object.entries(municipality.cetrtletja)
            .map(([quarter, stats]) => ({
              quarter,
              mediana: stats.stevilo >= MIN_TRANSACTIONS ? stats.mediana : null,
              povprecje: stats.stevilo >= MIN_TRANSACTIONS ? stats.povprecje : null,
              stevilo: stats.stevilo,
            }))
            .sort((a, b) => a.quarter.localeCompare(b.quarter));

          setStanovanjaData(chartData);
          setHiseData([]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading municipality data:', err);
        setError('Napaka pri nalaganju podatkov');
        setLoading(false);
      });
  }, [obcina]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="h-[250px] bg-gray-50 animate-pulse rounded-lg" />
        <div className="h-[250px] bg-gray-50 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`h-[300px] bg-gray-50 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  // Format quarter label for display (e.g., "2024-Q1" -> "Q1 '24")
  const formatQuarterLabel = (quarter: string) => {
    const [year, q] = quarter.split('-');
    return `${q} '${year.slice(2)}`;
  };

  // Check if there's any data to show
  const hasStanovanjaData = stanovanjadata.some(d => d.mediana !== null);
  const hasHiseData = hiseData.some(d => d.mediana !== null);

  if (!hasStanovanjaData && !hasHiseData) {
    return (
      <div className={`h-[200px] bg-gray-50 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-500">Ni dovolj podatkov za prikaz grafa (potrebne vsaj 3 transakcije na četrtletje)</p>
      </div>
    );
  }

  // Custom tooltip that shows transaction count and both median/average
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number | null; dataKey: string; payload: ChartDataPoint }>; label?: string }) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint = payload[0].payload;
    const [year, q] = String(label).split('-');
    const medianaValue = payload.find(p => p.dataKey === 'mediana')?.value;
    const povprecjeValue = payload.find(p => p.dataKey === 'povprecje')?.value;

    if (medianaValue === null && povprecjeValue === null) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg">
        <div className="text-xs text-gray-500 mb-1">{q} {year}</div>
        {medianaValue !== null && medianaValue !== undefined && (
          <div className="font-semibold text-gray-900">
            Mediana: {formatPricePerM2(medianaValue)}
          </div>
        )}
        {povprecjeValue !== null && povprecjeValue !== undefined && (
          <div className="text-sm text-gray-600">
            Povprečje: {formatPricePerM2(povprecjeValue)}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-1">
          {dataPoint.stevilo} transakcij
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Stanovanja Chart */}
      {hasStanovanjaData && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building className="w-4 h-4 text-blue-500" />
            <h3 className="font-medium text-gray-900">Stanovanja</h3>
            <span className="text-xs text-gray-500">(mediana €/m²)</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stanovanjadata} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={formatQuarterLabel}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                domain={['auto', 'auto']}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value: string) => value === 'mediana' ? 'Mediana' : 'Povprečje'}
              />
              <Line
                type="monotone"
                dataKey="mediana"
                name="mediana"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#3b82f6' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="povprecje"
                name="povprecje"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 5, fill: '#3b82f6' }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Hiše Chart */}
      {hasHiseData && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Home className="w-4 h-4 text-orange-500" />
            <h3 className="font-medium text-gray-900">Hiše</h3>
            <span className="text-xs text-gray-500">(mediana €/m²)</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={hiseData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={formatQuarterLabel}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                domain={['auto', 'auto']}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value: string) => value === 'mediana' ? 'Mediana' : 'Povprečje'}
              />
              <Line
                type="monotone"
                dataKey="mediana"
                name="mediana"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#f97316' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="povprecje"
                name="povprecje"
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 5, fill: '#f97316' }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Note about data filtering */}
      <p className="text-xs text-gray-400 text-center">
        Prikazana so samo četrtletja z vsaj {MIN_TRANSACTIONS} transakcijami za zmanjšanje nihanj
      </p>
    </div>
  );
}
