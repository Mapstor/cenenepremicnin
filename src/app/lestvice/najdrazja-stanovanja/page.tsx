import { Metadata } from 'next';
import Link from 'next/link';
import { Building, ArrowLeft } from 'lucide-react';
import { ItemListJsonLd, CitationBlock } from '@/components/seo';
import RankingTableClient from '@/components/rankings/RankingTableClient';

export const metadata: Metadata = {
  title: 'Top 100 najdražjih stanovanj v Sloveniji | Cene Nepremičnin',
  description:
    'Lestvica 100 najdražjih prodanih stanovanj v Sloveniji od leta 2007. Prestižna stanovanja v Ljubljani, na obali in drugod.',
};

export default function NajdrazjaStanovanjaPage() {
  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <ItemListJsonLd
        name="Top 100 najdražjih stanovanj v Sloveniji"
        description="Lestvica 100 najdražjih prodanih stanovanj v Sloveniji od leta 2007. Prestižna stanovanja v Ljubljani, na obali in drugod."
        url="https://cenenepremicnin.com/lestvice/najdrazja-stanovanja"
        numberOfItems={100}
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/lestvice"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Vse lestvice
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Top 100 najdražjih stanovanj
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Najdražja stanovanja prodana v Sloveniji od 2007
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ranking Table */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <RankingTableClient dataUrl="/data/rankings/najdrazja-stanovanja-100.json" />
        </div>
      </section>

      {/* Info */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">O lestvici</h2>
            <div className="prose prose-sm text-gray-600">
              <p>
                Lestvica prikazuje 100 najdražjih prodanih stanovanj v Sloveniji od leta
                2007. Vključena so stanovanja vseh velikosti v večstanovanjskih stavbah.
              </p>
              <p className="mt-2">
                Najprestižnejša stanovanja so večinoma v Ljubljani (center, Šiška, Bežigrad)
                in na slovenski obali (Piran, Portorož, Izola).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Citation Block */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <CitationBlock
            pageTitle="Top 100 najdražjih stanovanj v Sloveniji"
            pageUrl="https://cenenepremicnin.com/lestvice/najdrazja-stanovanja"
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
