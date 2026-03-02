'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, Percent, TrendingUp } from 'lucide-react';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { STAT_EXPLANATIONS } from '@/lib/stat-explanations';
import { formatPricePerM2, formatNumber } from '@/lib/format';

interface YearStats {
  skupaj: number;
  novogradnje: number;
  rabljeno: number;
  delezNovogradenj: number;
  medianaCenaM2Novo: number;
  medianaCenaM2Rabljeno: number;
  razlikaCene: number;
}

interface NovogradnjeData {
  poLetu: Record<string, YearStats>;
}

export default function NovogradnjeTeaser() {
  const [data, setData] = useState<NovogradnjeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/novogradnje.json')
      .then((res) => res.json())
      .then((json: NovogradnjeData) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading novogradnje data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const years = Object.keys(data.poLetu).sort();
  const latestYear = years[years.length - 2]; // Use 2024 since 2025 is incomplete
  const latest = data.poLetu[latestYear];
  const previousYear = years[years.length - 3];
  const previous = data.poLetu[previousYear];

  // Calculate totals across all years
  const totalNovogradnje = Object.values(data.poLetu).reduce((sum, y) => sum + y.novogradnje, 0);
  const avgPremium = Object.values(data.poLetu)
    .filter(y => y.razlikaCene > 0 && y.razlikaCene < 200)
    .reduce((sum, y, _, arr) => sum + y.razlikaCene / arr.length, 0);

  // Change in new construction share
  const shareChange = latest.delezNovogradenj - previous.delezNovogradenj;

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Novogradnje</h2>
          </div>
          <Link
            href="/lestvice/novogradnje"
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            Podrobna analiza
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-violet-600 mb-2">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium flex items-center">
                Delež novogradenj
                <InfoTooltip text={STAT_EXPLANATIONS.delezNovogradenj} />
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {latest.delezNovogradenj.toFixed(1)}%
            </div>
            <div className={`text-sm flex items-center gap-1 ${shareChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {shareChange >= 0 ? '+' : ''}{shareChange.toFixed(1)}% vs {previousYear}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-violet-600 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium flex items-center">
                Cena novogradnje
                <InfoTooltip text={STAT_EXPLANATIONS.medianaPriceM2} />
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPricePerM2(latest.medianaCenaM2Novo)}
            </div>
            <div className="text-sm text-gray-500">
              mediana {latestYear}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-violet-600 mb-2">
              <Percent className="w-4 h-4" />
              <span className="text-sm font-medium flex items-center">
                Premija novogradnje
                <InfoTooltip text={STAT_EXPLANATIONS.premijaNovogradnje} />
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              +{latest.razlikaCene.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-500">
              vs rabljeno
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-violet-600 mb-2">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium flex items-center">
                Skupaj prodanih
                <InfoTooltip text={STAT_EXPLANATIONS.novogradnje} />
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(totalNovogradnje)}
            </div>
            <div className="text-sm text-gray-500">
              novogradenj 2007–2025
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Primerjava: novogradnje vs rabljeno ({latestYear})</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Novogradnja</div>
                <div className="text-xl font-bold text-violet-600">
                  {formatPricePerM2(latest.medianaCenaM2Novo)}
                </div>
                <div className="text-xs text-gray-400">
                  {formatNumber(latest.novogradnje)} transakcij
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Rabljeno</div>
                <div className="text-xl font-bold text-gray-600">
                  {formatPricePerM2(latest.medianaCenaM2Rabljeno)}
                </div>
                <div className="text-xs text-gray-400">
                  {formatNumber(latest.rabljeno)} transakcij
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${latest.delezNovogradenj}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {latest.delezNovogradenj.toFixed(1)}% novogradenj
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Novogradnja = nepremičnina stara do 2 leti ob času prodaje. Podatki iz Evidence trga nepremičnin (GURS).
        </p>
      </div>
    </section>
  );
}
