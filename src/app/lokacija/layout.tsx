import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Išči lokacijo – Cene nepremičnin v bližini | Cene Nepremičnin',
  description:
    'Poiščite cene nepremičnin v bližini kateregakoli naslova v Sloveniji. Analizirajte mediano cen, zadnje transakcije in primerjajte cene v okolici.',
};

export default function LokacijaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
