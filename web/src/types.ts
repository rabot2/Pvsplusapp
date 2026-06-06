export type BookingType = 'KOMMEN' | 'GEHEN' | 'MOBILES_KOMMEN' | 'MOBILES_GEHEN';
export type BookingStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

export interface Booking {
  id: string;
  type: BookingType;
  timestamp: string; // ISO string
  status: BookingStatus;
  isMobile: boolean;
}

export interface PendingBooking {
  booking: Booking;
  remainingSeconds: number;
  scheduledAt: number;
}

export interface UserSettings {
  apiUrl: string;
  username: string;
  password: string;
  authToken: string;
  userName: string;
  department: string;
}
