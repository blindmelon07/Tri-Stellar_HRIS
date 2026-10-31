import { createElement } from 'react';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  mode: 'date' | 'time';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

/**
 * Web preview: the browser's own date / time input.
 */
export function DateField({ mode, value, onChange }: Props) {
  const theme = useTheme();

  return createElement('input', {
    type: mode,
    value,
    onChange: (event: { target: { value: string } }) => onChange(event.target.value),
    style: {
      minHeight: 48,
      border: `1px solid ${theme.border}`,
      borderRadius: Radius.md,
      padding: `0 ${Spacing.three}px`,
      fontSize: 16,
      backgroundColor: theme.backgroundElement,
      color: theme.text,
      fontFamily: 'inherit',
    },
  });
}
