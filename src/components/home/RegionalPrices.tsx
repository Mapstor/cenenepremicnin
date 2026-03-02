'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Map, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { formatPricePerM2, formatPercent, formatNumber } from '@/lib/format';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { STAT_EXPLANATIONS } from '@/lib/stat-explanations';

interface RegionStats {
  regija: string;
  medianaCenaM2Stanovanja: number | null;
  medianaCenaM2Hise: number | null;
  steviloTransakcij: number;
  trendYoY: number | null;
  steviloObcin: number;
}

export default function RegionalPrices() {
  const [regions, setRegions] = useState<RegionStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/aggregated-regije.json')
      .then((res) => res.json())
      .then((data: RegionStats[]) => {
        setRegions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load regional data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (regions.length === 0) return null;

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

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Map className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Cene po regijah</h2>
          </div>
          <Link
            href="/statistika"
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            Podrobna statistika
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Regija</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  <span className="inline-flex items-center">
                    Stanovanja €/m²
                    <InfoTooltip text={STAT_EXPLANATIONS.medianaPriceM2} />
                  </span>
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  <span className="inline-flex items-center">
                    Hiše €/m²
                    <InfoTooltip text={STAT_EXPLANATIONS.stanovanjaVsHise} />
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
              {regions.map((region, idx) => (
                <tr key={region.regija} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-gray-900">{region.regija}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {region.medianaCenaM2Stanovanja
                      ? formatPricePerM2(region.medianaCenaM2Stanovanja)
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {region.medianaCenaM2Hise
                      ? formatPricePerM2(region.medianaCenaM2Hise)
                      : '-'}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${getTrendColor(region.trendYoY)}`}>
                    <span className="inline-flex items-center gap-1">
                      {getTrendIcon(region.trendYoY)}
                      {region.trendYoY !== null
                        ? `${region.trendYoY > 0 ? '+' : ''}${region.trendYoY.toFixed(1)}%`
                        : '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-500">
                    {formatNumber(region.steviloTransakcij)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
          {regions.map((region, idx) => (
            <div
              key={region.regija}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-gray-900 text-sm">{region.regija}</span>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${getTrendColor(region.trendYoY)}`}>
                  {getTrendIcon(region.trendYoY)}
                  {region.trendYoY !== null ? `${region.trendYoY > 0 ? '+' : ''}${region.trendYoY.toFixed(1)}%` : '-'}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {region.medianaCenaM2Stanovanja
                      ? formatPricePerM2(region.medianaCenaM2Stanovanja)
                      : '-'}
                  </div>
                  <div className="text-xs text-gray-500">stanovanja</div>
                </div>
                {region.medianaCenaM2Hise && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-600">
                      {formatPricePerM2(region.medianaCenaM2Hise)}
                    </div>
                    <div className="text-xs text-gray-500">hiše</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Podatki za zadnji 2 leti. Trend prikazuje letno spremembo mediane cen.
        </p>
      </div>
    </section>
  );
}
