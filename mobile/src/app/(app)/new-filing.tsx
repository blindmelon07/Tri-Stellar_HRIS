import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { DateField } from '@/components/date-field';
import { AppText, Button, Card, Chip, Field, Input, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/ctx/session';
import { useApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { api, ApiError } from '@/lib/api';
import { isoDate } from '@/lib/format';
import type { FilingList, FilingType } from '@/lib/types';

const guidance: Record<FilingType, string> = {
  unaccounted: 'Missing time in or out — field work, approved WFH, or the reader was offline.',
  leave: 'Half-day leave counts as 0.5 day worked + 0.5 day leave. Extra hours beyond the half day are not paid.',
  overtime: 'Work beyond your shift. Per Biyahe drivers cannot claim OT on a trip day.',
  early_out: 'Leaving before the end of your shift. Undertime is still deducted.',
  shift_change: 'Work a different schedule for the day.',
};

export default function NewFilingScreen() {
  const theme = useTheme();
  const { token } = useSession();
  const options = useApi<FilingList>('filings');

  const [type, setType] = useState<FilingType>('unaccounted');
  const [dateFrom, setDateFrom] = useState(isoDate(new Date()));
  const [dateTo, setDateTo] = useState(isoDate(new Date()));
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [withPay, setWithPay] = useState(true);
  const [shiftId, setShiftId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isLeave = type === 'leave';
  const multiDay = isLeave && !isHalfDay;

  async function submit() {
    setSubmitting(true);
    setError(null);

    try {
      await api('filings', {
        method: 'POST',
        token,
        body: {
          type,
          date_from: dateFrom,
          date_to: multiDay ? dateTo : dateFrom,
          time_from: timeFrom || null,
          time_to: timeTo || null,
          is_half_day: isLeave && isHalfDay,
          with_pay: isLeave && withPay,
          shift_id: type === 'shift_change' ? shiftId || null : null,
          reason,
        },
      });
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/filings');
      }
    } catch (exception) {
      setError(exception instanceof ApiError ? exception : new ApiError('Could not submit. Please try again.', 0));
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Field label="Type" hint={guidance[type]} error={error?.field('type')}>
        <View style={styles.chips}>
          {(options.data?.meta.types ?? []).map((option) => (
            <Chip key={option.value} label={option.label} selected={type === option.value} onPress={() => setType(option.value as FilingType)} />
          ))}
        </View>
      </Field>

      <View style={multiDay ? styles.twoColumns : undefined}>
        <View style={styles.flex}>
          <Field label={multiDay ? 'From' : 'Date'} error={error?.field('date_from')}>
            <DateField mode="date" value={dateFrom} onChange={setDateFrom} />
          </Field>
        </View>
        {multiDay && (
          <View style={styles.flex}>
            <Field label="To" error={error?.field('date_to')}>
              <DateField mode="date" value={dateTo} onChange={setDateTo} />
            </Field>
          </View>
        )}
      </View>

      {isLeave && (
        <Card>
          <View style={styles.switchRow}>
            <AppText style={styles.flex}>Half day</AppText>
            <Switch value={isHalfDay} onValueChange={setIsHalfDay} trackColor={{ true: theme.brand }} thumbColor="#FFFFFF" />
          </View>
          <View style={styles.switchRow}>
            <AppText style={styles.flex}>With pay (subject to HR approval)</AppText>
            <Switch value={withPay} onValueChange={setWithPay} trackColor={{ true: theme.brand }} thumbColor="#FFFFFF" />
          </View>
        </Card>
      )}

      {(type === 'unaccounted' || type === 'overtime') && (
        <View style={styles.twoColumns}>
          <View style={styles.flex}>
            <Field label={type === 'unaccounted' ? 'Time in' : 'Start'} error={error?.field('time_from')}>
              <DateField mode="time" value={timeFrom} onChange={setTimeFrom} placeholder="--:--" />
            </Field>
          </View>
          <View style={styles.flex}>
            <Field label={type === 'unaccounted' ? 'Time out' : 'End'} error={error?.field('time_to')}>
              <DateField mode="time" value={timeTo} onChange={setTimeTo} placeholder="--:--" />
            </Field>
          </View>
        </View>
      )}

      {type === 'early_out' && (
        <Field label="Time out" error={error?.field('time_from')}>
          <DateField mode="time" value={timeFrom} onChange={setTimeFrom} placeholder="--:--" />
        </Field>
      )}

      {type === 'shift_change' && (
        <Field label="Shift" error={error?.field('shift_id')}>
          <View style={styles.chips}>
            {(options.data?.meta.shifts ?? []).map((shift) => (
              <Chip key={shift.value} label={shift.label} selected={shiftId === shift.value} onPress={() => setShiftId(shift.value)} />
            ))}
          </View>
        </Field>
      )}

      <Field label="Reason" error={error?.field('reason')}>
        <Input value={reason} onChangeText={setReason} multiline numberOfLines={3} style={styles.reason} placeholder="Explain briefly" />
      </Field>

      {error && Object.keys(error.errors).length === 0 && <AppText color="danger">{error.message}</AppText>}

      <Button title="Submit filing" onPress={submit} loading={submitting} disabled={!reason.trim()} />
      <AppText variant="caption" color="textSecondary" style={styles.center}>
        Goes to your Dept. Head first, then to the HR Time Keeper.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  twoColumns: { flexDirection: 'row', gap: Spacing.two },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  reason: { minHeight: 96, textAlignVertical: 'top' },
  center: { textAlign: 'center' },
});
