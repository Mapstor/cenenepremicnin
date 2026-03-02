import { Metadata } from 'next';
import { Database, FileSpreadsheet, BarChart3, Map, RefreshCw } from 'lucide-react';
import { DatasetJsonLd } from '@/components/seo';

export const metadata: Metadata = {
  title: 'O podatkih | Cene Nepremičnin',
  description:
    'Viri podatkov in metodologija za CeneNepremičnin.com. Uradni podatki GURS, SI-STAT in Eurostat.',
};

export default function OPodatkihPage() {
  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <DatasetJsonLd
        name="Evidenca trga nepremičnin Slovenije"
        description="Podatki o prodajah nepremičnin v Sloveniji od leta 2007. Vključuje transakcije stanovanj, hiš, poslovnih prostorov in zemljišč."
        spatialCoverage="Slovenija"
        temporalCoverage="2007/2026"
        url="https://cenenepremicnin.com/o-podatkih"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">O podatkih</h1>
          <p className="text-lg text-gray-600 mt-4">
            Viri podatkov, metodologija in obdelava
          </p>
        </div>
      </section>

      {/* Data sources */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Viri podatkov</h2>

          <div className="space-y-6">
            {/* GURS ETN */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Evidenca trga nepremičnin (ETN)
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Glavni vir podatkov o transakcijah nepremičnin v Sloveniji. ETN vsebuje
                    podatke o vseh kupoprodajnih poslih z nepremičninami od leta 2007.
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>
                      <strong>Upravljavec:</strong> Geodetska uprava Republike Slovenije (GURS)
                    </p>
                    <p>
                      <strong>Obdobje:</strong> 2007 – danes
                    </p>
                    <p>
                      <strong>Posodobitve:</strong> Polletno (junij in december)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SI-STAT */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">SI-STAT</h3>
                  <p className="text-gray-600 mb-3">
                    Podatkovni portal Statističnega urada RS. Uporabljamo podatke o
                    indeksih cen nepremičnin (četrtletne časovne vrste).
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>
                      <strong>Upravljavec:</strong> Statistični urad Republike Slovenije (SURS)
                    </p>
                    <p>
                      <strong>Podatki:</strong> Indeksi cen stanovanj, hiš, zemljišč
                    </p>
                    <p>
                      <strong>Posodobitve:</strong> Četrtletno
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Eurostat */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Database className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Eurostat</h3>
                  <p className="text-gray-600 mb-3">
                    Evropski statistični urad. Uporabljamo House Price Index (HPI) za
                    primerjavo gibanja cen nepremičnin v Sloveniji z drugimi državami EU.
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>
                      <strong>Upravljavec:</strong> Evropska komisija
                    </p>
                    <p>
                      <strong>Podatki:</strong> prc_hpi_q (House Price Index)
                    </p>
                    <p>
                      <strong>Posodobitve:</strong> Četrtletno
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map data */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Map className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Kartografski podatki</h3>
                  <p className="text-gray-600 mb-3">
                    Meje občin in katastrskih občin za prikaz na zemljevidu. Podlaga
                    zemljevida temelji na OpenStreetMap.
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>
                      <strong>Viri:</strong> GURS (meje), OpenStreetMap (podlaga)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Metodologija</h2>

          <div className="prose prose-gray max-w-none">
            <h3>Filtriranje transakcij</h3>
            <p>Iz analize izključujemo netržne posle, kot so:</p>
            <ul>
              <li>Prenosi med povezanimi osebami (družinski člani, lastniško povezana podjetja)</li>
              <li>Lizing, razlastitve in stečajne prodaje</li>
              <li>Aneksi k pogodbam (upoštevamo samo osnovne pogodbe)</li>
              <li>Transakcije brez veljavnih koordinat ali površine</li>
            </ul>

            <h3>Izračun mediane</h3>
            <p>
              Za prikaz cen na m² uporabljamo <strong>mediano</strong>, ne povprečja. Mediana
              je vrednost, od katere je polovica transakcij cenejša in polovica dražja. Ta
              metrika je manj občutljiva na ekstremne vrednosti (zelo drage ali poceni posle).
            </p>

            <h3>Koordinatni sistem</h3>
            <p>
              Izvorni podatki GURS uporabljajo koordinatni sistem EPSG:3794 (D96/TM).
              Za prikaz na zemljevidu koordinate pretvorimo v WGS84 (EPSG:4326).
            </p>

            <h3>Zaokroževanje</h3>
            <p>
              Cene prikazujemo brez decimalnih mest. Površine zaokrožujemo na eno decimalno
              mesto.
            </p>
          </div>
        </div>
      </section>

      {/* Updates */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Posodobitve</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Podatke posodabljamo ob vsaki novi objavi GURS (praviloma junija in decembra).
            Indeksi cen se posodabljajo četrtletno ob objavi novih podatkov SURS in Eurostat.
          </p>
          <p className="text-gray-500 text-sm">
            Zadnja posodobitev: februar 2026 (podatki do vključno 2. polletja 2025)
          </p>
        </div>
      </section>

      {/* Attribution */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Navedba virov</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Vir: Geodetska uprava Republike Slovenije, Evidenca trga nepremičnin, 2007–2026</p>
            <p>Vir: Statistični urad Republike Slovenije, SI-STAT podatkovni portal</p>
            <p>Vir: Eurostat, House Price Index (prc_hpi_q)</p>
            <p>Kartografska podlaga: © OpenStreetMap contributors</p>
          </div>
        </div>
      </section>
    </div>
  );
}
