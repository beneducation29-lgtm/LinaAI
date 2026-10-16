const EVENT_NAMES = new Set([
  'app_open', 'lesson_start', 'lesson_complete', 'vocabulary_review',
  'vocabulary_mastered', 'mistake', 'correction', 'speaking_start',
  'speaking_complete', 'roleplay_start', 'roleplay_complete',
  'pronunciation_practice', 'quiz_answer', 'quiz_complete',
  'subscription_start', 'subscription_cancel', 'mistake_resolved',
  'mistake_reopened',
]);

const PROPERTY_KEYS = new Set([
  'lessonId', 'minutes', 'category', 'ai', 'costUsd', 'level',
  'questionType', 'result', 'source', 'durationSeconds',
]);
const MAX_BATCH = 50;
const MAX_ID_LENGTH = 128;
const MAX_PROPERTY_LENGTH = 120;
const MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
const MAX_FUTURE_MS = 10 * 60 * 1000;

function boundedId(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_ID_LENGTH
    ? value.trim()
    : null;
}

function safeProperties(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (!PROPERTY_KEYS.has(key) || item === null || item === undefined) continue;
    if (typeof item === 'string') output[key] = item.slice(0, MAX_PROPERTY_LENGTH);
    else if (typeof item === 'boolean') output[key] = item;
    else if (typeof item === 'number' && Number.isFinite(item)) {
      if (key === 'minutes' || key === 'durationSeconds') output[key] = Math.max(0, Math.min(180, item));
      else if (key === 'costUsd') output[key] = Math.max(0, Math.min(1000, item));
      else output[key] = item;
    }
  }
  return output;
}

export function normalizeAnalyticsEvents(input, { userId = null, now = Date.now() } = {}) {
  if (!Array.isArray(input)) return [];
  const seen = new Set();
  const rows = [];
  for (const item of input.slice(0, MAX_BATCH)) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const eventId = boundedId(item.eventId);
    const anonymousId = boundedId(item.anonymousId);
    const sessionId = boundedId(item.sessionId);
    if (!eventId || !anonymousId || !sessionId || seen.has(eventId)) continue;
    if (!EVENT_NAMES.has(item.eventName)) continue;
    const timestamp = Date.parse(item.occurredAt);
    if (!Number.isFinite(timestamp) || timestamp < now - MAX_AGE_MS || timestamp > now + MAX_FUTURE_MS) continue;
    seen.add(eventId);
    rows.push({
      event_id: eventId,
      user_id: typeof userId === 'string' && userId.length <= 64 ? userId : null,
      anonymous_id: anonymousId,
      session_id: sessionId,
      event_name: item.eventName,
      properties: safeProperties(item.properties),
      occurred_at: new Date(timestamp).toISOString(),
    });
  }
  return rows;
}

export const ANALYTICS_INGESTION_LIMITS = Object.freeze({
  maxBatch: MAX_BATCH,
  maxIdLength: MAX_ID_LENGTH,
  maxPropertyLength: MAX_PROPERTY_LENGTH,
});
