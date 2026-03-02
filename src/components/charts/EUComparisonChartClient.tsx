'use client';

import dynamic from 'next/dynamic';

const EUComparisonChart = dynamic(
  () => import('@/components/charts/EUComparisonChart'),
  {
    ssr: false,
    loading: () => <div className="h-[400px] bg-gray-50 animate-pulse rounded-lg" />,
  }
);

export default function EUComparisonChartClient() {
  return <EUComparisonChart />;
}
