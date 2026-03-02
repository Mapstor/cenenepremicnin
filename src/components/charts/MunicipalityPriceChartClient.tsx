'use client';

import dynamic from 'next/dynamic';

const MunicipalityPriceChart = dynamic(
  () => import('@/components/charts/MunicipalityPriceChart'),
  {
    ssr: false,
    loading: () => <div className="h-[300px] bg-gray-50 animate-pulse rounded-lg" />,
  }
);

interface MunicipalityPriceChartClientProps {
  obcina: string;
}

export default function MunicipalityPriceChartClient({ obcina }: MunicipalityPriceChartClientProps) {
  return <MunicipalityPriceChart obcina={obcina} />;
}
