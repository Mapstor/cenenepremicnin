'use client';

import { useState } from 'react';
import { Layers, MapPin, Building, CircleDot, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import PropertyTypeFilter from '@/components/filters/PropertyTypeFilter';
import PriceRangeFilter from '@/components/filters/PriceRangeFilter';
import DateRangeFilter from '@/components/filters/DateRangeFilter';
import { useFilters } from '@/hooks/useFilters';

export type MapViewMode = 'heatmap' | 'markers' | 'both';

interface MapControlsProps {
  heatmapType: 'ko' | 'obcine';
  onHeatmapTypeChange: (type: 'ko' | 'obcine') => void;
  viewMode?: MapViewMode;
  onViewModeChange?: (mode: MapViewMode) => void;
}

export default function MapControls({
  heatmapType,
  onHeatmapTypeChange,
  viewMode = 'heatmap',
  onViewModeChange,
}: MapControlsProps) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('propertyType');
  const { state, resetFilters } = useFilters();

  // Check if any filters are active (non-default)
  const hasActiveFilters =
    state.propertyTypes.length !== 2 ||
    !state.propertyTypes.includes('stanovanja') ||
    !state.propertyTypes.includes('hise') ||
    state.priceRange.min !== 0 ||
    state.priceRange.max !== 10000 ||
    state.dateRange.startYear !== 2007 ||
    state.dateRange.endYear !== 2026;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {/* Filter toggle button */}
        <button
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-colors ${
            isFilterPanelOpen || hasActiveFilters
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-medium">Filtri</span>
          {hasActiveFilters && !isFilterPanelOpen && (
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          )}
        </button>

        {/* View mode toggle */}
        {onViewModeChange && (
          <div className="bg-white rounded-lg shadow-lg p-2">
            <div className="text-xs text-gray-500 px-2 mb-1.5 font-medium">Prikaz</div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onViewModeChange('heatmap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'heatmap'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="Prikaži samo toplotni zemljevid"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Območja</span>
              </button>
              <button
                onClick={() => onViewModeChange('markers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'markers'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="Prikaži samo oznake transakcij"
              >
                <CircleDot className="w-4 h-4" />
                <span className="hidden sm:inline">Prodaje</span>
              </button>
              <button
                onClick={() => onViewModeChange('both')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'both'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="Prikaži oboje"
              >
                <span className="text-xs font-bold">Vse</span>
              </button>
            </div>
          </div>
        )}

        {/* Heatmap type toggle - only show when heatmap is visible */}
        {(viewMode === 'heatmap' || viewMode === 'both') && (
          <div className="bg-white rounded-lg shadow-lg p-2">
            <div className="text-xs text-gray-500 px-2 mb-1.5 font-medium">Raven</div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onHeatmapTypeChange('obcine')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  heatmapType === 'obcine'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="Prikaži podatke po občinah"
              >
                <Building className="w-4 h-4" />
                <span className="hidden sm:inline">Občine</span>
              </button>
              <button
                onClick={() => onHeatmapTypeChange('ko')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  heatmapType === 'ko'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="Prikaži podatke po katastrskih občinah"
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">K.O.</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Filter Panel - pointer-events-auto ensures it's clickable while rest of overlay isn't blocking map */}
      {isFilterPanelOpen && (
        <div className="absolute top-4 left-4 z-[1001] w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Filtri</h3>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Ponastavi
                </button>
              )}
              <button
                onClick={() => setIsFilterPanelOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter sections */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Property Type Section */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleSection('propertyType')}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              >
                <span className="font-medium text-gray-700">Vrsta nepremičnine</span>
                {expandedSection === 'propertyType' ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {expandedSection === 'propertyType' && (
                <div className="px-4 pb-4">
                  <PropertyTypeFilter />
                </div>
              )}
            </div>

            {/* Price Range Section */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleSection('priceRange')}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              >
                <span className="font-medium text-gray-700">Cena na m²</span>
                {expandedSection === 'priceRange' ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {expandedSection === 'priceRange' && (
                <div className="px-4 pb-4">
                  <PriceRangeFilter />
                </div>
              )}
            </div>

            {/* Date Range Section */}
            <div>
              <button
                onClick={() => toggleSection('dateRange')}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              >
                <span className="font-medium text-gray-700">Obdobje</span>
                {expandedSection === 'dateRange' ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {expandedSection === 'dateRange' && (
                <div className="px-4 pb-4">
                  <DateRangeFilter />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 rounded-b-lg border-t border-gray-100">
            <button
              onClick={() => setIsFilterPanelOpen(false)}
              className="w-full py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Uporabi filtre
            </button>
          </div>
        </div>
      )}
    </>
  );
}
