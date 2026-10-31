import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { SessionProvider, useSession } from '@/ctx/session';

SplashScreen.preventAutoHideAsync();

/** Keeps the TriStellar splash screen up until the saved session has been read. */
function SplashScreenController() {
  const { isLoading } = useSession();

  if (!isLoading) {
    SplashScreen.hide();
  }

  return null;
}

function RootNavigator() {
  const { token, isLoading } = useSession();

  // Wait for the stored token so guards don't redirect (and drop deep links) before it is known.
  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...base,
        colors: { ...base.colors, primary: colors.brand, background: colors.background, card: colors.backgroundElement, border: colors.border },
      }}>
      <SessionProvider>
        <SplashScreenController />
        <StatusBar style="auto" />
        <RootNavigator />
      </SessionProvider>
    </ThemeProvider>
  );
}
