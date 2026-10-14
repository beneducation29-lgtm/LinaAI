import type { SyncRecord } from '../types/sync';

/**
 * Keep records created or updated after a sync started. Only the exact versions
 * present in the completed sync snapshot can be removed from the pending queue.
 */
export function retainUnchangedUnsentRecords(
  currentQueue: SyncRecord[],
  syncSnapshot: SyncRecord[],
): SyncRecord[] {
  const snapshotByKey = new Map(syncSnapshot.map(record => [record.key, record]));
  return currentQueue.filter(current => {
    const snapshot = snapshotByKey.get(current.key);
    return !snapshot || snapshot.version !== current.version || snapshot.updatedAt !== current.updatedAt;
  });
}

/** Re-run sync after an account switch even when the new account has an empty local queue,
 * because it still needs to pull its existing remote records. */
export function shouldScheduleSyncAgain(
  syncStartedForUserId: string,
  activeUserId: string | null,
  activePendingCount: number,
): boolean {
  return Boolean(
    activeUserId &&
    (activeUserId !== syncStartedForUserId || activePendingCount > 0)
  );
}
