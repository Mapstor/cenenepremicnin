'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFilters } from '@/hooks/useFilters';

const MIN_PRICE = 0;
const MAX_PRICE = 10000;
const STEP = 100;

export default function PriceRangeFilter() {
  const { state, setPriceRange } = useFilters();
  const [localMin, setLocalMin] = useState(state.priceRange.min);
  const [localMax, setLocalMax] = useState(state.priceRange.max);

  // Sync with external state
  useEffect(() => {
    setLocalMin(state.priceRange.min);
    setLocalMax(state.priceRange.max);
  }, [state.priceRange.min, state.priceRange.max]);

  // Debounced update to context
  const commitChanges = useCallback(() => {
    setPriceRange(localMin, localMax);
  }, [localMin, localMax, setPriceRange]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), localMax - STEP);
    setLocalMin(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), localMin + STEP);
    setLocalMax(value);
  };

  const formatPrice = (price: number): string => {
    if (price >= 10000) return '10.000+';
    return new Intl.NumberFormat('sl-SI').format(price);
  };

  // Calculate percentages for visual track
  const minPercent = ((localMin - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const maxPercent = ((localMax - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Cena na m²</label>

      {/* Price display */}
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-900">{formatPrice(localMin)} €/m²</span>
        <span className="font-medium text-gray-900">{formatPrice(localMax)} €/m²</span>
      </div>

      {/* Dual range slider */}
      <div className="relative h-2 mt-4">
        {/* Track background */}
        <div className="absolute inset-0 bg-gray-200 rounded-full" />

        {/* Active track */}
        <div
          className="absolute h-full bg-emerald-500 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min range input */}
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={STEP}
          value={localMin}
          onChange={handleMinChange}
          onMouseUp={commitChanges}
          onTouchEnd={commitChanges}
          className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-emerald-600 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />

        {/* Max range input */}
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={STEP}
          value={localMax}
          onChange={handleMaxChange}
          onMouseUp={commitChanges}
          onTouchEnd={commitChanges}
          className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-emerald-600 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-1 mt-2">
        {[
          { label: 'Do 1.500', min: 0, max: 1500 },
          { label: '1.500 - 3.000', min: 1500, max: 3000 },
          { label: '3.000 - 5.000', min: 3000, max: 5000 },
          { label: 'Nad 5.000', min: 5000, max: 10000 },
        ].map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              setLocalMin(preset.min);
              setLocalMax(preset.max);
              setPriceRange(preset.min, preset.max);
            }}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              localMin === preset.min && localMax === preset.max
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
