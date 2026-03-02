import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get parameters from URL
  const title = searchParams.get('title') || 'Cene Nepremičnin';
  const subtitle = searchParams.get('subtitle') || 'Interaktivni zemljevid cen nepremičnin v Sloveniji';
  const type = searchParams.get('type') || 'default'; // default, statistika, lestvica, lokacija
  const stat = searchParams.get('stat') || ''; // e.g., "2.450 €/m²"
  const statLabel = searchParams.get('statLabel') || ''; // e.g., "Mediana cene"

  // Colors based on type
  const colors = {
    default: { bg: '#059669', accent: '#10b981' }, // emerald
    statistika: { bg: '#2563eb', accent: '#3b82f6' }, // blue
    lestvica: { bg: '#7c3aed', accent: '#8b5cf6' }, // violet
    lokacija: { bg: '#0891b2', accent: '#06b6d4' }, // cyan
    novogradnje: { bg: '#7c3aed', accent: '#a78bfa' }, // violet
  };

  const color = colors[type as keyof typeof colors] || colors.default;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Top gradient bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: `linear-gradient(90deg, ${color.bg} 0%, ${color.accent} 100%)`,
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '60px 80px',
            height: '100%',
          }}
        >
          {/* Logo / Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: color.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
              }}
            >
              {/* House icon SVG */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              CeneNepremičnin.com
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: title.length > 40 ? '48px' : '56px',
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1.2,
              marginBottom: '20px',
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '28px',
              color: '#6b7280',
              lineHeight: 1.4,
              maxWidth: '800px',
              marginBottom: stat ? '40px' : '0',
            }}
          >
            {subtitle}
          </p>

          {/* Stat highlight (if provided) */}
          {stat && (
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '16px',
                padding: '20px 32px',
                backgroundColor: '#f9fafb',
                borderRadius: '16px',
                border: `2px solid ${color.accent}`,
              }}
            >
              <span
                style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  color: color.bg,
                }}
              >
                {stat}
              </span>
              {statLabel && (
                <span
                  style={{
                    fontSize: '24px',
                    color: '#6b7280',
                  }}
                >
                  {statLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom info bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            padding: '20px 80px',
            backgroundColor: '#f9fafb',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '18px',
              color: '#6b7280',
            }}
          >
            Podatki: GURS ETN 2007–2025 • 300.000+ transakcij
          </span>
          <span
            style={{
              fontSize: '18px',
              color: '#9ca3af',
            }}
          >
            cenenepremicnin.com
          </span>
        </div>

        {/* Decorative element */}
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '80px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${color.accent}22 0%, ${color.bg}11 100%)`,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
