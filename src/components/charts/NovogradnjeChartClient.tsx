'use client';

import dynamic from 'next/dynamic';

const NovogradnjeChart = dynamic(
  () => import('@/components/charts/NovogradnjeChart'),
  {
    ssr: false,
    loading: () => <div className="h-[350px] bg-gray-50 animate-pulse rounded-lg" />,
  }
);

interface NovogradnjeChartClientProps {
  chartType: 'volume' | 'share' | 'prices' | 'count';
}

export default function NovogradnjeChartClient({ chartType }: NovogradnjeChartClientProps) {
  return <NovogradnjeChart chartType={chartType} />;
}
