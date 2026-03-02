import { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, Filter, Calendar, ArrowUpRight } from 'lucide-react';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { STAT_EXPLANATIONS } from '@/lib/stat-explanations';
import { DatasetJsonLd, CitationBlock } from '@/components/seo';
import TransactionTableClient from '@/components/transactions/TransactionTableClient';

export const metadata: Metadata = {
  title: 'Zadnje prodaje nepremičnin | Cene Nepremičnin',
  description:
    'Pregled najnovejših prodaj nepremičnin v Sloveniji. Stanovanja, hiše, poslovni prostori in več iz Evidence trga nepremičnin.',
};

export default function ProdajePage() {
  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <DatasetJsonLd
        name="Zadnje prodaje nepremičnin v Sloveniji"
        description="Pregled najnovejših prodaj nepremičnin v Sloveniji. Stanovanja, hiše, poslovni prostori iz Evidence trga nepremičnin (GURS)."
        url="https://cenenepremicnin.com/prodaje"
        temporalCoverage="2007/2026"
        keywords={['prodaje nepremičnin', 'transakcije', 'stanovanja', 'hiše', 'slovenija', 'GURS ETN']}
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Zadnje prodaje nepremičnin
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Pregled najnovejših prodaj nepremičnin v Sloveniji. Podatki iz Evidence trga
            nepremičnin (GURS), posodobljeni mesečno.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-b">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">2025</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">12.847</div>
              <div className="text-sm text-gray-500 flex items-center">
                transakcij
                <InfoTooltip text={STAT_EXPLANATIONS.transakcije} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Stanovanja</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">8.234</div>
              <div className="text-sm text-gray-500">prodaj</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Hiše</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">2.156</div>
              <div className="text-sm text-gray-500">prodaj</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Zadnja</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">Dec</div>
              <div className="text-sm text-gray-500">posodobitev</div>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction List */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Zadnje transakcije</h2>
            <Link
              href="/statistika"
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              Statistika
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <TransactionTableClient limit={100} />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">O podatkih</h2>
            <div className="prose prose-sm text-gray-600 max-w-none">
              <p>
                Podatki o prodajah nepremičnin so pridobljeni iz Evidence trga nepremičnin
                (ETN), ki jo vodi Geodetska uprava Republike Slovenije (GURS). Prikazane so
                samo tržne transakcije na prostem trgu.
              </p>
              <p className="mt-2">
                Vključene so transakcije s potrjeno kupoprodajno pogodbo, izključeni pa so
                posli med povezanimi osebami, lizingi in razlastitve.
              </p>
            </div>
            <Link
              href="/o-podatkih"
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium mt-4"
            >
              Več o virih podatkov
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Citation Block */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <CitationBlock
            pageTitle="Zadnje prodaje nepremičnin v Sloveniji"
            pageUrl="https://cenenepremicnin.com/prodaje"
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
