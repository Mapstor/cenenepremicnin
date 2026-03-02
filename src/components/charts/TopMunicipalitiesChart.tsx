'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatPricePerM2 } from '@/lib/format';

interface MunicipalityStats {
  obcina: string;
  medianaCenaM2Stanovanja: number;
  steviloTransakcij: number;
  trendYoY: number;
}

interface TopMunicipalitiesChartProps {
  className?: string;
  limit?: number;
}

export default function TopMunicipalitiesChart({
  className = '',
  limit = 15,
}: TopMunicipalitiesChartProps) {
  const [data, setData] = useState<MunicipalityStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/aggregated-obcine.json')
      .then((res) => res.json())
      .then((json: MunicipalityStats[]) => {
        // Sort by price and take top N
        const sorted = json
          .filter((m) => m.medianaCenaM2Stanovanja > 0)
          .sort((a, b) => b.medianaCenaM2Stanovanja - a.medianaCenaM2Stanovanja)
          .slice(0, limit);
        setData(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading municipality data:', err);
        setLoading(false);
      });
  }, [limit]);

  if (loading) {
    return (
      <div className={`h-[500px] bg-gray-50 animate-pulse rounded-lg ${className}`} />
    );
  }

  // Format municipality name for display
  const formatName = (name: string) => {
    // Capitalize first letter, rest lowercase
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, bottom: 5, left: 100 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="obcina"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatName}
            width={95}
          />
          <Tooltip
            formatter={(value) => [typeof value === 'number' ? formatPricePerM2(value) : '–', 'Mediana']}
            labelFormatter={(label) => formatName(String(label))}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          />
          <Bar dataKey="medianaCenaM2Stanovanja" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={entry.obcina}
                fill={index === 0 ? '#059669' : index < 3 ? '#10b981' : '#34d399'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-2">
        Mediana cene na m² za stanovanja v zadnjem letu (2025). Podatki iz Evidence trga
        nepremičnin (GURS).
      </p>
    </div>
  );
}
