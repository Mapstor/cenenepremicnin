'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, Building, Home, MapPin } from 'lucide-react';
import { formatPrice, formatPricePerM2, formatArea, formatDateShort } from '@/lib/format';

interface Transaction {
  id: number;
  datum: string;
  cena: number;
  tip: number;
  tipNaziv: string;
  povrsina: number;
  uporabnaPovrsina: number;
  cenaNaM2: number;
  obcina: string;
  naslov: string;
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestDate, setLatestDate] = useState<string | null>(null);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        // Try 2025 first, then 2024
        let data: Transaction[] = [];

        try {
          const res2025 = await fetch('/data/transactions/2025.json');
          if (res2025.ok) {
            data = await res2025.json();
          }
        } catch {
          // Fallback to 2024
        }

        if (data.length === 0) {
          const res2024 = await fetch('/data/transactions/2024.json');
          if (res2024.ok) {
            data = await res2024.json();
          }
        }

        // Sort by date descending and take top 10
        const sorted = data
          .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
          .slice(0, 10);

        setTransactions(sorted);

        // Track latest date in dataset
        if (sorted.length > 0) {
          setLatestDate(sorted[0].datum);
        }
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const getPropertyIcon = (tip: number) => {
    if (tip === 1) return <Home className="w-4 h-4" />;
    return <Building className="w-4 h-4" />;
  };

  const getPropertyColor = (tip: number) => {
    switch (tip) {
      case 1: return 'bg-green-100 text-green-700'; // Hiša
      case 2: return 'bg-blue-100 text-blue-700';   // Stanovanje
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return null;
  }

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Zadnje prodaje</h2>
              <p className="text-sm text-gray-500">
                Vir: GURS ETN · Posodobljeno tedensko
                {latestDate && (
                  <span className="ml-1">
                    · Zadnji vnos: {formatDateShort(latestDate)}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Link
            href="/prodaje"
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            Vse prodaje
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Lokacija</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tip</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Cena</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Površina</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">€/m²</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx, index) => (
                <tr key={`${tx.id}-${index}`} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
                          {tx.naslov}
                        </div>
                        <div className="text-xs text-gray-500">{tx.obcina}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getPropertyColor(tx.tip)}`}>
                      {getPropertyIcon(tx.tip)}
                      {tx.tipNaziv}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {formatPrice(tx.cena)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {formatArea(tx.uporabnaPovrsina)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {formatPricePerM2(tx.cenaNaM2)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-500 text-sm">
                    {formatDateShort(tx.datum)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {transactions.map((tx, index) => (
            <div
              key={`${tx.id}-${index}`}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900 text-sm truncate">
                      {tx.naslov}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 ml-6">{tx.obcina}</div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getPropertyColor(tx.tip)}`}>
                  {getPropertyIcon(tx.tip)}
                  {tx.tipNaziv}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div>
                  <div className="text-lg font-bold text-gray-900">{formatPrice(tx.cena)}</div>
                  <div className="text-xs text-gray-500">{formatPricePerM2(tx.cenaNaM2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{formatArea(tx.uporabnaPovrsina)}</div>
                  <div className="text-xs text-gray-500">{formatDateShort(tx.datum)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/prodaje"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Poglej vse prodaje
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
