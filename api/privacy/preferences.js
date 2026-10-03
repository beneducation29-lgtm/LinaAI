import { json, parseCookies, getUser } from '../auth/_utils.js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVER_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const DEFAULTS = {
  aiMemoryEnabled: true,
  conversationHistoryEnabled: true,
  analyticsEnabled: true,
  voiceDataEnabled: false,
  personalizationEnabled: true,
};

function headers(extra = {}) {
  return {
    apikey: SUPABASE_SERVER_KEY,
    Authorization: `Bearer ${SUPABASE_SERVER_KEY}`,
    ...extra,
  };
}

function normalize(input) {
  const x = input && typeof input === 'object' ? input : {};
  return {
    aiMemoryEnabled: x.aiMemoryEnabled !== false,
    conversationHistoryEnabled: x.conversationHistoryEnabled !== false,
    analyticsEnabled: x.analyticsEnabled !== false,
    voiceDataEnabled: x.voiceDataEnabled === true,
    personalizationEnabled: x.personalizationEnabled !== false,
  };
}

export default async function handler(req, res) {
  try {
    if (!['GET', 'POST'].includes(req.method)) {
      return json(res, 405, { error: 'Method Not Allowed' });
    }
    if (!SUPABASE_URL || !SUPABASE_SERVER_KEY) {
      return json(res, 503, {
        error: 'Privacy database chưa được cấu hình.',
        code: 'PRIVACY_SERVER_KEY_MISSING',
      });
    }

    const cookies = parseCookies(req);
    const user = await getUser(cookies.lina_access);
    if (!user) return json(res, 401, { error: 'Unauthorized' });

    const base = `${SUPABASE_URL}/rest/v1/lina_privacy_preferences`;

    if (req.method === 'GET') {
      const url = new URL(base);
      url.searchParams.set(
        'select',
        'ai_memory_enabled,conversation_history_enabled,analytics_enabled,voice_data_enabled,personalization_enabled'
      );
      url.searchParams.set('user_id', `eq.${user.id}`);
      url.searchParams.set('limit', '1');

      const response = await fetch(url, { headers: headers() });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        console.error('[Lina][PRIVACY_GET]', response.status, detail.slice(0, 500));
        return json(res, 503, { error: 'Privacy database unavailable', code: 'PRIVACY_DB_REQUEST_FAILED' });
      }

      const rows = await response.json();
      const row = rows[0];
      return json(res, 200, {
        preferences: row
          ? normalize({
              aiMemoryEnabled: row.ai_memory_enabled,
              conversationHistoryEnabled: row.conversation_history_enabled,
              analyticsEnabled: row.analytics_enabled,
              voiceDataEnabled: row.voice_data_enabled,
              personalizationEnabled: row.personalization_enabled,
            })
          : DEFAULTS,
      });
    }

    const preferences = normalize(req.body?.preferences);
    const response = await fetch(base, {
      method: 'POST',
      headers: headers({
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      }),
      body: JSON.stringify({
        user_id: user.id,
        ai_memory_enabled: preferences.aiMemoryEnabled,
        conversation_history_enabled: preferences.conversationHistoryEnabled,
        analytics_enabled: preferences.analyticsEnabled,
        voice_data_enabled: preferences.voiceDataEnabled,
        personalization_enabled: preferences.personalizationEnabled,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('[Lina][PRIVACY_POST]', response.status, detail.slice(0, 500));
      return json(res, 503, { error: 'Privacy database unavailable', code: 'PRIVACY_DB_WRITE_FAILED' });
    }

    return json(res, 200, { preferences });
  } catch (err) {
    console.error('[Lina][PRIVACY_ERROR]', err?.message || err);
    return json(res, 503, { error: 'Privacy preferences unavailable' });
  }
}
