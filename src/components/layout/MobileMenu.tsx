'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import {
  Map,
  BarChart3,
  List,
  Trophy,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const iconMap = {
  Map,
  BarChart3,
  List,
  Trophy,
  Search,
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOOTER_LINKS = [
  { label: 'O nas', href: '/o-nas' },
  { label: 'Kontakt', href: '/kontakt' },
  { label: 'Zasebnost', href: '/zasebnost' },
  { label: 'Pogoji uporabe', href: '/pogoji-uporabe' },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const prevPathnameRef = useRef(pathname);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close menu on route change (but not on initial mount)
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      onClose();
      prevPathnameRef.current = pathname;
    }
  }, [pathname, onClose]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const toggleSection = (href: string) => {
    setExpandedSection(expandedSection === href ? null : href);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Slide-in drawer */}
      <div
        className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <span className="text-lg font-semibold text-gray-900">Meni</span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Zapri meni"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                const hasChildren = 'children' in item && item.children;
                const isExpanded = expandedSection === item.href;

                return (
                  <li key={item.href}>
                    {hasChildren ? (
                      <>
                        {/* Expandable section */}
                        <button
                          type="button"
                          onClick={() => toggleSection(item.href)}
                          className={`w-full flex items-center justify-between px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                            isActive(item.href)
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-gray-700 hover:text-emerald-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="w-5 h-5" />
                            {item.label}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>

                        {/* Expandable children */}
                        <div
                          className={`overflow-hidden transition-all duration-200 ease-in-out ${
                            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <ul className="mt-1 ml-8 space-y-1 pb-2">
                            {/* Link to main section page */}
                            <li>
                              <Link
                                href={item.href}
                                onClick={onClose}
                                className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                  pathname === item.href
                                    ? 'text-emerald-700 bg-emerald-50'
                                    : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                                }`}
                              >
                                Vse lestvice
                              </Link>
                            </li>
                            {item.children.map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                    isActive(child.href)
                                      ? 'text-emerald-700 bg-emerald-50'
                                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                          isActive(item.href)
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-gray-700 hover:text-emerald-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer links */}
          <div className="border-t border-gray-200 px-4 py-4">
            <ul className="grid grid-cols-2 gap-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive(link.href)
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-gray-500 hover:text-emerald-700 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
