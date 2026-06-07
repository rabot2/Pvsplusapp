import { useState, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { apiService } from '../services/api'
import { colors } from '../theme'
import type { UserSettings } from '../types'

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,59,111,0.07)', border: `1px solid ${colors.border}`, marginBottom: 16 }}>{children}</div>
}

function SectionTitle({ title }: { title: string }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.9, padding: '16px 16px 6px' }}>{title}</div>
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ padding: '10px 16px', borderBottom: `1px solid ${colors.border}` }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textSecondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        autoCapitalize="off" autoCorrect="off" spellCheck={false}
        style={{ width: '100%', border: `1.5px solid ${focused ? colors.primary : colors.border}`, borderRadius: 10, padding: '10px 12px', fontSize: 15, color: colors.text, backgroundColor: focused ? '#fff' : '#FAFAFA', outline: 'none', WebkitAppearance: 'none', appearance: 'none' }}
      />
    </div>
  )
}

function Btn({ label, onClick, variant = 'secondary', disabled = false }: { label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'danger'; disabled?: boolean }) {
  const bg = variant === 'primary' ? (disabled ? '#9CA3AF' : colors.primary) : 'transparent'
  const border = variant === 'danger' ? '#C62828' : colors.primary
  const textColor = variant === 'primary' ? '#fff' : variant === 'danger' ? '#C62828' : colors.primary
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: '100%', padding: 12, borderRadius: 10, border: `1.5px solid ${disabled ? '#D1D5DB' : border}`, backgroundColor: bg, color: disabled ? '#9CA3AF' : textColor, fontSize: 14, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}>
      {label}
    </button>
  )
}

export default function SettingsScreen() {
  const { state, updateSettings, clearAllData } = useApp()
  const [apiUrl, setApiUrl]   = useState(state.userSettings.apiUrl)
  const [username, setUsername] = useState(state.userSettings.username)
  const [password, setPassword] = useState(state.userSettings.password)
  const [connStatus, setConnStatus] = useState<'idle'|'testing'|'ok'|'error'>('idle')
  const [loginStatus, setLoginStatus] = useState<'idle'|'loading'|'ok'|'error'>('idle')
  const [loginError, setLoginError] = useState('')
  const isLoggedIn = Boolean(state.userSettings.authToken)

  const testConnection = useCallback(async () => {
    setConnStatus('testing')
    try { await apiService.testConnection(apiUrl); setConnStatus('ok'); updateSettings({ ...state.userSettings, apiUrl }) }
    catch { setConnStatus('error') }
  }, [apiUrl, state.userSettings, updateSettings])

  const login = useCallback(async () => {
    setLoginStatus('loading'); setLoginError('')
    try {
      const r = await apiService.login(apiUrl, username, password)
      const s: UserSettings = { apiUrl, username, password, authToken: r.token, userName: r.name, department: r.department }
      updateSettings(s); setLoginStatus('ok')
    } catch (e) { setLoginError(e instanceof Error ? e.message : 'Anmeldung fehlgeschlagen'); setLoginStatus('error') }
  }, [apiUrl, username, password, updateSettings])

  const logout = useCallback(() => {
    updateSettings({ ...state.userSettings, authToken: '', userName: '', department: '' })
    setLoginStatus('idle'); setLoginError('')
  }, [state.userSettings, updateSettings])

  const clearAll = useCallback(() => {
    if (window.confirm('Alle lokalen Daten löschen?\n\nKann nicht rückgängig gemacht werden.')) {
      clearAllData(); setApiUrl(''); setUsername(''); setPassword(''); setConnStatus('idle'); setLoginStatus('idle'); setLoginError('')
    }
  }, [clearAllData])

  const connLabel = connStatus === 'testing' ? '⏳ Teste...' : connStatus === 'ok' ? '✓ Verbunden' : connStatus === 'error' ? '✗ Fehlgeschlagen – erneut testen' : '🔌 Verbindung testen'

  return (
    <div style={{ minHeight: '100%', backgroundColor: colors.background, padding: '16px 16px 32px' }}>
      <SectionTitle title="Verbindung" />
      <Card>
        <Field label="API-URL" value={apiUrl} onChange={setApiUrl} type="url" placeholder="https://api.example.com" />
        <div style={{ padding: '10px 16px 14px' }}>
          <Btn label={connLabel} onClick={() => void testConnection()} disabled={connStatus === 'testing' || !apiUrl} variant={connStatus === 'ok' ? 'primary' : 'secondary'} />
        </div>
      </Card>

      <SectionTitle title="Anmeldung" />
      <Card>
        {isLoggedIn ? (
          <div style={{ padding: 16 }}>
            <div style={{ backgroundColor: '#E8F5E9', borderRadius: 10, padding: '12px 14px', marginBottom: 12, border: '1px solid #A5D6A7' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1B5E20', marginBottom: 4 }}>✓ Angemeldet</div>
              <div style={{ fontSize: 14, color: colors.text, fontWeight: 600 }}>{state.userSettings.userName}</div>
              {state.userSettings.department && <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{state.userSettings.department}</div>}
            </div>
            <Btn label="Abmelden" onClick={logout} variant="danger" />
          </div>
        ) : (
          <>
            <Field label="Benutzername" value={username} onChange={setUsername} placeholder="max.mustermann" />
            <Field label="Passwort" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
            {loginError && <div style={{ margin: '0 16px 8px', padding: '10px 12px', backgroundColor: '#FFEBEE', borderRadius: 8, fontSize: 13, color: '#C62828', border: '1px solid #FFCDD2' }}>⚠️ {loginError}</div>}
            {loginStatus === 'ok' && <div style={{ margin: '0 16px 8px', padding: '10px 12px', backgroundColor: '#E8F5E9', borderRadius: 8, fontSize: 13, color: '#1B5E20', border: '1px solid #A5D6A7' }}>✓ Erfolgreich angemeldet</div>}
            <div style={{ padding: '10px 16px 14px' }}>
              <Btn label={loginStatus === 'loading' ? '⏳ Anmeldung...' : 'Anmelden'} onClick={() => void login()} disabled={loginStatus === 'loading' || !username || !password} variant="primary" />
            </div>
          </>
        )}
      </Card>

      <SectionTitle title="App-Info" />
      <Card>
        {[['Version', '1.0.0'], ['Buchungen gespeichert', String(state.bookings.length)]].map(([k, v]) => (
          <div key={k} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${colors.border}` }}>
            <span style={{ fontSize: 14, color: colors.text }}>{k}</span>
            <span style={{ fontSize: 14, color: colors.textSecondary, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
        <div style={{ padding: '10px 16px 14px' }}>
          <Btn label="🗑 Alle Daten löschen" onClick={clearAll} variant="danger" />
        </div>
      </Card>
    </div>
  )
}
