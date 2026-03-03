'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface TimeSliderProps {
  minYear?: number;
  maxYear?: number;
  selectedYear: number | null;
  onChange: (year: number | null) => void;
  className?: string;
}

const YEARS = Array.from({ length: 20 }, (_, i) => 2007 + i); // 2007-2026

export default function TimeSlider({
  minYear = 2007,
  maxYear = 2026,
  selectedYear,
  onChange,
  className = '',
}: TimeSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false); // Paused by default
  const [currentYear, setCurrentYear] = useState(selectedYear ?? maxYear); // Start at most recent year (2026)
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with external selectedYear prop
  useEffect(() => {
    if (selectedYear !== null) {
      setCurrentYear(selectedYear);
    }
  }, [selectedYear]);

  // Handle play/pause animation
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentYear((prev) => {
          const next = prev + 1;
          if (next > maxYear) {
            setIsPlaying(false);
            return minYear;
          }
          return next;
        });
      }, 1000); // 1 year per second
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, maxYear, minYear]);

  // Emit changes
  useEffect(() => {
    onChange(currentYear);
  }, [currentYear, onChange]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value, 10);
    setCurrentYear(year);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (!isPlaying && currentYear >= maxYear) {
      setCurrentYear(minYear);
    }
    setIsPlaying((prev) => !prev);
  }, [isPlaying, currentYear, maxYear, minYear]);

  const skipBack = useCallback(() => {
    setCurrentYear(minYear);
    setIsPlaying(false);
  }, [minYear]);

  const skipForward = useCallback(() => {
    setCurrentYear(maxYear);
    setIsPlaying(false);
  }, [maxYear]);

  const handleShowAll = useCallback(() => {
    onChange(null);
    setIsPlaying(false);
  }, [onChange]);

  // Calculate position for year labels
  const yearLabels = YEARS.filter((y) => y >= minYear && y <= maxYear);
  const showEveryNthYear = yearLabels.length > 10 ? 2 : 1;

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-[1000] pointer-events-none px-4 py-3 ${className}`}
    >
      <div className="mx-auto max-w-4xl pointer-events-auto bg-gradient-to-t from-black/60 via-black/40 to-transparent rounded-t-xl px-4 py-3">
        {/* Controls row */}
        <div className="flex items-center gap-3 mb-2">
          {/* Play controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={skipBack}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Na začetek"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-lg"
              title={isPlaying ? 'Pavza' : 'Predvajaj'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <button
              onClick={skipForward}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Na konec"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Current year display */}
          <div className="flex-1 flex items-center justify-center">
            <span className="text-3xl font-bold text-white tabular-nums tracking-tight drop-shadow-lg">
              {currentYear}
            </span>
          </div>

          {/* Show all button */}
          <button
            onClick={handleShowAll}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedYear === null
                ? 'bg-emerald-600 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Vse
          </button>
        </div>

        {/* Slider row */}
        <div className="relative">
          {/* Year labels */}
          <div className="flex justify-between px-1 mb-1">
            {yearLabels.map((year, idx) =>
              idx % showEveryNthYear === 0 ? (
                <span
                  key={year}
                  className={`text-xs font-medium transition-colors ${
                    year === currentYear ? 'text-emerald-400' : 'text-white/60'
                  }`}
                >
                  {year}
                </span>
              ) : (
                <span key={year} className="text-xs text-transparent">
                  {year}
                </span>
              )
            )}
          </div>

          {/* Slider track with year markers */}
          <div className="relative h-2 bg-white/20 rounded-full">
            {/* Progress fill */}
            <div
              className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-100"
              style={{
                width: `${((currentYear - minYear) / (maxYear - minYear)) * 100}%`,
              }}
            />
            {/* Year tick marks */}
            <div className="absolute inset-0 flex justify-between px-0.5">
              {yearLabels.map((year) => (
                <div
                  key={year}
                  className={`w-0.5 h-full rounded-full ${
                    year <= currentYear ? 'bg-emerald-300/50' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Invisible range input for interaction */}
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={currentYear}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ top: '-8px', height: 'calc(100% + 16px)' }}
          />
        </div>

        {/* Info text */}
        <p className="text-center text-xs text-white/50 mt-2">
          Premikaj drsnik za prikaz cen po letih • Klikni &quot;Vse&quot; za skupni prikaz
        </p>
      </div>
    </div>
  );
}
