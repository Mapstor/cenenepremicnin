'use client';

import { Layers, MapPin, Building, Home } from 'lucide-react';

interface MapControlsProps {
  heatmapType: 'ko' | 'obcine';
  onHeatmapTypeChange: (type: 'ko' | 'obcine') => void;
}

export default function MapControls({
  heatmapType,
  onHeatmapTypeChange,
}: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <div className="bg-white rounded-lg shadow-lg p-2">
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
    </div>
  );
}
