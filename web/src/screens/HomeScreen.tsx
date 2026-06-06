import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import BookingButton from '../components/BookingButton'
import StatusCard from '../components/StatusCard'
import UndoBanner from '../components/UndoBanner'
import { colors } from '../theme'
import type { BookingType } from '../types'

const BOOKING_TYPES: BookingType[] = ['KOMMEN', 'GEHEN', 'MOBILES_KOMMEN', 'MOBILES_GEHEN']

const CHECKIN_TYPES = new Set<BookingType>(['KOMMEN', 'MOBILES_KOMMEN'])
const CHECKOUT_TYPES = new Set<BookingType>(['GEHEN', 'MOBILES_GEHEN'])

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${hh}:${mm}`
}

function isSameDay(isoString: string, date: Date): boolean {
  const d = new Date(isoString)
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  )
}

export default function HomeScreen() {
  const { state, makeBooking } = useApp()
  const hasPending = state.pendingBooking !== null
  const today = useMemo(() => new Date(), [])

  const todayBookings = useMemo(
    () =>
      state.bookings
        .filter((b) => isSameDay(b.timestamp, today) && b.status !== 'cancelled')
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [state.bookings, today]
  )

  // Last non-cancelled booking today determines which buttons are "next logical step"
  const lastBookingType: BookingType | null = useMemo(() => {
    if (todayBookings.length === 0) return null
    return todayBookings[todayBookings.length - 1].type
  }, [todayBookings])

  // Currently checked in = last action was a check-in type
  const isCheckedIn = lastBookingType !== null && CHECKIN_TYPES.has(lastBookingType)

  // Build last-booking-time map per type
  const lastTimesMap = useMemo(() => {
    const map: Partial<Record<BookingType, string>> = {}
    for (const b of todayBookings) {
      map[b.type] = formatTime(b.timestamp)
    }
    return map
  }, [todayBookings])

  // A button is "dimmed" when it's the logical opposite of the expected next step
  function isDimmed(type: BookingType): boolean {
    if (isCheckedIn) {
      // After check-in → check-out buttons are recommended, check-in buttons are dimmed
      return CHECKIN_TYPES.has(type)
    } else {
      // Not checked in → check-in buttons are recommended, check-out buttons are dimmed
      return CHECKOUT_TYPES.has(type)
    }
  }

  return (
    <div
      style={{
        minHeight: '100%',
        backgroundColor: colors.background,
        padding: '16px 16px 0',
      }}
    >
      {/* Status card */}
      <StatusCard />

      {/* Section header */}
      <div
        style={{
          marginTop: 20,
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 3,
            height: 18,
            backgroundColor: colors.primary,
            borderRadius: 2,
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: colors.primary,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          Buchung erfassen
        </span>
      </div>

      {/* Booking buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {BOOKING_TYPES.map((type) => (
          <BookingButton
            key={type}
            type={type}
            onPress={() => makeBooking(type)}
            disabled={hasPending}
            dimmed={isDimmed(type)}
            lastBookingTime={lastTimesMap[type]}
          />
        ))}
      </div>

      {/* Bottom padding so content doesn't hide behind UndoBanner */}
      <div style={{ height: 16 }} />

      {/* Undo banner overlay */}
      <UndoBanner />
    </div>
  )
}
