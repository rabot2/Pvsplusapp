import { useApp } from '../context/AppContext'
import { bookingConfig } from '../theme'
import type { PendingBooking } from '../types'

const TOTAL_SECONDS = 120
const RADIUS = 26
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface UndoBannerInnerProps {
  pendingBooking: PendingBooking
  onUndo: () => void
}

function UndoBannerInner({ pendingBooking, onUndo }: UndoBannerInnerProps) {
  const { booking, remainingSeconds } = pendingBooking
  const config = bookingConfig[booking.type]

  const progress = remainingSeconds / TOTAL_SECONDS
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        zIndex: 200,
        animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        padding: '0 12px 8px',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100%); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);   opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(0);   opacity: 1; }
          to   { transform: translateX(-50%) translateY(100%); opacity: 0; }
        }
        .undo-banner-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      <div
        style={{
          backgroundColor: config.color,
          borderRadius: 20,
          padding: '14px 16px',
          boxShadow: `0 8px 32px ${config.color}55, 0 2px 8px rgba(0,0,0,0.2)`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* Circular progress + icon */}
        <div style={{ position: 'relative', flexShrink: 0, width: 64, height: 64 }}>
          {/* SVG ring */}
          <svg
            width={64}
            height={64}
            style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
          >
            {/* Background track */}
            <circle
              cx={32}
              cy={32}
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={4}
            />
            {/* Progress arc */}
            <circle
              cx={32}
              cy={32}
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />
          </svg>
          {/* Center: icon + seconds */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0,
            }}
          >
            <span style={{ fontSize: 14 }}>{config.icon}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1,
              }}
            >
              {remainingSeconds}s
            </span>
          </div>
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.2,
              marginBottom: 3,
            }}
          >
            {config.label}
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.3,
            }}
          >
            Wird in {remainingSeconds}s übermittelt...
          </div>
        </div>

        {/* Undo button */}
        <button
          onClick={onUndo}
          style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            color: config.color,
            border: 'none',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'transform 0.1s ease, opacity 0.1s ease',
            WebkitAppearance: 'none',
            appearance: 'none',
          }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)' }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
          onTouchStart={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)' }}
          onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
        >
          Rückgängig
        </button>
      </div>
    </div>
  )
}

export default function UndoBanner() {
  const { state, undoPendingBooking } = useApp()

  if (!state.pendingBooking) return null

  return (
    <UndoBannerInner
      pendingBooking={state.pendingBooking}
      onUndo={undoPendingBooking}
    />
  )
}
