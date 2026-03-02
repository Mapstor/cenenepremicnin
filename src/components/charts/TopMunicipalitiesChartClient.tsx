'use client';

import dynamic from 'next/dynamic';

const TopMunicipalitiesChart = dynamic(
  () => import('@/components/charts/TopMunicipalitiesChart'),
  {
    ssr: false,
    loading: () => <div className="h-[500px] bg-gray-50 animate-pulse rounded-lg" />,
  }
);

interface TopMunicipalitiesChartClientProps {
  limit?: number;
}

export default function TopMunicipalitiesChartClient({ limit }: TopMunicipalitiesChartClientProps) {
  return <TopMunicipalitiesChart limit={limit} />;
}
