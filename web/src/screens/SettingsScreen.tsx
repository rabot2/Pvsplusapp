import { useState, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { apiService } from '../services/api'
import { colors } from '../theme'
import type { UserSettings } from '../types'

// ─────────────────────────────────────────────
// Reusable UI helpers
// ─────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 6px rgba(0,59,111,0.07)',
        border: `1px solid ${colors.border}`,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.9,
        padding: '16px 16px 6px',
      }}
    >
      {title}
    </div>
  )
}

interface InputRowProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  autoCapitalize?: React.HTMLAttributes<HTMLInputElement>['autoCapitalize']
}

function InputRow({ label, value, onChange, placeholder, type = 'text', autoCapitalize }: InputRowProps) {
  return (
    <div
      style={{
        padding: '10px 16px',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <label
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 600,
          color: colors.textSecondary,
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize ?? 'off'}
        autoCorrect="off"
        spellCheck={false}
        style={{
          width: '100%',
          border: `1.5px solid ${colors.border}`,
          borderRadius: 10,
          padding: '10px 12px',
          fontSize: 15,
          color: colors.text,
          backgroundColor: '#FAFAFA',
          outline: 'none',
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
        onFocus={(e) => {
          ;(e.target as HTMLInputElement).style.borderColor = colors.primary
          ;(e.target as HTMLInputElement).style.backgroundColor = '#FFFFFF'
        }}
        onBlur={(e) => {
          ;(e.target as HTMLInputElement).style.borderColor = colors.border
          ;(e.target as HTMLInputElement).style.backgroundColor = '#FAFAFA'
        }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// PasswordRow with show/hide toggle
// ─────────────────────────────────────────────

interface PasswordRowProps {
  value: string
  onChange: (v: string) => void
}

function PasswordRow({ value, onChange }: PasswordRowProps) {
  const [show, setShow] = useState(false)

  return (
    <div
      style={{
        padding: '10px 16px',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <label
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 600,
          color: colors.textSecondary,
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        Passwort
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoCapitalize="off"
          autoCorrect="off"
          style={{
            width: '100%',
            border: `1.5px solid ${colors.border}`,
            borderRadius: 10,
            padding: '10px 44px 10px 12px',
            fontSize: 15,
            color: colors.text,
            backgroundColor: '#FAFAFA',
            outline: 'none',
            WebkitAppearance: 'none',
            appearance: 'none',
          }}
          onFocus={(e) => {
            ;(e.target as HTMLInputElement).style.borderColor = colors.primary
            ;(e.target as HTMLInputElement).style.backgroundColor = '#FFFFFF'
          }}
          onBlur={(e) => {
            ;(e.target as HTMLInputElement).style.borderColor = colors.border
            ;(e.target as HTMLInputElement).style.backgroundColor = '#FAFAFA'
          }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            color: colors.textSecondary,
            padding: '4px',
            lineHeight: 1,
          }}
          aria-label={show ? 'Passwort verbergen' : 'Passwort anzeigen'}
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// SettingsScreen
// ─────────────────────────────────────────────

export default function SettingsScreen() {
  const { state, updateSettings, clearAllData } = useApp()

  const [apiUrl, setApiUrl] = useState(state.userSettings.apiUrl)
  const [username, setUsername] = useState(state.userSettings.username)
  const [password, setPassword] = useState(state.userSettings.password)

  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [loginError, setLoginError] = useState('')

  const isLoggedIn = Boolean(state.userSettings.authToken)

  const handleTestConnection = useCallback(async () => {
    setConnectionStatus('testing')
    try {
      await apiService.testConnection(apiUrl)
      setConnectionStatus('ok')
      // Persist apiUrl
      updateSettings({ ...state.userSettings, apiUrl })
    } catch {
      setConnectionStatus('error')
    }
  }, [apiUrl, state.userSettings, updateSettings])

  const handleLogin = useCallback(async () => {
    setLoginStatus('loading')
    setLoginError('')
    try {
      const result = await apiService.login(apiUrl, username, password)
      const newSettings: UserSettings = {
        apiUrl,
        username,
        password,
        authToken: result.token,
        userName: result.name,
        department: result.department,
      }
      updateSettings(newSettings)
      setLoginStatus('success')
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'Anmeldung fehlgeschlagen')
      setLoginStatus('error')
    }
  }, [apiUrl, username, password, updateSettings])

  const handleLogout = useCallback(() => {
    const newSettings: UserSettings = {
      ...state.userSettings,
      authToken: '',
      userName: '',
      department: '',
    }
    updateSettings(newSettings)
    setLoginStatus('idle')
    setLoginError('')
  }, [state.userSettings, updateSettings])

  const handleClearAll = useCallback(() => {
    const confirmed = window.confirm(
      'Alle lokalen Daten löschen?\n\nDieser Vorgang kann nicht rückgängig gemacht werden.'
    )
    if (confirmed) {
      clearAllData()
      setApiUrl('')
      setUsername('')
      setPassword('')
      setConnectionStatus('idle')
      setLoginStatus('idle')
      setLoginError('')
    }
  }, [clearAllData])

  return (
    <div
      style={{
        minHeight: '100%',
        backgroundColor: colors.background,
        padding: '16px 16px 32px',
      }}
    >
      {/* ── Verbindung ── */}
      <SectionHeader title="Verbindung" />
      <SectionCard>
        <InputRow
          label="API-URL"
          value={apiUrl}
          onChange={setApiUrl}
          placeholder="https://api.example.com"
          type="url"
        />
        <div style={{ padding: '10px 16px 14px' }}>
          <button
            onClick={() => { void handleTestConnection() }}
            disabled={connectionStatus === 'testing' || !apiUrl}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              border: `1.5px solid ${colors.primary}`,
              backgroundColor:
                connectionStatus === 'testing' ? '#F3F4F6' : 'transparent',
              color: colors.primary,
              fontSize: 14,
              fontWeight: 600,
              cursor: connectionStatus === 'testing' || !apiUrl ? 'not-allowed' : 'pointer',
              opacity: !apiUrl ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.15s ease',
            }}
          >
            {connectionStatus === 'testing' && '⏳ Teste Verbindung...'}
            {connectionStatus === 'ok' && '✅ Verbindung erfolgreich'}
            {connectionStatus === 'error' && '❌ Verbindung fehlgeschlagen'}
            {connectionStatus === 'idle' && '🔌 Verbindung testen'}
          </button>
        </div>
      </SectionCard>

      {/* ── Anmeldung ── */}
      <SectionHeader title="Anmeldung" />
      <SectionCard>
        {isLoggedIn ? (
          /* Logged in state */
          <div style={{ padding: '14px 16px' }}>
            <div
              style={{
                backgroundColor: '#E8F5E9',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 12,
                border: '1px solid #A5D6A7',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#1B5E20',
                  marginBottom: 4,
                }}
              >
                ✓ Angemeldet
              </div>
              <div style={{ fontSize: 14, color: colors.text, fontWeight: 600 }}>
                {state.userSettings.userName}
              </div>
              {state.userSettings.department && (
                <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  {state.userSettings.department}
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                border: '1.5px solid #C62828',
                backgroundColor: 'transparent',
                color: '#C62828',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Abmelden
            </button>
          </div>
        ) : (
          /* Login form */
          <>
            <InputRow
              label="Benutzername"
              value={username}
              onChange={setUsername}
              placeholder="max.mustermann"
              autoCapitalize="none"
            />
            <PasswordRow value={password} onChange={setPassword} />
            {loginError ? (
              <div
                style={{
                  margin: '0 16px 8px',
                  padding: '10px 12px',
                  backgroundColor: '#FFEBEE',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#C62828',
                  border: '1px solid #FFCDD2',
                }}
              >
                ⚠️ {loginError}
              </div>
            ) : null}
            <div style={{ padding: '10px 16px 14px' }}>
              <button
                onClick={() => { void handleLogin() }}
                disabled={loginStatus === 'loading' || !username || !password}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor:
                    loginStatus === 'loading' || !username || !password
                      ? '#9CA3AF'
                      : colors.primary,
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor:
                    loginStatus === 'loading' || !username || !password
                      ? 'not-allowed'
                      : 'pointer',
                  transition: 'background 0.15s ease',
                  letterSpacing: 0.2,
                }}
              >
                {loginStatus === 'loading' ? '⏳ Anmeldung...' : 'Anmelden'}
              </button>
            </div>
          </>
        )}
      </SectionCard>

      {/* ── App-Info ── */}
      <SectionHeader title="App-Info" />
      <SectionCard>
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <span style={{ fontSize: 14, color: colors.text }}>Version</span>
          <span
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              fontWeight: 500,
            }}
          >
            1.0.0
          </span>
        </div>
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <span style={{ fontSize: 14, color: colors.text }}>Buchungen gespeichert</span>
          <span
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              fontWeight: 500,
            }}
          >
            {state.bookings.length}
          </span>
        </div>
        <div style={{ padding: '10px 16px 14px' }}>
          <button
            onClick={handleClearAll}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              border: '1.5px solid #C62828',
              backgroundColor: 'transparent',
              color: '#C62828',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            🗑 Alle Daten löschen
          </button>
        </div>
      </SectionCard>
    </div>
  )
}
