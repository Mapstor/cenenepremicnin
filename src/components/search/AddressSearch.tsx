'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Loader2, MapPin, Navigation, Building2, Home } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { searchGursAddresses, GursAddressResult } from '@/lib/gurs-geocoding';

// Unified search result type
interface SearchResult {
  id: string;
  main: string;
  secondary: string;
  lat: number;
  lon: number;
  source: 'gurs' | 'nominatim';
  type?: string;
}

interface AddressSearchProps {
  onSelect: (result: { lat: number; lon: number; address: string }) => void;
  placeholder?: string;
}

// Get icon based on result source/type
const getResultIcon = (result: SearchResult) => {
  if (result.source === 'gurs') return Home;
  if (result.type === 'building' || result.type === 'apartments') return Building2;
  return MapPin;
};

export default function AddressSearch({
  onSelect,
  placeholder = 'Slovenska cesta 1, Ljubljana',
}: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Search using GURS WFS (primary) and Nominatim (fallback)
  const searchAddress = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Try GURS WFS first (complete address database for Slovenia)
      const gursResults = await searchGursAddresses(searchQuery);

      const combinedResults: SearchResult[] = [];

      // Add GURS results
      gursResults.forEach((result: GursAddressResult) => {
        combinedResults.push({
          id: result.id,
          main: `${result.street} ${result.houseNumber}${result.houseNumberSuffix || ''}`,
          secondary: `${result.postcode} ${result.city}`,
          lat: result.lat,
          lon: result.lon,
          source: 'gurs',
        });
      });

      // If GURS returned few results, also try Nominatim for POIs/landmarks
      if (gursResults.length < 3) {
        try {
          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
              new URLSearchParams({
                q: searchQuery,
                format: 'json',
                countrycodes: 'si',
                limit: String(6 - gursResults.length),
                addressdetails: '1',
              }),
            {
              headers: {
                'Accept-Language': 'sl',
              },
            }
          );
          const nominatimData = await nominatimResponse.json();

          // Add Nominatim results that aren't duplicates
          nominatimData.forEach((result: {
            place_id: number;
            lat: string;
            lon: string;
            display_name: string;
            type?: string;
            class?: string;
            address?: {
              road?: string;
              house_number?: string;
              city?: string;
              town?: string;
              village?: string;
              postcode?: string;
            };
          }) => {
            const lat = parseFloat(result.lat);
            const lon = parseFloat(result.lon);

            // Skip if too close to an existing GURS result
            const isDuplicate = combinedResults.some(
              (existing) =>
                Math.abs(existing.lat - lat) < 0.0001 &&
                Math.abs(existing.lon - lon) < 0.0001
            );

            if (!isDuplicate) {
              const addr = result.address;
              const mainParts: string[] = [];
              const secondaryParts: string[] = [];

              if (addr?.road) {
                mainParts.push(addr.road + (addr.house_number ? ' ' + addr.house_number : ''));
              } else {
                mainParts.push(result.display_name.split(', ')[0]);
              }

              const place = addr?.city || addr?.town || addr?.village;
              if (place) {
                secondaryParts.push(addr?.postcode ? `${addr.postcode} ${place}` : place);
              }

              combinedResults.push({
                id: `nominatim-${result.place_id}`,
                main: mainParts.join(', ') || result.display_name.split(', ')[0],
                secondary: secondaryParts.join(', ') || result.display_name.split(', ').slice(1, 3).join(', '),
                lat,
                lon,
                source: 'nominatim',
                type: result.type || result.class,
              });
            }
          });
        } catch (nominatimError) {
          console.error('Nominatim fallback error:', nominatimError);
        }
      }

      setResults(combinedResults.slice(0, 8));
      setIsOpen(combinedResults.length > 0);
    } catch (error) {
      console.error('Geocoding error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reverse geocode coordinates
  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
          new URLSearchParams({
            lat: lat.toString(),
            lon: lon.toString(),
            format: 'json',
            addressdetails: '1',
          }),
        {
          headers: {
            'Accept-Language': 'sl',
          },
        }
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
  }, []);

  // Geolocation
  const handleGeolocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeoError('Geolokacija ni podprta v vašem brskalniku');
      return;
    }

    setIsGeolocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Check if within Slovenia bounds
        if (latitude < 45.42 || latitude > 46.88 || longitude < 13.38 || longitude > 16.61) {
          setGeoError('Vaša lokacija ni v Sloveniji');
          setIsGeolocating(false);
          return;
        }

        // Reverse geocode to get address
        const address = await reverseGeocode(latitude, longitude);

        setQuery(address);
        setSelectedAddress(address);
        setIsOpen(false);
        setIsGeolocating(false);

        onSelect({
          lat: latitude,
          lon: longitude,
          address,
        });
      },
      (error) => {
        setIsGeolocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Dostop do lokacije je bil zavrnjen');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError('Lokacija ni na voljo');
            break;
          case error.TIMEOUT:
            setGeoError('Zahteva za lokacijo je potekla');
            break;
          default:
            setGeoError('Napaka pri pridobivanju lokacije');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [onSelect, reverseGeocode]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery && !selectedAddress) {
      searchAddress(debouncedQuery);
    }
  }, [debouncedQuery, searchAddress, selectedAddress]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    const address = result.secondary
      ? `${result.main}, ${result.secondary}`
      : result.main;

    setSelectedAddress(address);
    setQuery(address);
    setIsOpen(false);
    setResults([]);
    onSelect({
      lat: result.lat,
      lon: result.lon,
      address,
    });
  };

  const handleClear = () => {
    setQuery('');
    setSelectedAddress(null);
    setResults([]);
    setIsOpen(false);
    setGeoError(null);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setGeoError(null);
    if (selectedAddress) {
      setSelectedAddress(null);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-24 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
        />
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          {query && (
            <button
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Počisti"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleGeolocation}
            disabled={isGeolocating}
            className="p-2 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Uporabi mojo lokacijo"
          >
            {isGeolocating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Geolocation error */}
      {geoError && (
        <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          {geoError}
        </div>
      )}

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {results.map((result) => {
            const Icon = getResultIcon(result);
            return (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-start gap-3"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 font-medium truncate">{result.main}</div>
                  {result.secondary && (
                    <div className="text-sm text-gray-500 truncate">{result.secondary}</div>
                  )}
                </div>
                {result.source === 'gurs' && (
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    GURS
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Geolocation hint */}
      {!query && !selectedAddress && (
        <p className="mt-2 text-sm text-gray-500 flex items-center gap-1.5">
          <Navigation className="w-4 h-4" />
          <span>Uporabite gumb za lokacijo ali vnesite naslov</span>
        </p>
      )}
    </div>
  );
}
