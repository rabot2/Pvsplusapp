/**
 * Bundesregierung Corporate Design Theme
 * Based on the German Federal Government visual identity guidelines
 */

export const Colors = {
  // Primary brand colors
  bundesblau: '#003B6F',
  bundesblauLight: '#0066CC',
  bundesblauDark: '#002347',

  // Background & surface
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#D1D9E0',
  borderLight: '#E8EDF2',

  // Text
  textPrimary: '#1D1D1B',
  textSecondary: '#5A6270',
  textTertiary: '#8A919C',
  textInverse: '#FFFFFF',
  textOnBlue: '#FFFFFF',

  // Booking type colors
  kommen: '#1B5E20',
  kommenLight: '#E8F5E9',
  kommenDark: '#145016',

  gehen: '#C62828',
  gehenLight: '#FFEBEE',
  gehenDark: '#9A1B1B',

  mobilKommen: '#1565C0',
  mobilKommenLight: '#E3F2FD',
  mobilKommenDark: '#0D47A1',

  mobilGehen: '#6A1B9A',
  mobilGehenLight: '#F3E5F5',
  mobilGehenDark: '#4A148C',

  // Status colors
  success: '#2E7D32',
  successLight: '#E8F5E9',
  warning: '#E65100',
  warningLight: '#FFF3E0',
  error: '#C62828',
  errorLight: '#FFEBEE',
  info: '#1565C0',
  infoLight: '#E3F2FD',

  // Work status
  present: '#1B5E20',
  absent: '#C62828',
  mobile: '#1565C0',

  // Neutral
  gray100: '#F5F7FA',
  gray200: '#E8EDF2',
  gray300: '#D1D9E0',
  gray400: '#A8B2BC',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Overlay
  overlay: 'rgba(0, 59, 111, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Tab bar
  tabBarActive: '#FFFFFF',
  tabBarInactive: 'rgba(255, 255, 255, 0.55)',
  tabBarBackground: '#003B6F',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 22,
  '3xl': 26,
  '4xl': 30,
  '5xl': 36,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: '#003B6F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Typography = {
  // Header
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.2,
  },

  // Screen titles
  screenTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },

  // Body
  bodyLarge: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    color: Colors.textPrimary,
    lineHeight: FontSize.base * 1.5,
  },
  bodyMedium: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    color: Colors.textPrimary,
    lineHeight: FontSize.md * 1.5,
  },
  bodySmall: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.5,
  },

  // Labels
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textTertiary,
    letterSpacing: 0.2,
  },

  // Booking button
  bookingButtonLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textInverse,
    letterSpacing: 0.2,
  },
  bookingButtonSublabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },

  // Time display
  timeDisplay: {
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'] as const,
  },
  timeMedium: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'] as const,
  },
  timeSmall: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'] as const,
  },
};

export const BookingTypeConfig = {
  KOMMEN: {
    label: 'Kommen',
    shortLabel: 'K',
    color: Colors.kommen,
    lightColor: Colors.kommenLight,
    darkColor: Colors.kommenDark,
    icon: 'log-in',
    description: 'Arbeitsbeginn erfassen',
  },
  GEHEN: {
    label: 'Gehen',
    shortLabel: 'G',
    color: Colors.gehen,
    lightColor: Colors.gehenLight,
    darkColor: Colors.gehenDark,
    icon: 'log-out',
    description: 'Arbeitsende erfassen',
  },
  MOBILES_KOMMEN: {
    label: 'Mobiles Kommen',
    shortLabel: 'MK',
    color: Colors.mobilKommen,
    lightColor: Colors.mobilKommenLight,
    darkColor: Colors.mobilKommenDark,
    icon: 'phone-portrait',
    description: 'Mobilen Arbeitsbeginn erfassen',
  },
  MOBILES_GEHEN: {
    label: 'Mobiles Gehen',
    shortLabel: 'MG',
    color: Colors.mobilGehen,
    lightColor: Colors.mobilGehenLight,
    darkColor: Colors.mobilGehenDark,
    icon: 'phone-portrait',
    description: 'Mobiles Arbeitsende erfassen',
  },
} as const;

const theme = {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  LineHeight,
  Shadows,
  Typography,
  BookingTypeConfig,
};

export default theme;
