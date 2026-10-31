import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Persisted string state: the device keychain/keystore on iOS and Android,
 * localStorage on web (development preview only).
 */
async function setStorageItem(key: string, value: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch {
      // Storage can be unavailable (private mode); the session then lasts until reload.
    }

    return;
  }

  if (value === null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

/**
 * Read synchronously so the very first render already knows whether the user is
 * signed in; otherwise route guards redirect before the token arrives and deep
 * links are lost.
 */
function getStorageItem(key: string): string | null {
  try {
    return Platform.OS === 'web' ? localStorage.getItem(key) : SecureStore.getItem(key);
  } catch {
    return null;
  }
}

export function useStorageState(key: string): [[boolean, string | null], (value: string | null) => void] {
  const [state, setState] = useState<[boolean, string | null]>(() => [false, getStorageItem(key)]);

  const setValue = useCallback(
    (value: string | null) => {
      setState([false, value]);
      void setStorageItem(key, value);
    },
    [key],
  );

  return [state, setValue];
}
