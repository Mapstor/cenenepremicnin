'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { BarChart3, TrendingUp, Building, Trophy } from 'lucide-react';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { STAT_EXPLANATIONS } from '@/lib/stat-explanations';
import MapControls from '@/components/map/MapControls';
import RecentTransactions from '@/components/home/RecentTransactions';
import RegionalPrices from '@/components/home/RegionalPrices';
import TopMunicipalities from '@/components/home/TopMunicipalities';
import PriceTrends from '@/components/home/PriceTrends';
import NovogradnjeTeaser from '@/components/home/NovogradnjeTeaser';
import SeoContent from '@/components/home/SeoContent';
import ExploreCards from '@/components/home/ExploreCards';
import EUComparison from '@/components/home/EUComparison';
import { HomepageJsonLd, FAQSection, HOMEPAGE_FAQS } from '@/components/seo';

// Dynamically import map (no SSR for Leaflet)
const MapContainer = dynamic(() => import('@/components/map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Nalaganje zemljevida...</div>
    </div>
  ),
});

export default function Home() {
  const [heatmapType, setHeatmapType] = useState<'ko' | 'obcine'>('obcine');

  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <HomepageJsonLd />

      {/* Hero section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Cene nepremičnin v Sloveniji
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mb-6">
            Raziskujte cene nepremičnin na interaktivnem zemljevidu. Podatki o{' '}
            <strong>266.551 prodajah</strong> od 2007 do 2026 iz Geodetske
            uprave RS.
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all">
              <Link href="/statistika/ljubljana">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Building className="w-4 h-4" />
                  <span className="text-sm font-medium">Stanovanja</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">3.100 €/m²</div>
              </Link>
              <div className="text-sm text-gray-500 flex items-center">
                mediana LJ 2025
                <InfoTooltip text={STAT_EXPLANATIONS.medianaPriceM2} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all">
              <Link href="/statistika">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Letna rast</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">+3,8 %</div>
              </Link>
              <div className="text-sm text-gray-500 flex items-center">
                indeks Q3 2025
                <InfoTooltip text={STAT_EXPLANATIONS.letniTrend} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all">
              <Link href="/prodaje">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Transakcij</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">266.551</div>
              </Link>
              <div className="text-sm text-gray-500 flex items-center">
                2007–2026
                <InfoTooltip text={STAT_EXPLANATIONS.transakcije} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all">
              <Link href="/lestvice/najdrazje-nepremicnine">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-medium">Najdražja</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">34,3 M €</div>
              </Link>
              <div className="text-sm text-gray-500">
                rekordna prodaja
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map section */}
      <section className="relative">
        <div className="relative w-full h-[600px]">
          <MapContainer
            showHeatmap={true}
            heatmapType={heatmapType}
            className="h-full"
          />
          <MapControls
            heatmapType={heatmapType}
            onHeatmapTypeChange={setHeatmapType}
          />
        </div>
      </section>

      {/* Recent transactions */}
      <RecentTransactions />

      {/* Regional prices */}
      <RegionalPrices />

      {/* Top municipalities */}
      <TopMunicipalities />

      {/* Price trends */}
      <PriceTrends />

      {/* Novogradnje teaser */}
      <NovogradnjeTeaser />

      {/* SEO content */}
      <SeoContent />

      {/* EU comparison */}
      <EUComparison />

      {/* Explore cards with real data previews */}
      <ExploreCards />

      {/* FAQ Section with Schema.org markup */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <FAQSection faqs={HOMEPAGE_FAQS} />
        </div>
      </section>
    </div>
  );
}
