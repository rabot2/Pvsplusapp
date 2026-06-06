import React, { useEffect, useRef } from 'react';
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
import { PendingBooking } from '../types';
import { BookingTypeConfig, Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../theme/bundesdesign';

interface UndoBannerProps {
  pending: PendingBooking;
  onUndo: () => void;
  bottomInset?: number;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function CircularCountdown({ remaining, total, color }: { remaining: number; total: number; color: string }) {
  const size = 44;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / total;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background circle */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: 'rgba(255,255,255,0.2)',
        }}
      />
      {/* Progress indicator — simple text-based for RN compatibility */}
      <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textInverse, fontVariant: ['tabular-nums'] }}>
        {remaining}
      </Text>
    </View>
  );
}

export default function UndoBanner({ pending, onUndo, bottomInset = 0 }: UndoBannerProps) {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const config = BookingTypeConfig[pending.booking.type];

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 14,
      bounciness: 6,
    }).start();
    return () => {
      Animated.spring(slideAnim, {
        toValue: 100,
        useNativeDriver: true,
        speed: 14,
        bounciness: 0,
      }).start();
    };
  }, []);

  const handleUndo = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Animated.spring(slideAnim, {
      toValue: 100,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start(() => onUndo());
  };

  const isUrgent = pending.remainingSeconds <= 30;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.color,
          bottom: bottomInset + Spacing.base,
          transform: [{ translateY: slideAnim }],
        },
        isUrgent && { backgroundColor: config.darkColor },
        Shadows.xl,
      ]}
    >
      {/* Left: countdown circle */}
      <CircularCountdown
        remaining={pending.remainingSeconds}
        total={pending.countdownSeconds}
        color={Colors.textInverse}
      />

      {/* Center: info */}
      <View style={styles.info}>
        <Text style={styles.typeLabel}>{config.label}</Text>
        <Text style={styles.timeLabel}>
          Buchungszeit: {formatTime(pending.booking.localCreatedAt)}
        </Text>
        <Text style={styles.countdownLabel}>
          Wird in {pending.remainingSeconds}s übermittelt
        </Text>
      </View>

      {/* Right: undo button */}
      <TouchableOpacity onPress={handleUndo} style={styles.undoButton} activeOpacity={0.8}>
        <Ionicons name="arrow-undo" size={16} color={config.color} />
        <Text style={[styles.undoText, { color: config.color }]}>Zurück</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    zIndex: 999,
  },
  info: {
    flex: 1,
  },
  typeLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    letterSpacing: 0.2,
  },
  timeLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  undoButton: {
    backgroundColor: Colors.textInverse,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    ...Shadows.sm,
  },
  undoText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
});
