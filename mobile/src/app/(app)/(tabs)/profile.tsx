import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Divider, ErrorState, Icon, LoadingState, Row, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/ctx/session';
import { useApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { API_URL } from '@/lib/api';
import type { Profile } from '@/lib/types';

export default function ProfileScreen() {
  const theme = useTheme();
  const { signOut } = useSession();
  const profile = useApi<{ data: Profile }>('me');
  const me = profile.data?.data;

  return (
    <Screen onRefresh={profile.refresh} refreshing={profile.isRefreshing}>
      {profile.isLoading && !me ? (
        <LoadingState />
      ) : profile.error && !me ? (
        <ErrorState message={profile.error} onRetry={profile.refresh} />
      ) : me ? (
        <>
          <View style={styles.hero}>
            <View style={[styles.avatar, { backgroundColor: theme.brandSoft }]}>
              <AppText variant="title" color="brand">
                {me.employee.full_name.charAt(0)}
              </AppText>
            </View>
            <AppText variant="heading">{me.employee.full_name}</AppText>
            <AppText color="textSecondary">{me.employee.job_title}</AppText>
          </View>

          <Card>
            <Row label="Employee No." value={me.employee.employee_number} />
            <Divider />
            <Row label="Department" value={me.employee.department} />
            <Divider />
            <Row label="Branch" value={me.employee.branch} />
            <Divider />
            <Row label="Shift" value={`${me.employee.shift.start_time}–${me.employee.shift.end_time}`} />
            <Divider />
            <Row label="Login" value={me.email} />
          </Card>

          {me.can.endorse_filings && (
            <Card onPress={() => router.push('/endorsements')}>
              <View style={styles.link}>
                <Icon name="check" color={theme.brand} />
                <AppText variant="heading" style={styles.flex}>
                  Team endorsements
                </AppText>
                <Icon name="chevronRight" size={18} color={theme.textSecondary} />
              </View>
            </Card>
          )}

          <Button title="Sign out" variant="secondary" onPress={signOut} />
          <AppText variant="caption" color="textSecondary" style={styles.center}>
            TriStellar HRIS · Server {API_URL.replace(/^https?:\/\//, '')}
          </AppText>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { alignItems: 'center', gap: Spacing.one, paddingVertical: Spacing.three },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  link: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  center: { textAlign: 'center' },
});
