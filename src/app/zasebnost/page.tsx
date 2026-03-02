import { Metadata } from 'next';
import { Shield, Cookie, Eye, Server } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Politika zasebnosti | Cene Nepremičnin',
  description:
    'Informacije o varovanju zasebnosti in uporabi piškotkov na CeneNepremičnin.com.',
};

export default function ZasebnostPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Politika zasebnosti</h1>
          <p className="text-lg text-gray-600 mt-4">Zadnja posodobitev: marec 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Overview */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">Na kratko</h2>
            </div>
            <p className="text-gray-700">
              Na CeneNepremičnin.com <strong>ne zbiramo osebnih podatkov</strong>. Uporabljamo
              analitiko brez piškotkov (Plausible), ki spoštuje vašo zasebnost. Oglasi tretjih
              strank lahko uporabljajo piškotke.
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            {/* Section 1 */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900 m-0">1. Zbiranje podatkov</h2>
              </div>
              <p>
                <strong>Ne zbiramo osebnih podatkov.</strong> Za uporabo strani ni potrebna
                registracija ali prijava. Ne beležimo vašega IP naslova, lokacije ali
                brskalne zgodovine.
              </p>
              <p>
                Edini podatki, ki jih zbiramo, so agregirane statistike obiska (število
                obiskov, najbolj obiskane strani), ki ne vsebujejo osebnih informacij.
              </p>
            </div>

            {/* Section 2 */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Cookie className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900 m-0">2. Piškotki</h2>
              </div>
              <h3 className="text-lg font-semibold mt-4 mb-2">Naši piškotki</h3>
              <p>
                Za analitiko uporabljamo <strong>Plausible Analytics</strong>, ki deluje brez
                piškotkov in je popolnoma skladen z GDPR. Ne sledi posameznikom in ne zbira
                osebnih podatkov.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Piškotki tretjih strank</h3>
              <p>
                Na strani prikazujemo oglase prek omrežja <strong>Raptive</strong> (prej
                AdThrive). Raptive lahko uporablja piškotke za prikazovanje prilagojenih
                oglasov. Več informacij o Raptive politiki zasebnosti najdete na:
              </p>
              <p>
                <a
                  href="https://raptive.com/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline"
                >
                  https://raptive.com/privacy-policy/
                </a>
              </p>
            </div>

            {/* Section 3 */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900 m-0">3. Hramba podatkov</h2>
              </div>
              <p>
                Ker ne zbiramo osebnih podatkov, jih tudi ne hranimo. Agregirane statistike
                obiska hranimo za obdobje 24 mesecev.
              </p>
            </div>

            {/* Section 4 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900">4. Vaše pravice</h2>
              <p>
                V skladu z GDPR imate pravico do dostopa, popravka in izbrisa svojih osebnih
                podatkov. Ker ne zbiramo osebnih podatkov, teh pravic ni mogoče uveljavljati
                na naši strani.
              </p>
              <p>
                Za uveljavljanje pravic glede piškotkov tretjih strank (Raptive) se obrnite
                neposredno nanje.
              </p>
            </div>

            {/* Section 5 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900">5. Kontakt</h2>
              <p>
                Za vprašanja o zasebnosti nas kontaktirajte na:{' '}
                <a
                  href="mailto:info@cenenepremicnin.com"
                  className="text-emerald-600 hover:underline"
                >
                  info@cenenepremicnin.com
                </a>
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-xl font-bold text-gray-900">6. Spremembe</h2>
              <p>
                To politiko zasebnosti lahko občasno posodobimo. Vsaka sprememba bo objavljena
                na tej strani z novim datumom posodobitve.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
