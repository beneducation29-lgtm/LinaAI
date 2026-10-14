import assert from 'node:assert/strict';
import { retainUnchangedUnsentRecords, shouldScheduleSyncAgain } from '../src/services/syncQueue';
import type { SyncRecord } from '../src/types/sync';

const record = (key: SyncRecord['key'], version: number, updatedAt: string): SyncRecord => ({
  key,
  version,
  updatedAt,
  deviceId: 'test-device',
  data: { version },
});

const oldConversation = record('conversation', 1, '2026-10-13T01:00:00.000Z');
const updatedConversation = record('conversation', 2, '2026-10-13T01:00:01.000Z');
const newFlashcards = record('flashcards', 1, '2026-10-13T01:00:02.000Z');
const unchangedPreferences = record('preferences', 3, '2026-10-13T00:59:00.000Z');

const remaining = retainUnchangedUnsentRecords(
  [updatedConversation, newFlashcards, unchangedPreferences],
  [oldConversation, unchangedPreferences],
);

assert.deepEqual(remaining, [updatedConversation, newFlashcards]);
assert.equal(shouldScheduleSyncAgain('user-a', 'user-b', 0), true, 'new account must pull even when its queue is empty');
assert.equal(shouldScheduleSyncAgain('user-a', 'user-a', 0), false, 'idle active account does not need another sync');
assert.equal(shouldScheduleSyncAgain('user-a', 'user-a', 2), true, 'pending writes should retry');
assert.equal(shouldScheduleSyncAgain('user-a', null, 3), false, 'never schedule sync when signed out');

console.log('Sync queue in-flight write regression checks passed.');
