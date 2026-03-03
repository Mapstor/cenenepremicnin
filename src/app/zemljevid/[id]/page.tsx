'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin, ArrowLeft, Building, Home, Car, Factory, Wheat,
  Calendar, Layers, DoorOpen, Sparkles, TrendingUp, TrendingDown,
  ChevronRight, Euro
} from 'lucide-react';
import { formatPrice, formatPricePerM2, formatArea, formatDateShort } from '@/lib/format';

// Dynamic import with SSR disabled for Leaflet map
const TransactionMap = dynamic(() => import('./TransactionMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[50vh] sm:h-[60vh] bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Nalaganje zemljevida...</div>
    </div>
  ),
});

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

// Property type icons
const getTypeIcon = (tip: number) => {
  if (tip === 1) return Home;
  if (tip === 2) return Building;
  if (tip === 3 || tip === 4) return Car;
  if ([5, 6, 7, 8, 9, 10, 11].includes(tip)) return Factory;
  if ([12, 13].includes(tip)) return Wheat;
  return Building;
};

// Calculate distance between two points in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function TransactionMapPage() {
  const params = useParams();
  const id = params.id as string;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [nearbyTransactions, setNearbyTransactions] = useState<Transaction[]>([]);
  const [areaStats, setAreaStats] = useState<{ median: number; count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  // Load transaction data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try loading from multiple years
        const years = ['2026', '2025', '2024', '2023', '2022'];
        let found: Transaction | null = null;
        let allTx: Transaction[] = [];

        for (const year of years) {
          const res = await fetch(`/data/transactions/${year}.json`);
          if (res.ok) {
            const data: Transaction[] = await res.json();
            allTx = [...allTx, ...data];

            if (!found) {
              const tx = data.find(t => t.id === parseInt(id));
              if (tx) found = tx;
            }
          }
        }

        setAllTransactions(allTx);

        if (found) {
          setTransaction(found);

          // Find nearby transactions (within 2km, same type)
          const nearby = allTx
            .filter(t => t.id !== found!.id && t.tip === found!.tip)
            .map(t => ({
              ...t,
              distance: getDistance(found!.lat, found!.lon, t.lat, t.lon)
            }))
            .filter(t => t.distance <= 2)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10);

          setNearbyTransactions(nearby);

          // Calculate area stats (same municipality, same type)
          const areaTransactions = allTx.filter(
            t => t.obcina === found!.obcina && t.tip === found!.tip
          );

          if (areaTransactions.length > 0) {
            const prices = areaTransactions.map(t => t.cenaNaM2).sort((a, b) => a - b);
            const median = prices[Math.floor(prices.length / 2)];
            setAreaStats({ median, count: areaTransactions.length });
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading transaction:', err);
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Nalaganje...</div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-gray-500">Transakcija ni bila najdena.</div>
        <Link href="/prodaje" className="text-emerald-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Nazaj na prodaje
        </Link>
      </div>
    );
  }

  const Icon = getTypeIcon(transaction.tip);
  const propertyAge = transaction.letoIzgradnje
    ? new Date().getFullYear() - transaction.letoIzgradnje
    : null;

  // Price comparison to area median
  const priceComparison = areaStats
    ? Math.round((transaction.cenaNaM2 - areaStats.median) / areaStats.median * 100)
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/prodaje"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Nazaj na prodaje</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              {transaction.obcina.charAt(0).toUpperCase() + transaction.obcina.slice(1).toLowerCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Map */}
      <TransactionMap
        transaction={transaction}
        nearbyTransactions={nearbyTransactions}
      />

      {/* Transaction Details */}
      <div className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 -mt-12 relative z-10">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {transaction.naslov || transaction.imeKo}
                  </h1>
                  {transaction.novogradnja && (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-sm font-medium px-2.5 py-1 rounded-full">
                      <Sparkles className="w-4 h-4" />
                      Novogradnja
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-500 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{transaction.obcina.charAt(0).toUpperCase() + transaction.obcina.slice(1).toLowerCase()}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-400">{transaction.imeKo}</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Prodajna cena</div>
                  <div className="text-3xl font-bold text-gray-900">{formatPrice(transaction.cena)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Cena na m²</div>
                  <div className="text-2xl font-bold text-emerald-600">{formatPricePerM2(transaction.cenaNaM2)}</div>
                </div>
              </div>

              {/* Comparison to area median */}
              {priceComparison !== null && (
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <div className="flex items-center gap-2">
                    {priceComparison > 0 ? (
                      <TrendingUp className="w-5 h-5 text-red-500" />
                    ) : priceComparison < 0 ? (
                      <TrendingDown className="w-5 h-5 text-green-500" />
                    ) : (
                      <Euro className="w-5 h-5 text-gray-500" />
                    )}
                    <span className="text-sm text-gray-600">
                      {priceComparison > 0 ? (
                        <><span className="font-semibold text-red-600">+{priceComparison}%</span> nad mediano občine</>
                      ) : priceComparison < 0 ? (
                        <><span className="font-semibold text-green-600">{priceComparison}%</span> pod mediano občine</>
                      ) : (
                        <>Na mediani občine</>
                      )}
                      {areaStats && (
                        <span className="text-gray-400"> ({formatPricePerM2(areaStats.median)} mediana, {areaStats.count} transakcij)</span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Tip</span>
                </div>
                <div className="font-semibold text-gray-900">{transaction.tipNaziv}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Površina</span>
                </div>
                <div className="font-semibold text-gray-900">{formatArea(transaction.uporabnaPovrsina)}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Leto izgradnje</span>
                </div>
                <div className="font-semibold text-gray-900">
                  {transaction.letoIzgradnje || '—'}
                  {propertyAge !== null && (
                    <span className="text-gray-400 font-normal text-sm"> ({propertyAge} let)</span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Datum prodaje</span>
                </div>
                <div className="font-semibold text-gray-900">{formatDateShort(transaction.datum)}</div>
              </div>
            </div>

            {/* Additional Details */}
            {(transaction.steviloSob || transaction.nadstropje) && (
              <div className="flex flex-wrap gap-3 mt-4">
                {transaction.steviloSob !== null && transaction.steviloSob > 0 && (
                  <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                    <DoorOpen className="w-5 h-5" />
                    {transaction.steviloSob} {transaction.steviloSob === 1 ? 'soba' : transaction.steviloSob === 2 ? 'sobi' : transaction.steviloSob <= 4 ? 'sobe' : 'sob'}
                  </span>
                )}
                {transaction.nadstropje && (
                  <span className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-2 rounded-lg">
                    <Layers className="w-5 h-5" />
                    {transaction.nadstropje}. nadstropje
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Nearby Transactions */}
          {nearbyTransactions.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Podobne nepremičnine v bližini
              </h2>
              <div className="space-y-3">
                {nearbyTransactions.slice(0, 5).map((tx) => {
                  const TxIcon = getTypeIcon(tx.tip);
                  return (
                    <Link
                      key={tx.id}
                      href={`/zemljevid/${tx.id}`}
                      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-emerald-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <TxIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {tx.naslov || tx.imeKo}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatArea(tx.uporabnaPovrsina)} • {formatDateShort(tx.datum)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{formatPrice(tx.cena)}</div>
                          <div className="text-sm text-emerald-600">{formatPricePerM2(tx.cenaNaM2)}</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Municipality Link */}
          <div className="mt-6">
            <Link
              href={`/statistika/${transaction.obcina.toLowerCase().replace(/č/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/[^a-z0-9]+/g, '-')}`}
              className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Statistika za {transaction.obcina.charAt(0).toUpperCase() + transaction.obcina.slice(1).toLowerCase()}
                  </div>
                  <div className="text-sm text-gray-500">Cene, trendi in več o občini</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Data Source */}
      <footer className="bg-white border-t py-4 px-4">
        <p className="text-center text-sm text-gray-500">
          Vir: Geodetska uprava RS, Evidenca trga nepremičnin (2007–2026)
        </p>
      </footer>
    </div>
  );
}
