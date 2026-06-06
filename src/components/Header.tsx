/**
 * Header Component
 *
 * Thin horizontal bar in Bundesblau with:
 *  - Stylized "BR" logo in a circle (Bundesadler-style placeholder)
 *  - App title "Zeiterfassung"
 *  - Logged-in user info
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../theme/bundesdesign';
import { useAppContext } from '../context/AppContext';

// ─── Logo ─────────────────────────────────────────────────────────────────────

function BundesLogo() {
  return (
    <View style={styles.logoContainer}>
      <Text style={styles.logoText}>BR</Text>
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface HeaderProps {
  showUserInfo?: boolean;
}

export default function Header({ showUserInfo = true }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { state } = useAppContext();
  const user = state.userSettings?.loggedInUser;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.sm },
      ]}
    >
      <View style={styles.inner}>
        {/* Left: Logo + Title */}
        <View style={styles.left}>
          <BundesLogo />
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Zeiterfassung</Text>
            <Text style={styles.subtitle}>PVS+ Buchungssystem</Text>
          </View>
        </View>

        {/* Right: User info */}
        {showUserInfo && user && (
          <View style={styles.right}>
            <View style={styles.userBadge}>
              <Text style={styles.userInitial}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={styles.userDept} numberOfLines={1}>
                {user.department}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bundesblau,
    paddingBottom: Spacing.base,
    paddingHorizontal: Spacing.base,
    ...Shadows.md,
    // Subtle bottom border for depth
    borderBottomWidth: 1,
    borderBottomColor: Colors.bundesblauDark,
  },

  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },

  // ── Left ──────────────────────────────────────────────────────────────────

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },

  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },

  titleBlock: {
    flexShrink: 1,
  },

  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    letterSpacing: 0.2,
  },

  subtitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 0.15,
    marginTop: 1,
  },

  // ── Right ─────────────────────────────────────────────────────────────────

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    maxWidth: 140,
  },

  userBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.bundesblauLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  userInitial: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },

  userInfo: {
    flexShrink: 1,
  },

  userName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textInverse,
    letterSpacing: 0.1,
  },

  userDept: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 1,
  },
});
