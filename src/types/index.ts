/**
 * Core TypeScript types for PVS+ Zeiterfassung
 */

// ─── Booking Types ────────────────────────────────────────────────────────────

export enum BookingType {
  KOMMEN = 'KOMMEN',
  GEHEN = 'GEHEN',
  MOBILES_KOMMEN = 'MOBILES_KOMMEN',
  MOBILES_GEHEN = 'MOBILES_GEHEN',
}

export type BookingStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

export interface Booking {
  id: string;
  type: BookingType;
  timestamp: string;      // ISO 8601 string
  status: BookingStatus;
  isMobile: boolean;
  localCreatedAt: string; // When the user tapped the button (before countdown)
  serverBookingId?: string; // Returned by API after successful submission
  errorMessage?: string;   // Set when status === 'failed'
}

// ─── Pending Booking (in countdown) ──────────────────────────────────────────

export interface PendingBooking {
  booking: Booking;
  submittedAt: number;    // Date.now() when booking was created
  countdownSeconds: number; // Total countdown duration (120)
  remainingSeconds: number; // Updated by timer
}

// ─── User / Auth ──────────────────────────────────────────────────────────────

export interface UserSettings {
  apiUrl: string;
  username: string;
  password: string;
  authToken: string | null;
  loggedInUser: LoggedInUser | null;
}

export interface LoggedInUser {
  id: string;
  name: string;
  department: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface LoginResponse {
  token: string;
  user: LoggedInUser;
}

export interface SubmitBookingRequest {
  typ: string;            // BookingType value
  zeitstempel: string;    // ISO 8601
  mobil: boolean;
  standort?: string;      // Optional GPS location
}

export interface SubmitBookingResponse {
  id: string;
  status: string;
  zeitstempel: string;
}

export interface GetBookingsResponse {
  buchungen: ApiBookingEntry[];
}

export interface ApiBookingEntry {
  id: string;
  typ: string;
  zeitstempel: string;
  mobil: boolean;
  status: string;
}

// ─── App State ────────────────────────────────────────────────────────────────

export type WorkStatus = 'present' | 'absent' | 'mobile' | 'unknown';

export interface DailyStats {
  date: string;           // YYYY-MM-DD
  firstKommen?: string;   // ISO timestamp
  lastGehen?: string;     // ISO timestamp
  totalHours?: number;    // Computed from bookings
  bookingCount: number;
}

export interface AppState {
  isLoading: boolean;
  isAuthenticated: boolean;
  userSettings: UserSettings | null;
  bookings: Booking[];
  pendingBooking: PendingBooking | null;
  workStatus: WorkStatus;
  dailyStats: DailyStats | null;
  error: string | null;
}

// ─── Context Actions ──────────────────────────────────────────────────────────

export interface AppContextValue {
  // State
  state: AppState;

  // Auth
  login: (apiUrl: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  testConnection: (apiUrl: string, username: string, password: string) => Promise<boolean>;

  // Bookings
  makeBooking: (type: BookingType) => Promise<void>;
  undoPendingBooking: () => void;

  // Data
  loadData: () => Promise<void>;
  refreshBookings: () => Promise<void>;
}

// ─── Navigation Types ─────────────────────────────────────────────────────────

export type RootTabParamList = {
  Buchung: undefined;
  Verlauf: undefined;
  Einstellungen: undefined;
};

// ─── Utility Types ────────────────────────────────────────────────────────────

export type WithTimestamp<T> = T & {
  createdAt: string;
  updatedAt: string;
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
