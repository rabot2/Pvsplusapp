/**
 * AppContext — Central state management for PVS+ Zeiterfassung
 *
 * Provides:
 *  - Authentication state and user settings
 *  - Booking history (persisted locally)
 *  - Pending booking with 120-second countdown
 *  - makeBooking / undoPendingBooking / loadData
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AppContextValue,
  AppState,
  Booking,
  BookingType,
  DailyStats,
  PendingBooking,
  UserSettings,
  WorkStatus,
} from '../types';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';

// ─── Constants ────────────────────────────────────────────────────────────────

const COUNTDOWN_SECONDS = 120;

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AppState = {
  isLoading: true,
  isAuthenticated: false,
  userSettings: null,
  bookings: [],
  pendingBooking: null,
  workStatus: 'unknown',
  dailyStats: null,
  error: null,
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `booking_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function isMobileType(type: BookingType): boolean {
  return type === BookingType.MOBILES_KOMMEN || type === BookingType.MOBILES_GEHEN;
}

function computeWorkStatus(bookings: Booking[]): WorkStatus {
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings
    .filter(b => b.status !== 'cancelled' && b.localCreatedAt.startsWith(today))
    .sort((a, b) => new Date(a.localCreatedAt).getTime() - new Date(b.localCreatedAt).getTime());

  if (todayBookings.length === 0) return 'absent';

  const last = todayBookings[todayBookings.length - 1];
  if (last.type === BookingType.KOMMEN) return 'present';
  if (last.type === BookingType.GEHEN) return 'absent';
  if (last.type === BookingType.MOBILES_KOMMEN) return 'mobile';
  if (last.type === BookingType.MOBILES_GEHEN) return 'absent';
  return 'unknown';
}

function computeDailyStats(bookings: Booking[]): DailyStats {
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings
    .filter(b => b.status !== 'cancelled' && b.localCreatedAt.startsWith(today))
    .sort((a, b) => new Date(a.localCreatedAt).getTime() - new Date(b.localCreatedAt).getTime());

  const firstKommen = todayBookings.find(
    b => b.type === BookingType.KOMMEN || b.type === BookingType.MOBILES_KOMMEN
  );
  const lastGehen = [...todayBookings]
    .reverse()
    .find(b => b.type === BookingType.GEHEN || b.type === BookingType.MOBILES_GEHEN);

  let totalHours: number | undefined;
  if (firstKommen && lastGehen) {
    const diff =
      new Date(lastGehen.localCreatedAt).getTime() -
      new Date(firstKommen.localCreatedAt).getTime();
    totalHours = diff / (1000 * 60 * 60);
  }

  return {
    date: today,
    firstKommen: firstKommen?.localCreatedAt,
    lastGehen: lastGehen?.localCreatedAt,
    totalHours,
    bookingCount: todayBookings.length,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  // Timer refs — we use refs so we can clear them without re-rendering
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const clearAllTimers = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (submitTimerRef.current) {
      clearTimeout(submitTimerRef.current);
      submitTimerRef.current = null;
    }
  }, []);

  const updateBookingsInState = useCallback(
    (updater: (prev: Booking[]) => Booking[]) => {
      setState(prev => {
        const newBookings = updater(prev.bookings);
        return {
          ...prev,
          bookings: newBookings,
          workStatus: computeWorkStatus(newBookings),
          dailyStats: computeDailyStats(newBookings),
        };
      });
    },
    []
  );

  // ── Load Data ──────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const [settings, bookings] = await Promise.all([
        storageService.loadSettings(),
        storageService.loadBookings(),
      ]);

      setState(prev => ({
        ...prev,
        isLoading: false,
        userSettings: settings,
        isAuthenticated: !!(settings?.authToken),
        bookings,
        workStatus: computeWorkStatus(bookings),
        dailyStats: computeDailyStats(bookings),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Daten konnten nicht geladen werden.',
      }));
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // ── Auth ───────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (apiUrl: string, username: string, password: string) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await apiService.login(apiUrl, username, password);
        const settings: UserSettings = {
          apiUrl,
          username,
          password,
          authToken: response.token,
          loggedInUser: response.user,
        };
        await storageService.saveSettings(settings);
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: true,
          userSettings: settings,
        }));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen.';
        setState(prev => ({ ...prev, isLoading: false, error: message }));
        throw error;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    clearAllTimers();
    await storageService.clearAll();
    setState({
      ...initialState,
      isLoading: false,
    });
  }, [clearAllTimers]);

  const updateSettings = useCallback(async (partial: Partial<UserSettings>) => {
    setState(prev => {
      const current = prev.userSettings ?? {
        apiUrl: '',
        username: '',
        password: '',
        authToken: null,
        loggedInUser: null,
      };
      return { ...prev, userSettings: { ...current, ...partial } };
    });
    await storageService.updateSettings(partial);
  }, []);

  const testConnection = useCallback(
    async (apiUrl: string, username: string, password: string): Promise<boolean> => {
      try {
        await apiService.login(apiUrl, username, password);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  // ── Booking Logic ──────────────────────────────────────────────────────────

  /**
   * Start the 120-second countdown for a new booking.
   * Only one pending booking is allowed at a time.
   */
  const makeBooking = useCallback(
    async (type: BookingType) => {
      // Don't allow new booking if one is already pending
      if (state.pendingBooking) return;

      const now = new Date().toISOString();
      const booking: Booking = {
        id: generateId(),
        type,
        timestamp: now,
        status: 'pending',
        isMobile: isMobileType(type),
        localCreatedAt: now,
      };

      const pending: PendingBooking = {
        booking,
        submittedAt: Date.now(),
        countdownSeconds: COUNTDOWN_SECONDS,
        remainingSeconds: COUNTDOWN_SECONDS,
      };

      setState(prev => ({ ...prev, pendingBooking: pending, error: null }));

      // Tick countdown every second
      countdownTimerRef.current = setInterval(() => {
        setState(prev => {
          if (!prev.pendingBooking) return prev;
          const remaining = prev.pendingBooking.remainingSeconds - 1;
          if (remaining <= 0) {
            return {
              ...prev,
              pendingBooking: { ...prev.pendingBooking, remainingSeconds: 0 },
            };
          }
          return {
            ...prev,
            pendingBooking: { ...prev.pendingBooking, remainingSeconds: remaining },
          };
        });
      }, 1000);

      // After COUNTDOWN_SECONDS, submit the booking
      submitTimerRef.current = setTimeout(async () => {
        clearInterval(countdownTimerRef.current!);
        countdownTimerRef.current = null;
        submitTimerRef.current = null;

        // Re-read current settings from storage to ensure fresh token
        const settings = await storageService.loadSettings();
        if (!settings?.authToken) {
          // Mark as failed — not authenticated
          const failedBooking: Booking = {
            ...booking,
            status: 'failed',
            errorMessage: 'Nicht authentifiziert.',
          };
          setState(prev => ({ ...prev, pendingBooking: null }));
          updateBookingsInState(prev => [failedBooking, ...prev]);
          await storageService.appendBooking(failedBooking);
          return;
        }

        try {
          const result = await apiService.submitBooking(
            settings.apiUrl,
            settings.authToken,
            {
              typ: booking.type,
              zeitstempel: booking.timestamp,
              mobil: booking.isMobile,
            }
          );

          const sentBooking: Booking = {
            ...booking,
            status: 'sent',
            serverBookingId: result.id,
          };

          setState(prev => ({ ...prev, pendingBooking: null }));
          updateBookingsInState(prev => [sentBooking, ...prev]);
          await storageService.appendBooking(sentBooking);
        } catch (error) {
          const failedBooking: Booking = {
            ...booking,
            status: 'failed',
            errorMessage:
              error instanceof Error
                ? error.message
                : 'Buchung fehlgeschlagen.',
          };

          setState(prev => ({ ...prev, pendingBooking: null }));
          updateBookingsInState(prev => [failedBooking, ...prev]);
          await storageService.appendBooking(failedBooking);
        }
      }, COUNTDOWN_SECONDS * 1000);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.pendingBooking, updateBookingsInState]
  );

  /**
   * Cancel the pending booking within the countdown window.
   */
  const undoPendingBooking = useCallback(() => {
    clearAllTimers();

    setState(prev => {
      if (!prev.pendingBooking) return prev;
      const cancelledBooking: Booking = {
        ...prev.pendingBooking.booking,
        status: 'cancelled',
      };
      // Fire-and-forget storage save
      storageService.appendBooking(cancelledBooking).catch(console.error);
      return {
        ...prev,
        pendingBooking: null,
      };
    });
  }, [clearAllTimers]);

  const refreshBookings = useCallback(async () => {
    const bookings = await storageService.loadBookings();
    setState(prev => ({
      ...prev,
      bookings,
      workStatus: computeWorkStatus(bookings),
      dailyStats: computeDailyStats(bookings),
    }));
  }, []);

  // ── Context Value ──────────────────────────────────────────────────────────

  const contextValue: AppContextValue = {
    state,
    login,
    logout,
    updateSettings,
    testConnection,
    makeBooking,
    undoPendingBooking,
    loadData,
    refreshBookings,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}

export default AppContext;
