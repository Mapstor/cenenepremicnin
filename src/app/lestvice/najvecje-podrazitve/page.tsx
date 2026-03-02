import { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { ItemListJsonLd, FAQSection, NAJVECJE_PODRAZITVE_FAQS, CitationBlock } from '@/components/seo';
import MunicipalityRankingTableClient from '@/components/rankings/MunicipalityRankingTableClient';

export const metadata: Metadata = {
  title: 'Občine z največjimi podražitvami | Cene Nepremičnin',
  description:
    'Kje so se cene nepremičnin najbolj zvišale v zadnjem letu. Občine z največjo rastjo cen na m².',
};

export default function NajvecjePodrazitvePage() {
  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <ItemListJsonLd
        name="Občine z največjimi podražitvami v Sloveniji"
        description="Lestvica občin z največjo letno rastjo cen nepremičnin na m². Kje so se cene najbolj zvišale v zadnjem letu."
        url="https://cenenepremicnin.com/lestvice/najvecje-podrazitve"
        numberOfItems={212}
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-red-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/lestvice"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Vse lestvice
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Občine z največjimi podražitvami
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Kje so se cene nepremičnin najbolj zvišale v zadnjem letu
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Info box */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-red-800 text-sm">
              Lestvica prikazuje občine z največjo letno rastjo mediane cene na m² za stanovanja.
              Primerjava temelji na podatkih zadnjih 12 mesecev glede na isto obdobje prejšnjega leta.
              Upoštevane so samo občine z vsaj 10 prodanimi stanovanji v vsakem obdobju.
            </p>
          </div>
        </div>
      </section>

      {/* Ranking Table */}
      <section className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <MunicipalityRankingTableClient
            dataUrl="/data/rankings/najvecje-podrazitve.json"
            showTrend={true}
          />
        </div>
      </section>

      {/* Analysis */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Analiza</h2>
            <div className="prose prose-sm text-gray-600">
              <p>
                Največje podražitve so pogosto v manjših občinah, kjer je število transakcij
                manjše in posamezne dražje prodaje lahko močno vplivajo na mediano.
              </p>
              <p className="mt-2">
                V večjih občinah z več transakcijami so trendi bolj stabilni. Nacionalno
                povprečje letne rasti cen stanovanj v zadnjih letih znaša med 5% in 15%.
              </p>
              <p className="mt-2">
                <strong>Opozorilo:</strong> Visoka rast cen v posamezni občini ni nujno
                kazalnik dobrega naložbenega potenciala. Upoštevajte tudi število transakcij
                in dolgoročne trende.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <FAQSection faqs={NAJVECJE_PODRAZITVE_FAQS} />
        </div>
      </section>

      {/* Citation Block */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <CitationBlock
            pageTitle="Občine z največjimi podražitvami v Sloveniji"
            pageUrl="https://cenenepremicnin.com/lestvice/najvecje-podrazitve"
            variant="compact"
          />
        </div>
      </section>

      {/* Data Source */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-t">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm text-gray-500">
            Vir: Geodetska uprava RS, Evidenca trga nepremičnin (primerjava zadnjih 12 mesecev)
          </p>
        </div>
      </section>
    </div>
  );
}
