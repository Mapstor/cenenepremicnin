'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQPageJsonLd } from './JsonLd';
import type { FAQItem } from './faq-data';

interface FAQSectionProps {
  title?: string;
  faqs: FAQItem[];
  className?: string;
  showSchema?: boolean;
}

export default function FAQSection({
  title = 'Pogosta vprašanja',
  faqs,
  className = '',
  showSchema = true,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`py-8 ${className}`}>
      {showSchema && <FAQPageJsonLd faqs={faqs} />}

      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="w-5 h-5 text-emerald-600" />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              aria-expanded={openIndex === index}
            >
              <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
