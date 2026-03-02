import { Metadata } from 'next';
import Link from 'next/link';
import { Target, Eye, Users, Heart } from 'lucide-react';
import { OrganizationJsonLd } from '@/components/seo';

export const metadata: Metadata = {
  title: 'O nas | Cene Nepremičnin',
  description:
    'Naša misija je lepo vizualizirati podatke o nepremičninah v Sloveniji, tako da jih lahko vsak enostavno razume.',
};

export default function ONasPage() {
  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <OrganizationJsonLd />

      {/* Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">O nas</h1>
          <p className="text-lg text-gray-600 mt-4">
            Spoznajte ekipo in poslanstvo za CeneNepremičnin.com
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">Naša misija</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              Naša misija je <strong>lepo vizualizirati podatke o nepremičninah v Sloveniji</strong>,
              tako da jih lahko vsak enostavno razume. Verjamemo, da bi morali biti podatki o cenah
              nepremičnin dostopni vsem – ne le nepremičninskim agentom in strokovnjakom.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Naše vrednote</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <Eye className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Transparentnost</h3>
              <p className="text-sm text-gray-600">
                Vsi podatki na strani so javno dostopni in brezplačni. Nikoli ne skrivamo
                metodologije ali virov podatkov.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <Users className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Neodvisnost</h3>
              <p className="text-sm text-gray-600">
                Stran je popolnoma neodvisna in ni povezana z nobeno nepremičninsko agencijo
                ali razvijalcem.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <Heart className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Dostopnost</h3>
              <p className="text-sm text-gray-600">
                Stran je zasnovana tako, da je enostavna za uporabo za vsakogar – od prvega
                kupca stanovanja do izkušenega investitorja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About the data */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">O podatkih</h2>
          <div className="prose prose-gray max-w-none">
            <p>
              Vsi podatki o transakcijah nepremičnin izvirajo iz{' '}
              <strong>Evidenc trga nepremičnin (ETN)</strong>, ki jo vodi Geodetska uprava
              Republike Slovenije. To so uradni podatki o vseh kupoprodajnih poslih z
              nepremičninami v Sloveniji od leta 2007.
            </p>
            <p>
              Dodatno uporabljamo podatke Statističnega urada RS (SI-STAT) za indekse cen
              nepremičnin in podatke Eurostata za primerjavo s tujino.
            </p>
            <p>
              Več o metodologiji in virih podatkov si lahko preberete na strani{' '}
              <Link href="/o-podatkih" className="text-emerald-600 hover:underline">
                O podatkih
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Imate vprašanja?</h2>
          <p className="text-gray-600 mb-6">
            Z veseljem vam odgovorimo na vsa vprašanja o strani ali podatkih.
          </p>
          <Link
            href="/kontakt"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Kontaktirajte nas
          </Link>
        </div>
      </section>
    </div>
  );
}
