import { json, parseCookies, getUser } from '../auth/_utils.js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVER_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const ALLOWED_KEYS = new Set([
  'profile',
  'preferences',
  'conversation',
  'flashcards',
  'structuredProgress',
  'reviewSchedules',
  'mistakes',
  'structuredSavedVocabulary',
  'aiMemory',
  'motivation',
  'learnerMemory',
]);

function headers(extra = {}) {
  return {
    apikey: SUPABASE_SERVER_KEY,
    Authorization: `Bearer ${SUPABASE_SERVER_KEY}`,
    ...extra,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return json(res, 405, { error: 'Method Not Allowed' });
    if (!SUPABASE_URL || !SUPABASE_SERVER_KEY) {
      return json(res, 503, { error: 'Sync database chưa được cấu hình.' });
    }

    const cookies = parseCookies(req);
    const user = await getUser(cookies.lina_access);
    if (!user) return json(res, 401, { error: 'Unauthorized' });

    const records = Array.isArray(req.body?.records)
      ? req.body.records.slice(0, 50)
      : [];
    const accepted = [];
    const conflicts = [];

    for (const record of records) {
      if (
        !record ||
        !ALLOWED_KEYS.has(record.key) ||
        typeof record.updatedAt !== 'string' ||
        !Number.isFinite(Number(record.version))
      ) {
        continue;
      }

      const lookup = new URL(`${SUPABASE_URL}/rest/v1/lina_learning_sync_records`);
      lookup.searchParams.set('select', 'version,updated_at');
      lookup.searchParams.set('user_id', `eq.${user.id}`);
      lookup.searchParams.set('record_key', `eq.${record.key}`);
      const existingResponse = await fetch(lookup, { headers: headers() });
      if (!existingResponse.ok) {
        return json(res, 503, { error: 'Sync database unavailable' });
      }

      const existingRows = await existingResponse.json();
      const existing = existingRows[0] || null;

      if (
        existing &&
        new Date(existing.updated_at).getTime() > new Date(record.updatedAt).getTime()
      ) {
        conflicts.push(record.key);
        continue;
      }

      const upsert = await fetch(
        `${SUPABASE_URL}/rest/v1/lina_learning_sync_records?on_conflict=user_id,record_key`,
        {
          method: 'POST',
          headers: headers({
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal',
          }),
          body: JSON.stringify({
            user_id: user.id,
            record_key: record.key,
            payload: record.data,
            version: Math.max(
              Number(record.version) || 1,
              Number(existing?.version || 0) + 1
            ),
            updated_at: record.updatedAt,
            device_id: String(record.deviceId || 'unknown').slice(0, 100),
          }),
        }
      );

      if (!upsert.ok) {
        console.error('[Lina][SYNC_PUSH_UPSERT]', upsert.status);
        return json(res, 503, { error: 'Sync database unavailable' });
      }

      accepted.push(record.key);
    }

    return json(res, 200, {
      accepted,
      conflicts,
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Lina][SYNC_PUSH_ERROR]', err?.message || err);
    return json(res, 503, { error: 'Sync push failed' });
  }
}
