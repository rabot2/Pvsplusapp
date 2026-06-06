import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../theme/bundesdesign';

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return <View style={[styles.card, Shadows.sm]}>{children}</View>;
}

function InputRow({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'url';
  editable?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false}
        keyboardType={keyboardType ?? 'default'}
        editable={editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  loading,
  variant = 'primary',
  icon,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: string;
}) {
  const bgColors = {
    primary: Colors.bundesblau,
    secondary: Colors.background,
    danger: Colors.error,
    success: Colors.success,
  };
  const textColors = {
    primary: Colors.textInverse,
    secondary: Colors.bundesblau,
    danger: Colors.textInverse,
    success: Colors.textInverse,
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={[
        styles.actionBtn,
        { backgroundColor: bgColors[variant] },
        variant === 'secondary' && { borderWidth: 1.5, borderColor: Colors.bundesblau },
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <>
          {icon && <Ionicons name={icon as any} size={16} color={textColors[variant]} />}
          <Text style={[styles.actionBtnText, { color: textColors[variant] }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { state, login, logout, testConnection, updateSettings } = useAppContext();
  const { userSettings, isAuthenticated } = state;

  const [apiUrl, setApiUrl] = useState(userSettings?.apiUrl ?? '');
  const [username, setUsername] = useState(userSettings?.username ?? '');
  const [password, setPassword] = useState(userSettings?.password ?? '');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);

  useEffect(() => {
    if (userSettings) {
      setApiUrl(userSettings.apiUrl);
      setUsername(userSettings.username);
      setPassword(userSettings.password);
    }
  }, [userSettings]);

  const handleLogin = async () => {
    if (!apiUrl || !username || !password) {
      Alert.alert('Fehlende Angaben', 'Bitte API-URL, Benutzername und Passwort angeben.');
      return;
    }
    setLoginLoading(true);
    try {
      await login(apiUrl, username, password);
      Alert.alert('Anmeldung erfolgreich', `Willkommen, ${username}!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen.';
      Alert.alert('Anmeldung fehlgeschlagen', msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiUrl) {
      Alert.alert('Fehlende Angabe', 'Bitte API-URL eingeben.');
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    try {
      const ok = await testConnection(apiUrl, username, password);
      setTestResult(ok ? 'success' : 'fail');
    } finally {
      setTestLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Abmelden',
      'Möchten Sie sich wirklich abmelden? Ihre lokalen Buchungen bleiben erhalten.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Abmelden', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Alle Daten löschen',
      'Dieser Vorgang löscht alle Buchungen, Anmeldedaten und Einstellungen unwiderruflich.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root]}>
      <View style={[styles.titleBar, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.screenTitle}>Einstellungen</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Login status banner */}
        {isAuthenticated && userSettings?.loggedInUser && (
          <View style={styles.loggedInBanner}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {userSettings.loggedInUser.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfoBlock}>
              <Text style={styles.loggedInName}>{userSettings.loggedInUser.name}</Text>
              <Text style={styles.loggedInDept}>{userSettings.loggedInUser.department}</Text>
            </View>
            <View style={styles.statusDot} />
          </View>
        )}

        {/* API Configuration */}
        <SectionLabel title="API-KONFIGURATION" />
        <SettingsCard>
          <InputRow
            label="API-URL"
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="https://zeiterfassung.bund.de"
            keyboardType="url"
          />
          <View style={styles.cardDivider} />
          <View style={styles.testRow}>
            <ActionButton
              label="Verbindung testen"
              onPress={handleTestConnection}
              loading={testLoading}
              variant="secondary"
              icon="wifi-outline"
            />
            {testResult === 'success' && (
              <View style={styles.testResultBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text style={[styles.testResultText, { color: Colors.success }]}>Erreichbar</Text>
              </View>
            )}
            {testResult === 'fail' && (
              <View style={styles.testResultBadge}>
                <Ionicons name="close-circle" size={14} color={Colors.error} />
                <Text style={[styles.testResultText, { color: Colors.error }]}>Nicht erreichbar</Text>
              </View>
            )}
          </View>
        </SettingsCard>

        {/* Credentials */}
        <SectionLabel title="ANMELDEDATEN" />
        <SettingsCard>
          <InputRow
            label="Benutzername"
            value={username}
            onChangeText={setUsername}
            placeholder="max.mustermann"
            keyboardType="email-address"
          />
          <View style={styles.cardDivider} />
          <View style={styles.passwordRow}>
            <InputRow
              label="Passwort"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(v => !v)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.loginButtonRow}>
            <ActionButton
              label={isAuthenticated ? 'Neu anmelden' : 'Anmelden'}
              onPress={handleLogin}
              loading={loginLoading}
              variant={isAuthenticated ? 'secondary' : 'primary'}
              icon="log-in-outline"
            />
            {isAuthenticated && (
              <ActionButton
                label="Abmelden"
                onPress={handleLogout}
                variant="danger"
                icon="log-out-outline"
              />
            )}
          </View>
        </SettingsCard>

        {/* App info */}
        <SectionLabel title="INFORMATIONEN" />
        <SettingsCard>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App-Version</Text>
            <Text style={styles.infoValue}>1.0.0 (Mock)</Text>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>API-Schnittstelle</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{apiUrl || '—'}</Text>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Buchungsverzögerung</Text>
            <Text style={styles.infoValue}>120 Sekunden</Text>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.authStatusRow}>
              <View style={[styles.statusIndicator, { backgroundColor: isAuthenticated ? Colors.success : Colors.error }]} />
              <Text style={[styles.infoValue, { color: isAuthenticated ? Colors.success : Colors.error }]}>
                {isAuthenticated ? 'Angemeldet' : 'Nicht angemeldet'}
              </Text>
            </View>
          </View>
        </SettingsCard>

        {/* Danger zone */}
        <SectionLabel title="DATENVERWALTUNG" />
        <SettingsCard>
          <Text style={styles.dangerDescription}>
            Alle lokalen Buchungen, Anmeldedaten und Einstellungen werden dauerhaft gelöscht.
          </Text>
          <View style={{ marginTop: Spacing.sm }}>
            <ActionButton
              label="Alle Daten löschen"
              onPress={handleClearData}
              variant="danger"
              icon="trash-outline"
            />
          </View>
        </SettingsCard>
      </ScrollView>
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
  },
  screenTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  loggedInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1.5,
    borderColor: Colors.success + '40',
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bundesblau,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  userInfoBlock: {
    flex: 1,
  },
  loggedInName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  loggedInDept: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 1.2,
    marginTop: Spacing.base,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  inputRow: {
    padding: Spacing.base,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginBottom: Spacing.xs,
  },
  input: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    backgroundColor: Colors.background,
  },
  inputFocused: {
    borderColor: Colors.bundesblau,
    backgroundColor: Colors.surface,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  passwordRow: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: Spacing.base + Spacing.xs,
    bottom: Spacing.base,
    padding: 4,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  testResultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  testResultText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  loginButtonRow: {
    flexDirection: 'row',
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  actionBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
  },
  infoLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    maxWidth: 180,
    textAlign: 'right',
  },
  authStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dangerDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    padding: Spacing.base,
    lineHeight: 20,
  },
});
