import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BookingType } from '../types';
import { useAppContext } from '../context/AppContext';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/bundesdesign';
import Header from '../components/Header';
import BookingButton from '../components/BookingButton';
import StatusCard from '../components/StatusCard';
import UndoBanner from '../components/UndoBanner';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { state, makeBooking, undoPendingBooking, refreshBookings } = useAppContext();
  const { pendingBooking, bookings, workStatus, isLoading } = state;

  const hasPending = !!pendingBooking;

  const getLastTimeForType = (type: BookingType): string | undefined => {
    return bookings.find(b => b.type === type && b.status !== 'cancelled')?.localCreatedAt;
  };

  const pendingLabel = pendingBooking
    ? `Buchung "${pendingBooking.booking.type === BookingType.KOMMEN ? 'Kommen' :
        pendingBooking.booking.type === BookingType.GEHEN ? 'Gehen' :
        pendingBooking.booking.type === BookingType.MOBILES_KOMMEN ? 'Mobiles Kommen' : 'Mobiles Gehen'
      }" wird in ${pendingBooking.remainingSeconds}s übermittelt…`
    : null;

  return (
    <View style={styles.root}>
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshBookings}
            tintColor={Colors.bundesblau}
          />
        }
      >
        {/* Status Card */}
        <StatusCard
          workStatus={workStatus}
          bookings={bookings}
          pendingLabel={pendingLabel}
        />

        {/* Auth warning */}
        {!state.isAuthenticated && (
          <View style={styles.authWarning}>
            <Ionicons name="warning-outline" size={16} color={Colors.warning} />
            <Text style={styles.authWarningText}>
              Nicht angemeldet — Buchungen werden lokal gespeichert. Bitte in den Einstellungen anmelden.
            </Text>
          </View>
        )}

        {/* Booking Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>BUCHUNG ERFASSEN</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <BookingButton
              type={BookingType.KOMMEN}
              onPress={() => makeBooking(BookingType.KOMMEN)}
              disabled={hasPending}
              lastTime={getLastTimeForType(BookingType.KOMMEN)}
            />
            <BookingButton
              type={BookingType.GEHEN}
              onPress={() => makeBooking(BookingType.GEHEN)}
              disabled={hasPending}
              lastTime={getLastTimeForType(BookingType.GEHEN)}
            />
          </View>
          <View style={styles.gridRow}>
            <BookingButton
              type={BookingType.MOBILES_KOMMEN}
              onPress={() => makeBooking(BookingType.MOBILES_KOMMEN)}
              disabled={hasPending}
              lastTime={getLastTimeForType(BookingType.MOBILES_KOMMEN)}
            />
            <BookingButton
              type={BookingType.MOBILES_GEHEN}
              onPress={() => makeBooking(BookingType.MOBILES_GEHEN)}
              disabled={hasPending}
              lastTime={getLastTimeForType(BookingType.MOBILES_GEHEN)}
            />
          </View>
        </View>

        {hasPending && (
          <View style={styles.pendingHint}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.pendingHintText}>
              Neue Buchungen sind erst möglich, wenn die aktuelle Buchung übermittelt oder abgebrochen wurde.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating undo banner */}
      {pendingBooking && (
        <UndoBanner
          pending={pendingBooking}
          onUndo={undoPendingBooking}
          bottomInset={insets.bottom + 60}
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
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  authWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FFCC80',
  },
  authWarningText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.warning,
    lineHeight: 16,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.base + Spacing.xs,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 1.2,
  },
  grid: {
    paddingHorizontal: Spacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  pendingHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  pendingHintText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    lineHeight: 16,
  },
});
