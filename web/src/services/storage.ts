import type { Booking, BookingStatus, UserSettings } from '../types'

const KEYS = {
  SETTINGS: 'pvsplusapp_settings',
  BOOKINGS: 'pvsplusapp_bookings',
} as const

export const storageService = {
  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  },

  loadSettings(): UserSettings | null {
    try {
      const raw = localStorage.getItem(KEYS.SETTINGS)
      if (!raw) return null
      return JSON.parse(raw) as UserSettings
    } catch (e) {
      console.error('Failed to load settings:', e)
      return null
    }
  },

  saveBookings(bookings: Booking[]): void {
    try {
      localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings))
    } catch (e) {
      console.error('Failed to save bookings:', e)
    }
  },

  loadBookings(): Booking[] {
    try {
      const raw = localStorage.getItem(KEYS.BOOKINGS)
      if (!raw) return []
      return JSON.parse(raw) as Booking[]
    } catch (e) {
      console.error('Failed to load bookings:', e)
      return []
    }
  },

  appendBooking(booking: Booking): void {
    const existing = storageService.loadBookings()
    storageService.saveBookings([...existing, booking])
  },

  updateBookingStatus(id: string, status: BookingStatus): void {
    const existing = storageService.loadBookings()
    const updated = existing.map((b) =>
      b.id === id ? { ...b, status } : b
    )
    storageService.saveBookings(updated)
  },

  clearAll(): void {
    try {
      localStorage.removeItem(KEYS.SETTINGS)
      localStorage.removeItem(KEYS.BOOKINGS)
    } catch (e) {
      console.error('Failed to clear storage:', e)
    }
  },
}
