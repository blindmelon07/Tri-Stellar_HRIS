import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Badge, Button, Card, ErrorState, Icon, LoadingState, Screen, SectionTitle } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { peso } from '@/lib/format';
import type { Home, Profile } from '@/lib/types';

function greeting(): string {
  const hour = new Date().getHours();

  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

export default function HomeScreen() {
  const theme = useTheme();
  const home = useApi<{ data: Home }>('home');
  const profile = useApi<{ data: Profile }>('me');

  const summary = home.data?.data;
  const me = profile.data?.data;

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.background }]}>
      <Screen onRefresh={() => { home.refresh(); profile.refresh(); }} refreshing={home.isRefreshing}>
        <View style={styles.header}>
          <Image source={require('@/assets/images/wordmark.png')} style={styles.wordmark} contentFit="contain" accessibilityLabel="TriStellar" />
          <Badge label="HRIS" tone="brand" />
        </View>

        {home.isLoading && !summary ? (
          <LoadingState />
        ) : home.error && !summary ? (
          <ErrorState message={home.error} onRetry={home.refresh} />
        ) : summary ? (
          <>
            <View>
              <AppText variant="title">
                {greeting()}, {me?.employee.first_name ?? ''}
              </AppText>
              <AppText color="textSecondary">
                {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
              </AppText>
            </View>

            <Card>
              <View style={styles.cardHeader}>
                <Icon name="clock" color={theme.brand} />
                <AppText variant="heading">Today&apos;s logs</AppText>
              </View>
              {summary.today_logs.length ? (
                <View style={styles.logs}>
                  {summary.today_logs.map((time, index) => (
                    <View key={index} style={[styles.logChip, { backgroundColor: theme.backgroundSelected }]}>
                      <AppText variant="heading">{time}</AppText>
                      <AppText variant="caption" color="textSecondary">
                        {index === 0 ? 'In' : index === summary.today_logs.length - 1 ? 'Out' : 'Break'}
                      </AppText>
                    </View>
                  ))}
                </View>
              ) : (
                <AppText color="textSecondary">No punches yet today. Tap your company ID at the biometric reader.</AppText>
              )}
              {me && (
                <AppText variant="caption" color="textSecondary">
                  Shift: {me.employee.shift.name}
                </AppText>
              )}
            </Card>

            {summary.endorsements_waiting !== null && (
              <Card onPress={() => router.push('/endorsements')}>
                <View style={styles.cardHeader}>
                  <Icon name="check" color={theme.brand} />
                  <AppText variant="heading" style={styles.flex}>
                    Team filings to endorse
                  </AppText>
                  <Badge label={String(summary.endorsements_waiting)} tone={summary.endorsements_waiting ? 'amber' : 'gray'} />
                  <Icon name="chevronRight" size={18} color={theme.textSecondary} />
                </View>
              </Card>
            )}

            <SectionTitle>Quick actions</SectionTitle>
            <View style={styles.actions}>
              <View style={styles.flex}>
                <Button title="File a request" onPress={() => router.push('/new-filing')} />
              </View>
              <View style={styles.flex}>
                <Button title="My attendance" variant="secondary" onPress={() => router.push('/attendance')} />
              </View>
            </View>

            <Card onPress={() => router.push('/filings')}>
              <View style={styles.cardHeader}>
                <Icon name="filing" color={theme.brand} />
                <AppText variant="heading" style={styles.flex}>
                  My filings
                </AppText>
                <AppText color="textSecondary">
                  {summary.pending_filings ? `${summary.pending_filings} awaiting approval` : 'None pending'}
                </AppText>
              </View>
            </Card>

            <Card onPress={summary.latest_payslip ? () => router.push(`/payslips/${summary.latest_payslip!.id}`) : undefined}>
              <View style={styles.cardHeader}>
                <Icon name="payslip" color={theme.brand} />
                <AppText variant="heading">Latest payslip</AppText>
              </View>
              {summary.latest_payslip ? (
                <>
                  <AppText variant="amount">{peso(summary.latest_payslip.net_pay)}</AppText>
                  <AppText color="textSecondary">
                    {summary.latest_payslip.period.label} · {summary.latest_payslip.payment_method_label}
                  </AppText>
                </>
              ) : (
                <AppText color="textSecondary">No released payslips yet.</AppText>
              )}
            </Card>
          </>
        ) : null}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  wordmark: { width: 120, height: 36 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  logs: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  logChip: { borderRadius: 12, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, alignItems: 'center' },
  actions: { flexDirection: 'row', gap: Spacing.two },
});
