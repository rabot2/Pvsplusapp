import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkStatus, Booking, BookingType } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows, BookingTypeConfig } from '../theme/bundesdesign';

interface StatusCardProps {
  workStatus: WorkStatus;
  bookings: Booking[];
  pendingLabel?: string | null;
}

function getStatusConfig(status: WorkStatus) {
  switch (status) {
    case 'present':
      return { label: 'Anwesend', color: Colors.present, bg: Colors.successLight, icon: 'checkmark-circle' as const };
    case 'mobile':
      return { label: 'Mobil tätig', color: Colors.mobile, bg: Colors.infoLight, icon: 'phone-portrait' as const };
    case 'absent':
      return { label: 'Abwesend', color: Colors.absent, bg: Colors.errorLight, icon: 'time-outline' as const };
    default:
      return { label: 'Unbekannt', color: Colors.gray500, bg: Colors.gray200, icon: 'help-circle-outline' as const };
  }
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function getTodayBookings(bookings: Booking[]): Booking[] {
  const today = new Date().toISOString().split('T')[0];
  return bookings
    .filter(b => b.status !== 'cancelled' && b.localCreatedAt.startsWith(today))
    .sort((a, b) => new Date(a.localCreatedAt).getTime() - new Date(b.localCreatedAt).getTime());
}

function computeTotalHours(bookings: Booking[]): number | null {
  const pairs: { kommen: Booking; gehen: Booking }[] = [];
  let openKommen: Booking | null = null;
  for (const b of bookings) {
    if (b.type === BookingType.KOMMEN || b.type === BookingType.MOBILES_KOMMEN) {
      openKommen = b;
    } else if ((b.type === BookingType.GEHEN || b.type === BookingType.MOBILES_GEHEN) && openKommen) {
      pairs.push({ kommen: openKommen, gehen: b });
      openKommen = null;
    }
  }
  if (pairs.length === 0) return null;
  const ms = pairs.reduce((sum, p) => {
    return sum + (new Date(p.gehen.localCreatedAt).getTime() - new Date(p.kommen.localCreatedAt).getTime());
  }, 0);
  return ms / (1000 * 60 * 60);
}

export default function StatusCard({ workStatus, bookings, pendingLabel }: StatusCardProps) {
  const cfg = getStatusConfig(workStatus);
  const todayBookings = getTodayBookings(bookings);
  const totalHours = computeTotalHours(todayBookings);
  const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <View style={[styles.card, Shadows.md]}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.dateLabel}>{today}</Text>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={14} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
        {totalHours !== null && (
          <View style={styles.hoursContainer}>
            <Text style={styles.hoursValue}>
              {Math.floor(totalHours)}:{String(Math.round((totalHours % 1) * 60)).padStart(2, '0')}
            </Text>
            <Text style={styles.hoursLabel}>Std.</Text>
          </View>
        )}
      </View>

      {/* Pending indicator */}
      {pendingLabel && (
        <View style={styles.pendingRow}>
          <View style={styles.pendingDot} />
          <Text style={styles.pendingText}>{pendingLabel}</Text>
        </View>
      )}

      {/* Timeline */}
      {todayBookings.length > 0 && (
        <View style={styles.timeline}>
          {todayBookings.slice(0, 4).map((b, i) => {
            const bc = BookingTypeConfig[b.type];
            return (
              <View key={b.id} style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: bc.color }]} />
                {i < todayBookings.length - 1 && i < 3 && (
                  <View style={[styles.timelineLine, { backgroundColor: bc.color + '40' }]} />
                )}
                <Text style={[styles.timelineTime, { color: bc.color }]}>
                  {formatTime(b.localCreatedAt)}
                </Text>
                <Text style={styles.timelineLabel}>{bc.label}</Text>
                {b.status === 'sent' && (
                  <Ionicons name="checkmark" size={12} color={Colors.success} style={styles.sentIcon} />
                )}
                {b.status === 'failed' && (
                  <Ionicons name="warning-outline" size={12} color={Colors.error} style={styles.sentIcon} />
                )}
              </View>
            );
          })}
          {todayBookings.length > 4 && (
            <Text style={styles.moreBookings}>+{todayBookings.length - 4} weitere</Text>
          )}
        </View>
      )}

      {todayBookings.length === 0 && !pendingLabel && (
        <Text style={styles.emptyText}>Noch keine Buchungen heute</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  dateLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  hoursContainer: {
    alignItems: 'flex-end',
  },
  hoursValue: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  hoursLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.regular,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.warning,
  },
  pendingText: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  timeline: {
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    position: 'relative',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineLine: {
    position: 'absolute',
    left: 4.5,
    top: 12,
    width: 1,
    height: 10,
  },
  timelineTime: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    fontVariant: ['tabular-nums'],
    width: 44,
  },
  timelineLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  sentIcon: {
    marginLeft: 2,
  },
  moreBookings: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 4,
    marginLeft: 18,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
    fontStyle: 'italic',
  },
});
