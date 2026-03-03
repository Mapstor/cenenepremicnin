'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Filter state types
export type PropertyTypeKey = 'stanovanja' | 'hise' | 'poslovni' | 'parking';

export interface FilterState {
  propertyTypes: PropertyTypeKey[];
  priceRange: {
    min: number;
    max: number;
  };
  dateRange: {
    startYear: number;
    endYear: number;
  };
  mapLayer: 'heatmap' | 'markers' | 'both';
  granularity: 'ko' | 'obcine';
}

// Property type mapping to ETN codes
export const PROPERTY_TYPE_CODES: Record<PropertyTypeKey, number[]> = {
  stanovanja: [2],           // Stanovanje
  hise: [1],                 // Hiša
  poslovni: [5, 6, 7, 8, 9, 10, 11], // Commercial
  parking: [3, 4],           // Garaža, Parkirno mesto
};

// Property type labels
export const PROPERTY_TYPE_LABELS: Record<PropertyTypeKey, string> = {
  stanovanja: 'Stanovanja',
  hise: 'Hiše',
  poslovni: 'Poslovni',
  parking: 'Parkirišča',
};

// Action types
type FilterAction =
  | { type: 'SET_PROPERTY_TYPES'; payload: PropertyTypeKey[] }
  | { type: 'TOGGLE_PROPERTY_TYPE'; payload: PropertyTypeKey }
  | { type: 'SET_PRICE_RANGE'; payload: { min: number; max: number } }
  | { type: 'SET_DATE_RANGE'; payload: { startYear: number; endYear: number } }
  | { type: 'SET_MAP_LAYER'; payload: 'heatmap' | 'markers' | 'both' }
  | { type: 'SET_GRANULARITY'; payload: 'ko' | 'obcine' }
  | { type: 'RESET_FILTERS' };

// Initial state
const initialState: FilterState = {
  propertyTypes: ['stanovanja'], // Default to apartments only (can't mix with houses)
  priceRange: {
    min: 0,
    max: 10000,
  },
  dateRange: {
    startYear: 2007,
    endYear: 2026,
  },
  mapLayer: 'heatmap',
  granularity: 'obcine',
};

// Reducer
function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_PROPERTY_TYPES':
      return { ...state, propertyTypes: action.payload };

    case 'TOGGLE_PROPERTY_TYPE': {
      const type = action.payload;
      const current = state.propertyTypes;
      const newTypes = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      // Ensure at least one type is selected
      return {
        ...state,
        propertyTypes: newTypes.length > 0 ? newTypes : current,
      };
    }

    case 'SET_PRICE_RANGE':
      return { ...state, priceRange: action.payload };

    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };

    case 'SET_MAP_LAYER':
      return { ...state, mapLayer: action.payload };

    case 'SET_GRANULARITY':
      return { ...state, granularity: action.payload };

    case 'RESET_FILTERS':
      return initialState;

    default:
      return state;
  }
}

// Context
interface FilterContextType {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  // Convenience methods
  setPropertyTypes: (types: PropertyTypeKey[]) => void;
  togglePropertyType: (type: PropertyTypeKey) => void;
  setPriceRange: (min: number, max: number) => void;
  setDateRange: (startYear: number, endYear: number) => void;
  setMapLayer: (layer: 'heatmap' | 'markers' | 'both') => void;
  setGranularity: (granularity: 'ko' | 'obcine') => void;
  resetFilters: () => void;
  // Helper to get all selected ETN codes
  getSelectedTypeCodes: () => number[];
}

const FilterContext = createContext<FilterContextType | null>(null);

// Provider component
export function FilterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  const setPropertyTypes = (types: PropertyTypeKey[]) => {
    dispatch({ type: 'SET_PROPERTY_TYPES', payload: types });
  };

  const togglePropertyType = (type: PropertyTypeKey) => {
    dispatch({ type: 'TOGGLE_PROPERTY_TYPE', payload: type });
  };

  const setPriceRange = (min: number, max: number) => {
    dispatch({ type: 'SET_PRICE_RANGE', payload: { min, max } });
  };

  const setDateRange = (startYear: number, endYear: number) => {
    dispatch({ type: 'SET_DATE_RANGE', payload: { startYear, endYear } });
  };

  const setMapLayer = (layer: 'heatmap' | 'markers' | 'both') => {
    dispatch({ type: 'SET_MAP_LAYER', payload: layer });
  };

  const setGranularity = (granularity: 'ko' | 'obcine') => {
    dispatch({ type: 'SET_GRANULARITY', payload: granularity });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const getSelectedTypeCodes = (): number[] => {
    return state.propertyTypes.flatMap((type) => PROPERTY_TYPE_CODES[type]);
  };

  const value: FilterContextType = {
    state,
    dispatch,
    setPropertyTypes,
    togglePropertyType,
    setPriceRange,
    setDateRange,
    setMapLayer,
    setGranularity,
    resetFilters,
    getSelectedTypeCodes,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

// Hook
export function useFilters(): FilterContextType {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}

// Export initial state for components that need defaults
export { initialState as defaultFilterState };
