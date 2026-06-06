// MOCK API - Swap these implementations with real fetch() calls for production
// Real API design:
//   POST {apiUrl}/api/v1/auth/login        { username, password } → { token, user }
//   POST {apiUrl}/api/v1/zeitbuchungen     { typ, zeitstempel, isMobil } → { id, status }
//   GET  {apiUrl}/api/v1/zeitbuchungen     ?datum=YYYY-MM-DD → { buchungen: [] }

import type { Booking } from '../types'

const mockDelay = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 200))

const shouldFail = (): boolean => Math.random() < 0.1

export const apiService = {
  async login(
    _apiUrl: string,
    username: string,
    _password: string
  ): Promise<{ token: string; name: string; department: string }> {
    await mockDelay()
    if (shouldFail()) {
      throw new Error('Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut.')
    }
    // Mock successful login
    const initials = username.charAt(0).toUpperCase()
    return {
      token: `mock-token-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: `${initials}. Mustermann`,
      department: 'Referat ZD 3',
    }
  },

  async submitBooking(
    _apiUrl: string,
    _token: string,
    booking: Booking
  ): Promise<{ id: string; status: string }> {
    await mockDelay()
    if (shouldFail()) {
      throw new Error('Übermittlung fehlgeschlagen. Buchung wird lokal gespeichert.')
    }
    return {
      id: booking.id,
      status: 'accepted',
    }
  },

  async testConnection(apiUrl: string): Promise<boolean> {
    await mockDelay()
    // Mock: URLs starting with https succeed, others might fail
    if (!apiUrl.startsWith('http')) {
      throw new Error('Ungültige URL')
    }
    if (shouldFail()) {
      throw new Error('Server nicht erreichbar')
    }
    return true
  },
}
