import * as Device from 'expo-device';
import { createContext, use, useEffect, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { api, onUnauthorized } from '@/lib/api';
import { useStorageState } from '@/lib/storage';

type Session = {
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const value = use(SessionContext);

  if (!value) {
    throw new Error('useSession must be used inside <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, token], setToken] = useStorageState('hris-token');

  useEffect(() => {
    onUnauthorized(() => setToken(null));

    return () => onUnauthorized(null);
  }, [setToken]);

  async function signIn(email: string, password: string) {
    const deviceName = Device.deviceName ?? `${Platform.OS} device`;
    const result = await api<{ token: string }>('auth/token', {
      method: 'POST',
      body: { email: email.trim(), password, device_name: deviceName },
    });

    setToken(result.token);
  }

  async function signOut() {
    try {
      await api('auth/token', { method: 'DELETE', token });
    } catch {
      // Signing out locally is enough if the server cannot be reached.
    }

    setToken(null);
  }

  return (
    <SessionContext.Provider value={{ token, isLoading, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}
