import { Metadata } from 'next';
import Link from 'next/link';
import { Building, ArrowLeft, TrendingDown } from 'lucide-react';
import { ItemListJsonLd, FAQSection, NAJCENEJSA_STANOVANJA_FAQS, CitationBlock } from '@/components/seo';
import YearlyRankingTableClient from '@/components/rankings/YearlyRankingTableClient';

export const metadata: Metadata = {
  title: 'Najcenejša stanovanja v Ljubljani po letih | Cene Nepremičnin',
  description:
    'Pregled najcenejših prodanih stanovanj v Ljubljani od 2007 do danes. Primerjava cen po letih.',
};

export default function NajcenejsaStanovanjaLjubljanaPage() {
  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <ItemListJsonLd
        name="Najcenejša stanovanja v Ljubljani po letih"
        description="Pregled najcenejših prodanih stanovanj v Ljubljani od 2007 do danes. Primerjava cen po letih."
        url="https://cenenepremicnin.com/lestvice/najcenejsa-stanovanja-ljubljana"
        numberOfItems={200}
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/lestvice"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Vse lestvice
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingDown className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Najcenejša stanovanja v Ljubljani
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Najbolj ugodna stanovanja prodana v Ljubljani vsako leto (2007–2026)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Info box */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <p className="text-purple-800 text-sm">
              Lestvica prikazuje 10 najcenejših stanovanj prodanih v Ljubljani vsako leto.
              Cene so nominalne (niso prilagojene inflaciji). Kliknite na leto za razširitev.
            </p>
          </div>
        </div>
      </section>

      {/* Yearly Ranking Table */}
      <section className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <YearlyRankingTableClient dataUrl="/data/rankings/najcenejsa-stanovanja-ljubljana.json" />
        </div>
      </section>

      {/* Analysis */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Analiza</h2>
            <div className="prose prose-sm text-gray-600">
              <p>
                V Ljubljani je cena stanovanj močno zrasla od leta 2015. Najcenejša
                stanovanja v zadnjih letih so večinoma manjša stanovanja v starejših
                blokih ali v manj iskanih četrtih.
              </p>
              <p className="mt-2">
                Primerjava cen po letih kaže, kako se je trg spreminjal – od relativno
                dostopnih cen v obdobju 2014–2016 do bistveno višjih cen danes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <FAQSection faqs={NAJCENEJSA_STANOVANJA_FAQS} />
        </div>
      </section>

      {/* Citation Block */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <CitationBlock
            pageTitle="Najcenejša stanovanja v Ljubljani po letih"
            pageUrl="https://cenenepremicnin.com/lestvice/najcenejsa-stanovanja-ljubljana"
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
