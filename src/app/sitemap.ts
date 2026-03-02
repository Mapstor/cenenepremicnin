import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

interface MunicipalityData {
  obcina: string;
}

// Convert obcina name to slug (matches logic in [slug]/page.tsx)
function obcinaToSlug(obcina: string): string {
  return obcina
    .toLowerCase()
    .replace(/č/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/\s+/g, '-');
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cenenepremicnin.com';
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/statistika`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lokacija`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/prodaje`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lestvice`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lestvice/najdrazje-nepremicnine`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lestvice/najdrazja-stanovanja`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lestvice/najdrazje-hise`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lestvice/najdrazja-cena-m2`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lestvice/najdrazje-obcine`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lestvice/najvecje-podrazitve`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lestvice/najcenejsa-stanovanja-ljubljana`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lestvice/novogradnje`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/o-nas`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/o-podatkih`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/zasebnost`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/pogoji-uporabe`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic municipality pages
  let municipalityPages: MetadataRoute.Sitemap = [];

  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'aggregated-obcine.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as MunicipalityData[];

    municipalityPages = data.map((municipality) => ({
      url: `${baseUrl}/statistika/${obcinaToSlug(municipality.obcina)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error loading municipality data for sitemap:', error);
  }

  return [...staticPages, ...municipalityPages];
}
