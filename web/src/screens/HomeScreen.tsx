import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import BookingButton from '../components/BookingButton'
import StatusCard from '../components/StatusCard'
import { colors } from '../theme'
import type { BookingType } from '../types'

const BOOKING_TYPES: BookingType[] = ['KOMMEN', 'GEHEN', 'MOBILES_KOMMEN', 'MOBILES_GEHEN']

// Strict pairing: each check-in type has exactly one expected follow-up
const NEXT_EXPECTED: Partial<Record<BookingType, BookingType>> = {
  KOMMEN:         'GEHEN',
  MOBILES_KOMMEN: 'MOBILES_GEHEN',
}

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
  const { state, makeBooking, undoPendingBooking } = useApp()
  const pending = state.pendingBooking
  const hasPending = pending !== null
  const pendingType = pending?.booking.type ?? null
  const today = useMemo(() => new Date(), [])

  const todayBookings = useMemo(
    () =>
      state.bookings
        .filter((b) => isSameDay(b.timestamp, today) && b.status !== 'cancelled')
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [state.bookings, today]
  )

  // Only CONFIRMED bookings drive sort order & dimming — pending bookings are ignored
  // so buttons don't jump the moment the user taps one.
  const confirmedBookings = useMemo(
    () => todayBookings.filter((b) => b.status === 'sent'),
    [todayBookings]
  )

  const lastBookingType: BookingType | null = useMemo(() => {
    if (confirmedBookings.length === 0) return null
    return confirmedBookings[confirmedBookings.length - 1].type
  }, [confirmedBookings])

  // Which single type is the recommended next action?
  // KOMMEN → GEHEN, MOBILES_KOMMEN → MOBILES_GEHEN, otherwise both check-ins
  const recommendedTypes = useMemo((): Set<BookingType> => {
    if (lastBookingType && NEXT_EXPECTED[lastBookingType]) {
      return new Set([NEXT_EXPECTED[lastBookingType]!])
    }
    // No booking yet, or last was a check-out → both check-ins are recommended
    return new Set<BookingType>(['KOMMEN', 'MOBILES_KOMMEN'])
  }, [lastBookingType])

  // Build last-booking-time map per type
  const lastTimesMap = useMemo(() => {
    const map: Partial<Record<BookingType, string>> = {}
    for (const b of todayBookings) {
      map[b.type] = formatTime(b.timestamp)
    }
    return map
  }, [todayBookings])

  const isDimmed = (type: BookingType) => !recommendedTypes.has(type)

  // Active buttons first, dimmed buttons after — each group keeps its natural order
  const sortedTypes = useMemo(
    () => [...BOOKING_TYPES].sort((a, b) => {
      const aActive = recommendedTypes.has(a) ? 0 : 1
      const bActive = recommendedTypes.has(b) ? 0 : 1
      return aActive - bActive
    }),
    [recommendedTypes]
  )

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
        {sortedTypes.map((type) => {
          const isThisPending = type === pendingType
          return (
            <BookingButton
              key={type}
              type={type}
              onPress={() => makeBooking(type)}
              // Pending button stays active (for cancel); others are disabled
              disabled={hasPending && !isThisPending}
              dimmed={!isThisPending && isDimmed(type)}
              lastBookingTime={lastTimesMap[type]}
              pendingSeconds={isThisPending ? (pending?.remainingSeconds ?? undefined) : undefined}
              totalSeconds={5}
              onCancel={undoPendingBooking}
            />
          )
        })}
      </div>

      <div style={{ height: 16 }} />
    </div>
  )
}
