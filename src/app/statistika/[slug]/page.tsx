import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building, Home, TrendingUp, TrendingDown, BarChart3, Ruler, Sparkles, Calendar, MapPin } from 'lucide-react';
import { formatPricePerM2, formatPrice, formatArea, formatDateShort } from '@/lib/format';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { STAT_EXPLANATIONS } from '@/lib/stat-explanations';
import { PlaceJsonLd, FAQSection, getMunicipalityFAQs, CitationBlock } from '@/components/seo';
import MunicipalityPriceChartClient from '@/components/charts/MunicipalityPriceChartClient';
import fs from 'fs';
import path from 'path';

interface PriceRange {
  min: number;
  max: number;
  q1: number;
  q3: number;
}

interface PropertyBreakdown {
  stanovanja: { stevilo: number; delez: number };
  hise: { stevilo: number; delez: number };
  ostalo: { stevilo: number; delez: number };
}

interface RecentTransaction {
  id: number;
  datum: string;
  cena: number;
  tip: number;
  tipNaziv: string;
  uporabnaPovrsina: number;
  cenaNaM2: number;
  naslov: string;
  novogradnja: boolean;
}

interface MunicipalityData {
  obcina: string;
  medianaCenaM2: number | null;
  medianaCenaM2Stanovanja: number | null;
  medianaCenaM2Hise: number | null;
  steviloTransakcij: number;
  trendYoY: number | null;
  cetrtletja: Record<string, { mediana: number; stevilo: number }>;
  // New context fields
  priceRange: PriceRange | null;
  propertyBreakdown: PropertyBreakdown;
  novogradnje: { stevilo: number; delez: number };
  avgPovrsina: number | null;
  busiestQuarter: string | null;
  recentTransactions: RecentTransaction[];
}

// Helper to format municipality name (LJUBLJANA -> Ljubljana)
function formatMunicipalityName(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Convert obcina name to slug (same logic as generateStaticParams)
function obcinaToSlug(obcina: string): string {
  return obcina
    .toLowerCase()
    .replace(/č/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/\s+/g, '-');
}

// Load municipality data by matching slug
async function getMunicipalityData(slug: string): Promise<MunicipalityData | null> {
  try {
    const filePath = path.join(process.cwd(), 'public/data/aggregated-obcine.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data: MunicipalityData[] = JSON.parse(fileContents);

    // Find municipality by comparing slugified obcina names
    return data.find((m) => obcinaToSlug(m.obcina) === slug) || null;
  } catch (error) {
    console.error('Error loading municipality data:', error);
    return null;
  }
}

// Get all municipalities for static generation
export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), 'public/data/aggregated-obcine.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data: MunicipalityData[] = JSON.parse(fileContents);

    return data
      .filter((m) => m.obcina && m.obcina.trim() !== '') // Filter out empty municipality names
      .map((m) => ({
        slug: m.obcina
          .toLowerCase()
          .replace(/č/g, 'c')
          .replace(/š/g, 's')
          .replace(/ž/g, 'z')
          .replace(/\s+/g, '-'),
      }));
  } catch {
    return [];
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getMunicipalityData(slug);

  if (!data) {
    return {
      title: 'Občina ni najdena | Cene Nepremičnin',
    };
  }

  const name = formatMunicipalityName(data.obcina);

  const priceDescription = data.medianaCenaM2Stanovanja
    ? `Mediana cene stanovanj: ${formatPricePerM2(data.medianaCenaM2Stanovanja)}.`
    : 'Pregled gibanja cen nepremičnin.';

  return {
    title: `Cene nepremičnin – ${name} | Cene Nepremičnin`,
    description: `Statistika cen nepremičnin v občini ${name}. ${priceDescription}`,
  };
}

