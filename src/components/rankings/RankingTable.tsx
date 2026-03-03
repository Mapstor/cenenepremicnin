'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice, formatPricePerM2, formatArea, formatDateShort } from '@/lib/format';
import { Building, Home, Car, Factory, Wheat, MapPin, Trophy } from 'lucide-react';

interface RankedTransaction {
  rank: number;
  id: number;
  datum: string;
  cena: number;
  tip: number;
  tipNaziv: string;
  povrsina: number;
  cenaNaM2: number;
  obcina: string;
  naslov: string;
  leto: number;
}

interface RankingTableProps {
  dataUrl: string;
  className?: string;
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

// Rank badge styling
const getRankStyle = (rank: number) => {
  if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  if (rank === 2) return 'bg-gray-100 text-gray-700 border-gray-300';
  if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
  return 'bg-gray-50 text-gray-600 border-gray-200';
};

export default function RankingTable({ dataUrl, className = '' }: RankingTableProps) {
  const [data, setData] = useState<RankedTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(dataUrl)
      .then((res) => res.json())
      .then((json: RankedTransaction[]) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading ranking data:', err);
        setLoading(false);
      });
  }, [dataUrl]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {data.map((item) => {
          const Icon = getTypeIcon(item.tip);
          return (
            <div
              key={`${item.id}-${item.rank}`}
              className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-emerald-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Rank badge */}
                <div
                  className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg border flex items-center justify-center font-bold text-base sm:text-lg ${getRankStyle(item.rank)}`}
                >
                  {item.rank <= 3 ? (
                    <Trophy className={`w-4 h-4 sm:w-5 sm:h-5 ${item.rank === 1 ? 'text-yellow-600' : item.rank === 2 ? 'text-gray-500' : 'text-orange-600'}`} />
                  ) : (
                    item.rank
                  )}
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  {/* Mobile: stack, Desktop: side by side */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                        {item.naslov || item.obcina}
                      </h3>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {item.obcina.charAt(0).toUpperCase() +
                            item.obcina.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <div className="sm:text-right flex-shrink-0 mt-1 sm:mt-0">
                      <div className="font-bold text-gray-900 text-base sm:text-lg">
                        {formatPrice(item.cena)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {formatPricePerM2(item.cenaNaM2)}
                      </div>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      {item.tipNaziv}
                    </span>
                    <span>{formatArea(item.povrsina)}</span>
                    <span className="text-gray-400">
                      {formatDateShort(item.datum)}
                    </span>
                    <Link
                      href={`/zemljevid/${item.id}`}
                      className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 ml-auto"
                    >
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">Zemljevid</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Count */}
      <div className="text-center text-sm text-gray-500 mt-6">
        Prikazanih {data.length} nepremičnin
      </div>
    </div>
  );
}
