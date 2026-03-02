'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { STAT_EXPLANATIONS } from '@/lib/stat-explanations';

interface EurostatData {
  quarter: string;
  SI: number;
  EU27_2020: number;
  AT: number | null;
  HR: number | null;
}

interface CountryComparison {
  code: string;
  name: string;
  flag: string;
  value: number | null;
  change: number | null;
}

export default function EUComparison() {
  const [data, setData] = useState<EurostatData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/eurostat-hpi.json')
      .then((res) => res.json())
      .then((json: EurostatData[]) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading Eurostat data:', err);
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
              <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (data.length === 0) return null;

  const latest = data[data.length - 1];
  const yearAgo = data[data.length - 5]; // 4 quarters ago

  const getYoYChange = (code: 'SI' | 'EU27_2020' | 'AT' | 'HR'): number | null => {
    if (!latest || !yearAgo) return null;
    const current = latest[code];
    const previous = yearAgo[code];
    if (current === null || previous === null) return null;
    return ((current - previous) / previous) * 100;
  };

  const countries: CountryComparison[] = [
    { code: 'SI', name: 'Slovenija', flag: '🇸🇮', value: latest.SI, change: getYoYChange('SI') },
    { code: 'AT', name: 'Avstrija', flag: '🇦🇹', value: latest.AT, change: getYoYChange('AT') },
    { code: 'HR', name: 'Hrvaška', flag: '🇭🇷', value: latest.HR, change: getYoYChange('HR') },
    { code: 'EU', name: 'EU-27', flag: '🇪🇺', value: latest.EU27_2020, change: getYoYChange('EU27_2020') },
  ];

  // Calculate how Slovenia compares to EU
  const siVsEU = latest.SI && latest.EU27_2020
    ? ((latest.SI - latest.EU27_2020) / latest.EU27_2020 * 100)
    : null;

  // Format quarter for display
  const formatQuarter = (quarter: string) => {
    const [year, q] = quarter.split('-');
    return `${q} ${year}`;
  };

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 bg-blue-50">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Primerjava z EU</h2>
              <p className="text-sm text-gray-500 flex items-center">
                Indeks cen nepremičnin (baza 2015 = 100)
                <InfoTooltip text={STAT_EXPLANATIONS.housepriceIndex} />
              </p>
            </div>
          </div>
          <Link
            href="/statistika"
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            Več statistike
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Country cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {countries.map((country) => (
            <div
              key={country.code}
              className={`bg-white rounded-xl p-4 border ${
                country.code === 'SI' ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{country.flag}</span>
                <span className="font-medium text-gray-900">{country.name}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {country.value !== null ? country.value.toFixed(1) : '-'}
              </div>
              {country.change !== null && (
                <div className={`text-sm flex items-center gap-1 ${
                  country.change >= 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {country.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {country.change >= 0 ? '+' : ''}{country.change.toFixed(1)}% letno
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary insight */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">Slovenija vs EU-27 povprečje</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-600">
                  {siVsEU !== null ? `+${siVsEU.toFixed(0)}%` : '-'}
                </span>
                <span className="text-gray-500">višji indeks</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">Hrvaška prehitela Slovenijo</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-600">
                  {latest.HR && latest.SI
                    ? `+${((latest.HR - latest.SI) / latest.SI * 100).toFixed(0)}%`
                    : '-'}
                </span>
                <span className="text-gray-500">od 2023</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">Avstrija v minusu</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600">
                  {latest.AT
                    ? `${((latest.AT - (data.find(d => d.quarter === '2022-Q3')?.AT || 173.59)) / 173.59 * 100).toFixed(0)}%`
                    : '-'}
                </span>
                <span className="text-gray-500">od vrha 2022</span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Vir: Eurostat, House Price Index ({formatQuarter(latest.quarter)}). Baza 2015 = 100.
        </p>
      </div>
    </section>
  );
}
