import { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, Building, BarChart3, ArrowUpRight, MapPin } from 'lucide-react';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { STAT_EXPLANATIONS } from '@/lib/stat-explanations';
import { StatisticsJsonLd, FAQSection, STATISTIKA_FAQS, CitationBlock } from '@/components/seo';
import PriceIndexChartClient from '@/components/charts/PriceIndexChartClient';
import EUComparisonChartClient from '@/components/charts/EUComparisonChartClient';
import TopMunicipalitiesChartClient from '@/components/charts/TopMunicipalitiesChartClient';

export const metadata: Metadata = {
  title: 'Statistika nepremičninskega trga | Cene Nepremičnin',
  description:
    'Pregled slovenskega nepremičninskega trga: cenovni indeksi, primerjava z EU, najdražje občine in več.',
};

export default function StatistikaPage() {
  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <StatisticsJsonLd
        name="Statistika nepremičninskega trga v Sloveniji"
        description="Celovit pregled slovenskega nepremičninskega trga od leta 2007: cenovni indeksi, primerjava z EU, analiza po občinah in več."
        url="https://cenenepremicnin.com/statistika"
        populationType="RealEstateTransaction"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Statistika nepremičninskega trga
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Pregled slovenskega nepremičninskega trga od leta 2007 do danes. Cenovni
            indeksi, primerjava z EU in analiza po občinah.
          </p>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Od leta 2015</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">+107%</div>
              <div className="text-sm text-gray-500 flex items-center">
                rast cen nepremičnin
                <InfoTooltip text={STAT_EXPLANATIONS.indeksRasti} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <Building className="w-5 h-5" />
                <span className="text-sm font-medium">Ljubljana</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">4.074 €</div>
              <div className="text-sm text-gray-500 flex items-center">
                mediana cene/m² 2025
                <InfoTooltip text={STAT_EXPLANATIONS.medianaPriceM2} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-medium">Transakcij</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">266.551</div>
              <div className="text-sm text-gray-500 flex items-center">
                od leta 2007
                <InfoTooltip text={STAT_EXPLANATIONS.transakcije} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <ArrowUpRight className="w-5 h-5" />
                <span className="text-sm font-medium">Letna rast</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">+2,7%</div>
              <div className="text-sm text-gray-500 flex items-center">
                Q3 2025 vs Q3 2024
                <InfoTooltip text={STAT_EXPLANATIONS.letniTrend} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Price Index Chart */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Cenovni indeks nepremičnin
          </h2>
          <p className="text-gray-600 mb-6">
            Gibanje cen nepremičnin v Sloveniji od leta 2007. Indeks 100 = povprečje leta
            2015. Vir: Statistični urad RS (SI-STAT).
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <PriceIndexChartClient />
          </div>
        </div>
      </section>

      {/* EU Comparison */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Primerjava z EU
          </h2>
          <p className="text-gray-600 mb-6">
            Slovenija je ena izmed držav z najhitrejšo rastjo cen nepremičnin v EU.
            Primerjava z EU povprečjem, Avstrijo in Hrvaško od leta 2007.
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <EUComparisonChartClient />
          </div>
        </div>
      </section>

      {/* Top Municipalities */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Najdražje občine
              </h2>
              <p className="text-gray-600">
                Občine z najvišjo mediano cene na m² za stanovanja v zadnjem letu.
              </p>
            </div>
            <Link
              href="/lestvice/najdrazje-obcine"
              className="hidden sm:flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Vse občine
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <TopMunicipalitiesChartClient limit={15} />
          </div>
          <Link
            href="/lestvice/najdrazje-obcine"
            className="sm:hidden flex items-center justify-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium mt-4"
          >
            Vse občine
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Municipality Links */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Statistika po občinah
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Ljubljana', slug: 'ljubljana' },
              { name: 'Maribor', slug: 'maribor' },
              { name: 'Kranj', slug: 'kranj' },
              { name: 'Koper', slug: 'koper' },
              { name: 'Celje', slug: 'celje' },
              { name: 'Novo mesto', slug: 'novo-mesto' },
              { name: 'Piran', slug: 'piran' },
              { name: 'Bled', slug: 'bled' },
            ].map((city) => (
              <Link
                key={city.slug}
                href={`/statistika/${city.slug}`}
                className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-200 hover:border-emerald-500 hover:shadow-sm transition-all"
              >
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-gray-900">{city.name}</span>
              </Link>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-6">
            Podrobna statistika za vseh 212 slovenskih občin
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-t">
        <div className="mx-auto max-w-7xl">
          <FAQSection faqs={STATISTIKA_FAQS} />
        </div>
      </section>

      {/* Citation Block */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <CitationBlock
            pageTitle="Statistika nepremičninskega trga v Sloveniji"
            pageUrl="https://cenenepremicnin.com/statistika"
          />
        </div>
      </section>

      {/* Data Source */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-t">
        <div className="mx-auto max-w-7xl">
          <div className="text-center text-sm text-gray-500">
            <p>
              Viri podatkov: Geodetska uprava RS (Evidenca trga nepremičnin),
              Statistični urad RS (SI-STAT), Eurostat (House Price Index).
            </p>
            <Link
              href="/o-podatkih"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Več o virih in metodologiji
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
