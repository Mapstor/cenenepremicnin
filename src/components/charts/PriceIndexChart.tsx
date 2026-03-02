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
  ReferenceLine,
} from 'recharts';

interface IndexData {
  quarter: string;
  base2015: number;
  yoy: number | null;
}

interface PriceIndexChartProps {
  className?: string;
}

export default function PriceIndexChart({ className = '' }: PriceIndexChartProps) {
  const [data, setData] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/sistat-indices.json')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading price index data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={`h-[400px] bg-gray-50 animate-pulse rounded-lg ${className}`} />
    );
  }

  // Format quarter for display (2024-Q3 -> Q3 2024)
  const formatQuarter = (quarter: string) => {
    const [year, q] = quarter.split('-');
    return `${q} ${year}`;
  };

  // Show only every 4th tick on X axis
  const tickFormatter = (value: string, index: number) => {
    if (index % 4 === 0) {
      const year = value.split('-')[0];
      return year;
    }
    return '';
  };

  const latestValue = data[data.length - 1]?.base2015;
  const latestYoY = data[data.length - 1]?.yoy;

  return (
    <div className={className}>
      <div className="flex items-baseline gap-4 mb-4">
        <div>
          <span className="text-3xl font-bold text-gray-900">
            {latestValue?.toFixed(1)}
          </span>
          <span className="text-gray-500 ml-1">indeks (2015=100)</span>
        </div>
        {latestYoY && (
          <div
            className={`text-lg font-medium ${
              latestYoY > 100 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {latestYoY > 100 ? '+' : ''}
            {(latestYoY - 100).toFixed(1)}% letno
          </div>
        )}
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
            tickFormatter={(value) => value.toFixed(0)}
          />
          <Tooltip
            formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : '–', 'Indeks']}
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
            dataKey="base2015"
            stroke="#059669"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#059669' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
