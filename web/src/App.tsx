import { AppProvider, useApp } from './context/AppContext'
import Header from './components/Header'
import HomeScreen from './screens/HomeScreen'
import HistoryScreen from './screens/HistoryScreen'
import SettingsScreen from './screens/SettingsScreen'
import { colors } from './theme'

// ─────────────────────────────────────────────
// Bottom Tab Bar
// ─────────────────────────────────────────────

interface Tab {
  id: 'home' | 'history' | 'settings'
  label: string
  icon: string
  activeIcon: string
}

const TABS: Tab[] = [
  { id: 'home', label: 'Buchung', icon: '🏠', activeIcon: '🏠' },
  { id: 'history', label: 'Verlauf', icon: '📋', activeIcon: '📋' },
  { id: 'settings', label: 'Einstellungen', icon: '⚙️', activeIcon: '⚙️' },
]

function TabBar() {
  const { state, setActiveTab } = useApp()
  const activeTab = state.activeTab

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        height: 80,
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 100,
        // Safe area for iPhone home indicator
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              padding: '8px 4px',
              gap: 3,
              WebkitAppearance: 'none',
              appearance: 'none',
              outline: 'none',
              transition: 'opacity 0.15s ease',
              // Active indicator bar at top
              borderTop: isActive
                ? `2.5px solid ${colors.primary}`
                : '2.5px solid transparent',
            }}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span
              style={{
                fontSize: 22,
                lineHeight: 1,
                filter: isActive ? 'none' : 'grayscale(100%) opacity(0.5)',
                transition: 'filter 0.15s ease',
              }}
            >
              {isActive ? tab.activeIcon : tab.icon}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? colors.primary : colors.textSecondary,
                letterSpacing: 0.2,
                transition: 'color 0.15s ease',
              }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// ─────────────────────────────────────────────
// Main App shell (inside AppProvider)
// ─────────────────────────────────────────────

function AppShell() {
  const { state } = useApp()
  const activeTab = state.activeTab

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 430,
        minHeight: '100vh',
        margin: '0 auto',
        backgroundColor: colors.background,
        // Simulate phone chrome on desktop
        boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 8px 48px rgba(0,0,0,0.18)',
      }}
    >
      {/* Fixed header */}
      <Header />

      {/* Scrollable content area */}
      <main
        style={{
          paddingTop: 56, // header height
          paddingBottom: 80, // tab bar height
          minHeight: '100vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
      >
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>

      {/* Fixed bottom tab bar */}
      <TabBar />
    </div>
  )
}

// ─────────────────────────────────────────────
// Root App with global styles
// ─────────────────────────────────────────────

export default function App() {
  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }
        body {
          background: #1D1D1B;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
          overflow-x: hidden;
        }
        input, button, select, textarea {
          font-family: inherit;
        }
        /* Remove number input spinners */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* Smooth scroll */
        ::-webkit-scrollbar {
          width: 0;
          background: transparent;
        }
      `}</style>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </>
  )
}
