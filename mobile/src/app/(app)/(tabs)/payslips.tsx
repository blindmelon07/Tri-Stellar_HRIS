import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, EmptyState, ErrorState, Icon, LoadingState, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, peso } from '@/lib/format';
import type { Paginated, PayslipSummary } from '@/lib/types';

export default function PayslipsScreen() {
  const theme = useTheme();
  const payslips = useApi<Paginated<PayslipSummary>>('payslips');

  return (
    <Screen onRefresh={payslips.refresh} refreshing={payslips.isRefreshing}>
      {payslips.isLoading && !payslips.data ? (
        <LoadingState />
      ) : payslips.error && !payslips.data ? (
        <ErrorState message={payslips.error} onRetry={payslips.refresh} />
      ) : payslips.data?.data.length ? (
        payslips.data.data.map((payslip) => (
          <Card key={payslip.id} onPress={() => router.push(`/payslips/${payslip.id}`)}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <AppText variant="heading">{payslip.period.label}</AppText>
                <AppText variant="caption" color="textSecondary">
                  Pay date {formatDate(payslip.period.pay_date)} · {payslip.payment_method_label}
                </AppText>
              </View>
              <AppText variant="heading">{peso(payslip.net_pay)}</AppText>
              <Icon name="chevronRight" size={18} color={theme.textSecondary} />
            </View>
          </Card>
        ))
      ) : (
        <EmptyState title="No payslips yet" message="Payslips appear here once payroll for the cut-off is finalized." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
