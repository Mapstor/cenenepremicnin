import Link from 'next/link';
import { FOOTER } from '@/lib/constants';
import { Map, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission */}
        <div className="mb-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Map className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Cene Nepremičnin
            </span>
          </div>
          <p className="text-gray-400 leading-relaxed">{FOOTER.mission}</p>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {FOOTER.columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Kontakt
            </h3>
            <a
              href={`mailto:${FOOTER.contact}`}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="break-all">{FOOTER.contact}</span>
            </a>
          </div>
        </div>

        {/* Attribution */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              {FOOTER.attribution.map((line, i) => (
                <p key={i} className="text-xs text-gray-500">
                  {line}
                </p>
              ))}
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span className="text-base">🇸🇮</span>
              {FOOTER.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
