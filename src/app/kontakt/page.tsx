import { Metadata } from 'next';
import { Mail, MessageSquare } from 'lucide-react';
import { OrganizationJsonLd } from '@/components/seo';

export const metadata: Metadata = {
  title: 'Kontakt | Cene Nepremičnin',
  description:
    'Kontaktirajte nas za vprašanja, predloge ali povratne informacije o CeneNepremičnin.com.',
};

export default function KontaktPage() {
  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <OrganizationJsonLd />

      {/* Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Kontakt</h1>
          <p className="text-lg text-gray-600 mt-4">
            Imate vprašanje ali predlog? Z veseljem vas slišimo.
          </p>
        </div>
      </section>

      {/* Contact options */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Email */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <Mail className="w-8 h-8 text-emerald-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900 mb-2">Email</h2>
              <p className="text-sm text-gray-600 mb-4">
                Za splošna vprašanja, predloge ali povratne informacije.
              </p>
              <a
                href="mailto:info@cenenepremicnin.com"
                className="text-emerald-600 font-medium hover:underline"
              >
                info@cenenepremicnin.com
              </a>
            </div>

            {/* Response time */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <MessageSquare className="w-8 h-8 text-emerald-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-900 mb-2">Odzivni čas</h2>
              <p className="text-sm text-gray-600">
                Na sporočila odgovarjamo v roku 1-2 delovnih dni. Hvala za potrpežljivost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Pošljite nam sporočilo
          </h2>
          <form
            action="https://formspree.io/f/YOUR_FORM_ID"
            method="POST"
            className="space-y-6"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Ime
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                placeholder="Vaše ime"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                placeholder="vas@email.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Sporočilo
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none"
                placeholder="Vaše sporočilo..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-6 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Pošlji sporočilo
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            S pošiljanjem sporočila se strinjate z našo{' '}
            <a href="/zasebnost" className="text-emerald-600 hover:underline">
              politiko zasebnosti
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
