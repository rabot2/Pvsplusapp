import type { BookingType } from './types'

export const colors = {
  primary: '#003B6F',
  secondary: '#0066CC',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#1D1D1B',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#1B5E20',
  error: '#C62828',
  warning: '#F59E0B',
  gold: '#FFD700',
}

export interface BookingConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const bookingConfig: Record<BookingType, BookingConfig> = {
  KOMMEN: {
    label: 'Kommen',
    color: '#1B5E20',
    bgColor: '#E8F5E9',
    icon: '▶',
  },
  GEHEN: {
    label: 'Gehen',
    color: '#C62828',
    bgColor: '#FFEBEE',
    icon: '■',
  },
  MOBILES_KOMMEN: {
    label: 'Mobiles Kommen',
    color: '#1565C0',
    bgColor: '#E3F2FD',
    icon: '📱',
  },
  MOBILES_GEHEN: {
    label: 'Mobiles Gehen',
    color: '#6A1B9A',
    bgColor: '#F3E5F5',
    icon: '📱',
  },
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
}
