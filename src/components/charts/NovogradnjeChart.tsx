'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
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

interface YearData {
  skupaj: number;
  novogradnje: number;
  rabljeno: number;
  delezNovogradenj: number;
  medianaCenaM2Novo: number;
  medianaCenaM2Rabljeno: number;
  razlikaCene: number;
}

interface NovogradnjeData {
  poLetu: Record<string, YearData>;
}

interface NovogradnjeChartProps {
  className?: string;
  chartType: 'volume' | 'share' | 'prices' | 'count';
}

export default function NovogradnjeChart({
  className = '',
  chartType,
}: NovogradnjeChartProps) {
  const [data, setData] = useState<({ year: string } & YearData & { leto: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/novogradnje.json')
      .then((res) => res.json())
      .then((json: NovogradnjeData) => {
        const chartData = Object.entries(json.poLetu)
          .map(([year, stats]) => ({
            year,
            leto: parseInt(year),
            ...stats,
          }))
          .sort((a, b) => a.leto - b.leto);
        setData(chartData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading novogradnje data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={`h-[350px] bg-gray-50 animate-pulse rounded-lg ${className}`} />
    );
  }

  if (chartType === 'volume') {
    return (
      <div className={className}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value, name) => [
                typeof value === 'number' ? value.toLocaleString('sl-SI') : value,
                name === 'novogradnje' ? 'Novogradnje' : 'Rabljeno',
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            />
            <Legend
              formatter={(value) => (value === 'novogradnje' ? 'Novogradnje' : 'Rabljeno')}
            />
            <Bar dataKey="rabljeno" stackId="a" fill="#d1d5db" name="rabljeno" />
            <Bar dataKey="novogradnje" stackId="a" fill="#059669" name="novogradnje" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === 'share') {
    return (
      <div className={className}>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 'auto']}
            />
            <Tooltip
              formatter={(value) => [
                typeof value === 'number' ? `${value.toFixed(1)}%` : value,
                'Delež novogradenj',
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="delezNovogradenj"
              stroke="#059669"
              strokeWidth={2}
              dot={{ r: 4, fill: '#059669' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === 'count') {
    return (
      <div className={className}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString('sl-SI')}
            />
            <Tooltip
              formatter={(value) => [
                typeof value === 'number' ? value.toLocaleString('sl-SI') : value,
                'Število novogradenj',
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            />
            <Bar
              dataKey="novogradnje"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
              name="novogradnje"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // chartType === 'prices'
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            domain={[0, 'auto']}
          />
          <Tooltip
            formatter={(value, name) => [
              typeof value === 'number' ? formatPricePerM2(value) : value,
              name === 'medianaCenaM2Novo' ? 'Novogradnje' : 'Rabljeno',
            ]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          />
          <Legend
            formatter={(value) =>
              value === 'medianaCenaM2Novo' ? 'Novogradnje' : 'Rabljeno'
            }
          />
          <Line
            type="monotone"
            dataKey="medianaCenaM2Novo"
            stroke="#059669"
            strokeWidth={2}
            dot={{ r: 3, fill: '#059669' }}
            activeDot={{ r: 5 }}
            name="medianaCenaM2Novo"
          />
          <Line
            type="monotone"
            dataKey="medianaCenaM2Rabljeno"
            stroke="#9ca3af"
            strokeWidth={2}
            dot={{ r: 3, fill: '#9ca3af' }}
            activeDot={{ r: 5 }}
            name="medianaCenaM2Rabljeno"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
