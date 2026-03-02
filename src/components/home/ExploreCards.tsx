'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Building, TrendingUp, ArrowRight, Trophy } from 'lucide-react';
import { formatPricePerM2, formatNumber } from '@/lib/format';

interface MunicipalityStats {
  obcina: string;
  medianaCenaM2Stanovanja: number | null;
  steviloTransakcij: number;
}

interface Transaction {
  id: number;
  datum: string;
  cena: number;
  tipNaziv: string;
}

interface IndexData {
  quarter: string;
  base2015: number;
  yoy: number | null;
}

export default function ExploreCards() {
  const [topMunicipality, setTopMunicipality] = useState<MunicipalityStats | null>(null);
  const [recentCount, setRecentCount] = useState<number>(0);
  const [latestIndex, setLatestIndex] = useState<IndexData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/data/aggregated-obcine.json').then(r => r.json()),
      fetch('/data/transactions/2025.json').then(r => r.json()),
      fetch('/data/sistat-indices.json').then(r => r.json()),
    ])
      .then(([municipalities, transactions, indices]: [MunicipalityStats[], Transaction[], IndexData[]]) => {
        // Get top municipality
        const sorted = municipalities
          .filter((m) => m.medianaCenaM2Stanovanja && m.medianaCenaM2Stanovanja > 0)
          .sort((a, b) => (b.medianaCenaM2Stanovanja || 0) - (a.medianaCenaM2Stanovanja || 0));
        if (sorted.length > 0) {
          setTopMunicipality(sorted[0]);
        }

        // Count recent transactions (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recent = transactions.filter((t: Transaction) => new Date(t.datum) >= thirtyDaysAgo);
        setRecentCount(recent.length);

        // Get latest index
        if (indices.length > 0) {
          setLatestIndex(indices[indices.length - 1]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading explore cards data:', err);
        setLoading(false);
      });
  }, []);

  const formatName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Raziskuj naprej
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Statistika card */}
          <Link
            href="/statistika"
            className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all"
          >
            <BarChart3 className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-700">
              Statistika
            </h3>
            <p className="text-gray-600 mb-3">
              Podrobna analiza cen po občinah, časovni trendi in primerjava z EU.
            </p>
            {!loading && latestIndex && (
              <div className="bg-emerald-50 rounded-lg p-3 mb-3">
                <div className="text-xs text-emerald-600 font-medium">Indeks cen Q3 2025</div>
                <div className="text-lg font-bold text-emerald-700">
                  {latestIndex.base2015.toFixed(1)}
                  {latestIndex.yoy !== null && (
                    <span className={`text-sm ml-2 ${latestIndex.yoy >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {latestIndex.yoy >= 0 ? '+' : ''}{latestIndex.yoy.toFixed(1)}% YoY
                    </span>
                  )}
                </div>
              </div>
            )}
            <span className="inline-flex items-center text-emerald-600 font-medium">
              Oglej si <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </Link>

          {/* Zadnje prodaje card */}
          <Link
            href="/prodaje"
            className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all"
          >
            <Building className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-700">
              Zadnje prodaje
            </h3>
            <p className="text-gray-600 mb-3">
              Preglej najnovejše transakcije nepremičnin po vsej Sloveniji.
            </p>
            {!loading && recentCount > 0 && (
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <div className="text-xs text-blue-600 font-medium">Zadnjih 30 dni</div>
                <div className="text-lg font-bold text-blue-700">
                  {formatNumber(recentCount)} novih prodaj
                </div>
              </div>
            )}
            <span className="inline-flex items-center text-emerald-600 font-medium">
              Oglej si <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </Link>

          {/* Lestvice card */}
          <Link
            href="/lestvice"
            className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all"
          >
            <Trophy className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-700">
              Lestvice
            </h3>
            <p className="text-gray-600 mb-3">
              Najdražje nepremičnine, najdražje občine, novogradnje in več.
            </p>
            {!loading && topMunicipality && (
              <div className="bg-amber-50 rounded-lg p-3 mb-3">
                <div className="text-xs text-amber-600 font-medium">Najdražja občina</div>
                <div className="text-lg font-bold text-amber-700">
                  {formatName(topMunicipality.obcina)}{' '}
                  <span className="text-sm font-normal">
                    {topMunicipality.medianaCenaM2Stanovanja
                      ? formatPricePerM2(topMunicipality.medianaCenaM2Stanovanja)
                      : '-'}
                  </span>
                </div>
              </div>
            )}
            <span className="inline-flex items-center text-emerald-600 font-medium">
              Oglej si <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
