/**
 * Storage Service — AsyncStorage wrapper
 *
 * Handles persistence of user settings and local booking history.
 * All data is stored as JSON strings under namespaced keys.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, Booking } from '../types';

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  USER_SETTINGS: '@pvsplusapp/user_settings',
  BOOKINGS: '@pvsplusapp/bookings',
  LAST_SYNC: '@pvsplusapp/last_sync',
} as const;

// ─── Default Values ───────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: UserSettings = {
  apiUrl: '',
  username: '',
  password: '',
  authToken: null,
  loggedInUser: null,
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const storageService = {
  // ── User Settings ────────────────────────────────────────────────────────

  /**
   * Persist user settings (API URL, credentials, auth token).
   * Overwrites any previously stored settings.
   */
  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      const json = JSON.stringify(settings);
      await AsyncStorage.setItem(KEYS.USER_SETTINGS, json);
    } catch (error) {
      console.error('[Storage] Failed to save settings:', error);
      throw new Error('Einstellungen konnten nicht gespeichert werden.');
    }
  },

  /**
   * Load persisted user settings.
   * Returns null if no settings have been saved yet.
   */
  async loadSettings(): Promise<UserSettings | null> {
    try {
      const json = await AsyncStorage.getItem(KEYS.USER_SETTINGS);
      if (json === null) return null;
      const parsed = JSON.parse(json) as Partial<UserSettings>;
      // Merge with defaults to handle missing keys from older app versions
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (error) {
      console.error('[Storage] Failed to load settings:', error);
      return null;
    }
  },

  /**
   * Update only the specified fields in stored settings.
   */
  async updateSettings(partial: Partial<UserSettings>): Promise<void> {
    const existing = await storageService.loadSettings();
    const merged: UserSettings = { ...(existing ?? DEFAULT_SETTINGS), ...partial };
    await storageService.saveSettings(merged);
  },

  // ── Bookings ─────────────────────────────────────────────────────────────

  /**
   * Persist the full local booking history.
   * Keeps bookings sorted by timestamp descending (newest first).
   */
  async saveBookings(bookings: Booking[]): Promise<void> {
    try {
      const sorted = [...bookings].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const json = JSON.stringify(sorted);
      await AsyncStorage.setItem(KEYS.BOOKINGS, json);
    } catch (error) {
      console.error('[Storage] Failed to save bookings:', error);
      throw new Error('Buchungen konnten nicht gespeichert werden.');
    }
  },

  /**
   * Load the local booking history.
   * Returns an empty array if no bookings have been saved yet.
   */
  async loadBookings(): Promise<Booking[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.BOOKINGS);
      if (json === null) return [];
      return JSON.parse(json) as Booking[];
    } catch (error) {
      console.error('[Storage] Failed to load bookings:', error);
      return [];
    }
  },

  /**
   * Append a single booking to the stored history.
   * More efficient than loading all bookings, updating, and saving.
   */
  async appendBooking(booking: Booking): Promise<void> {
    const existing = await storageService.loadBookings();
    const updated = [booking, ...existing];
    await storageService.saveBookings(updated);
  },

  /**
   * Update the status of an existing booking by ID.
   */
  async updateBookingStatus(
    id: string,
    status: Booking['status'],
    serverBookingId?: string,
    errorMessage?: string
  ): Promise<void> {
    const bookings = await storageService.loadBookings();
    const updated = bookings.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        status,
        ...(serverBookingId ? { serverBookingId } : {}),
        ...(errorMessage ? { errorMessage } : {}),
      };
    });
    await storageService.saveBookings(updated);
  },

  // ── Housekeeping ─────────────────────────────────────────────────────────

  /**
   * Record the timestamp of the last successful server sync.
   */
  async saveLastSync(timestamp: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.LAST_SYNC, timestamp);
  },

  async loadLastSync(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.LAST_SYNC);
  },

  /**
   * Wipe all app data from storage.
   * Used on logout or when the user taps "Daten löschen".
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.USER_SETTINGS,
        KEYS.BOOKINGS,
        KEYS.LAST_SYNC,
      ]);
    } catch (error) {
      console.error('[Storage] Failed to clear all data:', error);
      throw new Error('Daten konnten nicht gelöscht werden.');
    }
  },
};

export default storageService;
