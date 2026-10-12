import assert from 'node:assert/strict';
import fs from 'node:fs';
import { rateLimit } from '../src/services/security';

const source = fs.readFileSync('src/services/security.ts', 'utf8');
assert.match(source, /const MAX_BUCKETS\s*=\s*20_000/);
assert.match(source, /callsSincePrune\s*>=\s*256/);
assert.match(source, /pruneRateLimits\(now\)/);
assert.match(source, /buckets\.size\s*>=\s*MAX_BUCKETS/);

const key = 'prompt43-regression-' + Math.random().toString(36).slice(2);
assert.equal(rateLimit(key, 2, 1_000).allowed, true);
assert.equal(rateLimit(key, 2, 1_001).allowed, true);
assert.equal(rateLimit(key, 2, 1_002).allowed, false);
assert.equal(rateLimit(key, 2, 62_000).allowed, true, 'expired windows should reset');

console.log('Bounded rate-limit memory regression checks passed.');
