'use client';

import dynamic from 'next/dynamic';

const MunicipalityRankingTable = dynamic(
  () => import('@/components/rankings/MunicipalityRankingTable'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    ),
  }
);

interface MunicipalityRankingTableClientProps {
  dataUrl: string;
  showTrend?: boolean;
  className?: string;
}

export default function MunicipalityRankingTableClient({
  dataUrl,
  showTrend = false,
  className = '',
}: MunicipalityRankingTableClientProps) {
  return <MunicipalityRankingTable dataUrl={dataUrl} showTrend={showTrend} className={className} />;
}
