'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { BarChart3, TrendingUp, Building, Trophy } from 'lucide-react';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { STAT_EXPLANATIONS } from '@/lib/stat-explanations';
import MapControls, { MapViewMode } from '@/components/map/MapControls';
import TimeSlider from '@/components/map/TimeSlider';
import RecentTransactions from '@/components/home/RecentTransactions';
import RegionalPrices from '@/components/home/RegionalPrices';
import TopMunicipalities from '@/components/home/TopMunicipalities';
import PriceTrends from '@/components/home/PriceTrends';
import NovogradnjeTeaser from '@/components/home/NovogradnjeTeaser';
import SeoContent from '@/components/home/SeoContent';
import ExploreCards from '@/components/home/ExploreCards';
import EUComparison from '@/components/home/EUComparison';
import { HomepageJsonLd, FAQSection, HOMEPAGE_FAQS } from '@/components/seo';

// Homepage stats interface
interface HomepageStats {
  statsYear: number;
  ljubljanaStanovanja: {
    medianaCenaM2: number;
    povprecjeCenaM2: number;
    stevilo: number;
    trendYoY: number | null;
  };
  skupajTransakcij: number;
  najdrazjaNepremicnina: {
    cena: number;
    tip: number;
    tipNaziv: string;
    obcina: string;
    leto: number;
  };
  najdrazjeStanovanje: {
    cena: number;
    obcina: string;
    leto: number;
    povrsina: number;
  };
}

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
  const [viewMode, setViewMode] = useState<MapViewMode>('heatmap');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [stats, setStats] = useState<HomepageStats | null>(null);

  useEffect(() => {
    fetch('/data/homepage-stats.json')
      .then((res) => res.json())
      .then((data: HomepageStats) => setStats(data))
      .catch(console.error);
  }, []);

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
            <strong>{stats ? stats.skupajTransakcij.toLocaleString('sl-SI') : '...'} prodajah</strong> od 2007 do {stats ? stats.statsYear : '...'} iz Geodetske
            uprave RS.
          </p>

          {/* Quick stats - dynamically loaded */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all">
              <Link href="/statistika/ljubljana">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Building className="w-4 h-4" />
                  <span className="text-sm font-medium">Stanovanja LJ</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats ? `${stats.ljubljanaStanovanja.medianaCenaM2.toLocaleString('sl-SI', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €/m²` : '...'}
                </div>
              </Link>
              <div className="text-sm text-gray-500 flex items-center">
                {stats ? `mediana ${stats.statsYear} (${stats.ljubljanaStanovanja.stevilo.toLocaleString('sl-SI')} prodaj)` : 'nalaganje...'}
                <InfoTooltip text={STAT_EXPLANATIONS.medianaPriceM2} />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {stats ? `povprečje: ${stats.ljubljanaStanovanja.povprecjeCenaM2.toLocaleString('sl-SI', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €/m²` : ''}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all">
              <Link href="/statistika/ljubljana">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Letna rast LJ</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats && stats.ljubljanaStanovanja.trendYoY !== null
                    ? `${stats.ljubljanaStanovanja.trendYoY >= 0 ? '+' : ''}${stats.ljubljanaStanovanja.trendYoY.toLocaleString('sl-SI', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`
                    : '...'}
                </div>
              </Link>
              <div className="text-sm text-gray-500 flex items-center">
                {stats ? `stanovanja ${stats.statsYear - 1}→${stats.statsYear}` : 'nalaganje...'}
                <InfoTooltip text={STAT_EXPLANATIONS.letniTrend} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all">
              <Link href="/prodaje">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Transakcij</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats ? stats.skupajTransakcij.toLocaleString('sl-SI') : '...'}
                </div>
              </Link>
              <div className="text-sm text-gray-500 flex items-center">
                2007–{stats ? stats.statsYear : '...'}
                <InfoTooltip text={STAT_EXPLANATIONS.transakcije} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all">
              <Link href="/lestvice/najdrazje-nepremicnine">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-medium">Najdražja</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats ? `${(stats.najdrazjaNepremicnina.cena / 1000000).toLocaleString('sl-SI', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M €` : '...'}
                </div>
              </Link>
              <div className="text-sm text-gray-500">
                {stats ? `rekord SLO (${stats.najdrazjaNepremicnina.leto})` : 'nalaganje...'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {stats ? `Stanovanje: ${(stats.najdrazjeStanovanje.cena / 1000000).toLocaleString('sl-SI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M € (LJ ${stats.najdrazjeStanovanje.leto})` : ''}
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
            viewMode={viewMode}
            selectedYear={selectedYear}
            className="h-full"
          />
          <MapControls
            heatmapType={heatmapType}
            onHeatmapTypeChange={setHeatmapType}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          <TimeSlider
            selectedYear={selectedYear}
            onChange={setSelectedYear}
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
