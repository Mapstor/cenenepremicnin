'use client';

import TransactionTable from '@/components/transactions/TransactionTable';

interface TransactionTableClientProps {
  limit?: number;
}

export default function TransactionTableClient({ limit }: TransactionTableClientProps) {
  return <TransactionTable limit={limit} />;
}
