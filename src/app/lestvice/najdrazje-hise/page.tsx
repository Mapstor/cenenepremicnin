import { Metadata } from 'next';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { ItemListJsonLd, CitationBlock } from '@/components/seo';
import RankingTableClient from '@/components/rankings/RankingTableClient';

export const metadata: Metadata = {
  title: 'Top 100 najdražjih hiš v Sloveniji | Cene Nepremičnin',
  description:
    'Lestvica 100 najdražjih prodanih hiš v Sloveniji od leta 2007. Luksuzne vile in hiše v najboljših lokacijah.',
};

export default function NajdrazjeHisePage() {
  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <ItemListJsonLd
        name="Top 100 najdražjih hiš v Sloveniji"
        description="Lestvica 100 najdražjih prodanih hiš v Sloveniji od leta 2007. Luksuzne vile in hiše na najboljših lokacijah."
        url="https://cenenepremicnin.com/lestvice/najdrazje-hise"
        numberOfItems={100}
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-green-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/lestvice"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Vse lestvice
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
              <Home className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Top 100 najdražjih hiš
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Najdražje hiše prodane v Sloveniji od 2007
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ranking Table */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <RankingTableClient dataUrl="/data/rankings/najdrazje-hise-100.json" />
        </div>
      </section>

      {/* Info */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">O lestvici</h2>
            <div className="prose prose-sm text-gray-600">
              <p>
                Lestvica prikazuje 100 najdražjih prodanih hiš v Sloveniji od leta 2007.
                Vključene so enodružinske hiše, vile in dvojčki.
              </p>
              <p className="mt-2">
                Najdražje hiše najdemo predvsem na prestižnih lokacijah v okolici
                Ljubljane (Škofljica, Brezovica, Ig) ter na slovenski obali.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Citation Block */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <CitationBlock
            pageTitle="Top 100 najdražjih hiš v Sloveniji"
            pageUrl="https://cenenepremicnin.com/lestvice/najdrazje-hise"
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
