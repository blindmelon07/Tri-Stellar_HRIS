import { SymbolView } from 'expo-symbols';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { MaxContentWidth, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

/** SF Symbols on iOS, Material Symbols on Android and web. */
export const Icons = {
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  filing: { ios: 'doc.text.fill', android: 'description', web: 'description' },
  payslip: { ios: 'banknote.fill', android: 'payments', web: 'payments' },
  profile: { ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' },
  check: { ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  chevronLeft: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  plus: { ios: 'plus', android: 'add', web: 'add' },
  clock: { ios: 'clock.fill', android: 'schedule', web: 'schedule' },
  warning: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
} satisfies Record<string, SymbolName>;

export function Icon({ name, size = 22, color }: { name: keyof typeof Icons; size?: number; color: ComponentProps<typeof SymbolView>['tintColor'] }) {
  return <SymbolView name={Icons[name]} size={size} tintColor={color} fallback={<View style={{ width: size, height: size }} />} />;
}

export function Screen({
  children,
  onRefresh,
  refreshing = false,
  contentStyle,
}: {
  children: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  contentStyle?: ViewStyle;
}) {
  const theme = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={[styles.screenContent, contentStyle]}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.brand} colors={[theme.brand]} /> : undefined
      }>
      {children}
    </ScrollView>
  );
}

export function AppText({
  children,
  variant = 'body',
  color = 'text',
  style,
  numberOfLines,
}: {
  children: ReactNode;
  variant?: 'title' | 'heading' | 'body' | 'label' | 'caption' | 'amount';
  color?: ThemeColor;
  style?: ComponentProps<typeof Text>['style'];
  numberOfLines?: number;
}) {
  const theme = useTheme();

  return (
    <Text numberOfLines={numberOfLines} style={[styles[variant], { color: theme[color] }, style]}>
      {children}
    </Text>
  );
}

export function Card({ children, style, onPress }: { children: ReactNode; style?: ViewStyle; onPress?: () => void }) {
  const theme = useTheme();
  const cardStyle = [styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }, style];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, pressed && styles.pressed]} accessibilityRole="button">
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <AppText variant="label" color="textSecondary">
        {children}
      </AppText>
      {action}
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  small = false,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
}) {
  const theme = useTheme();
  const background = { primary: theme.brand, secondary: theme.backgroundElement, danger: theme.dangerSoft }[variant];
  const foreground = { primary: theme.brandText, secondary: theme.text, danger: theme.danger }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: background, borderColor: variant === 'secondary' ? theme.border : background },
        (pressed || disabled) && styles.pressed,
      ]}>
      {loading ? <ActivityIndicator color={foreground} /> : <Text style={[styles.buttonText, small && styles.buttonTextSmall, { color: foreground }]}>{title}</Text>}
    </Pressable>
  );
}

const badgeTones: Record<string, [ThemeColor, ThemeColor]> = {
  green: ['successSoft', 'success'],
  amber: ['warningSoft', 'warning'],
  red: ['dangerSoft', 'danger'],
  blue: ['infoSoft', 'info'],
  brand: ['brandSoft', 'brand'],
  gray: ['backgroundSelected', 'textSecondary'],
};

export type BadgeTone = keyof typeof badgeTones;

export function Badge({ label, tone = 'gray' }: { label: string; tone?: BadgeTone }) {
  const theme = useTheme();
  const [background, foreground] = badgeTones[tone];

  return (
    <View style={[styles.badge, { backgroundColor: theme[background] }]}>
      <Text style={[styles.badgeText, { color: theme[foreground] }]}>{label}</Text>
    </View>
  );
}

export const filingTone: Record<string, BadgeTone> = {
  pending: 'amber',
  endorsed: 'blue',
  approved: 'green',
  denied: 'red',
};

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      {children}
      {error ? (
        <AppText variant="caption" color="danger">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color="textSecondary">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

export function Input(props: TextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      {...props}
      style={[styles.input, { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text }, props.style]}
    />
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        { borderColor: selected ? theme.brand : theme.border, backgroundColor: selected ? theme.brandSoft : theme.backgroundElement },
      ]}>
      <Text style={[styles.chipText, { color: selected ? theme.brand : theme.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Row({ label, value, strong = false }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <AppText color={strong ? 'text' : 'textSecondary'} style={strong && styles.strong}>
        {label}
      </AppText>
      <AppText style={[styles.rowValue, strong && styles.strong]}>{value}</AppText>
    </View>
  );
}

export function Divider() {
  const theme = useTheme();

  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

export function LoadingState() {
  const theme = useTheme();

  return (
    <View style={styles.centered}>
      <ActivityIndicator color={theme.brand} size="large" />
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const theme = useTheme();

  return (
    <View style={styles.centered}>
      <Icon name="warning" size={32} color={theme.warning} />
      <AppText style={styles.centerText}>{message}</AppText>
      <Button title="Try again" variant="secondary" onPress={onRetry} small />
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <View style={[styles.centered, styles.empty]}>
      <AppText variant="heading">{title}</AppText>
      {message && (
        <AppText color="textSecondary" style={styles.centerText}>
          {message}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  title: { fontSize: 26, fontWeight: '700', lineHeight: 32 },
  heading: { fontSize: 17, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 15, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
  amount: { fontSize: 28, fontWeight: '700', lineHeight: 34, fontVariant: ['tabular-nums'] },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pressed: { opacity: 0.65 },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
    textTransform: 'uppercase',
  },
  button: {
    minHeight: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  buttonSmall: { minHeight: 36, paddingHorizontal: Spacing.three },
  buttonText: { fontSize: 16, fontWeight: '600' },
  buttonTextSmall: { fontSize: 14 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  field: { gap: Spacing.one },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three, paddingVertical: Spacing.half },
  rowValue: { fontVariant: ['tabular-nums'], textAlign: 'right', flexShrink: 1 },
  strong: { fontWeight: '700' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.one },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, padding: Spacing.five, minHeight: 240 },
  centerText: { textAlign: 'center' },
  empty: { minHeight: 200 },
});
