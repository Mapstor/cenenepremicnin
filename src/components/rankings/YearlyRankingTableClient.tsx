'use client';

import dynamic from 'next/dynamic';

const YearlyRankingTable = dynamic(
  () => import('@/components/rankings/YearlyRankingTable'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    ),
  }
);

interface YearlyRankingTableClientProps {
  dataUrl: string;
}

export default function YearlyRankingTableClient({ dataUrl }: YearlyRankingTableClientProps) {
  return <YearlyRankingTable dataUrl={dataUrl} />;
}
