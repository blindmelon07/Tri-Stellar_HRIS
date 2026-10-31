import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, isoDate, parseIsoDate } from '@/lib/format';

type Props = {
  mode: 'date' | 'time';
  /** YYYY-MM-DD for dates, HH:MM for times; empty when not chosen yet. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function toDate(mode: Props['mode'], value: string): Date {
  if (!value) {
    return new Date();
  }

  if (mode === 'date') {
    return parseIsoDate(value);
  }

  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date;
}

function fromDate(mode: Props['mode'], date: Date): string {
  if (mode === 'date') {
    return isoDate(date);
  }

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * Native date / time picker: a compact control on iOS, a dialog opened from a button on Android.
 */
export function DateField({ mode, value, onChange, placeholder = 'Select' }: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const label = value ? (mode === 'date' ? formatDate(value) : value) : placeholder;

  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.box, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
        <DateTimePicker
          mode={mode}
          display="compact"
          value={toDate(mode, value)}
          accentColor={theme.brand}
          onValueChange={(_, date) => onChange(fromDate(mode, date))}
        />
      </View>
    );
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={[styles.box, styles.button, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
        <Text style={[styles.text, { color: value ? theme.text : theme.textSecondary }]}>{label}</Text>
      </Pressable>
      {open && (
        <DateTimePicker
          mode={mode}
          value={toDate(mode, value)}
          is24Hour
          onValueChange={(_, date) => {
            setOpen(false);
            onChange(fromDate(mode, date));
          }}
          onDismiss={() => setOpen(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.two,
  },
  button: { paddingHorizontal: Spacing.three },
  text: { fontSize: 16 },
});
