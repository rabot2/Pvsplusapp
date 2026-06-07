import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { bookingConfig, colors } from '../theme'
import type { Booking } from '../types'

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function formatTodayDate(): string {
  const d = new Date()
  const weekdays = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.']
  const months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
  return `${weekdays[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`
}

function isSameDay(isoString: string, date: Date): boolean {
  const d = new Date(isoString)
  return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate()
}

function getStatus(todayBookings: Booking[]): { label: string; color: string; bg: string } {
  if (todayBookings.length === 0) return { label: 'Noch nicht gebucht', color: '#6B7280', bg: '#F3F4F6' }
  const last = todayBookings[todayBookings.length - 1]
  if (last.type === 'KOMMEN')        return { label: 'Anwesend', color: '#1B5E20', bg: '#E8F5E9' }
  if (last.type === 'MOBILES_KOMMEN') return { label: 'Mobil',    color: '#1565C0', bg: '#E3F2FD' }
  return { label: 'Abwesend', color: '#6B7280', bg: '#F3F4F6' }
}

export default function StatusCard() {
  const { state } = useApp()
  const today = useMemo(() => new Date(), [])

  const todayBookings = useMemo(
    () => state.bookings
      .filter(b => isSameDay(b.timestamp, today) && b.status !== 'cancelled')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [state.bookings, today]
  )

  const status = getStatus(todayBookings)
  const recent = todayBookings.slice(-3)

  return (
    <div style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, boxShadow: '0 2px 12px rgba(0,59,111,0.08)', border: `1px solid ${colors.border}`, marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600, marginBottom: 2 }}>Heute</div>
          <div style={{ fontSize: 14, color: colors.text, fontWeight: 500 }}>{formatTodayDate()}</div>
        </div>
        <div style={{ backgroundColor: status.bg, color: status.color, borderRadius: 20, padding: '5px 12px', fontSize: 13, fontWeight: 700, border: `1.5px solid ${status.color}44` }}>
          {status.label}
        </div>
      </div>
      <div style={{ height: 1, backgroundColor: colors.border, marginBottom: 12 }} />
      {recent.length === 0 ? (
        <div style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 13, padding: '8px 0' }}>Noch keine Buchungen heute</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recent.map(b => {
            const cfg = bookingConfig[b.type]
            return (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: cfg.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.text, minWidth: 40 }}>{formatTime(b.timestamp)}</span>
                <span style={{ fontSize: 13, color: cfg.color, fontWeight: 500, flex: 1 }}>{cfg.label}</span>
                {b.status === 'pending' && (
                  <span style={{ fontSize: 11, color: '#F59E0B' }}>⏳</span>
                )}
                {b.status === 'failed' && (
                  <span style={{ fontSize: 13, color: '#C62828', opacity: 0.7 }} title="Übertragung fehlgeschlagen">⚠︎</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
