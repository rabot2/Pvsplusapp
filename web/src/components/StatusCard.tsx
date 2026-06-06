import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { bookingConfig, colors } from '../theme'
import type { Booking } from '../types'

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${hh}:${mm}`
}

function formatTodayDate(): string {
  const d = new Date()
  const weekdays = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.']
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ]
  return `${weekdays[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`
}

function isSameDay(isoString: string, date: Date): boolean {
  const d = new Date(isoString)
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  )
}

function getStatusInfo(todayBookings: Booking[]): {
  label: string
  color: string
  bgColor: string
  dot: string
} {
  if (todayBookings.length === 0) {
    return { label: 'Noch nicht gebucht', color: '#6B7280', bgColor: '#F3F4F6', dot: '○' }
  }
  const last = todayBookings[todayBookings.length - 1]
  if (last.type === 'KOMMEN') {
    return { label: 'Anwesend', color: '#1B5E20', bgColor: '#E8F5E9', dot: '●' }
  }
  if (last.type === 'MOBILES_KOMMEN') {
    return { label: 'Mobil', color: '#1565C0', bgColor: '#E3F2FD', dot: '●' }
  }
  return { label: 'Abwesend', color: '#6B7280', bgColor: '#F3F4F6', dot: '○' }
}

export default function StatusCard() {
  const { state } = useApp()

  const today = useMemo(() => new Date(), [])

  const todayBookings = useMemo(
    () =>
      state.bookings
        .filter((b) => isSameDay(b.timestamp, today) && b.status !== 'cancelled')
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [state.bookings, today]
  )

  const status = getStatusInfo(todayBookings)
  const recentBookings = todayBookings.slice(-3)

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: '16px',
        boxShadow: '0 2px 12px rgba(0,59,111,0.08)',
        border: `1px solid ${colors.border}`,
        marginBottom: 4,
      }}
    >
      {/* Date + status row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              fontWeight: 600,
              marginBottom: 2,
            }}
          >
            Heute
          </div>
          <div
            style={{
              fontSize: 14,
              color: colors.text,
              fontWeight: 500,
            }}
          >
            {formatTodayDate()}
          </div>
        </div>

        {/* Status pill */}
        <div
          style={{
            backgroundColor: status.bgColor,
            color: status.color,
            borderRadius: 20,
            padding: '5px 12px',
            fontSize: 13,
            fontWeight: 700,
            border: `1.5px solid ${status.color}33`,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <span style={{ fontSize: 8 }}>{status.dot}</span>
          {status.label}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: colors.border,
          marginBottom: 12,
        }}
      />

      {/* Recent bookings timeline */}
      {recentBookings.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: colors.textSecondary,
            fontSize: 13,
            padding: '8px 0',
          }}
        >
          Noch keine Buchungen heute
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recentBookings.map((booking) => {
            const cfg = bookingConfig[booking.type]
            return (
              <div
                key={booking.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                {/* Colored dot */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: cfg.color,
                    flexShrink: 0,
                  }}
                />
                {/* Time */}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.text,
                    minWidth: 40,
                  }}
                >
                  {formatTime(booking.timestamp)}
                </span>
                {/* Label */}
                <span
                  style={{
                    fontSize: 13,
                    color: cfg.color,
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  {cfg.label}
                </span>
                {/* Pending indicator */}
                {booking.status === 'pending' && (
                  <span
                    style={{
                      fontSize: 10,
                      color: '#F59E0B',
                      fontWeight: 600,
                    }}
                  >
                    ⏳
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
