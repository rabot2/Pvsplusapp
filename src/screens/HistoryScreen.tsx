import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Booking, BookingType } from '../types';
import { useAppContext } from '../context/AppContext';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows, BookingTypeConfig } from '../theme/bundesdesign';

type ListItem =
  | { kind: 'header'; date: string; label: string }
  | { kind: 'booking'; booking: Booking };

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Heute';
  if (dateStr === yesterday) return 'Gestern';
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function statusInfo(status: Booking['status']) {
  switch (status) {
    case 'sent':
      return { icon: 'checkmark-circle' as const, color: Colors.success, label: 'Übermittelt' };
    case 'failed':
      return { icon: 'close-circle' as const, color: Colors.error, label: 'Fehlgeschlagen' };
    case 'cancelled':
      return { icon: 'ban' as const, color: Colors.gray400, label: 'Abgebrochen' };
    case 'pending':
    default:
      return { icon: 'time' as const, color: Colors.warning, label: 'Ausstehend' };
  }
}

function BookingRow({ booking }: { booking: Booking }) {
  const cfg = BookingTypeConfig[booking.type];
  const st = statusInfo(booking.status);
  const isCancelled = booking.status === 'cancelled';

  return (
    <View style={[styles.row, isCancelled && styles.rowCancelled]}>
      {/* Color bar */}
      <View style={[styles.colorBar, { backgroundColor: isCancelled ? Colors.gray300 : cfg.color }]} />

      {/* Icon */}
      <View style={[styles.typeIcon, { backgroundColor: isCancelled ? Colors.gray200 : cfg.lightColor }]}>
        <Ionicons
          name={cfg.icon as any}
          size={18}
          color={isCancelled ? Colors.gray400 : cfg.color}
        />
      </View>

      {/* Info */}
      <View style={styles.rowInfo}>
        <Text style={[styles.typeLabel, isCancelled && styles.cancelledText]}>{cfg.label}</Text>
        <Text style={styles.timeLabel}>{formatTime(booking.localCreatedAt)} Uhr</Text>
        {booking.errorMessage && (
          <Text style={styles.errorText} numberOfLines={1}>{booking.errorMessage}</Text>
        )}
      </View>

      {/* Status */}
      <View style={styles.statusBadge}>
        <Ionicons name={st.icon} size={14} color={st.color} />
        <Text style={[styles.statusLabel, { color: st.color }]}>{st.label}</Text>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { state, refreshBookings } = useAppContext();
  const { bookings, isLoading } = state;

  // Group bookings by date and build flat list
  const listItems = useCallback((): ListItem[] => {
    const visible = bookings.filter(b => b.status !== 'cancelled' || true);
    const grouped: Record<string, Booking[]> = {};
    for (const b of visible) {
      const date = b.localCreatedAt.split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(b);
    }
    const items: ListItem[] = [];
    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    for (const date of sortedDates) {
      items.push({ kind: 'header', date, label: formatDate(date) });
      for (const b of grouped[date].sort(
        (a, c) => new Date(c.localCreatedAt).getTime() - new Date(a.localCreatedAt).getTime()
      )) {
        items.push({ kind: 'booking', booking: b });
      }
    }
    return items;
  }, [bookings])();

  const renderItem = ({ item }: ListRenderItemInfo<ListItem>) => {
    if (item.kind === 'header') {
      return (
        <View style={styles.dateHeader}>
          <Text style={styles.dateHeaderText}>{item.label}</Text>
        </View>
      );
    }
    return <BookingRow booking={item.booking} />;
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Screen title bar */}
      <View style={styles.titleBar}>
        <Text style={styles.screenTitle}>Buchungsverlauf</Text>
        <Text style={styles.countBadge}>{bookings.filter(b => b.status !== 'cancelled').length}</Text>
      </View>

      {listItems.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={48} color={Colors.gray300} />
          <Text style={styles.emptyTitle}>Keine Buchungen vorhanden</Text>
          <Text style={styles.emptyText}>Erfassen Sie Ihre erste Buchung im Tab "Buchung".</Text>
        </View>
      ) : (
        <FlatList
          data={listItems}
          keyExtractor={(item, i) =>
            item.kind === 'header' ? `hdr-${item.date}` : `bkn-${item.booking.id}`
          }
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refreshBookings}
              tintColor={Colors.bundesblau}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  titleBar: {
    backgroundColor: Colors.bundesblau,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: Colors.textInverse,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  listContent: {
    paddingTop: Spacing.sm,
  },
  dateHeader: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xs,
  },
  dateHeaderText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  rowCancelled: {
    opacity: 0.6,
  },
  colorBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginLeft: 0,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  cancelledText: {
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  timeLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statusLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
