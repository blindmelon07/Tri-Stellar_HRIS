import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useSession } from '@/ctx/session';
import { api, ApiError } from '@/lib/api';

/**
 * Loads an authenticated GET endpoint, refreshing whenever the screen gains focus.
 */
export function useApi<T>(path: string, query?: Record<string, string | number | undefined>) {
  const { token } = useSession();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryKey = JSON.stringify(query ?? {});

  const load = useCallback(
    async (refreshing = false) => {
      if (refreshing) {
        setIsRefreshing(true);
      }

      try {
        setData(await api<T>(path, { token, query: JSON.parse(queryKey) }));
        setError(null);
      } catch (exception) {
        setError(exception instanceof ApiError ? exception.message : 'Something went wrong.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [path, token, queryKey],
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { data, error, isLoading, isRefreshing, refresh: () => load(true) };
}