export default async function ObcinaStatistikaPage({ params }: Props) {
  const { slug } = await params;
  const data = await getMunicipalityData(slug);

  if (!data) {
    notFound();
  }

  const name = formatMunicipalityName(data.obcina);
  const hasTrend = data.trendYoY !== null;
  const trendPositive = data.trendYoY !== null && data.trendYoY > 0;
  const hasStanovanja = data.medianaCenaM2Stanovanja !== null;
  const hasHise = data.medianaCenaM2Hise !== null;

  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <PlaceJsonLd
        name={`Cene nepremičnin – ${name}`}
        description={`Statistika cen nepremičnin v občini ${name}. ${hasStanovanja ? `Mediana cene stanovanj: ${formatPricePerM2(data.medianaCenaM2Stanovanja!)}.` : ''}`}
        url={`https://cenenepremicnin.com/statistika/${slug}`}
        containedIn="Slovenija"
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/statistika"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Vse občine
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Cene nepremičnin – {name}
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Statistika nepremičninskega trga v občini {name}
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
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Building className="w-4 h-4" />
                <span className="text-sm font-medium">Stanovanja</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {hasStanovanja ? formatPricePerM2(data.medianaCenaM2Stanovanja!) : 'Ni podatkov'}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                mediana cene/m²
                <InfoTooltip text={STAT_EXPLANATIONS.medianaPriceM2} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Hiše</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {hasHise ? formatPricePerM2(data.medianaCenaM2Hise!) : 'Ni podatkov'}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                mediana cene/m²
                <InfoTooltip text={STAT_EXPLANATIONS.stanovanjaVsHise} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                {trendPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">Letni trend</span>
              </div>
              <div
                className={`text-2xl font-bold ${
                  !hasTrend ? 'text-gray-400' : trendPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {hasTrend ? `${trendPositive ? '+' : ''}${data.trendYoY!.toFixed(1)}%` : 'Ni podatkov'}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                v zadnjem letu
                <InfoTooltip text={STAT_EXPLANATIONS.letniTrend} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">Transakcije</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {data.steviloTransakcij.toLocaleString('sl-SI')}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                v zadnjih 12 mesecih
                <InfoTooltip text={STAT_EXPLANATIONS.transakcije} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Price Chart */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Gibanje cen po četrtletjih
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Mediana cene na m² za vse tipe nepremičnin v občini {name} od leta 2007.
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <MunicipalityPriceChartClient obcina={data.obcina} />
          </div>
        </div>
      </section>

      {/* Comparison with national average */}
      {(hasStanovanja || hasHise) && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Primerjava z nacionalnim povprečjem
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {hasStanovanja && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-medium text-gray-900 mb-3">Stanovanja</h3>
                  <div className="flex items-end gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">{name}</div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {formatPricePerM2(data.medianaCenaM2Stanovanja!)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Slovenija</div>
                      <div className="text-2xl font-bold text-gray-400">
                        {formatPricePerM2(2800)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm">
                    {data.medianaCenaM2Stanovanja! > 2800 ? (
                      <span className="text-red-600">
                        {((data.medianaCenaM2Stanovanja! / 2800 - 1) * 100).toFixed(0)}% nad
                        povprečjem
                      </span>
                    ) : (
                      <span className="text-green-600">
                        {((1 - data.medianaCenaM2Stanovanja! / 2800) * 100).toFixed(0)}% pod
                        povprečjem
                      </span>
                    )}
                  </div>
                </div>
              )}
              {hasHise && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-medium text-gray-900 mb-3">Hiše</h3>
                  <div className="flex items-end gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">{name}</div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {formatPricePerM2(data.medianaCenaM2Hise!)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Slovenija</div>
                      <div className="text-2xl font-bold text-gray-400">
                        {formatPricePerM2(1500)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm">
                    {data.medianaCenaM2Hise! > 1500 ? (
                      <span className="text-red-600">
                        {((data.medianaCenaM2Hise! / 1500 - 1) * 100).toFixed(0)}% nad povprečjem
                      </span>
                    ) : (
                      <span className="text-green-600">
                        {((1 - data.medianaCenaM2Hise! / 1500) * 100).toFixed(0)}% pod povprečjem
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Market Overview */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Pregled trga v občini {name}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Property Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Struktura prodaj
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Stanovanja</span>
                    <span className="font-medium">{data.propertyBreakdown.stanovanja.delez}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${data.propertyBreakdown.stanovanja.delez}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {data.propertyBreakdown.stanovanja.stevilo.toLocaleString('sl-SI')} transakcij
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Hiše</span>
                    <span className="font-medium">{data.propertyBreakdown.hise.delez}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${data.propertyBreakdown.hise.delez}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {data.propertyBreakdown.hise.stevilo.toLocaleString('sl-SI')} transakcij
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Ostalo</span>
                    <span className="font-medium">{data.propertyBreakdown.ostalo.delez}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-400 rounded-full"
                      style={{ width: `${data.propertyBreakdown.ostalo.delez}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {data.propertyBreakdown.ostalo.stevilo.toLocaleString('sl-SI')} transakcij
                  </div>
                </div>
              </div>
            </div>

            {/* Average Size & New Construction */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-emerald-600" />
                Značilnosti nepremičnin
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Povprečna velikost</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {data.avgPovrsina ? formatArea(data.avgPovrsina) : 'Ni podatkov'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 flex items-center">
                    Delež novogradenj
                    <InfoTooltip text={STAT_EXPLANATIONS.novogradnje} iconSize={12} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {data.novogradnje.delez}%
                    </span>
                    {data.novogradnje.delez > 0 && (
                      <span className="text-sm text-emerald-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {data.novogradnje.stevilo.toLocaleString('sl-SI')} novogradenj
                      </span>
                    )}
                  </div>
                </div>
                {data.busiestQuarter && (
                  <div>
                    <div className="text-sm text-gray-500">Najbolj aktivno četrtletje</div>
                    <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {data.busiestQuarter}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Range */}
            {data.priceRange && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Razpon cen (€/m²)
                  <InfoTooltip text={STAT_EXPLANATIONS.priceRange} iconSize={12} />
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Minimum</span>
                    <span className="font-medium">{formatPricePerM2(data.priceRange.min)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center">
                      25. percentil (Q1)
                      <InfoTooltip text={STAT_EXPLANATIONS.percentileQ1} iconSize={12} />
                    </span>
                    <span className="font-medium">{formatPricePerM2(data.priceRange.q1)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-emerald-50 -mx-2 px-2 py-1 rounded">
                    <span className="text-sm font-medium text-emerald-700 flex items-center">
                      Mediana
                      <InfoTooltip text={STAT_EXPLANATIONS.medianaPriceM2} iconSize={12} />
                    </span>
                    <span className="font-bold text-emerald-700">
                      {data.medianaCenaM2 ? formatPricePerM2(data.medianaCenaM2) : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center">
                      75. percentil (Q3)
                      <InfoTooltip text={STAT_EXPLANATIONS.percentileQ3} iconSize={12} />
                    </span>
                    <span className="font-medium">{formatPricePerM2(data.priceRange.q3)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Maksimum</span>
                    <span className="font-medium">{formatPricePerM2(data.priceRange.max)}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    50% transakcij med {formatPricePerM2(data.priceRange.q1)} in {formatPricePerM2(data.priceRange.q3)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      {data.recentTransactions && data.recentTransactions.length > 0 && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Zadnje prodaje v občini {name}
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Najnovejše zabeležene transakcije nepremičnin.
            </p>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Datum</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tip</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Naslov</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Površina</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Cena</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">€/m²</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.recentTransactions.map((tx, index) => (
                      <tr key={`${tx.id}-${index}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDateShort(tx.datum)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center gap-1">
                            {tx.tip === 1 ? (
                              <Home className="w-3.5 h-3.5 text-orange-500" />
                            ) : tx.tip === 2 ? (
                              <Building className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            <span className="text-gray-900">{tx.tipNaziv}</span>
                            {tx.novogradnja && (
                              <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded">
                                Novo
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                          {tx.naslov}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatArea(tx.uporabnaPovrsina)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatPrice(tx.cena)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-600 text-right">
                          {formatPricePerM2(tx.cenaNaM2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Info */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">O podatkih</h2>
            <div className="prose prose-sm text-gray-600">
              <p>
                Statistika temelji na dejansko realiziranih prodajah nepremičnin v občini {name},
                zabeleženih v Evidenci trga nepremičnin (ETN). Prikazana je mediana cene na m²,
                ki je bolj reprezentativna od povprečja, saj ni občutljiva na ekstremne vrednosti.
              </p>
              <p className="mt-2">
                Četrtletni podatki lahko variirajo glede na število prodaj v posameznem obdobju.
                Za občine z manj transakcijami so lahko nihanja večja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <FAQSection faqs={getMunicipalityFAQs(name, data.medianaCenaM2Stanovanja || undefined)} />
        </div>
      </section>

      {/* Citation Block */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <CitationBlock
            pageTitle={`Cene nepremičnin – ${name}`}
            pageUrl={`https://cenenepremicnin.com/statistika/${slug}`}
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
