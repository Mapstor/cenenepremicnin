import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowLeft, Euro } from 'lucide-react';
import { ItemListJsonLd, FAQSection, NAJDRAZJE_OBCINE_FAQS, CitationBlock } from '@/components/seo';
import MunicipalityRankingTableClient from '@/components/rankings/MunicipalityRankingTableClient';

export const metadata: Metadata = {
  title: 'Najdražje občine v Sloveniji | Cene Nepremičnin',
  description:
    'Lestvica občin z najvišjo mediano cene na m² za stanovanja. Primerjava cen po občinah v Sloveniji.',
};

export default function NajdrazjeObcinePage() {
  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <ItemListJsonLd
        name="Najdražje občine v Sloveniji"
        description="Lestvica občin z najvišjo mediano cene na m² za stanovanja. Primerjava cen po občinah v Sloveniji."
        url="https://cenenepremicnin.com/lestvice/najdrazje-obcine"
        numberOfItems={212}
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/lestvice"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Vse lestvice
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Najdražje občine v Sloveniji
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Občine z najvišjo mediano cene na m² za stanovanja
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Info box */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <p className="text-emerald-800 text-sm">
              Lestvica prikazuje občine razvrščene po mediani cene na m² za stanovanja v zadnjih 12 mesecih.
              Upoštevane so samo občine z vsaj 10 prodanimi stanovanji. Kliknite na občino za podrobno statistiko.
            </p>
          </div>
        </div>
      </section>

      {/* Ranking Table */}
      <section className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <MunicipalityRankingTableClient dataUrl="/data/rankings/najdrazje-obcine.json" />
        </div>
      </section>

      {/* Analysis */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Analiza</h2>
            <div className="prose prose-sm text-gray-600">
              <p>
                Ljubljana ostaja najdražja občina v Sloveniji, s cenami stanovanj, ki presegajo
                3.500 €/m². Sledijo ji obalne občine (Piran, Izola, Koper) in turistična
                središča (Bled, Kranjska Gora).
              </p>
              <p className="mt-2">
                Cene so odvisne od več dejavnikov: bližine prestolnice, turističnega potenciala,
                kakovosti infrastrukture in naravnih danosti (morje, gore, jezera).
              </p>
              <p className="mt-2">
                Mediana cene na m² je bolj zanesljiv kazalnik od povprečja, saj ni občutljiva
                na posamezne ekstremno drage ali poceni transakcije.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <FAQSection faqs={NAJDRAZJE_OBCINE_FAQS} />
        </div>
      </section>

      {/* Citation Block */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <CitationBlock
            pageTitle="Najdražje občine v Sloveniji"
            pageUrl="https://cenenepremicnin.com/lestvice/najdrazje-obcine"
            variant="compact"
          />
        </div>
      </section>

      {/* Data Source */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-t">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm text-gray-500">
            Vir: Geodetska uprava RS, Evidenca trga nepremičnin (zadnjih 12 mesecev)
          </p>
        </div>
      </section>
    </div>
  );
}
