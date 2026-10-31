/**
 * TriStellar brand colors (from the "Bigas ng Bayan" logo) for light and dark mode.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#161A21',
    textSecondary: '#5F6877',
    background: '#F6F7F9',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F1F3F6',
    border: '#E2E5EA',
    brand: '#C2570C',
    brandText: '#FFFFFF',
    brandSoft: '#FDEEDD',
    success: '#047857',
    successSoft: '#D1FAE5',
    warning: '#B45309',
    warningSoft: '#FEF3C7',
    danger: '#B91C1C',
    dangerSoft: '#FEE2E2',
    info: '#1D4ED8',
    infoSoft: '#DBEAFE',
  },
  dark: {
    text: '#E9EDF2',
    textSecondary: '#98A2B1',
    background: '#0D1015',
    backgroundElement: '#151A21',
    backgroundSelected: '#1C222B',
    border: '#2A313C',
    brand: '#F59E42',
    brandText: '#0D1015',
    brandSoft: '#3A2614',
    success: '#34D399',
    successSoft: '#063B2C',
    warning: '#FBBF24',
    warningSoft: '#3D2E0A',
    danger: '#F87171',
    dangerSoft: '#3F1414',
    info: '#93C5FD',
    infoSoft: '#172554',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const MaxContentWidth = 640;
