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
  ReferenceLine,
} from 'recharts';

interface HPIData {
  quarter: string;
  SI: number;
  EU27_2020: number;
  AT: number | null;
  HR: number | null;
}

interface EUComparisonChartProps {
  className?: string;
}

const COUNTRY_COLORS = {
  SI: '#059669', // emerald-600
  EU27_2020: '#6b7280', // gray-500
  AT: '#3b82f6', // blue-500
  HR: '#f59e0b', // amber-500
};

const COUNTRY_NAMES = {
  SI: 'Slovenija',
  EU27_2020: 'EU povprečje',
  AT: 'Avstrija',
  HR: 'Hrvaška',
};

export default function EUComparisonChart({ className = '' }: EUComparisonChartProps) {
  const [data, setData] = useState<HPIData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/eurostat-hpi.json')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading EU HPI data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={`h-[400px] bg-gray-50 animate-pulse rounded-lg ${className}`} />
    );
  }

  // Format quarter for display
  const formatQuarter = (quarter: string) => {
    const [year, q] = quarter.split('-');
    return `${q} ${year}`;
  };

  // Show only every 4th tick on X axis
  const tickFormatter = (value: string, index: number) => {
    if (index % 8 === 0) {
      return value.split('-')[0];
    }
    return '';
  };

  // Get latest values
  const latest = data[data.length - 1];

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-4 mb-4">
        {(['SI', 'EU27_2020', 'AT', 'HR'] as const).map((country) => (
          <div key={country} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COUNTRY_COLORS[country] }}
            />
            <span className="text-sm text-gray-600">{COUNTRY_NAMES[country]}</span>
            <span className="font-semibold text-gray-900">
              {latest?.[country]?.toFixed(1) ?? '–'}
            </span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="quarter"
            tickFormatter={tickFormatter}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value, name) => [
              typeof value === 'number' ? value.toFixed(2) : '–',
              COUNTRY_NAMES[name as keyof typeof COUNTRY_NAMES] || name,
            ]}
            labelFormatter={(label) => formatQuarter(String(label))}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          />
          <ReferenceLine
            y={100}
            stroke="#9ca3af"
            strokeDasharray="3 3"
            label={{ value: '2015', position: 'right', fontSize: 10, fill: '#9ca3af' }}
          />
          <Line
            type="monotone"
            dataKey="SI"
            stroke={COUNTRY_COLORS.SI}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="EU27_2020"
            stroke={COUNTRY_COLORS.EU27_2020}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="AT"
            stroke={COUNTRY_COLORS.AT}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="HR"
            stroke={COUNTRY_COLORS.HR}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-2">
        Vir: Eurostat House Price Index (2015=100). Slovenija je ena izmed držav z
        najhitrejšo rastjo cen nepremičnin v EU.
      </p>
    </div>
  );
}
