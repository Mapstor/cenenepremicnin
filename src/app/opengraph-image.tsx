import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Cene Nepremičnin - Interaktivni zemljevid cen nepremičnin v Sloveniji';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
            background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
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
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
              }}
            >
              <svg
                width="32"
                height="32"
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
                fontSize: '28px',
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
              fontSize: '64px',
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1.1,
              marginBottom: '24px',
            }}
          >
            Cene Nepremičnin
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '32px',
              color: '#6b7280',
              lineHeight: 1.3,
              maxWidth: '700px',
              marginBottom: '48px',
            }}
          >
            Interaktivni zemljevid cen nepremičnin v Sloveniji
          </p>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: '48px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  fontSize: '44px',
                  fontWeight: 700,
                  color: '#059669',
                }}
              >
                300.000+
              </span>
              <span
                style={{
                  fontSize: '20px',
                  color: '#6b7280',
                }}
              >
                transakcij
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  fontSize: '44px',
                  fontWeight: 700,
                  color: '#059669',
                }}
              >
                212
              </span>
              <span
                style={{
                  fontSize: '20px',
                  color: '#6b7280',
                }}
              >
                občin
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  fontSize: '44px',
                  fontWeight: 700,
                  color: '#059669',
                }}
              >
                2007–2025
              </span>
              <span
                style={{
                  fontSize: '20px',
                  color: '#6b7280',
                }}
              >
                obdobje
              </span>
            </div>
          </div>
        </div>

        {/* Bottom info bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            padding: '24px 80px',
            backgroundColor: '#f9fafb',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '20px',
              color: '#6b7280',
            }}
          >
            Uradni podatki GURS • Brezplačno • Ažurno
          </span>
          <span
            style={{
              fontSize: '20px',
              color: '#9ca3af',
            }}
          >
            cenenepremicnin.com
          </span>
        </div>

        {/* Decorative Slovenia shape hint */}
        <div
          style={{
            position: 'absolute',
            top: '100px',
            right: '60px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b98122 0%, #05966911 100%)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
