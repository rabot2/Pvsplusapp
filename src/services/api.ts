/**
 * API Service — Mock Implementation
 *
 * This file provides a mock API that simulates the real Bundesregierung
 * Zeiterfassungs-API. The mock has realistic delays and a small failure rate.
 *
 * TO SWAP FOR REAL API:
 *   1. Remove the mock functions at the bottom of this file.
 *   2. Replace each method body with the corresponding real fetch() call.
 *   3. The method signatures stay identical — no changes needed in the rest of the app.
 *
 * REAL API ENDPOINTS (to be implemented):
 *   POST   {apiUrl}/api/v1/auth/login           — Authenticate user
 *   POST   {apiUrl}/api/v1/zeitbuchungen        — Submit a booking
 *   GET    {apiUrl}/api/v1/zeitbuchungen        — Get bookings (optionally filtered by date)
 *   DELETE {apiUrl}/api/v1/zeitbuchungen/{id}   — Cancel a pending booking
 *   GET    {apiUrl}/api/v1/auth/me              — Get current user info
 *
 * REAL AUTH FLOW:
 *   Login returns a Bearer token. All subsequent requests include:
 *   Authorization: Bearer {token}
 */

import {
  BookingType,
  LoginResponse,
  SubmitBookingRequest,
  SubmitBookingResponse,
  GetBookingsResponse,
  Booking,
} from '../types';

// ─── Configuration ────────────────────────────────────────────────────────────

/** Probability of a mock API call failing (simulates network errors) */
const MOCK_FAILURE_RATE = 0.1;

/** Simulated network delay range in milliseconds */
const MOCK_DELAY_MIN = 300;
const MOCK_DELAY_MAX = 800;

// ─── Utility helpers ──────────────────────────────────────────────────────────

/** Simulate realistic network latency */
function mockDelay(): Promise<void> {
  const ms = Math.floor(Math.random() * (MOCK_DELAY_MAX - MOCK_DELAY_MIN) + MOCK_DELAY_MIN);
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Simulate occasional API errors */
function maybeThrow(errorMessage: string): void {
  if (Math.random() < MOCK_FAILURE_RATE) {
    throw new ApiError(errorMessage, 503, 'SERVICE_UNAVAILABLE');
  }
}

function generateId(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Error class ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Request helpers (for real implementation) ────────────────────────────────

/**
 * Build standard request headers.
 * Used by the real implementation — kept here as reference.
 */
function buildHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Version': '1.0.0',
    'X-Platform': 'mobile',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Handle API response (used by real fetch implementation).
 * Throws ApiError for non-2xx responses.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorBody: { message?: string; code?: string } = {};
    try {
      errorBody = await response.json();
    } catch {
      // ignore parse errors
    }
    throw new ApiError(
      errorBody.message ?? `HTTP ${response.status}`,
      response.status,
      errorBody.code ?? 'UNKNOWN'
    );
  }
  return response.json() as Promise<T>;
}

// ─── Public API Service ───────────────────────────────────────────────────────

export const apiService = {
  /**
   * Authenticate and retrieve a session token.
   *
   * REAL IMPLEMENTATION:
   *   const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
   *     method: 'POST',
   *     headers: buildHeaders(),
   *     body: JSON.stringify({ username, password }),
   *   });
   *   return handleResponse<LoginResponse>(response);
   */
  async login(
    apiUrl: string,
    username: string,
    password: string
  ): Promise<LoginResponse> {
    await mockDelay();

    // Validate credentials (mock: any non-empty username/password works)
    if (!username.trim() || !password.trim()) {
      throw new ApiError(
        'Benutzername und Passwort sind erforderlich.',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!apiUrl.startsWith('http')) {
      throw new ApiError(
        'Ungültige API-URL. Muss mit http:// oder https:// beginnen.',
        400,
        'INVALID_URL'
      );
    }

    // Simulate wrong credentials
    if (password === 'wrong') {
      throw new ApiError(
        'Benutzername oder Passwort ist falsch.',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    // Mock success response
    return {
      token: `mock_token_${generateId()}`,
      user: {
        id: `user_${username.toLowerCase().replace(/\s/g, '_')}`,
        name: username,
        department: 'Bundesministerium — Referat Z 3',
      },
    };
  },

  /**
   * Submit a time booking to the server.
   *
   * REAL IMPLEMENTATION:
   *   const response = await fetch(`${apiUrl}/api/v1/zeitbuchungen`, {
   *     method: 'POST',
   *     headers: buildHeaders(token),
   *     body: JSON.stringify(booking),
   *   });
   *   return handleResponse<SubmitBookingResponse>(response);
   */
  async submitBooking(
    apiUrl: string,
    token: string,
    booking: SubmitBookingRequest
  ): Promise<SubmitBookingResponse> {
    await mockDelay();

    // Validate token
    if (!token) {
      throw new ApiError(
        'Nicht authentifiziert. Bitte neu anmelden.',
        401,
        'UNAUTHORIZED'
      );
    }

    // Simulate occasional server errors
    maybeThrow('Buchung konnte nicht übermittelt werden. Bitte erneut versuchen.');

    return {
      id: generateId(),
      status: 'accepted',
      zeitstempel: booking.zeitstempel,
    };
  },

  /**
   * Retrieve bookings for a given date (defaults to today).
   *
   * REAL IMPLEMENTATION:
   *   const dateParam = date ?? new Date().toISOString().split('T')[0];
   *   const response = await fetch(
   *     `${apiUrl}/api/v1/zeitbuchungen?datum=${dateParam}`,
   *     { headers: buildHeaders(token) }
   *   );
   *   return handleResponse<GetBookingsResponse>(response);
   */
  async getBookings(
    apiUrl: string,
    token: string,
    date?: string
  ): Promise<Booking[]> {
    await mockDelay();

    if (!token) {
      throw new ApiError('Nicht authentifiziert.', 401, 'UNAUTHORIZED');
    }

    // Return empty list — local storage is the source of truth in the mock
    return [];
  },

  /**
   * Test whether the API is reachable (health check).
   *
   * REAL IMPLEMENTATION:
   *   const response = await fetch(`${apiUrl}/api/v1/health`, {
   *     headers: buildHeaders(),
   *     signal: AbortSignal.timeout(5000),
   *   });
   *   return response.ok;
   */
  async testConnection(apiUrl: string): Promise<boolean> {
    await mockDelay();

    if (!apiUrl.startsWith('http')) {
      return false;
    }

    // Mock: always succeeds for valid URLs
    return true;
  },
};

export default apiService;
