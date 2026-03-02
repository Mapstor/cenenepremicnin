'use client';

import dynamic from 'next/dynamic';

const PriceIndexChart = dynamic(
  () => import('@/components/charts/PriceIndexChart'),
  {
    ssr: false,
    loading: () => <div className="h-[400px] bg-gray-50 animate-pulse rounded-lg" />,
  }
);

export default function PriceIndexChartClient() {
  return <PriceIndexChart />;
}
