'use client';

import { ReactNode } from 'react';
import { FilterProvider } from '@/hooks/useFilters';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return <FilterProvider>{children}</FilterProvider>;
}
