import { Metadata } from 'next';
import { FileText, AlertTriangle, Database, Ban } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pogoji uporabe | Cene Nepremičnin',
  description: 'Pogoji uporabe spletne strani CeneNepremičnin.com.',
};

export default function PogojiUporabePage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Pogoji uporabe</h1>
          <p className="text-lg text-gray-600 mt-4">Zadnja posodobitev: marec 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="prose prose-gray max-w-none">
            {/* Section 1 */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900 m-0">1. Splošno</h2>
              </div>
              <p>
                Z uporabo spletne strani CeneNepremičnin.com (v nadaljevanju &quot;stran&quot;)
                se strinjate s temi pogoji uporabe. Če se s pogoji ne strinjate, vas prosimo,
                da strani ne uporabljate.
              </p>
            </div>

            {/* Section 2 */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900 m-0">2. Omejitev odgovornosti</h2>
              </div>
              <p>
                <strong>Podatki na strani so izključno informativne narave.</strong> Ne
                predstavljajo pravnega, finančnega ali nepremičninskega svetovanja.
              </p>
              <p>
                Kljub temu da si prizadevamo za točnost podatkov, <strong>ne jamčimo</strong>{' '}
                za njihovo pravilnost, popolnost ali ažurnost. Za odločitve na podlagi teh
                podatkov se posvetujte z ustreznimi strokovnjaki.
              </p>
              <p>
                Ne odgovarjamo za kakršnokoli škodo, ki bi nastala zaradi uporabe ali
                nezmožnosti uporabe strani ali podatkov na njej.
              </p>
            </div>

            {/* Section 3 */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900 m-0">3. Viri podatkov</h2>
              </div>
              <p>Podatki na strani izvirajo iz javno dostopnih virov:</p>
              <ul>
                <li>
                  <strong>Geodetska uprava RS</strong> – Evidenca trga nepremičnin (ETN)
                </li>
                <li>
                  <strong>Statistični urad RS</strong> – SI-STAT podatkovni portal
                </li>
                <li>
                  <strong>Eurostat</strong> – House Price Index (indeks cen stanovanj)
                </li>
              </ul>
              <p>
                Podatki so last Republike Slovenije in Evropske komisije. Za uporabo teh
                podatkov veljajo pogoji posameznih institucij.
              </p>
            </div>

            {/* Section 4 */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Ban className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900 m-0">4. Prepovedi</h2>
              </div>
              <p>Pri uporabi strani je prepovedano:</p>
              <ul>
                <li>
                  Avtomatizirano zbiranje podatkov (scraping) za komercialne namene brez
                  predhodnega pisnega dovoljenja
                </li>
                <li>
                  Uporaba strani na način, ki bi lahko škodoval njenemu delovanju ali
                  dostopnosti
                </li>
                <li>
                  Prikazovanje vsebine strani na drugih spletnih mestih brez navedbe vira
                </li>
                <li>Kakršnakoli zloraba ali nepooblaščen dostop do sistemov</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900">5. Intelektualna lastnina</h2>
              <p>
                Vizualizacije, grafična podoba in programska koda strani so last
                CeneNepremičnin.com. Izvorni podatki so javna last.
              </p>
              <p>
                Uporabnikom je dovoljena nekomercialna uporaba vsebin z navedbo vira
                (CeneNepremičnin.com).
              </p>
            </div>

            {/* Section 6 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900">6. Spremembe pogojev</h2>
              <p>
                Te pogoje uporabe lahko kadar koli spremenimo. Nadaljnja uporaba strani po
                spremembi pomeni, da se s spremenjenimi pogoji strinjate.
              </p>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-xl font-bold text-gray-900">7. Kontakt</h2>
              <p>
                Za vprašanja o pogojih uporabe nas kontaktirajte na:{' '}
                <a
                  href="mailto:info@cenenepremicnin.com"
                  className="text-emerald-600 hover:underline"
                >
                  info@cenenepremicnin.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
