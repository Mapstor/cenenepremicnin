'use client';

import { useEffect, useState } from 'react';
import { formatPricePerM2 } from '@/lib/format';
import { MapPin, Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface MunicipalityRank {
  rank: number;
  obcina: string;
  medianaCenaM2: number;
  steviloTransakcij: number;
  trendYoY?: number;
}

interface MunicipalityRankingTableProps {
  dataUrl: string;
  showTrend?: boolean;
  className?: string;
}

// Rank badge styling
const getRankStyle = (rank: number) => {
  if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  if (rank === 2) return 'bg-gray-100 text-gray-700 border-gray-300';
  if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
  return 'bg-gray-50 text-gray-600 border-gray-200';
};

// Format municipality name
const formatMunicipality = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Create slug from municipality name
const toSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/č/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/\s+/g, '-');
};

export default function MunicipalityRankingTable({
  dataUrl,
  showTrend = false,
  className = '',
}: MunicipalityRankingTableProps) {
  const [data, setData] = useState<MunicipalityRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(dataUrl)
      .then((res) => res.json())
      .then((json: MunicipalityRank[]) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading municipality ranking:', err);
        setLoading(false);
      });
  }, [dataUrl]);

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {data.map((item) => (
          <Link
            key={item.obcina}
            href={`/statistika/${toSlug(item.obcina)}`}
            className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-emerald-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-4">
              {/* Rank badge */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-lg ${getRankStyle(item.rank)}`}
              >
                {item.rank <= 3 ? (
                  <Trophy className={`w-5 h-5 ${item.rank === 1 ? 'text-yellow-600' : item.rank === 2 ? 'text-gray-500' : 'text-orange-600'}`} />
                ) : (
                  item.rank
                )}
              </div>

              {/* Municipality name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {formatMunicipality(item.obcina)}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {item.steviloTransakcij} transakcij
                </div>
              </div>

              {/* Price and trend */}
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-gray-900">
                  {formatPricePerM2(item.medianaCenaM2)}
                </div>
                {showTrend && item.trendYoY !== undefined && (
                  <div
                    className={`flex items-center justify-end gap-1 text-sm ${
                      item.trendYoY > 0 ? 'text-green-600' : item.trendYoY < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}
                  >
                    {item.trendYoY > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : item.trendYoY < 0 ? (
                      <TrendingDown className="w-3.5 h-3.5" />
                    ) : null}
                    {item.trendYoY > 0 ? '+' : ''}{item.trendYoY.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Count */}
      <div className="text-center text-sm text-gray-500 mt-6">
        Prikazanih {data.length} občin
      </div>
    </div>
  );
}
