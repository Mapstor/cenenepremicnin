// JSON-LD Structured Data Components for SEO and AI visibility
// Schema.org markup for better search engine and AI understanding

import { ReactNode } from 'react';

interface JsonLdProps {
  data: Record<string, unknown>;
}

// Base component that renders JSON-LD script tag
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization schema - used site-wide
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cene Nepremičnin',
    url: 'https://cenenepremicnin.com',
    logo: 'https://cenenepremicnin.com/icon.svg',
    description: 'Interaktivni portal za vizualizacijo cen nepremičnin v Sloveniji',
    email: 'info@cenenepremicnin.com',
    foundingDate: '2024',
    areaServed: {
      '@type': 'Country',
      name: 'Slovenia',
      sameAs: 'https://en.wikipedia.org/wiki/Slovenia',
    },
    sameAs: [],
  };
  return <JsonLd data={data} />;
}

// WebSite schema - for homepage
export function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Cene Nepremičnin',
    alternateName: 'CeneNepremičnin.com',
    url: 'https://cenenepremicnin.com',
    description: 'Interaktivni zemljevid cen nepremičnin v Sloveniji z več kot 300.000 transakcijami od leta 2007.',
    inLanguage: 'sl',
    publisher: {
      '@type': 'Organization',
      name: 'Cene Nepremičnin',
      url: 'https://cenenepremicnin.com',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://cenenepremicnin.com/lokacija?naslov={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
  return <JsonLd data={data} />;
}

// Dataset schema - for pages showing data
interface DatasetJsonLdProps {
  name: string;
  description: string;
  url: string;
  dateModified?: string;
  spatialCoverage?: string;
  temporalCoverage?: string;
  keywords?: string[];
}

export function DatasetJsonLd({
  name,
  description,
  url,
  dateModified = new Date().toISOString().split('T')[0],
  spatialCoverage = 'Slovenia',
  temporalCoverage = '2007/2025',
  keywords = ['real estate', 'property prices', 'Slovenia', 'nepremičnine'],
}: DatasetJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url,
    dateModified,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: {
      '@type': 'Organization',
      name: 'Cene Nepremičnin',
      url: 'https://cenenepremicnin.com',
    },
    provider: {
      '@type': 'Organization',
      name: 'GURS - Geodetska uprava Republike Slovenije',
      url: 'https://www.e-prostor.gov.si/',
    },
    spatialCoverage: {
      '@type': 'Place',
      name: spatialCoverage,
      geo: {
        '@type': 'GeoShape',
        box: '45.42 13.38 46.88 16.61', // Slovenia bounding box
      },
    },
    temporalCoverage,
    keywords: keywords.join(', '),
    measurementTechnique: 'Government transaction records (GURS ETN)',
    variableMeasured: [
      {
        '@type': 'PropertyValue',
        name: 'Transaction Price',
        unitCode: 'EUR',
      },
      {
        '@type': 'PropertyValue',
        name: 'Price per Square Meter',
        unitCode: 'EUR/m²',
      },
      {
        '@type': 'PropertyValue',
        name: 'Property Area',
        unitCode: 'MTK', // square meters
      },
    ],
  };
  return <JsonLd data={data} />;
}

// FAQPage schema
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQPageJsonLdProps {
  faqs: FAQItem[];
}

export function FAQPageJsonLd({ faqs }: FAQPageJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
  return <JsonLd data={data} />;
}

// BreadcrumbList schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <JsonLd data={data} />;
}

// ItemList schema - for ranking pages
interface RankedItem {
  name: string;
  url?: string;
  position: number;
  description?: string;
}

interface ItemListJsonLdProps {
  name: string;
  description: string;
  url: string;
  items?: RankedItem[];
  numberOfItems?: number;
}

export function ItemListJsonLd({
  name,
  description,
  url,
  items = [],
  numberOfItems,
}: ItemListJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url,
    numberOfItems: numberOfItems || items.length || 100,
  };

  // Only add itemListElement if items are provided
  if (items.length > 0) {
    data.itemListElement = items.slice(0, 10).map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      description: item.description,
      url: item.url,
    }));
  }

  return <JsonLd data={data} />;
}

// Article schema - for content pages
interface ArticleJsonLdProps {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  keywords?: string[];
}

export function ArticleJsonLd({
  headline,
  description,
  url,
  datePublished = '2024-01-01',
  dateModified = new Date().toISOString().split('T')[0],
  image = 'https://cenenepremicnin.com/og-image.png',
  keywords = [],
}: ArticleJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url,
    datePublished,
    dateModified,
    image,
    author: {
      '@type': 'Organization',
      name: 'Cene Nepremičnin',
      url: 'https://cenenepremicnin.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Cene Nepremičnin',
      url: 'https://cenenepremicnin.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cenenepremicnin.com/icon.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: keywords.join(', '),
    inLanguage: 'sl',
    isAccessibleForFree: true,
  };
  return <JsonLd data={data} />;
}

// Place schema - for municipality/location pages
interface PlaceJsonLdProps {
  name: string;
  description: string;
  url: string;
  latitude?: number;
  longitude?: number;
  containedIn?: string;
}

export function PlaceJsonLd({
  name,
  description,
  url,
  latitude,
  longitude,
  containedIn = 'Slovenia',
}: PlaceJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name,
    description,
    url,
    containedInPlace: {
      '@type': 'Country',
      name: containedIn,
    },
  };

  if (latitude && longitude) {
    data.geo = {
      '@type': 'GeoCoordinates',
      latitude,
      longitude,
    };
  }

  return <JsonLd data={data} />;
}

// StatisticalPopulation schema - for aggregate statistics
interface StatisticsJsonLdProps {
  name: string;
  description: string;
  url: string;
  populationType: string;
  numConstraints?: number;
}

export function StatisticsJsonLd({
  name,
  description,
  url,
  populationType,
}: StatisticsJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url,
    about: {
      '@type': 'StatisticalPopulation',
      populationType,
      location: {
        '@type': 'Country',
        name: 'Slovenia',
      },
    },
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      name: 'Cene Nepremičnin',
      url: 'https://cenenepremicnin.com',
    },
  };
  return <JsonLd data={data} />;
}

// Combined schemas for homepage
export function HomepageJsonLd() {
  return (
    <>
      <WebSiteJsonLd />
      <OrganizationJsonLd />
      <DatasetJsonLd
        name="Cene Nepremičnin v Sloveniji"
        description="Interaktivni zemljevid cen nepremičnin v Sloveniji z več kot 300.000 transakcijami od leta 2007 do 2025. Podatki iz uradne evidence GURS ETN."
        url="https://cenenepremicnin.com"
        keywords={[
          'cene nepremičnin',
          'slovenija',
          'stanovanja',
          'hiše',
          'nepremičninski trg',
          'cena na kvadratni meter',
          'ljubljana',
          'maribor',
        ]}
      />
    </>
  );
}
