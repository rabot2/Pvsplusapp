import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BookingType } from '../types';
import { BookingTypeConfig, Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../theme/bundesdesign';

interface BookingButtonProps {
  type: BookingType;
  onPress: () => void;
  disabled?: boolean;
  lastTime?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export default function BookingButton({ type, onPress, disabled = false, lastTime }: BookingButtonProps) {
  const config = BookingTypeConfig[type];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  const isMobile = type === BookingType.MOBILES_KOMMEN || type === BookingType.MOBILES_GEHEN;
  const isGehen = type === BookingType.GEHEN || type === BookingType.MOBILES_GEHEN;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
        style={[
          styles.button,
          { backgroundColor: disabled ? Colors.gray300 : config.color },
          disabled && styles.buttonDisabled,
        ]}
      >
        {/* Background pattern */}
        <View style={[styles.patternCircle, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

        {/* Icon row */}
        <View style={styles.iconRow}>
          {isMobile && (
            <Ionicons
              name="phone-portrait-outline"
              size={16}
              color="rgba(255,255,255,0.8)"
              style={styles.mobileIcon}
            />
          )}
          <Ionicons
            name={isGehen ? 'log-out-outline' : 'log-in-outline'}
            size={28}
            color={disabled ? Colors.gray500 : Colors.textInverse}
          />
        </View>

        {/* Label */}
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {config.label}
        </Text>

        {/* Sublabel / description */}
        <Text style={[styles.description, disabled && styles.labelDisabled]}>
          {config.description}
        </Text>

        {/* Last booking time */}
        {lastTime && !disabled && (
          <View style={styles.lastTimeContainer}>
            <Text style={styles.lastTimeLabel}>Zuletzt</Text>
            <Text style={styles.lastTime}>{formatTime(lastTime)}</Text>
          </View>
        )}

        {/* Disabled overlay label */}
        {disabled && (
          <View style={styles.disabledBadge}>
            <Text style={styles.disabledBadgeText}>Buchung läuft…</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: Spacing.xs,
    borderRadius: BorderRadius['2xl'],
    ...Shadows.md,
  },
  button: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.base,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    overflow: 'hidden',
    position: 'relative',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  patternCircle: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  mobileIcon: {
    marginRight: 4,
  },
  label: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  labelDisabled: {
    color: Colors.gray500,
  },
  description: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    marginTop: 3,
  },
  lastTimeContainer: {
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastTimeLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: FontWeight.regular,
  },
  lastTime: {
    fontSize: FontSize.xs,
    color: Colors.textInverse,
    fontWeight: FontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  disabledBadge: {
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  disabledBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.gray600,
    fontWeight: FontWeight.medium,
  },
});
