'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Trophy, ArrowLeft, Building, Home, Layers, Briefcase, Car, TreePine } from 'lucide-react';
import { ItemListJsonLd, FAQSection, NAJDRAZJE_NEPREMICNINE_FAQS, CitationBlock } from '@/components/seo';

const RankingTable = dynamic(
  () => import('@/components/rankings/RankingTable'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    ),
  }
);

type TabType = 'vse' | 'stanovanja' | 'hise' | 'poslovni' | 'garaze' | 'turisticni';

const TABS: { id: TabType; label: string; icon: React.ElementType; dataUrl: string }[] = [
  { id: 'vse', label: 'Vse', icon: Layers, dataUrl: '/data/rankings/najdrazje-100.json' },
  { id: 'stanovanja', label: 'Stanovanja', icon: Building, dataUrl: '/data/rankings/najdrazja-stanovanja-100.json' },
  { id: 'hise', label: 'Hiše', icon: Home, dataUrl: '/data/rankings/najdrazje-hise-100.json' },
  { id: 'poslovni', label: 'Poslovni', icon: Briefcase, dataUrl: '/data/rankings/najdrazji-poslovni-100.json' },
  { id: 'garaze', label: 'Garaže', icon: Car, dataUrl: '/data/rankings/najdrazje-garaze-100.json' },
  { id: 'turisticni', label: 'Turizem & kmetijstvo', icon: TreePine, dataUrl: '/data/rankings/najdrazji-turisticni-kmetijski-100.json' },
];

export default function NajdrazjeNepremicninePage() {
  const [activeTab, setActiveTab] = useState<TabType>('vse');
  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <ItemListJsonLd
        name="Top 100 najdražjih nepremičnin v Sloveniji"
        description="Lestvica 100 najdražjih prodanih nepremičnin v Sloveniji od leta 2007. Luksuzne vile, stanovanja in poslovni objekti."
        url="https://cenenepremicnin.com/lestvice/najdrazje-nepremicnine"
        numberOfItems={100}
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-yellow-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/lestvice"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Vse lestvice
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Top 100 najdražjih nepremičnin
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Najdražje prodane nepremičnine v Sloveniji vseh časov (2007–2026)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex gap-1 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ranking Table */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <RankingTable key={activeTab} dataUrl={currentTab.dataUrl} />
        </div>
      </section>

      {/* Info */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">O lestvici</h2>
            <div className="prose prose-sm text-gray-600">
              <p>
                Lestvica prikazuje 100 najdražjih prodanih nepremičnin v Sloveniji od leta
                2007. Uporabite zavihke za filtriranje po vrsti nepremičnine:
              </p>
              <ul className="mt-2 space-y-1">
                <li><strong>Vse</strong> – vse vrste nepremičnin</li>
                <li><strong>Stanovanja</strong> – stanovanja v večstanovanjskih stavbah</li>
                <li><strong>Hiše</strong> – stanovanjske hiše</li>
                <li><strong>Poslovni</strong> – pisarne, trgovine, gostinski lokali, industrijski prostori</li>
                <li><strong>Garaže</strong> – parkirni prostori in garaže</li>
                <li><strong>Turizem & kmetijstvo</strong> – turistični nastanitveni objekti in kmetijski objekti</li>
              </ul>
              <p className="mt-3">
                Upoštevane so samo tržne transakcije na prostem trgu, izključeni so posli
                med povezanimi osebami.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <FAQSection faqs={NAJDRAZJE_NEPREMICNINE_FAQS} />
        </div>
      </section>

      {/* Citation Block */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <CitationBlock
            pageTitle="Top 100 najdražjih nepremičnin v Sloveniji"
            pageUrl="https://cenenepremicnin.com/lestvice/najdrazje-nepremicnine"
            variant="compact"
          />
        </div>
      </section>

      {/* Data Source */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-t">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm text-gray-500">
            Vir: Geodetska uprava RS, Evidenca trga nepremičnin (2007–2026)
          </p>
        </div>
      </section>
    </div>
  );
}
