import { Metadata } from 'next';
import Link from 'next/link';
import {
  Trophy,
  Building,
  Home,
  MapPin,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  Ruler,
} from 'lucide-react';
import { ItemListJsonLd, FAQSection, LESTVICE_FAQS } from '@/components/seo';

export const metadata: Metadata = {
  title: 'Lestvice nepremičnin | Cene Nepremičnin',
  description:
    'Rankingi slovenskega nepremičninskega trga: najdražje nepremičnine, najdražje občine, največje podražitve in več.',
};

const RANKINGS = [
  {
    slug: 'najdrazje-nepremicnine',
    title: 'Top 100 najdražjih nepremičnin',
    description: 'Najdražje prodane nepremičnine v Sloveniji vseh časov (2007–2026)',
    icon: Trophy,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
  {
    slug: 'najdrazja-stanovanja',
    title: 'Top 100 najdražjih stanovanj',
    description: 'Najdražja stanovanja prodana v Sloveniji od 2007',
    icon: Building,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    slug: 'najdrazje-hise',
    title: 'Top 100 najdražjih hiš',
    description: 'Najdražje hiše prodane v Sloveniji od 2007',
    icon: Home,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    slug: 'najdrazja-cena-m2',
    title: 'Top 100 najvišjih cen na m²',
    description: 'Nepremičnine z najvišjo ceno na kvadratni meter',
    icon: Ruler,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    slug: 'najdrazje-obcine',
    title: 'Najdražje občine',
    description: 'Občine z najvišjo mediano cene na m² za stanovanja',
    icon: MapPin,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    slug: 'najcenejse-obcine',
    title: 'Najcenejše občine',
    description: 'Občine z najnižjo mediano cene na m² za stanovanja',
    icon: TrendingDown,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    slug: 'najcenejsa-stanovanja-ljubljana',
    title: 'Najcenejša stanovanja v Ljubljani',
    description: 'Najbolj ugodna stanovanja prodana v Ljubljani vsako leto',
    icon: Building,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    slug: 'najvecje-podrazitve',
    title: 'Največje podražitve',
    description: 'Občine z največjo rastjo cen v zadnjem letu',
    icon: TrendingUp,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    slug: 'novogradnje',
    title: 'Novogradnje statistika',
    description: 'Analiza prodaj novogradenj v primerjavi z rabljenimi nepremičninami',
    icon: Sparkles,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
];

export default function LestvicePage() {
  // Prepare ranking items for schema
  const rankingItems = RANKINGS.map((ranking, index) => ({
    position: index + 1,
    name: ranking.title,
    url: `https://cenenepremicnin.com/lestvice/${ranking.slug}`,
    description: ranking.description,
  }));

  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <ItemListJsonLd
        name="Lestvice nepremičnin v Sloveniji"
        description="Rankingi slovenskega nepremičninskega trga: najdražje nepremičnine, najdražje občine, največje podražitve in več."
        url="https://cenenepremicnin.com/lestvice"
        items={rankingItems}
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Lestvice in rankingi
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Preglejte najdražje nepremičnine, primerjajte občine in odkrijte trende na
            slovenskem nepremičninskem trgu.
          </p>
        </div>
      </section>

      {/* Rankings Grid */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {RANKINGS.map((ranking) => {
              const Icon = ranking.icon;
              return (
                <Link
                  key={ranking.slug}
                  href={`/lestvice/${ranking.slug}`}
                  className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-emerald-400 hover:shadow-lg transition-all"
                >
                  <div
                    className={`w-12 h-12 rounded-lg ${ranking.bg} flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-6 h-6 ${ranking.color}`} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {ranking.title}
                  </h2>
                  <p className="text-gray-600 mt-2 text-sm">{ranking.description}</p>
                  <div className="flex items-center gap-1 text-emerald-600 font-medium mt-4 text-sm">
                    Poglej
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Hiter dostop</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/statistika/ljubljana"
              className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-200 hover:border-emerald-500 hover:shadow-sm transition-all"
            >
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span className="font-medium text-gray-900">Ljubljana</span>
            </Link>
            <Link
              href="/statistika/maribor"
              className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-200 hover:border-emerald-500 hover:shadow-sm transition-all"
            >
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span className="font-medium text-gray-900">Maribor</span>
            </Link>
            <Link
              href="/statistika/koper"
              className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-200 hover:border-emerald-500 hover:shadow-sm transition-all"
            >
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span className="font-medium text-gray-900">Koper</span>
            </Link>
            <Link
              href="/statistika/kranj"
              className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-200 hover:border-emerald-500 hover:shadow-sm transition-all"
            >
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span className="font-medium text-gray-900">Kranj</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-t">
        <div className="mx-auto max-w-7xl">
          <FAQSection faqs={LESTVICE_FAQS} />
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
