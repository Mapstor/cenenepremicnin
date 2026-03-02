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
} from 'recharts';
import { formatPricePerM2 } from '@/lib/format';

interface QuarterData {
  mediana: number;
  stevilo: number;
}

interface MunicipalityData {
  obcina: string;
  medianaCenaM2: number;
  medianaCenaM2Stanovanja: number;
  medianaCenaM2Hise: number;
  steviloTransakcij: number;
  trendYoY: number;
  cetrtletja: Record<string, QuarterData>;
}

interface MunicipalityPriceChartProps {
  obcina: string;
  className?: string;
}

interface ChartDataPoint {
  quarter: string;
  mediana: number;
  stevilo: number;
}

export default function MunicipalityPriceChart({
  obcina,
  className = '',
}: MunicipalityPriceChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
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

        const chartData = Object.entries(municipality.cetrtletja)
          .map(([quarter, stats]) => ({
            quarter,
            mediana: stats.mediana,
            stevilo: stats.stevilo,
          }))
          .sort((a, b) => a.quarter.localeCompare(b.quarter));

        setData(chartData);
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
      <div className={`h-[300px] bg-gray-50 animate-pulse rounded-lg ${className}`} />
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

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            formatter={(value) => [
              typeof value === 'number' ? formatPricePerM2(value) : value,
              'Mediana cene',
            ]}
            labelFormatter={(label) => {
              const [year, q] = String(label).split('-');
              return `${q} ${year}`;
            }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="mediana"
            stroke="#059669"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: '#059669' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
