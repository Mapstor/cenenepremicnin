'use client';

import dynamic from 'next/dynamic';

const RankingTable = dynamic(
  () => import('@/components/rankings/RankingTable'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    ),
  }
);

interface RankingTableClientProps {
  dataUrl: string;
}

export default function RankingTableClient({ dataUrl }: RankingTableClientProps) {
  return <RankingTable dataUrl={dataUrl} />;
}
