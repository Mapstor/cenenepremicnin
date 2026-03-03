'use client';

import { useFilters, PropertyTypeKey, PROPERTY_TYPE_LABELS } from '@/hooks/useFilters';

const PROPERTY_TYPE_ORDER: PropertyTypeKey[] = ['stanovanja', 'hise', 'poslovni', 'parking'];

export default function PropertyTypeFilter() {
  const { state, togglePropertyType } = useFilters();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Vrsta nepremičnine</label>
      <div className="flex flex-wrap gap-2">
        {PROPERTY_TYPE_ORDER.map((typeKey) => {
          const isSelected = state.propertyTypes.includes(typeKey);
          return (
            <button
              key={typeKey}
              onClick={() => togglePropertyType(typeKey)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {PROPERTY_TYPE_LABELS[typeKey]}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500">
        Izbrano: {state.propertyTypes.length === 0 ? 'Nobeno' : state.propertyTypes.length === PROPERTY_TYPE_ORDER.length ? 'Vse' : state.propertyTypes.map(t => PROPERTY_TYPE_LABELS[t]).join(', ')}
      </p>
    </div>
  );
}
