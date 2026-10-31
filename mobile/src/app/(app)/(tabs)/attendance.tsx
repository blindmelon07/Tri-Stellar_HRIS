import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Badge, Card, ErrorState, Icon, LoadingState, Screen, type BadgeTone } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { cutoff, dateRange, formatDate, minutes } from '@/lib/format';
import type { Attendance, DailyRecord } from '@/lib/types';

const status: Record<DailyRecord['status'], [string, BadgeTone]> = {
  present: ['Present', 'green'],
  absent: ['Absent', 'red'],
  incomplete: ['Missing log', 'amber'],
  leave: ['On leave', 'blue'],
  holiday: ['Holiday', 'blue'],
  rest_day: ['Rest day', 'gray'],
  not_employed: ['—', 'gray'],
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.stat}>
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
    </View>
  );
}

export default function AttendanceScreen() {
  const theme = useTheme();
  const [offset, setOffset] = useState(0);
  const range = cutoff(new Date(), offset);
  const attendance = useApi<Attendance>('attendance', range);

  const records = attendance.data?.data ?? [];
  const summary = attendance.data?.meta.summary;
  const missing = records.filter((record) => record.status === 'incomplete' || record.status === 'absent').length;

  return (
    <Screen onRefresh={attendance.refresh} refreshing={attendance.isRefreshing}>
      <View style={styles.periodBar}>
        <Pressable onPress={() => setOffset(offset - 1)} hitSlop={12} accessibilityLabel="Previous cut-off">
          <Icon name="chevronLeft" color={theme.brand} />
        </Pressable>
        <View style={styles.periodLabel}>
          <AppText variant="heading">{dateRange(range.from, range.to)}</AppText>
          <AppText variant="caption" color="textSecondary">
            {offset === 0 ? 'Current cut-off' : 'Cut-off'}
          </AppText>
        </View>
        <Pressable onPress={() => setOffset(offset + 1)} hitSlop={12} disabled={offset >= 0} accessibilityLabel="Next cut-off" style={offset >= 0 && styles.disabled}>
          <Icon name="chevronRight" color={theme.brand} />
        </Pressable>
      </View>

      {attendance.isLoading && !attendance.data ? (
        <LoadingState />
      ) : attendance.error && !attendance.data ? (
        <ErrorState message={attendance.error} onRetry={attendance.refresh} />
      ) : summary ? (
        <>
          <Card style={styles.stats}>
            <Stat label="Worked" value={summary.days_worked} />
            <Stat label="Paid leave" value={summary.paid_leave_days} />
            <Stat label="Absent" value={summary.days_absent + summary.unpaid_leave_days} />
            <Stat label="Late" value={minutes(summary.late_minutes)} />
            <Stat label="Undertime" value={minutes(summary.undertime_minutes)} />
            <Stat label="OT" value={`${summary.overtime_hours}h`} />
          </Card>

          {missing > 0 && (
            <Card style={{ backgroundColor: theme.warningSoft, borderColor: theme.warningSoft }}>
              <AppText>
                {missing} day(s) with missing logs or no attendance. If you were at work, file an Unaccounted or Leave request before the 3rd / 18th, 12:00 NN.
              </AppText>
            </Card>
          )}

          {records
            .filter((record) => record.status !== 'not_employed')
            .map((record) => {
              const [label, tone] = status[record.status];

              return (
                <Card key={record.date} style={!record.is_work_day ? { opacity: 0.6 } : undefined}>
                  <View style={styles.recordHeader}>
                    <AppText variant="heading" style={styles.flex}>
                      {record.day}, {formatDate(record.date, false)}
                    </AppText>
                    <Badge label={record.status === 'leave' ? (record.paid_leave_days ? 'Leave (paid)' : 'Leave (unpaid)') : label} tone={tone} />
                  </View>
                  {(record.time_in || record.time_out) && (
                    <View style={styles.times}>
                      <AppText>In {record.time_in ?? '—'}</AppText>
                      <AppText>Out {record.time_out ?? '—'}</AppText>
                      {record.late_minutes > 0 && <AppText color="danger">Late {minutes(record.late_minutes)}</AppText>}
                      {record.undertime_minutes > 0 && <AppText color="danger">UT {minutes(record.undertime_minutes)}</AppText>}
                      {record.overtime_hours > 0 && <AppText color="success">OT {record.overtime_hours}h</AppText>}
                    </View>
                  )}
                  {(record.holiday || record.days_worked === 0.5) && (
                    <AppText variant="caption" color="textSecondary">
                      {[record.holiday, record.days_worked === 0.5 ? 'Half-day leave' : null].filter(Boolean).join(' · ')}
                    </AppText>
                  )}
                </Card>
              );
            })}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  periodBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  periodLabel: { alignItems: 'center' },
  disabled: { opacity: 0.3 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', rowGap: Spacing.three },
  stat: { width: '33.33%', alignItems: 'center' },
  recordHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  times: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.three },
});
