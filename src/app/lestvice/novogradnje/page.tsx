import { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, ArrowLeft, TrendingUp, Building, Percent, MapPin, Calendar, Euro, Home, HardHat } from 'lucide-react';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { STAT_EXPLANATIONS } from '@/lib/stat-explanations';
import { ArticleJsonLd, FAQSection, NOVOGRADNJE_FAQS, CitationBlock } from '@/components/seo';
import NovogradnjeChartClient from '@/components/charts/NovogradnjeChartClient';

export const metadata: Metadata = {
  title: 'Novogradnje v Sloveniji - statistika in analiza | Cene Nepremičnin',
  description:
    'Celovita analiza prodaj novogradenj v Sloveniji 2007-2026. Število novogradenj po letih, delež na trgu, cenovna premija vs rabljeno, kje se gradi največ.',
  keywords: 'novogradnje slovenija, nova stanovanja, cene novogradenj, gradnja stanovanj, nepremičninski trg',
};

export default function NovogradnjePage() {
  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <ArticleJsonLd
        headline="Novogradnje v Sloveniji - statistika in analiza"
        description="Celovita analiza prodaj novogradenj v Sloveniji 2007-2026. Število novogradenj po letih, delež na trgu, cenovna premija vs rabljeno, kje se gradi največ."
        url="https://cenenepremicnin.com/lestvice/novogradnje"
        datePublished="2024-01-15"
        dateModified={new Date().toISOString().split('T')[0]}
        keywords={['novogradnje', 'nova stanovanja', 'cene novogradenj', 'gradnja stanovanj', 'nepremičninski trg']}
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/lestvice"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Vse lestvice
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Novogradnje v Sloveniji
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Celovita analiza prodaj novogradenj v primerjavi z rabljenimi nepremičninami (2007–2026)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-b">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Building className="w-4 h-4" />
                <span className="text-sm font-medium">2025</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">~8%</div>
              <div className="text-sm text-gray-500 flex items-center">
                delež novogradenj
                <InfoTooltip text={STAT_EXPLANATIONS.novogradnje} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Premija</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">+15-25%</div>
              <div className="text-sm text-gray-500 flex items-center">
                vs rabljeno
                <InfoTooltip text="Cenovna premija je razlika v ceni/m² med novogradnjami in rabljenimi nepremičninami. Novogradnje so tipično dražje zaradi energetske učinkovitosti, sodobnih materialov in garancije." />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Euro className="w-4 h-4" />
                <span className="text-sm font-medium">Mediana novo</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">~3.800 €</div>
              <div className="text-sm text-gray-500 flex items-center">
                cena/m² 2025
                <InfoTooltip text={STAT_EXPLANATIONS.medianaPriceM2} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Percent className="w-4 h-4" />
                <span className="text-sm font-medium">Trend</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">Raste</div>
              <div className="text-sm text-gray-500">od 2015</div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Context */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-orange-50/50">
        <div className="mx-auto max-w-5xl">
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              Novogradnje predstavljajo pomemben segment slovenskega nepremičninskega trga.
              Čeprav je njihov delež relativno majhen (5-10% vseh transakcij), so za kupce
              privlačne zaradi <strong>sodobnih energetskih standardov</strong>,
              <strong>nižjih stroškov vzdrževanja</strong> in <strong>funkcionalnih tlorisov</strong>.
              Hkrati pa za investitorje predstavljajo priložnost za višje marže.
            </p>
          </div>
        </div>
      </section>

      {/* Novogradnje Count Chart - NEW */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <HardHat className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Število prodanih novogradenj po letih
            </h2>
          </div>
          <p className="text-gray-600 mb-6 text-sm">
            Absolutno število prodanih novogradenj (stanovanj in hiš) na letni ravni.
            Graf prikazuje, koliko novih nepremičnin je bilo vsako leto dejansko prodanih na slovenskem trgu.
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <NovogradnjeChartClient chartType="count" />
          </div>
          <div className="mt-4 bg-orange-50 rounded-lg p-4 border border-orange-100">
            <p className="text-sm text-orange-800">
              <strong>Opomba:</strong> Rekordno leto za novogradnje je bilo 2008 (pred finančno krizo),
              ko je bilo prodanih preko 3.000 novih enot. Po krizi je sledil globok padec, oživitev pa
              beležimo šele od leta 2017 naprej.
            </p>
          </div>
        </div>
      </section>

      {/* Share Chart */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <Percent className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Delež novogradenj na trgu
            </h2>
          </div>
          <p className="text-gray-600 mb-6 text-sm">
            Odstotek novogradenj med vsemi prodanimi nepremičninami. Prikazuje, kolikšen del
            vseh transakcij odpade na novo zgrajene objekte.
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <NovogradnjeChartClient chartType="share" />
          </div>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm font-medium text-gray-500 mb-1">Najnižji delež</div>
              <div className="text-lg font-bold text-gray-900">~3% (2013-2014)</div>
              <div className="text-xs text-gray-500">Dno po finančni krizi</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm font-medium text-gray-500 mb-1">Najvišji delež</div>
              <div className="text-lg font-bold text-gray-900">~12% (2008)</div>
              <div className="text-xs text-gray-500">Tik pred krizo</div>
            </div>
          </div>
        </div>
      </section>

      {/* Volume Chart - Stacked comparison */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <Building className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Novogradnje vs rabljene nepremičnine
            </h2>
          </div>
          <p className="text-gray-600 mb-6 text-sm">
            Primerjava števila prodanih novogradenj (zeleno) in rabljenih nepremičnin (sivo) po letih.
            Graf prikazuje celoten obseg trga in delež novogradenj znotraj njega.
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <NovogradnjeChartClient chartType="volume" />
          </div>
        </div>
      </section>

      {/* Price Comparison Chart */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <Euro className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Cenovna premija novogradenj
            </h2>
          </div>
          <p className="text-gray-600 mb-6 text-sm">
            Primerjava mediane cene na m² med novogradnjami in rabljenimi nepremičninami.
            Razlika predstavlja &quot;premijo&quot;, ki jo kupci plačajo za novo zgrajeno nepremičnino.
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <NovogradnjeChartClient chartType="prices" />
          </div>
          <div className="mt-4 bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <p className="text-sm text-emerald-800">
              <strong>Zakaj je premija upravičena?</strong> Novogradnje ponujajo energetski razred A ali B
              (nižji računi za ogrevanje), sodobne materiale, garancijo za napake, parkirna mesta v garaži
              in pogosto dodatne ugodnosti (shrambe, skupni prostori). Za starejše nepremičnine so ti stroški
              dodatna investicija.
            </p>
          </div>
        </div>
      </section>

      {/* Where are novogradnje built */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Kje se gradi največ?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Home className="w-4 h-4 text-orange-500" />
                Ljubljana in okolica
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Največ novogradenj nastaja v Ljubljani (Šiška, Bežigrad, Vič) in primestnih občinah:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Brezovica</strong> – intenzivna gradnja družinskih hiš</li>
                <li>• <strong>Škofljica</strong> – stanovanjske soseske</li>
                <li>• <strong>Domžale</strong> – večstanovanjski objekti</li>
                <li>• <strong>Grosuplje</strong> – mešana gradnja</li>
                <li>• <strong>Trzin</strong> – poslovni in stanovanjski kompleksi</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-500" />
                Obala in večja mesta
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Visoka aktivnost tudi na Obali in v regionalnih centrih:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Koper/Izola</strong> – apartmaji in luksuzna stanovanja</li>
                <li>• <strong>Maribor</strong> – prenova in nova gradnja v centru</li>
                <li>• <strong>Kranj</strong> – stanovanjske soseske</li>
                <li>• <strong>Celje</strong> – nova gradnja v mestu in okolici</li>
                <li>• <strong>Novo mesto</strong> – industrijska rast spodbuja gradnjo</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Historical Context */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Zgodovinski pregled
            </h2>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 text-center">
                  <div className="text-lg font-bold text-orange-600">2007-08</div>
                  <div className="text-xs text-gray-500">Vrh</div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Predkrizni boom</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Najvišji obseg novogradenj v zgodovini. Bankno financiranje je bilo dostopno,
                    investitorji so gradili špekulativno. Delež novogradenj je presegel 10%.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 text-center">
                  <div className="text-lg font-bold text-red-600">2009-14</div>
                  <div className="text-xs text-gray-500">Kriza</div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Kolaps gradbeništva</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Finančna kriza je ustavila večino projektov. Več velikih gradbenih podjetij je
                    propadlo (SCT, Vegrad, Primorje). Delež novogradenj je padel pod 4%.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 text-center">
                  <div className="text-lg font-bold text-yellow-600">2015-18</div>
                  <div className="text-xs text-gray-500">Okrevanje</div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Počasno okrevanje</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Postopno okrevanje gospodarstva in nepremičninskega trga. Novi investitorji
                    (tudi tuji) so začeli z novimi projekti, predvsem v Ljubljani.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 text-center">
                  <div className="text-lg font-bold text-emerald-600">2019-26</div>
                  <div className="text-xs text-gray-500">Rast</div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Nova doba gradnje</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Močan porast gradbene aktivnosti, kljub covidu in inflaciji. Visoko povpraševanje,
                    nizka ponudba rabljenih stanovanj in ugodni krediti spodbujajo novogradnje.
                    Delež se je stabiliziral pri 7-9%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Insights */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Ključne ugotovitve</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Za kupce</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span>Novogradnje so 15-25% dražje, a prinašajo prihranke pri energiji</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span>Najboljši čas za nakup je pred dokončanjem projekta (nižja cena)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span>Preverite finančno stabilnost investitorja pred plačilom are</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Za prodajalce rabljenih</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">!</span>
                    <span>Novi projekti v soseski lahko znižajo vrednost starejših stanovanj</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">!</span>
                    <span>Poudarite prednosti: lokacija, večja kvadratura, uhojen vrt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">!</span>
                    <span>Razmislite o energetski prenovi za konkurenčnost</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Analysis */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Metodologija</h2>
            <div className="prose prose-sm text-gray-600 max-w-none">
              <p>
                Podatki temeljijo na <strong>Evidenci trga nepremičnin (ETN)</strong> Geodetske uprave RS.
                Nepremičnina se šteje kot novogradnja, če je označena z <code>NOVOGRADNJA = 1</code> v
                podatkovni bazi ETN, ali če je leto izgradnje enako letu prodaje.
              </p>
              <p className="mt-3">
                <strong>Kaj je vključeno:</strong> Stanovanja (tip 2), stanovanjske hiše (tip 1).
                <strong>Kaj ni vključeno:</strong> Poslovni prostori, garaže, zemljišča.
              </p>
              <p className="mt-3">
                <strong>Mediana cene/m²</strong> se izračuna na podlagi uporabne površine
                (<code>PRODANA_UPORABNA_POVRSINA</code>) in pogodbene cene. Izključene so transakcije
                z očitno napačnimi podatki (cena/m² &lt; 100 € ali &gt; 20.000 €).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <FAQSection faqs={NOVOGRADNJE_FAQS} />
        </div>
      </section>

      {/* Citation Block */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <CitationBlock
            pageTitle="Novogradnje v Sloveniji - statistika in analiza"
            pageUrl="https://cenenepremicnin.com/lestvice/novogradnje"
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
