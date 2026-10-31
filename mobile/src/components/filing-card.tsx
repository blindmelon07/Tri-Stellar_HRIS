import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Badge, Card, filingTone } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { dateRange } from '@/lib/format';
import type { Filing } from '@/lib/types';

/** What a filing asks for, in one line. */
export function filingDetail(filing: Filing): string {
  switch (filing.type) {
    case 'unaccounted':
      return [filing.time_from && `In ${filing.time_from}`, filing.time_to && `Out ${filing.time_to}`].filter(Boolean).join(' · ');
    case 'overtime':
      return `${filing.time_from}–${filing.time_to}`;
    case 'early_out':
      return `Out at ${filing.time_from}`;
    case 'leave':
      return `${filing.is_half_day ? 'Half day' : 'Whole day'} · ${filing.with_pay ? 'With pay' : 'Without pay'}`;
    case 'shift_change':
      return filing.shift ?? '';
  }
}

export function FilingCard({ filing, showEmployee = false, actions }: { filing: Filing; showEmployee?: boolean; actions?: ReactNode }) {
  return (
    <Card>
      {showEmployee && filing.employee && (
        <AppText variant="label" color="textSecondary">
          {filing.employee.full_name} · {filing.employee.employee_number}
        </AppText>
      )}
      <View style={styles.header}>
        <AppText variant="heading" style={styles.flex}>
          {filing.type_label}
        </AppText>
        <Badge label={filing.status_label} tone={filingTone[filing.status]} />
      </View>
      <AppText>{dateRange(filing.date_from, filing.date_to)}</AppText>
      {filingDetail(filing) !== '' && (
        <AppText variant="caption" color="textSecondary">
          {filingDetail(filing)}
        </AppText>
      )}
      <AppText color="textSecondary">{filing.reason}</AppText>
      {filing.remarks && <AppText variant="caption">Remarks: {filing.remarks}</AppText>}
      {actions && <View style={styles.actions}>{actions}</View>}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  actions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
});
