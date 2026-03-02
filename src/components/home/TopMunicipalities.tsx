'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Trophy, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPricePerM2, formatNumber } from '@/lib/format';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { STAT_EXPLANATIONS } from '@/lib/stat-explanations';

// Dynamic import to avoid SSR issues with Recharts
const TopMunicipalitiesChart = dynamic(
  () => import('@/components/charts/TopMunicipalitiesChart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg" />
    ),
  }
);

interface MunicipalityStats {
  obcina: string;
  medianaCenaM2Stanovanja: number | null;
  steviloTransakcij: number;
  trendYoY: number | null;
}

export default function TopMunicipalities() {
  const [data, setData] = useState<MunicipalityStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/aggregated-obcine.json')
      .then((res) => res.json())
      .then((json: MunicipalityStats[]) => {
        const sorted = json
          .filter((m) => m.medianaCenaM2Stanovanja && m.medianaCenaM2Stanovanja > 0)
          .sort((a, b) => (b.medianaCenaM2Stanovanja || 0) - (a.medianaCenaM2Stanovanja || 0))
          .slice(0, 10);
        setData(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading municipality data:', err);
        setLoading(false);
      });
  }, []);

  const formatName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const getTrendIcon = (trend: number | null) => {
    if (trend === null) return null;
    if (trend > 0) return <TrendingUp className="w-3 h-3" />;
    if (trend < 0) return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  const getTrendColor = (trend: number | null) => {
    if (trend === null) return 'text-gray-400';
    if (trend > 5) return 'text-red-600';
    if (trend > 0) return 'text-orange-500';
    if (trend < -5) return 'text-green-600';
    if (trend < 0) return 'text-green-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-6" />
          <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg" />
        </div>
      </section>
    );
  }

  if (data.length === 0) return null;

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Najdražje občine</h2>
          </div>
          <Link
            href="/lestvice/najdrazje-obcine"
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            Vseh 212 občin
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <TopMunicipalitiesChart limit={10} className="h-[380px]" />
        </div>

        {/* Table */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">#</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Občina</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  <span className="inline-flex items-center">
                    Cena/m²
                    <InfoTooltip text={STAT_EXPLANATIONS.medianaPriceM2} />
                  </span>
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  <span className="inline-flex items-center">
                    Letni trend
                    <InfoTooltip text={STAT_EXPLANATIONS.letniTrend} />
                  </span>
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  <span className="inline-flex items-center">
                    Transakcij
                    <InfoTooltip text={STAT_EXPLANATIONS.transakcije} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((m, idx) => (
                <tr key={m.obcina} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-400 text-white' :
                      idx === 1 ? 'bg-gray-300 text-gray-700' :
                      idx === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {formatName(m.obcina)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {m.medianaCenaM2Stanovanja ? formatPricePerM2(m.medianaCenaM2Stanovanja) : '-'}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${getTrendColor(m.trendYoY)}`}>
                    <span className="inline-flex items-center gap-1">
                      {getTrendIcon(m.trendYoY)}
                      {m.trendYoY !== null
                        ? `${m.trendYoY > 0 ? '+' : ''}${m.trendYoY.toFixed(1)}%`
                        : '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-500">
                    {formatNumber(m.steviloTransakcij)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden grid grid-cols-1 gap-3">
          {data.slice(0, 5).map((m, idx) => (
            <div
              key={m.obcina}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3"
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                idx === 0 ? 'bg-amber-400 text-white' :
                idx === 1 ? 'bg-gray-300 text-gray-700' :
                idx === 2 ? 'bg-amber-600 text-white' :
                'bg-gray-100 text-gray-600'
              }`}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">{formatName(m.obcina)}</div>
                <div className="text-xs text-gray-500">{formatNumber(m.steviloTransakcij)} transakcij</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {m.medianaCenaM2Stanovanja ? formatPricePerM2(m.medianaCenaM2Stanovanja) : '-'}
                </div>
                <div className={`text-xs font-medium ${getTrendColor(m.trendYoY)}`}>
                  {m.trendYoY !== null ? `${m.trendYoY > 0 ? '+' : ''}${m.trendYoY.toFixed(1)}%` : '-'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Mediana cene na m² za stanovanja v zadnjem letu. Top 10 občin od skupaj 212.
        </p>
      </div>
    </section>
  );
}
