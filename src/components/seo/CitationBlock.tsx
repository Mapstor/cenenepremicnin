'use client';

import { useState } from 'react';
import { Quote, Copy, Check } from 'lucide-react';

interface CitationBlockProps {
  pageTitle?: string;
  pageUrl?: string;
  className?: string;
  variant?: 'full' | 'compact';
}

export default function CitationBlock({
  pageTitle,
  pageUrl,
  className = '',
  variant = 'full',
}: CitationBlockProps) {
  const [copied, setCopied] = useState(false);

  const currentYear = new Date().getFullYear();
  const title = pageTitle || 'Cene Nepremičnin';
  const url = pageUrl || 'https://cenenepremicnin.com';

  const citations = {
    short: `Vir: CeneNepremičnin.com, podatki GURS ETN 2007-${currentYear}`,
    standard: `CeneNepremičnin.com. (${currentYear}). ${title}. Podatki: GURS ETN. Dostopno na: ${url}`,
    academic: `CeneNepremičnin.com. (${currentYear}). ${title} [Podatkovna vizualizacija]. Vir podatkov: Geodetska uprava RS, Evidenca trga nepremičnin 2007-${currentYear}. Pridobljeno z ${url}`,
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`text-sm text-gray-500 flex items-center gap-2 ${className}`}>
        <Quote className="w-4 h-4 flex-shrink-0" />
        <span>{citations.short}</span>
        <button
          onClick={() => copyToClipboard(citations.short)}
          className="text-emerald-600 hover:text-emerald-700 ml-1"
          title="Kopiraj citat"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  return (
    <section className={`bg-gray-50 rounded-xl p-6 border border-gray-200 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Quote className="w-5 h-5 text-emerald-600" />
        <h3 className="font-semibold text-gray-900">Kako citirati te podatke</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Kratka oblika
            </span>
            <button
              onClick={() => copyToClipboard(citations.short)}
              className="text-emerald-600 hover:text-emerald-700 text-xs flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              Kopiraj
            </button>
          </div>
          <div className="bg-white rounded-lg p-3 text-sm text-gray-700 border border-gray-200 font-mono">
            {citations.short}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Standardna oblika
            </span>
            <button
              onClick={() => copyToClipboard(citations.standard)}
              className="text-emerald-600 hover:text-emerald-700 text-xs flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              Kopiraj
            </button>
          </div>
          <div className="bg-white rounded-lg p-3 text-sm text-gray-700 border border-gray-200">
            {citations.standard}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Akademska oblika
            </span>
            <button
              onClick={() => copyToClipboard(citations.academic)}
              className="text-emerald-600 hover:text-emerald-700 text-xs flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              Kopiraj
            </button>
          </div>
          <div className="bg-white rounded-lg p-3 text-sm text-gray-700 border border-gray-200">
            {citations.academic}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Pri uporabi podatkov v publikacijah, člankih ali raziskavah vas prosimo, da
        navedete vir. Osnovni podatki so javno dostopni iz Evidence trga nepremičnin (GURS).
      </p>
    </section>
  );
}

// Simple inline citation for footer or small spaces
export function InlineCitation({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-gray-500 ${className}`}>
      Vir podatkov: GURS ETN, SI-STAT, Eurostat. © {new Date().getFullYear()} CeneNepremičnin.com
    </p>
  );
}
