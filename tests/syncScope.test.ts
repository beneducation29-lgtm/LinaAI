import assert from 'node:assert/strict';
import { scopedSyncStorageKey } from '../src/services/syncEngine';

assert.equal(scopedSyncStorageKey('lina_sync_queue_v1', 'user-a'), 'lina_sync_queue_v1:user-a');
assert.equal(scopedSyncStorageKey('lina_sync_queue_v1', 'user-b'), 'lina_sync_queue_v1:user-b');
assert.notEqual(
  scopedSyncStorageKey('lina_sync_queue_v1', 'user-a'),
  scopedSyncStorageKey('lina_sync_queue_v1', 'user-b'),
);
assert.equal(scopedSyncStorageKey('lina_sync_queue_v1', null), 'lina_sync_queue_v1');

console.log('Sync queue account-scope tests passed.');
