import { useState, useCallback } from 'react'
import {
  KernButton,
  KernInput,
  KernAlert,
} from '@kern-ux-annex/kern-react-kit'
import { useApp } from '../context/AppContext'
import { apiService } from '../services/api'
import { colors } from '../theme'
import type { UserSettings } from '../types'

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
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
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
        padding: '4px 0 2px',
      }}
    >
      {title}
    </div>
  )
}

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
    updateSettings({ ...state.userSettings, authToken: '', userName: '', department: '' })
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

  const connectionLabel =
    connectionStatus === 'testing' ? 'Teste Verbindung...' :
    connectionStatus === 'ok'      ? '✓ Verbindung erfolgreich' :
    connectionStatus === 'error'   ? '✗ Verbindung fehlgeschlagen' :
                                     'Verbindung testen'

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
        <KernInput
          label="API-URL"
          type="url"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="https://api.example.com"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />

        {connectionStatus === 'ok' && (
          <KernAlert title="Verbindung erfolgreich" variant="success" />
        )}
        {connectionStatus === 'error' && (
          <KernAlert title="Verbindung fehlgeschlagen" variant="danger">
            Der Server ist nicht erreichbar. Bitte API-URL prüfen.
          </KernAlert>
        )}

        <KernButton
          label={connectionLabel}
          variant={connectionStatus === 'ok' ? 'success' : 'secondary'}
          block
          disabled={connectionStatus === 'testing' || !apiUrl}
          onClick={() => { void handleTestConnection() }}
        />
      </SectionCard>

      {/* ── Anmeldung ── */}
      <SectionHeader title="Anmeldung" />
      <SectionCard>
        {isLoggedIn ? (
          <>
            <KernAlert title={`Angemeldet als ${state.userSettings.userName}`} variant="success">
              {state.userSettings.department || 'Bundesverwaltung'}
            </KernAlert>
            <KernButton
              label="Abmelden"
              variant="danger"
              block
              onClick={handleLogout}
            />
          </>
        ) : (
          <>
            <KernInput
              label="Benutzername"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="max.mustermann"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <KernInput
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoCapitalize="off"
              autoCorrect="off"
            />

            {loginError && (
              <KernAlert title="Anmeldung fehlgeschlagen" variant="danger">
                {loginError}
              </KernAlert>
            )}
            {loginStatus === 'success' && (
              <KernAlert title="Erfolgreich angemeldet" variant="success" />
            )}

            <KernButton
              label={loginStatus === 'loading' ? 'Anmeldung läuft...' : 'Anmelden'}
              variant="primary"
              block
              disabled={loginStatus === 'loading' || !username || !password}
              onClick={() => { void handleLogin() }}
            />
          </>
        )}
      </SectionCard>

      {/* ── App-Info ── */}
      <SectionHeader title="App-Info" />
      <SectionCard>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 0',
            borderBottom: `1px solid ${colors.border}`,
            paddingBottom: 12,
          }}
        >
          <span style={{ fontSize: 14, color: colors.text }}>Version</span>
          <span style={{ fontSize: 14, color: colors.textSecondary, fontWeight: 500 }}>1.0.0</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 0',
            borderBottom: `1px solid ${colors.border}`,
            paddingBottom: 12,
          }}
        >
          <span style={{ fontSize: 14, color: colors.text }}>Buchungen gespeichert</span>
          <span style={{ fontSize: 14, color: colors.textSecondary, fontWeight: 500 }}>
            {state.bookings.length}
          </span>
        </div>
        <KernButton
          label="Alle Daten löschen"
          variant="danger"
          block
          onClick={handleClearAll}
        />
      </SectionCard>
    </div>
  )
}
