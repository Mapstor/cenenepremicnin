import { d96ToWgs84 } from './geo';

export interface GursAddressResult {
  id: string;
  address: string;
  street: string;
  houseNumber: number;
  houseNumberSuffix: string | null;
  city: string;
  postcode: number;
  municipality: string;
  lat: number;
  lon: number;
}

interface GursWfsFeature {
  id: string;
  properties: {
    ULICA_NAZIV: string;
    HS_STEVILKA: number;
    HS_DODATEK: string | null;
    NASELJE_NAZIV: string;
    POSTNI_OKOLIS_SIFRA: number;
    POSTNI_OKOLIS_NAZIV: string;
    OBCINA_NAZIV: string;
    E: number;
    N: number;
  };
}

interface GursWfsResponse {
  type: string;
  features: GursWfsFeature[];
}

/**
 * Search GURS WFS for addresses matching the query
 * This provides complete address coverage for Slovenia including house numbers
 */
export async function searchGursAddresses(query: string): Promise<GursAddressResult[]> {
  // Parse the query to extract street name, house number, and postal code
  const { streetName, houseNumber, postalCode } = parseAddressQuery(query);

  if (!streetName || streetName.length < 2) {
    return [];
  }

  // Build CQL filter
  let cqlFilter = `ULICA_NAZIV ILIKE '%${escapeForCql(streetName)}%'`;

  if (houseNumber) {
    cqlFilter += ` AND HS_STEVILKA=${houseNumber}`;
  }

  if (postalCode) {
    cqlFilter += ` AND POSTNI_OKOLIS_SIFRA=${postalCode}`;
  }

  try {
    const url = new URL('https://ipi.eprostor.gov.si/wfs-si-gurs-kn/ows');
    url.searchParams.set('service', 'WFS');
    url.searchParams.set('version', '1.1.0');
    url.searchParams.set('request', 'GetFeature');
    url.searchParams.set('typeName', 'SI.GURS.KN:NASLOVI_HS');
    url.searchParams.set('outputFormat', 'application/json');
    url.searchParams.set('CQL_FILTER', cqlFilter);
    url.searchParams.set('maxFeatures', '10');

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error('GURS WFS error:', response.status);
      return [];
    }

    const data: GursWfsResponse = await response.json();

    if (!data.features || data.features.length === 0) {
      return [];
    }

    return data.features.map((feature) => {
      const props = feature.properties;
      const [lat, lon] = d96ToWgs84(props.E, props.N);

      const fullAddress = formatGursAddress(
        props.ULICA_NAZIV,
        props.HS_STEVILKA,
        props.HS_DODATEK,
        props.POSTNI_OKOLIS_SIFRA,
        props.NASELJE_NAZIV
      );

      return {
        id: feature.id,
        address: fullAddress,
        street: props.ULICA_NAZIV,
        houseNumber: props.HS_STEVILKA,
        houseNumberSuffix: props.HS_DODATEK,
        city: props.NASELJE_NAZIV,
        postcode: props.POSTNI_OKOLIS_SIFRA,
        municipality: props.OBCINA_NAZIV,
        lat,
        lon,
      };
    });
  } catch (error) {
    console.error('GURS geocoding error:', error);
    return [];
  }
}

/**
 * Parse address query to extract components
 */
function parseAddressQuery(query: string): {
  streetName: string;
  houseNumber: number | null;
  postalCode: number | null;
} {
  // Normalize whitespace and remove extra spaces
  const normalized = query.trim().replace(/\s+/g, ' ');

  // Try to extract postal code (4 digit number, usually at the end or before city name)
  const postalMatch = normalized.match(/\b(\d{4})\b/);
  const postalCode = postalMatch ? parseInt(postalMatch[1], 10) : null;

  // Remove postal code and common city names for cleaner street parsing
  let cleaned = normalized
    .replace(/\b\d{4}\b/, '')
    .replace(/\bljubljana\b/gi, '')
    .replace(/\bmaribor\b/gi, '')
    .replace(/\bcelje\b/gi, '')
    .replace(/\bkoper\b/gi, '')
    .replace(/\bkranj\b/gi, '')
    .trim();

  // Extract house number (last number in the remaining string, possibly with letter suffix)
  const houseMatch = cleaned.match(/\b(\d+)\s*[a-zA-Z]?\s*$/);
  const houseNumber = houseMatch ? parseInt(houseMatch[1], 10) : null;

  // Remove house number from street name
  if (houseMatch) {
    cleaned = cleaned.replace(houseMatch[0], '').trim();
  }

  // Clean up trailing commas and extra spaces
  const streetName = cleaned.replace(/,\s*$/, '').replace(/\s+/g, ' ').trim();

  return { streetName, houseNumber, postalCode };
}

/**
 * Escape special characters for CQL filter
 */
function escapeForCql(str: string): string {
  // Escape single quotes by doubling them
  return str.replace(/'/g, "''");
}

/**
 * Format GURS address into a readable string
 */
function formatGursAddress(
  street: string,
  houseNumber: number,
  suffix: string | null,
  postcode: number,
  city: string
): string {
  const houseStr = suffix ? `${houseNumber}${suffix}` : `${houseNumber}`;
  return `${street} ${houseStr}, ${postcode} ${city}`;
}
