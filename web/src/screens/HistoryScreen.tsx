import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { bookingConfig, colors } from '../theme'
import type { Booking, BookingStatus } from '../types'

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${hh}:${mm}`
}

function toDateKey(isoString: string): string {
  const d = new Date(isoString)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDayHeader(dateKey: string): string {
  const d = new Date(dateKey + 'T12:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const todayKey = toDateKey(today.toISOString())
  const yesterdayKey = toDateKey(yesterday.toISOString())

  if (dateKey === todayKey) return 'Heute'
  if (dateKey === yesterdayKey) return 'Gestern'

  const weekdays = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.']
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = d.getFullYear()
  return `${weekdays[d.getDay()]} ${dd}.${mm}.${yy}`
}

function getStatusBadge(status: BookingStatus): { label: string; color: string; bg: string } {
  switch (status) {
    case 'sent':
      return { label: 'Übermittelt', color: '#1B5E20', bg: '#E8F5E9' }
    case 'pending':
      return { label: 'Ausstehend', color: '#B45309', bg: '#FEF3C7' }
    case 'failed':
      return { label: 'Fehlgeschlagen', color: '#C62828', bg: '#FFEBEE' }
    case 'cancelled':
      return { label: 'Abgebrochen', color: '#6B7280', bg: '#F3F4F6' }
  }
}

function BookingRow({ booking }: { booking: Booking }) {
  const cfg = bookingConfig[booking.type]
  const badge = getStatusBadge(booking.status)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 14px',
        gap: 12,
        backgroundColor: colors.surface,
      }}
    >
      {/* Left colored bar */}
      <div
        style={{
          width: 4,
          alignSelf: 'stretch',
          backgroundColor: cfg.color,
          borderRadius: 2,
          flexShrink: 0,
          minHeight: 36,
        }}
      />

      {/* Icon circle */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          backgroundColor: cfg.bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          flexShrink: 0,
          border: `1.5px solid ${cfg.color}33`,
        }}
      >
        {cfg.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: colors.text,
            marginBottom: 2,
          }}
        >
          {cfg.label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: colors.textSecondary,
          }}
        >
          {formatTime(booking.timestamp)} Uhr
        </div>
      </div>

      {/* Status badge */}
      <div
        style={{
          backgroundColor: badge.bg,
          color: badge.color,
          borderRadius: 8,
          padding: '3px 8px',
          fontSize: 11,
          fontWeight: 600,
          flexShrink: 0,
          border: `1px solid ${badge.color}33`,
        }}
      >
        {badge.label}
      </div>
    </div>
  )
}

interface DayGroup {
  dateKey: string
  bookings: Booking[]
}

export default function HistoryScreen() {
  const { state } = useApp()

  const groups = useMemo(() => {
    const map = new Map<string, Booking[]>()

    for (const b of state.bookings) {
      const key = toDateKey(b.timestamp)
      const existing = map.get(key) ?? []
      map.set(key, [...existing, b])
    }

    // Sort by date desc, bookings within each day asc
    const result: DayGroup[] = Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dateKey, bookings]) => ({
        dateKey,
        bookings: bookings.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ),
      }))

    return result
  }, [state.bookings])

  if (groups.length === 0) {
    return (
      <div
        style={{
          minHeight: '100%',
          backgroundColor: colors.background,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          gap: 16,
        }}
      >
        <div style={{ fontSize: 48 }}>📭</div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: colors.text,
            textAlign: 'center',
          }}
        >
          Noch keine Buchungen vorhanden
        </div>
        <div
          style={{
            fontSize: 13,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Ihre Zeitbuchungen erscheinen hier,
          sobald Sie eine Buchung durchführen.
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100%',
        backgroundColor: colors.background,
        paddingBottom: 16,
      }}
    >
      {groups.map(({ dateKey, bookings }) => {
        const todayKey = toDateKey(new Date().toISOString())
        const isToday = dateKey === todayKey

        return (
          <div key={dateKey} style={{ marginBottom: 8 }}>
            {/* Day header */}
            <div
              style={{
                backgroundColor: colors.background,
                padding: '12px 16px 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isToday ? colors.primary : colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                {formatDayHeader(dateKey)}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: colors.textSecondary,
                  fontWeight: 500,
                }}
              >
                {bookings.length} {bookings.length === 1 ? 'Buchung' : 'Buchungen'}
              </span>
            </div>

            {/* Bookings card */}
            <div
              style={{
                backgroundColor: colors.surface,
                margin: '0 16px',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 1px 6px rgba(0,59,111,0.07)',
                border: `1px solid ${colors.border}`,
              }}
            >
              {bookings.map((booking, idx) => (
                <div key={booking.id}>
                  {idx > 0 && (
                    <div
                      style={{
                        height: 1,
                        backgroundColor: colors.border,
                        margin: '0 14px',
                      }}
                    />
                  )}
                  <BookingRow booking={booking} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
