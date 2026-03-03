'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice, formatPricePerM2, formatArea, formatDateShort } from '@/lib/format';
import { Building, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

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

interface YearlyRankingTableProps {
  dataUrl: string;
  className?: string;
}

export default function YearlyRankingTable({ dataUrl, className = '' }: YearlyRankingTableProps) {
  const [data, setData] = useState<Record<string, RankedTransaction[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(dataUrl)
      .then((res) => res.json())
      .then((json: Record<string, RankedTransaction[]>) => {
        setData(json);
        // Expand current year by default
        const years = Object.keys(json).sort((a, b) => Number(b) - Number(a));
        if (years.length > 0) {
          setExpandedYears(new Set([years[0]]));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading yearly ranking data:', err);
        setLoading(false);
      });
  }, [dataUrl]);

  const toggleYear = (year: string) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const years = Object.keys(data).sort((a, b) => Number(b) - Number(a));

  return (
    <div className={`space-y-4 ${className}`}>
      {years.map((year) => {
        const isExpanded = expandedYears.has(year);
        const transactions = data[year];

        return (
          <div
            key={year}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            {/* Year header */}
            <button
              onClick={() => toggleYear(year)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-gray-900">{year}</span>
                <span className="text-gray-500 text-sm">
                  {transactions.length} stanovanj
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Transactions */}
            {isExpanded && (
              <div className="border-t border-gray-200">
                {transactions.map((item) => (
                  <div
                    key={`${item.id}-${item.rank}`}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs sm:text-sm">
                      {item.rank}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900 truncate text-xs sm:text-sm">
                            {item.naslov || item.obcina}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {item.obcina.charAt(0).toUpperCase() +
                                item.obcina.slice(1).toLowerCase()}
                            </span>
                          </div>
                        </div>
                        <div className="sm:text-right flex-shrink-0 mt-1 sm:mt-0">
                          <div className="font-bold text-gray-900 text-sm sm:text-base">
                            {formatPrice(item.cena)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatPricePerM2(item.cenaNaM2)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                        <span>{formatArea(item.povrsina)}</span>
                        <span>{formatDateShort(item.datum)}</span>
                        <Link
                          href={`/zemljevid/${item.id}`}
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 ml-auto"
                        >
                          <MapPin className="w-3 h-3" />
                          <span className="hidden sm:inline">Zemljevid</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
