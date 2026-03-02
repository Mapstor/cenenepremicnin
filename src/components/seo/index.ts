// SEO Components - JSON-LD, FAQ, Citation
// Export all SEO-related components from a single entry point

export {
  JsonLd,
  OrganizationJsonLd,
  WebSiteJsonLd,
  DatasetJsonLd,
  FAQPageJsonLd,
  BreadcrumbJsonLd,
  ItemListJsonLd,
  ArticleJsonLd,
  PlaceJsonLd,
  StatisticsJsonLd,
  HomepageJsonLd,
} from './JsonLd';

// FAQ Component (client component)
export { default as FAQSection } from './FAQ';

// FAQ Data (can be used in server components)
export {
  HOMEPAGE_FAQS,
  STATISTIKA_FAQS,
  NOVOGRADNJE_FAQS,
  LOKACIJA_FAQS,
  LESTVICE_FAQS,
  NAJDRAZJE_NEPREMICNINE_FAQS,
  NAJDRAZJE_OBCINE_FAQS,
  NAJCENEJSA_STANOVANJA_FAQS,
  NAJVECJE_PODRAZITVE_FAQS,
  getMunicipalityFAQs,
} from './faq-data';
export type { FAQItem } from './faq-data';

export { default as CitationBlock, InlineCitation } from './CitationBlock';
