'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Building, Home, MapPin, TrendingUp, Calendar, Ruler, Loader2 } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { formatPrice, formatPricePerM2, formatArea, formatDateShort } from '@/lib/format';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { STAT_EXPLANATIONS } from '@/lib/stat-explanations';

// Dynamic import for map (avoid SSR issues with Leaflet)
const LocationMap = dynamic(() => import('./LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
    </div>
  ),
});

interface LocationAnalysisProps {
  lat: number;
  lon: number;
  address: string;
}

const RADIUS_OPTIONS = [
  { value: 500, label: '500 m' },
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
];

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate median
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export default function LocationAnalysis({ lat, lon, address }: LocationAnalysisProps) {
  const [radius, setRadius] = useState(1000);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [yearsToLoad] = useState([2025, 2024, 2023, 2022, 2021]);

  // Load transactions from recent years
  useEffect(() => {
    async function loadTransactions() {
      setIsLoading(true);
      const allTransactions: Transaction[] = [];

      for (const year of yearsToLoad) {
        try {
          const response = await fetch(`/data/transactions/${year}.json`);
          if (response.ok) {
            const data = await response.json();
            allTransactions.push(...data);
          }
        } catch (error) {
          console.error(`Error loading transactions for ${year}:`, error);
        }
      }

      setTransactions(allTransactions);
      setIsLoading(false);
    }

    loadTransactions();
  }, [yearsToLoad]);

  // Filter transactions within radius
  const nearbyTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const distance = calculateDistance(lat, lon, tx.lat, tx.lon);
        return distance <= radius;
      })
      .map((tx) => ({
        ...tx,
        distance: calculateDistance(lat, lon, tx.lat, tx.lon),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [transactions, lat, lon, radius]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (nearbyTransactions.length === 0) {
      return null;
    }

    const stanovanja = nearbyTransactions.filter((tx) => tx.tip === 2);
    const hise = nearbyTransactions.filter((tx) => tx.tip === 1);

    const cenaNaM2All = nearbyTransactions.map((tx) => tx.cenaNaM2);
    const cenaNaM2Stanovanja = stanovanja.map((tx) => tx.cenaNaM2);
    const cenaNaM2Hise = hise.map((tx) => tx.cenaNaM2);
    const ceneAll = nearbyTransactions.map((tx) => tx.cena);

    return {
      total: nearbyTransactions.length,
      stanovanja: stanovanja.length,
      hise: hise.length,
      medianaCenaM2: calculateMedian(cenaNaM2All),
      medianaCenaM2Stanovanja: stanovanja.length > 0 ? calculateMedian(cenaNaM2Stanovanja) : null,
      medianaCenaM2Hise: hise.length > 0 ? calculateMedian(cenaNaM2Hise) : null,
      medianaCena: calculateMedian(ceneAll),
      najnizjaCena: Math.min(...ceneAll),
      najvisjaCena: Math.max(...ceneAll),
    };
  }, [nearbyTransactions]);

  // Recent transactions (last 10)
  const recentTransactions = useMemo(() => {
    return [...nearbyTransactions]
      .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
      .slice(0, 10);
  }, [nearbyTransactions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="ml-3 text-gray-600">Nalaganje podatkov...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Location header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analiza lokacije</h2>
          <p className="text-gray-600 mt-1">{address}</p>
        </div>
      </div>

      {/* Radius selector */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          Polmer iskanja
          <InfoTooltip text={STAT_EXPLANATIONS.radius} />
        </label>
        <div className="flex gap-2">
          {RADIUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setRadius(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                radius === option.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <LocationMap
          center={[lat, lon]}
          radius={radius}
          transactions={nearbyTransactions.slice(0, 200)}
        />
      </div>

      {/* Statistics */}
      {stats && stats.total > 0 ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Mediana cene/m²</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPricePerM2(stats.medianaCenaM2)}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                {stats.total} transakcij
                <InfoTooltip text={STAT_EXPLANATIONS.medianaPriceM2} />
              </div>
            </div>

            {stats.medianaCenaM2Stanovanja && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Building className="w-4 h-4" />
                  <span className="text-sm font-medium">Stanovanja</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPricePerM2(stats.medianaCenaM2Stanovanja)}
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  {stats.stanovanja} transakcij
                  <InfoTooltip text={STAT_EXPLANATIONS.stanovanjaVsHise} />
                </div>
              </div>
            )}

            {stats.medianaCenaM2Hise && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <Home className="w-4 h-4" />
                  <span className="text-sm font-medium">Hiše</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPricePerM2(stats.medianaCenaM2Hise)}
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  {stats.hise} transakcij
                  <InfoTooltip text={STAT_EXPLANATIONS.stanovanjaVsHise} />
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Ruler className="w-4 h-4" />
                <span className="text-sm font-medium">Razpon cen</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(stats.najnizjaCena)}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                do {formatPrice(stats.najvisjaCena)}
                <InfoTooltip text="Najnižja in najvišja prodajna cena v izbranem polmeru. Za bolj reprezentativno oceno uporabite mediano." />
              </div>
            </div>
          </div>

          {/* Recent transactions table */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Zadnje transakcije v bližini</h3>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Datum
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Tip
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Naslov
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                        Cena
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                        Površina
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                        €/m²
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                        Razdalja
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentTransactions.map((tx, index) => (
                      <tr key={`${tx.id}-${index}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateShort(tx.datum)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                              tx.tip === 2
                                ? 'bg-blue-100 text-blue-700'
                                : tx.tip === 1
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {tx.tip === 2 && <Building className="w-3 h-3" />}
                            {tx.tip === 1 && <Home className="w-3 h-3" />}
                            {tx.tipNaziv}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">
                          {tx.naslov}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatPrice(tx.cena)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {formatArea(tx.uporabnaPovrsina)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-emerald-600 text-right">
                          {formatPricePerM2(tx.cenaNaM2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-right">
                          {tx.distance < 1000
                            ? `${Math.round(tx.distance)} m`
                            : `${(tx.distance / 1000).toFixed(1)} km`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">O analizi</h3>
            <p className="text-gray-600 text-sm">
              Analiza temelji na {stats.total} transakcijah v polmeru {radius / 1000} km od
              izbrane lokacije v zadnjih 5 letih (2021-2025). Prikazana je mediana cene na m²,
              ki je bolj reprezentativna od povprečja, saj ni občutljiva na ekstremne vrednosti.
            </p>
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 text-center">
          <p className="text-yellow-800">
            V polmeru {radius / 1000} km ni zabeleženih transakcij. Poskusite povečati polmer iskanja.
          </p>
        </div>
      )}
    </div>
  );
}
