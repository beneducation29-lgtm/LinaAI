import { json, parseCookies, getUser } from '../auth/_utils.js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVER_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function headers() {
  return {
    apikey: SUPABASE_SERVER_KEY,
    Authorization: `Bearer ${SUPABASE_SERVER_KEY}`,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });
    if (!SUPABASE_URL || !SUPABASE_SERVER_KEY) {
      console.error('[Lina][SYNC_PULL_CONFIG]', { hasSupabaseUrl: Boolean(SUPABASE_URL), hasServerKey: Boolean(SUPABASE_SERVER_KEY) });
      return json(res, 503, { error: 'Sync database chưa được cấu hình.', code: 'SYNC_SERVER_KEY_MISSING' });
    }

    const cookies = parseCookies(req);
    const user = await getUser(cookies.lina_access);
    if (!user) return json(res, 401, { error: 'Unauthorized' });

    const url = new URL(`${SUPABASE_URL}/rest/v1/lina_learning_sync_records`);
    url.searchParams.set('select', 'record_key,payload,version,updated_at,device_id');
    url.searchParams.set('user_id', `eq.${user.id}`);
    url.searchParams.set('order', 'updated_at.asc');

    const response = await fetch(url, { headers: headers() });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('[Lina][SYNC_PULL]', response.status, detail.slice(0, 500));
      return json(res, 503, { error: 'Sync database unavailable', code: 'SYNC_DB_REQUEST_FAILED', status: response.status });
    }

    const rows = await response.json();
    return json(res, 200, {
      records: rows.map((row) => ({
        key: row.record_key,
        data: row.payload,
        version: row.version,
        updatedAt: row.updated_at,
        deviceId: row.device_id,
      })),
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Lina][SYNC_PULL_ERROR]', err?.message || err);
    return json(res, 503, { error: 'Sync pull failed' });
  }
}
