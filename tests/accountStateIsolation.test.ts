import assert from 'node:assert/strict';
import fs from 'node:fs';

const context = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
const shell = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf8');
const privacy = fs.readFileSync('src/services/privacy.ts', 'utf8');

assert.match(context, /resetLocalAccountState\\(accountId, authUser\\?\\.name\\)/);
assert.match(context, /accountStorageKey\\(STORAGE_KEYS\\.CONVERSATION, authUser\\?\\.id\\)/);
assert.match(context, /accountStorageKey\\(STORAGE_KEYS\\.REVIEW_SCHEDULES, authUser\\?\\.id\\)/);
assert.match(context, /accountStorageKey\\(MOTIVATION_STORAGE_KEY, authUser\\?\\.id\\)/);
assert.match(context, /setAuthScopeReady\\(true\\)/);
assert.match(shell, /if \\(!authScopeReady\\)/);
assert.match(privacy, /clearLearningDataLocally\\(userId\\?: string \\| null\\)/);
assert.match(privacy, /owner \\|\\| 'guest'/);

console.log('Account state isolation regression checks passed.');
