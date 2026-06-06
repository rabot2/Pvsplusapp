import { useApp } from '../context/AppContext'
import { colors } from '../theme'

export default function Header() {
  const { state } = useApp()
  const { userName } = state.userSettings

  const initials = userName
    ? userName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : null

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        height: 56,
        backgroundColor: colors.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* Left: Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: colors.gold,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          🦅
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              color: colors.gold,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            Bundesrepublik
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: 8,
              letterSpacing: 0.3,
              lineHeight: 1.2,
            }}
          >
            Deutschland
          </div>
        </div>
      </div>

      {/* Center: Title */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 0.3,
          whiteSpace: 'nowrap',
        }}
      >
        Zeiterfassung
      </div>

      {/* Right: User initials or placeholder */}
      <div style={{ minWidth: 32, display: 'flex', justifyContent: 'flex-end' }}>
        {initials ? (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '1.5px solid rgba(255,255,255,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {initials}
          </div>
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}
          >
            👤
          </div>
        )}
      </div>
    </header>
  )
}
