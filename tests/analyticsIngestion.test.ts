import assert from 'node:assert/strict';
import { normalizeAnalyticsEvents, ANALYTICS_INGESTION_LIMITS } from '../lib/analyticsIngestion.js';

const now = Date.parse('2026-10-16T00:00:00.000Z');
const valid = {
  eventId: 'event-1',
  eventName: 'lesson_start',
  anonymousId: 'anon-1',
  sessionId: 'session-1',
  occurredAt: '2026-10-15T23:00:00.000Z',
  properties: {
    lessonId: 'hsk1-hello',
    minutes: 240,
    costUsd: -2,
    email: 'private@example.com',
    transcript: 'private transcript',
    customUnknown: 'not allowed',
  },
};

const rows = normalizeAnalyticsEvents([valid], { userId: 'user-123', now });
assert.equal(rows.length, 1);
assert.equal(rows[0].user_id, 'user-123');
assert.equal(rows[0].event_name, 'lesson_start');
assert.equal(rows[0].properties.lessonId, 'hsk1-hello');
assert.equal(rows[0].properties.minutes, 180);
assert.equal(rows[0].properties.costUsd, 0);
assert.equal('email' in rows[0].properties, false);
assert.equal('transcript' in rows[0].properties, false);
assert.equal('customUnknown' in rows[0].properties, false);

const deduplicated = normalizeAnalyticsEvents([valid, { ...valid, eventName: 'app_open' }], { now });
assert.equal(deduplicated.length, 1, 'duplicate event IDs should be deduplicated per batch');
assert.equal(deduplicated[0].user_id, null, 'anonymous events should not acquire an unverified account ID');

const invalid = normalizeAnalyticsEvents([
  { ...valid, eventId: 'bad-event', eventName: 'not_allowed' },
  { ...valid, eventId: 'bad-date', occurredAt: 'not-a-date' },
  { ...valid, eventId: 'future-event', occurredAt: '2026-10-16T01:00:00.000Z' },
  { ...valid, eventId: 'long-id', sessionId: 'x'.repeat(ANALYTICS_INGESTION_LIMITS.maxIdLength + 1) },
], { now });
assert.equal(invalid.length, 0, 'invalid event names, dates, and identifiers should be dropped');

const tooOld = normalizeAnalyticsEvents([
  { ...valid, eventId: 'old-event', occurredAt: '2025-01-01T00:00:00.000Z' },
], { now });
assert.equal(tooOld.length, 0, 'events older than the retention window should be dropped');

const batch = Array.from({ length: 55 }, (_, index) => ({
  ...valid,
  eventId: 'batch-' + index,
}));
assert.equal(normalizeAnalyticsEvents(batch, { now }).length, 50, 'normalizer should enforce the batch limit');

console.log('Analytics ingestion validation tests passed');
