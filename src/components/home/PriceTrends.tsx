'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { TrendingUp, ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { STAT_EXPLANATIONS } from '@/lib/stat-explanations';

// Dynamic import to avoid SSR issues with Recharts
const PriceIndexChart = dynamic(
  () => import('@/components/charts/PriceIndexChart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg" />
    ),
  }
);

interface IndexData {
  quarter: string;
  base2015: number;
  yoy: number | null;
}

export default function PriceTrends() {
  const [data, setData] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/sistat-indices.json')
      .then((res) => res.json())
      .then((json: IndexData[]) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading price index data:', err);
        setLoading(false);
      });
  }, []);

  // Calculate key stats
  const latest = data[data.length - 1];
  const earliest = data[0];
  const peak = data.reduce((max, d) => d.base2015 > max.base2015 ? d : max, data[0] || { base2015: 0, quarter: '' });
  const trough = data.reduce((min, d) => d.base2015 < min.base2015 ? d : min, data[0] || { base2015: Infinity, quarter: '' });

  // Calculate total change since 2007
  const totalChange = latest && earliest
    ? ((latest.base2015 - earliest.base2015) / earliest.base2015 * 100)
    : 0;

  // Calculate change since 2015 (base)
  const changeSince2015 = latest
    ? (latest.base2015 - 100)
    : 0;

  // Format quarter for display
  const formatQuarter = (quarter: string) => {
    const [year, q] = quarter.split('-');
    return `${q} ${year}`;
  };

  if (loading) {
    return (
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-6" />
          <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg" />
        </div>
      </section>
    );
  }

  if (data.length === 0) return null;

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Gibanje cen</h2>
          </div>
          <Link
            href="/statistika"
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            Podrobna analiza
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Key stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-500 mb-1 flex items-center">
              Trenutni indeks
              <InfoTooltip text="Cenovni indeks prikazuje relativno spremembo cen nepremičnin glede na bazno leto 2015 (= 100). Vrednost 207 pomeni, da so cene za 107% višje kot leta 2015." />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {latest?.base2015.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">{formatQuarter(latest?.quarter || '')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-500 mb-1 flex items-center">
              Od 2015
              <InfoTooltip text={STAT_EXPLANATIONS.indeksRasti} />
            </div>
            <div className={`text-2xl font-bold flex items-center gap-1 ${changeSince2015 >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {changeSince2015 >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              {changeSince2015 >= 0 ? '+' : ''}{changeSince2015.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">baza 2015 = 100</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-500 mb-1 flex items-center">
              Vrh
              <InfoTooltip text="Najvišja vrednost cenovnega indeksa od začetka merjenja. Predstavlja četrtletje z najvišjimi cenami nepremičnin." />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {peak?.base2015.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">{formatQuarter(peak?.quarter || '')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-500 mb-1 flex items-center">
              Dno
              <InfoTooltip text="Najnižja vrednost cenovnega indeksa od začetka merjenja. Predstavlja četrtletje z najnižjimi cenami nepremičnin (tipično v času krize 2014-2015)." />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {trough?.base2015.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">{formatQuarter(trough?.quarter || '')}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Indeks cen stanovanjskih nepremičnin v Sloveniji (2007–2025)
          </h3>
          <PriceIndexChart className="h-[350px]" />
        </div>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Vir: Statistični urad RS (SI-STAT). Indeks cen stanovanjskih nepremičnin, baza 2015 = 100.
        </p>
      </div>
    </section>
  );
}
