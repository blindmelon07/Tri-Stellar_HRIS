import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';

import { FilingCard } from '@/components/filing-card';
import { Button, EmptyState, ErrorState, LoadingState, Screen } from '@/components/ui';
import { useSession } from '@/ctx/session';
import { useApi } from '@/hooks/use-api';
import { api, ApiError } from '@/lib/api';
import type { Filing, FilingList } from '@/lib/types';

function confirm(message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) {
      onConfirm();
    }

    return;
  }

  Alert.alert('Withdraw filing', message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Withdraw', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function FilingsScreen() {
  const { token } = useSession();
  const filings = useApi<FilingList>('filings');

  function withdraw(filing: Filing) {
    confirm('Withdraw this pending filing?', async () => {
      try {
        await api(`filings/${filing.id}`, { method: 'DELETE', token });
        filings.refresh();
      } catch (exception) {
        Alert.alert('Could not withdraw', exception instanceof ApiError ? exception.message : 'Please try again.');
      }
    });
  }

  return (
    <Screen onRefresh={filings.refresh} refreshing={filings.isRefreshing}>
      <Button title="New filing" onPress={() => router.push('/new-filing')} />

      {filings.isLoading && !filings.data ? (
        <LoadingState />
      ) : filings.error && !filings.data ? (
        <ErrorState message={filings.error} onRetry={filings.refresh} />
      ) : filings.data?.data.length ? (
        filings.data.data.map((filing) => (
          <FilingCard
            key={filing.id}
            filing={filing}
            actions={filing.can_withdraw ? <Button title="Withdraw" variant="danger" small onPress={() => withdraw(filing)} /> : undefined}
          />
        ))
      ) : (
        <EmptyState title="No filings yet" message="Missing logs, leaves, overtime, early outs and shift changes you file will show here." />
      )}
    </Screen>
  );
}
