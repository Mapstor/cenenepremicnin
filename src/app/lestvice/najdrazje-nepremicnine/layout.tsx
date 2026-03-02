import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Top 100 najdražjih nepremičnin v Sloveniji | Cene Nepremičnin',
  description:
    'Lestvica 100 najdražjih prodanih nepremičnin v Sloveniji od leta 2007. Stanovanja, hiše, poslovni prostori in več.',
};

export default function NajdrazjeNepremicnineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
