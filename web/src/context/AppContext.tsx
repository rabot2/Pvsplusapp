import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import type { Booking, BookingType, PendingBooking, UserSettings } from '../types'
import { apiService } from '../services/api'
import { storageService } from '../services/storage'

type ActiveTab = 'home' | 'history' | 'settings'

interface AppState {
  userSettings: UserSettings
  bookings: Booking[]
  pendingBooking: PendingBooking | null
  activeTab: ActiveTab
  isLoading: boolean
}

type AppAction =
  | { type: 'SET_SETTINGS'; payload: UserSettings }
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING_STATUS'; payload: { id: string; status: Booking['status'] } }
  | { type: 'SET_PENDING'; payload: PendingBooking | null }
  | { type: 'TICK_PENDING' }
  | { type: 'SET_ACTIVE_TAB'; payload: ActiveTab }
  | { type: 'SET_LOADING'; payload: boolean }

const defaultSettings: UserSettings = {
  apiUrl: '',
  username: '',
  password: '',
  authToken: '',
  userName: '',
  department: '',
}

const initialState: AppState = {
  userSettings: defaultSettings,
  bookings: [],
  pendingBooking: null,
  activeTab: 'home',
  isLoading: false,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { ...state, userSettings: action.payload }
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload }
    case 'ADD_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] }
    case 'UPDATE_BOOKING_STATUS':
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.payload.id ? { ...b, status: action.payload.status } : b
        ),
      }
    case 'SET_PENDING':
      return { ...state, pendingBooking: action.payload }
    case 'TICK_PENDING':
      if (!state.pendingBooking) return state
      return {
        ...state,
        pendingBooking: {
          ...state.pendingBooking,
          remainingSeconds: state.pendingBooking.remainingSeconds - 1,
        },
      }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  makeBooking: (type: BookingType) => void
  undoPendingBooking: () => void
  updateSettings: (settings: UserSettings) => void
  clearAllData: () => void
  setActiveTab: (tab: ActiveTab) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingBookingRef = useRef<PendingBooking | null>(null)
  const settingsRef = useRef<UserSettings>(defaultSettings)

  // Keep refs in sync with state so callbacks always see latest values
  useEffect(() => {
    pendingBookingRef.current = state.pendingBooking
  }, [state.pendingBooking])

  useEffect(() => {
    settingsRef.current = state.userSettings
  }, [state.userSettings])

  // Load persisted data on mount
  useEffect(() => {
    const savedSettings = storageService.loadSettings()
    if (savedSettings) {
      dispatch({ type: 'SET_SETTINGS', payload: savedSettings })
    }
    const savedBookings = storageService.loadBookings()
    if (savedBookings.length > 0) {
      dispatch({ type: 'SET_BOOKINGS', payload: savedBookings })
    }
  }, [])

  const clearCountdownTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (submitTimeoutRef.current !== null) {
      clearTimeout(submitTimeoutRef.current)
      submitTimeoutRef.current = null
    }
  }, [])

  const submitBookingNow = useCallback(async (booking: Booking) => {
    clearCountdownTimer()
    const settings = settingsRef.current
    try {
      await apiService.submitBooking(settings.apiUrl, settings.authToken, booking)
      dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { id: booking.id, status: 'sent' } })
      storageService.updateBookingStatus(booking.id, 'sent')
    } catch {
      dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { id: booking.id, status: 'failed' } })
      storageService.updateBookingStatus(booking.id, 'failed')
    }
    dispatch({ type: 'SET_PENDING', payload: null })
  }, [clearCountdownTimer])

  const makeBooking = useCallback((type: BookingType) => {
    if (pendingBookingRef.current !== null) {
      alert('Bitte zuerst aktuelle Buchung abschließen oder rückgängig machen.')
      return
    }

    const booking: Booking = {
      id: `booking-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      timestamp: new Date().toISOString(),
      status: 'pending',
      isMobile: type === 'MOBILES_KOMMEN' || type === 'MOBILES_GEHEN',
    }

    const pending: PendingBooking = {
      booking,
      remainingSeconds: 4,
      scheduledAt: Date.now(),
    }

    dispatch({ type: 'ADD_BOOKING', payload: booking })
    storageService.appendBooking(booking)
    dispatch({ type: 'SET_PENDING', payload: pending })

    // Start countdown interval
    clearCountdownTimer()
    let remaining = 4

    intervalRef.current = setInterval(() => {
      remaining -= 1
      dispatch({ type: 'TICK_PENDING' })

      if (remaining <= 0) {
        // Stop ticking; wait 1 s so the final animation (ring drains to 0) completes
        clearInterval(intervalRef.current!)
        intervalRef.current = null
        submitTimeoutRef.current = setTimeout(() => {
          submitTimeoutRef.current = null
          void submitBookingNow(booking)
        }, 1000)
      }
    }, 1000)
  }, [clearCountdownTimer, submitBookingNow])

  const undoPendingBooking = useCallback(() => {
    const current = pendingBookingRef.current
    if (!current) return

    clearCountdownTimer()
    dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { id: current.booking.id, status: 'cancelled' } })
    storageService.updateBookingStatus(current.booking.id, 'cancelled')
    dispatch({ type: 'SET_PENDING', payload: null })
  }, [clearCountdownTimer])

  const updateSettings = useCallback((settings: UserSettings) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings })
    storageService.saveSettings(settings)
  }, [])

  const clearAllData = useCallback(() => {
    clearCountdownTimer()
    storageService.clearAll()
    dispatch({ type: 'SET_SETTINGS', payload: defaultSettings })
    dispatch({ type: 'SET_BOOKINGS', payload: [] })
    dispatch({ type: 'SET_PENDING', payload: null })
  }, [clearCountdownTimer])

  const setActiveTab = useCallback((tab: ActiveTab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCountdownTimer()
    }
  }, [clearCountdownTimer])

  const value: AppContextValue = {
    state,
    makeBooking,
    undoPendingBooking,
    updateSettings,
    clearAllData,
    setActiveTab,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
