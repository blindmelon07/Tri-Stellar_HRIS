import { useState } from 'react';
import { Alert } from 'react-native';

import { FilingCard } from '@/components/filing-card';
import { AppText, Button, EmptyState, ErrorState, LoadingState, Screen } from '@/components/ui';
import { useSession } from '@/ctx/session';
import { useApi } from '@/hooks/use-api';
import { api, ApiError } from '@/lib/api';
import type { Filing, Paginated } from '@/lib/types';

export default function EndorsementsScreen() {
  const { token } = useSession();
  const filings = useApi<Paginated<Filing>>('endorsements');
  const [busyId, setBusyId] = useState<number | null>(null);

  async function decide(filing: Filing, decision: 'endorse' | 'deny') {
    setBusyId(filing.id);

    try {
      await api(`endorsements/${filing.id}`, { method: 'PUT', token, body: { decision } });
      filings.refresh();
    } catch (exception) {
      Alert.alert('Could not save', exception instanceof ApiError ? exception.message : 'Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Screen onRefresh={filings.refresh} refreshing={filings.isRefreshing}>
      <AppText color="textSecondary">
        Endorsed filings go to the HR Time Keeper for final approval. Denied filings are returned to the employee.
      </AppText>

      {filings.isLoading && !filings.data ? (
        <LoadingState />
      ) : filings.error && !filings.data ? (
        <ErrorState message={filings.error} onRetry={filings.refresh} />
      ) : filings.data?.data.length ? (
        filings.data.data.map((filing) => (
          <FilingCard
            key={filing.id}
            filing={filing}
            showEmployee
            actions={
              <>
                <Button title="Endorse" small onPress={() => decide(filing, 'endorse')} loading={busyId === filing.id} />
                <Button title="Deny" small variant="danger" onPress={() => decide(filing, 'deny')} disabled={busyId === filing.id} />
              </>
            }
          />
        ))
      ) : (
        <EmptyState title="All caught up" message="No team filings are waiting for your endorsement." />
      )}
    </Screen>
  );
}
