'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { formatPricePerM2, formatNumber } from '@/lib/format';

interface MunicipalityStats {
  obcina: string;
  medianaCenaM2Stanovanja: number | null;
  steviloTransakcij: number;
  trendYoY: number | null;
}

function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function MunicipalityRow({ m, idx, variant }: { m: MunicipalityStats; idx: number; variant: 'expensive' | 'cheap' }) {
  const getTrendColor = (trend: number | null) => {
    if (trend === null) return 'text-gray-400';
    if (trend > 5) return 'text-red-600';
    if (trend > 0) return 'text-orange-500';
    if (trend < -5) return 'text-green-600';
    if (trend < 0) return 'text-green-500';
    return 'text-gray-500';
  };

  const badgeColor = variant === 'expensive'
    ? idx === 0 ? 'bg-amber-400 text-white' :
      idx === 1 ? 'bg-gray-300 text-gray-700' :
      idx === 2 ? 'bg-amber-600 text-white' :
      'bg-gray-100 text-gray-600'
    : idx === 0 ? 'bg-emerald-500 text-white' :
      idx === 1 ? 'bg-emerald-400 text-white' :
      idx === 2 ? 'bg-emerald-300 text-gray-700' :
      'bg-gray-100 text-gray-600';

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-b-0">
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${badgeColor}`}>
        {idx + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 text-sm truncate">{formatName(m.obcina)}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-semibold text-gray-900 text-sm">
          {m.medianaCenaM2Stanovanja ? formatPricePerM2(m.medianaCenaM2Stanovanja) : '-'}
        </div>
        {m.trendYoY !== null && (
          <div className={`text-xs font-medium flex items-center justify-end gap-0.5 ${getTrendColor(m.trendYoY)}`}>
            {m.trendYoY > 0 ? <TrendingUp className="w-3 h-3" /> : m.trendYoY < 0 ? <TrendingDown className="w-3 h-3" /> : null}
            {m.trendYoY > 0 ? '+' : ''}{m.trendYoY.toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}

function MunicipalityBar({ m, maxPrice, variant }: { m: MunicipalityStats; maxPrice: number; variant: 'expensive' | 'cheap' }) {
  const price = m.medianaCenaM2Stanovanja || 0;
  const widthPercent = (price / maxPrice) * 100;

  const barColor = variant === 'expensive'
    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
    : 'bg-gradient-to-r from-emerald-400 to-emerald-500';

  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className="w-24 text-xs text-gray-600 text-right truncate flex-shrink-0">
        {formatName(m.obcina)}
      </div>
      <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
        <div
          className={`h-full ${barColor} rounded transition-all duration-500`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      <div className="w-16 text-xs font-medium text-gray-700 flex-shrink-0">
        {price ? `${Math.round(price / 100) / 10}k` : '-'}
      </div>
    </div>
  );
}

export default function TopMunicipalities() {
  const [data, setData] = useState<MunicipalityStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/aggregated-obcine.json')
      .then((res) => res.json())
      .then((json: MunicipalityStats[]) => {
        const filtered = json.filter((m) => m.medianaCenaM2Stanovanja && m.medianaCenaM2Stanovanja > 0 && m.steviloTransakcij >= 5);
        setData(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading municipality data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-6" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-[400px] bg-white animate-pulse rounded-xl" />
            <div className="h-[400px] bg-white animate-pulse rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  if (data.length === 0) return null;

  const expensive = [...data]
    .sort((a, b) => (b.medianaCenaM2Stanovanja || 0) - (a.medianaCenaM2Stanovanja || 0))
    .slice(0, 10);

  const cheap = [...data]
    .sort((a, b) => (a.medianaCenaM2Stanovanja || 0) - (b.medianaCenaM2Stanovanja || 0))
    .slice(0, 10);

  const maxExpensive = expensive[0]?.medianaCenaM2Stanovanja || 1;
  const maxCheap = cheap[cheap.length - 1]?.medianaCenaM2Stanovanja || maxExpensive;

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Občine po ceni</h2>
          </div>
          <Link
            href="/lestvice/najdrazje-obcine"
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            Vse občine
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Najdražje */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
              <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Najdražje občine
              </h3>
              <p className="text-xs text-amber-600 mt-0.5">Najvišja mediana cene/m² za stanovanja</p>
            </div>

            {/* Bar chart */}
            <div className="px-4 py-3 border-b border-gray-100">
              {expensive.map((m) => (
                <MunicipalityBar key={m.obcina} m={m} maxPrice={maxExpensive} variant="expensive" />
              ))}
            </div>

            {/* List */}
            <div className="px-4 py-2">
              {expensive.slice(0, 5).map((m, idx) => (
                <MunicipalityRow key={m.obcina} m={m} idx={idx} variant="expensive" />
              ))}
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <Link
                href="/lestvice/najdrazje-obcine"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Vseh 212 občin →
              </Link>
            </div>
          </div>

          {/* Najcenejše */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
              <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Najcenejše občine
              </h3>
              <p className="text-xs text-emerald-600 mt-0.5">Najnižja mediana cene/m² za stanovanja</p>
            </div>

            {/* Bar chart - use same scale as expensive for comparison */}
            <div className="px-4 py-3 border-b border-gray-100">
              {cheap.map((m) => (
                <MunicipalityBar key={m.obcina} m={m} maxPrice={maxExpensive} variant="cheap" />
              ))}
            </div>

            {/* List */}
            <div className="px-4 py-2">
              {cheap.slice(0, 5).map((m, idx) => (
                <MunicipalityRow key={m.obcina} m={m} idx={idx} variant="cheap" />
              ))}
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <Link
                href="/lestvice/najcenejse-obcine"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Vseh 212 občin →
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Mediana cene na m² za stanovanja v zadnjem letu. Prikazane so občine z vsaj 5 transakcijami.
        </p>
      </div>
    </section>
  );
}
