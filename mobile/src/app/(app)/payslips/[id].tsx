import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, Divider, ErrorState, LoadingState, Row, Screen, SectionTitle } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, minutes, peso } from '@/lib/format';
import type { Payslip } from '@/lib/types';

export default function PayslipScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const payslip = useApi<{ data: Payslip }>(`payslips/${id}`);
  const slip = payslip.data?.data;

  if (payslip.isLoading && !slip) {
    return <LoadingState />;
  }

  if (!slip) {
    return <ErrorState message={payslip.error ?? 'Payslip not found.'} onRetry={payslip.refresh} />;
  }

  const { attendance, earnings, deductions } = slip.details;

  return (
    <Screen>
      <Card style={{ backgroundColor: theme.brandSoft, borderColor: theme.brandSoft }}>
        <AppText variant="label" color="brand">
          NET PAY
        </AppText>
        <AppText variant="amount">{peso(slip.net_pay)}</AppText>
        <AppText color="textSecondary">
          {slip.period.label} · Paid {formatDate(slip.period.pay_date)}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          {slip.payment_method === 'atm' ? 'Credited to your BDO payroll account' : 'Released in cash'}
        </AppText>
      </Card>

      <View style={styles.stats}>
        {[
          ['Days worked', String(attendance.days_worked)],
          ['Absent', String(attendance.days_absent)],
          ['Late / UT', minutes(attendance.late_undertime_minutes)],
          ['Overtime', `${attendance.overtime_hours}h`],
        ].map(([label, value]) => (
          <Card key={label} style={styles.stat}>
            <AppText variant="heading">{value}</AppText>
            <AppText variant="caption" color="textSecondary">
              {label}
            </AppText>
          </Card>
        ))}
      </View>

      <SectionTitle>Earnings</SectionTitle>
      <Card>
        {earnings.map((line) => (
          <Row key={line.label} label={line.label} value={line.amount < 0 ? `−${peso(-line.amount)}` : peso(line.amount)} />
        ))}
        <Divider />
        <Row label="Gross pay" value={peso(slip.gross_pay)} strong />
      </Card>

      <SectionTitle>Deductions</SectionTitle>
      <Card>
        {deductions.length ? (
          deductions.map((line, index) => <Row key={`${line.label}-${index}`} label={line.label} value={peso(line.amount)} />)
        ) : (
          <AppText color="textSecondary">No deductions this cut-off.</AppText>
        )}
        <Divider />
        <Row label="Total deductions" value={peso(slip.total_deductions)} strong />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  stat: { flexGrow: 1, flexBasis: '45%', alignItems: 'center', gap: 0 },
});
