import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function AppLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerTintColor: theme.brand,
        headerTitleStyle: { color: theme.text },
        headerStyle: { backgroundColor: theme.backgroundElement },
        headerBackButtonDisplayMode: 'minimal',
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="new-filing" options={{ title: 'New Filing', presentation: 'modal' }} />
      <Stack.Screen name="payslips/[id]" options={{ title: 'Payslip' }} />
      <Stack.Screen name="endorsements" options={{ title: 'Endorsements' }} />
    </Stack>
  );
}
