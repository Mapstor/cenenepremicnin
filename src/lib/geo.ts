import proj4 from 'proj4';

// Define EPSG:3794 (D96/TM) - Slovenian national coordinate system
proj4.defs(
  'EPSG:3794',
  '+proj=tmerc +lat_0=0 +lon_0=15 +k=0.9999 +x_0=500000 +y_0=-5000000 +ellps=GRS80 +units=m +no_defs'
);

/**
 * Convert D96/TM (EPSG:3794) coordinates to WGS84 (EPSG:4326)
 * @param e - Easting (E coordinate)
 * @param n - Northing (N coordinate)
 * @returns [lat, lon] in WGS84
 */
export function d96ToWgs84(e: number, n: number): [number, number] {
  const [lon, lat] = proj4('EPSG:3794', 'EPSG:4326', [e, n]);
  return [lat, lon];
}

/**
 * Convert WGS84 to D96/TM
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns [e, n] in D96/TM
 */
export function wgs84ToD96(lat: number, lon: number): [number, number] {
  const [e, n] = proj4('EPSG:4326', 'EPSG:3794', [lon, lat]);
  return [e, n];
}

// Slovenia bounding box in WGS84
export const SLOVENIA_LAT_MIN = 45.42;
export const SLOVENIA_LAT_MAX = 46.88;
export const SLOVENIA_LON_MIN = 13.38;
export const SLOVENIA_LON_MAX = 16.61;

/**
 * Check if WGS84 coordinates are within Slovenia bounds
 */
export function isInSlovenia(lat: number, lon: number): boolean {
  return (
    lat >= SLOVENIA_LAT_MIN &&
    lat <= SLOVENIA_LAT_MAX &&
    lon >= SLOVENIA_LON_MIN &&
    lon <= SLOVENIA_LON_MAX
  );
}

/**
 * Calculate Haversine distance between two points in kilometers
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Filter items within a radius of a center point
 * @param items - Array of items with lat/lon properties
 * @param centerLat - Center latitude
 * @param centerLon - Center longitude
 * @param radiusKm - Radius in kilometers
 * @returns Filtered items within radius, with distance property added
 */
export function filterByRadius<T extends { lat: number; lon: number }>(
  items: T[],
  centerLat: number,
  centerLon: number,
  radiusKm: number
): (T & { distance: number })[] {
  return items
    .map((item) => ({
      ...item,
      distance: haversineDistance(centerLat, centerLon, item.lat, item.lon),
    }))
    .filter((item) => item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}
