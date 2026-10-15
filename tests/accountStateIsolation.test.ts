import assert from 'node:assert/strict';
import fs from 'node:fs';

const context = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
const shell = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf8');
const privacy = fs.readFileSync('src/services/privacy.ts', 'utf8');

assert.ok(context.includes('resetLocalAccountState(accountId, authUser?.name)'));
assert.ok(context.includes('accountStorageKey(STORAGE_KEYS.CONVERSATION, authUser?.id)'));
assert.ok(context.includes('accountStorageKey(STORAGE_KEYS.REVIEW_SCHEDULES, authUser?.id)'));
assert.ok(context.includes('accountStorageKey(MOTIVATION_STORAGE_KEY, authUser?.id)'));
assert.ok(context.includes('setAuthScopeReady(true)'));
assert.ok(shell.includes('if (!authScopeReady)'));
assert.ok(privacy.includes('clearLearningDataLocally(userId?: string | null)'));
assert.ok(privacy.includes("owner || 'guest'"));

console.log('Account state isolation regression checks passed.');
