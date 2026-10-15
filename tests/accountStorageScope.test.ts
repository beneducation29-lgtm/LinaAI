import assert from 'node:assert/strict';
import { accountStorageKey } from '../src/services/accountStorage';

const base = 'lina_learning_progress_v1';
assert.equal(accountStorageKey(base, null), `${base}:guest`);
assert.equal(accountStorageKey(base, undefined), `${base}:guest`);
assert.equal(accountStorageKey(base, 'user-a'), `${base}:user-a`);
assert.equal(accountStorageKey(base, 'user-b'), `${base}:user-b`);
assert.notEqual(accountStorageKey(base, 'user-a'), accountStorageKey(base, 'user-b'));
assert.equal(accountStorageKey(base, ' user-a '), `${base}:user-a`);

console.log('Account-local-storage scope checks passed.');
