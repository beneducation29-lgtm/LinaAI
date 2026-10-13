import assert from 'node:assert/strict';
import { retainUnchangedUnsentRecords } from '../src/services/syncQueue';
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
console.log('Sync queue in-flight write regression checks passed.');
