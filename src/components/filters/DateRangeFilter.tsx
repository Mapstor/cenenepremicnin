'use client';

import { useFilters } from '@/hooks/useFilters';

const MIN_YEAR = 2007;
const MAX_YEAR = 2026;
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

export default function DateRangeFilter() {
  const { state, setDateRange } = useFilters();

  const handleStartYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const startYear = Number(e.target.value);
    // Ensure start year is not after end year
    const endYear = Math.max(startYear, state.dateRange.endYear);
    setDateRange(startYear, endYear);
  };

  const handleEndYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const endYear = Number(e.target.value);
    // Ensure end year is not before start year
    const startYear = Math.min(state.dateRange.startYear, endYear);
    setDateRange(startYear, endYear);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Obdobje</label>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="sr-only">Od leta</label>
          <select
            value={state.dateRange.startYear}
            onChange={handleStartYearChange}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {YEARS.map((year) => (
              <option key={year} value={year} disabled={year > state.dateRange.endYear}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <span className="text-gray-400">–</span>

        <div className="flex-1">
          <label className="sr-only">Do leta</label>
          <select
            value={state.dateRange.endYear}
            onChange={handleEndYearChange}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {YEARS.map((year) => (
              <option key={year} value={year} disabled={year < state.dateRange.startYear}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-1">
        {[
          { label: 'Zadnje leto', start: MAX_YEAR, end: MAX_YEAR },
          { label: 'Zadnjih 5 let', start: MAX_YEAR - 4, end: MAX_YEAR },
          { label: 'Zadnjih 10 let', start: MAX_YEAR - 9, end: MAX_YEAR },
          { label: 'Vse', start: MIN_YEAR, end: MAX_YEAR },
        ].map((preset) => (
          <button
            key={preset.label}
            onClick={() => setDateRange(preset.start, preset.end)}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              state.dateRange.startYear === preset.start && state.dateRange.endYear === preset.end
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
