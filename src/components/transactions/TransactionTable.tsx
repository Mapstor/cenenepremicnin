'use client';

import { useEffect, useState } from 'react';
import { formatPrice, formatPricePerM2, formatArea, formatDateShort } from '@/lib/format';
import { Building, Home, Car, Factory, Wheat, MapPin, Calendar, Layers, DoorOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: number;
  datum: string;
  cena: number;
  tip: number;
  tipNaziv: string;
  povrsina: number;
  uporabnaPovrsina: number;
  cenaNaM2: number;
  lat: number;
  lon: number;
  sifraKo: number;
  imeKo: string;
  obcina: string;
  naslov: string;
  letoIzgradnje: number | null;
  novogradnja: boolean;
  steviloSob: number | null;
  nadstropje: string | null;
}

interface TransactionTableProps {
  className?: string;
  limit?: number;
  filterType?: number | null;
}

// Property type icons
const getTypeIcon = (tip: number) => {
  if (tip === 1) return Home; // Hiša
  if (tip === 2) return Building; // Stanovanje
  if (tip === 3 || tip === 4) return Car; // Parking/Garaža
  if ([5, 6, 7, 8, 9, 10, 11].includes(tip)) return Factory; // Poslovni prostori
  if ([12, 13].includes(tip)) return Wheat; // Kmetijski/Turistični
  return Building;
};

export default function TransactionTable({
  className = '',
  limit = 50,
  filterType = null,
}: TransactionTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<number | null>(filterType);

  useEffect(() => {
    // Load most recent year
    fetch('/data/transactions/2025.json')
      .then((res) => res.json())
      .then((json: Transaction[]) => {
        // Sort by date descending
        const sorted = json.sort(
          (a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()
        );
        setTransactions(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading transactions:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  // Filter and limit
  const filtered = selectedType === null
    ? transactions
    : transactions.filter((t) => t.tip === selectedType);
  const display = filtered.slice(0, limit);

  // Property type options with counts
  const getCounts = () => {
    const counts: Record<number, number> = {};
    for (const t of transactions) {
      counts[t.tip] = (counts[t.tip] || 0) + 1;
    }
    return counts;
  };
  const counts = getCounts();

  const typeOptions = [
    { value: null, label: 'Vse', count: transactions.length },
    { value: 2, label: 'Stanovanja', count: counts[2] || 0 },
    { value: 1, label: 'Hiše', count: counts[1] || 0 },
    { value: 3, label: 'Parkirna mesta', count: counts[3] || 0 },
    { value: 4, label: 'Garaže', count: counts[4] || 0 },
  ];

  return (
    <div className={className}>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {typeOptions.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => setSelectedType(opt.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedType === opt.value
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {opt.label} ({opt.count})
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="space-y-3 overflow-x-auto">
        {display.map((tx, index) => {
          const Icon = getTypeIcon(tx.tip);
          const propertyAge = tx.letoIzgradnje ? new Date().getFullYear() - tx.letoIzgradnje : null;

          return (
            <div
              key={`${tx.id}-${index}`}
              className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-emerald-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                          {tx.naslov || tx.imeKo}
                        </h3>
                        {tx.novogradnja && (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3" />
                            <span className="hidden sm:inline">Novogradnja</span>
                            <span className="sm:hidden">Novo</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                          <span className="truncate">{tx.obcina.charAt(0).toUpperCase() + tx.obcina.slice(1).toLowerCase()}</span>
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400 truncate">{tx.imeKo}</span>
                      </div>
                    </div>
                    <div className="sm:text-right flex-shrink-0">
                      <div className="font-bold text-gray-900 text-base sm:text-lg">
                        {formatPrice(tx.cena)}
                      </div>
                      <div className="text-xs sm:text-sm text-emerald-600 font-medium">
                        {formatPricePerM2(tx.cenaNaM2)}
                      </div>
                    </div>
                  </div>

                  {/* Property details grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 pt-3 border-t border-gray-100">
                    {/* Type */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] sm:text-xs text-gray-400">Tip</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{tx.tipNaziv}</div>
                      </div>
                    </div>

                    {/* Area */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Layers className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] sm:text-xs text-gray-400">Površina</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900">{formatArea(tx.uporabnaPovrsina)}</div>
                      </div>
                    </div>

                    {/* Year built / Age */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] sm:text-xs text-gray-400">Leto</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {tx.letoIzgradnje ? tx.letoIzgradnje : <span className="text-gray-400">—</span>}
                        </div>
                      </div>
                    </div>

                    {/* Date of sale */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] sm:text-xs text-gray-400">Prodano</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900">{formatDateShort(tx.datum)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Additional details row */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-xs sm:text-sm">
                    {/* Number of rooms */}
                    {tx.steviloSob !== null && tx.steviloSob > 0 && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 sm:py-1 rounded-lg">
                        <DoorOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                        {tx.steviloSob} {tx.steviloSob === 1 ? 'soba' : tx.steviloSob === 2 ? 'sobi' : tx.steviloSob <= 4 ? 'sobe' : 'sob'}
                      </span>
                    )}

                    {/* Floor */}
                    {tx.nadstropje && (
                      <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 sm:py-1 rounded-lg">
                        <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
                        {tx.nadstropje}. nad.
                      </span>
                    )}

                    {/* Map link */}
                    <Link
                      href={`/zemljevid/${tx.id}`}
                      className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-0.5 sm:py-1 rounded-lg transition-colors ml-auto"
                    >
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Prikaži na zemljevidu</span>
                      <span className="sm:hidden">Zemljevid</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show count */}
      <div className="text-center text-sm text-gray-500 mt-6">
        Prikazanih {display.length} od {filtered.length}{' '}
        {selectedType === null
          ? 'transakcij'
          : selectedType === 2
          ? 'stanovanj'
          : selectedType === 1
          ? 'hiš'
          : selectedType === 3
          ? 'parkirnih mest'
          : selectedType === 4
          ? 'garaž'
          : 'transakcij'}
      </div>
    </div>
  );
}
