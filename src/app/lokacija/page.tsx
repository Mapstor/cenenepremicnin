'use client';

import { useState } from 'react';
import { MapPin, Search, Info } from 'lucide-react';
import AddressSearch from '@/components/search/AddressSearch';
import LocationAnalysis from '@/components/search/LocationAnalysis';
import { FAQSection, LOKACIJA_FAQS } from '@/components/seo';

interface SelectedLocation {
  lat: number;
  lon: number;
  address: string;
}

export default function LokacijaPage() {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);

  const handleLocationSelect = (location: { lat: number; lon: number; address: string }) => {
    setSelectedLocation(location);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Išči lokacijo
          </h1>
          <p className="text-lg text-gray-600 mt-4">
            Poiščite cene nepremičnin v bližini kateregakoli naslova v Sloveniji.
            Vnesite naslov in izberite polmer iskanja za analizo cen v okolici.
          </p>
        </div>
      </section>

      {/* Search section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b">
        <div className="mx-auto max-w-2xl">
          <AddressSearch onSelect={handleLocationSelect} />
        </div>
      </section>

      {/* Results section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {selectedLocation ? (
            <LocationAnalysis
              lat={selectedLocation.lat}
              lon={selectedLocation.lon}
              address={selectedLocation.address}
            />
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                Vnesite naslov za začetek
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Vnesite ulico, hišno številko in mesto za analizo cen nepremičnin
                v bližini. Npr. &quot;Slovenska cesta 1, Ljubljana&quot;.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-600" />
            Kako deluje
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold mb-3">
                1
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Vnesite naslov</h3>
              <p className="text-sm text-gray-600">
                Vpišite naslov nepremičnine, ki vas zanima. Sistem bo poiskal lokacijo.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold mb-3">
                2
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Izberite polmer</h3>
              <p className="text-sm text-gray-600">
                Določite polmer iskanja (500 m do 5 km) glede na vaše potrebe.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold mb-3">
                3
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Preglejte analizo</h3>
              <p className="text-sm text-gray-600">
                Oglejte si mediano cen, nedavne transakcije in zemljevid prodaj v okolici.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <FAQSection faqs={LOKACIJA_FAQS} />
        </div>
      </section>

      {/* Data source */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-t">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm text-gray-500">
            Vir: Geodetska uprava RS, Evidenca trga nepremičnin (2021–2025)
          </p>
        </div>
      </section>
    </div>
  );
}
