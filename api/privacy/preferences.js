import { json, parseCookies, getUser, clearAuthCookies } from '../auth/_utils.js';

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

async function readPreferences(user) {
  const base = `${SUPABASE_URL}/rest/v1/lina_privacy_preferences`;
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
    throw new Error('PRIVACY_DB_REQUEST_FAILED');
  }

  const rows = await response.json();
  const row = rows[0];
  return row
    ? normalize({
        aiMemoryEnabled: row.ai_memory_enabled,
        conversationHistoryEnabled: row.conversation_history_enabled,
        analyticsEnabled: row.analytics_enabled,
        voiceDataEnabled: row.voice_data_enabled,
        personalizationEnabled: row.personalization_enabled,
      })
    : DEFAULTS;
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

    const user = await getUser(parseCookies(req).lina_access);
    if (!user) return json(res, 401, { error: 'Unauthorized' });

    if (req.method === 'GET') {
      return json(res, 200, { preferences: await readPreferences(user) });
    }

    const action = req.body?.action || 'save_preferences';

    if (action === 'export_data') {
      const base = `${SUPABASE_URL}/rest/v1/`;
      const [syncRes, privacyRes] = await Promise.all([
        fetch(
          base +
            'lina_learning_sync_records?select=record_key,payload,version,updated_at,device_id&user_id=eq.' +
            encodeURIComponent(user.id),
          { headers: headers() }
        ),
        fetch(
          base +
            'lina_privacy_preferences?select=ai_memory_enabled,conversation_history_enabled,analytics_enabled,voice_data_enabled,personalization_enabled&user_id=eq.' +
            encodeURIComponent(user.id),
          { headers: headers() }
        ),
      ]);

      if (!syncRes.ok || !privacyRes.ok) {
        return json(res, 503, { error: 'Không thể đọc dữ liệu để xuất.' });
      }

      const sync = await syncRes.json();
      const privacy = await privacyRes.json();
      const payload = {
        exportedAt: new Date().toISOString(),
        account: { id: user.id, email: user.email || null },
        privacy: privacy[0] || null,
        learningSyncRecords: sync,
      };

      res
        .status(200)
        .setHeader('Content-Type', 'application/json; charset=utf-8')
        .setHeader(
          'Content-Disposition',
          'attachment; filename="lina-learning-export.json"'
        )
        .setHeader('Cache-Control', 'no-store')
        .send(JSON.stringify(payload, null, 2));
      return;
    }

    if (action === 'delete_learning_data') {
      const url =
        SUPABASE_URL +
        '/rest/v1/lina_learning_sync_records?user_id=eq.' +
        encodeURIComponent(user.id);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers({ Prefer: 'return=minimal' }),
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        console.error(
          '[Lina][PRIVACY_DELETE_LEARNING]',
          response.status,
          detail.slice(0, 300)
        );
        return json(res, 503, { error: 'Không thể xóa dữ liệu học tập.' });
      }
      return json(res, 200, { deleted: true });
    }

    if (action === 'delete_account') {
      if (req.body?.confirmation !== 'DELETE') {
        return json(res, 400, { error: 'Confirmation required.' });
      }

      const response = await fetch(
        SUPABASE_URL +
          '/auth/v1/admin/users/' +
          encodeURIComponent(user.id),
        { method: 'DELETE', headers: headers() }
      );
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        console.error(
          '[Lina][PRIVACY_DELETE_ACCOUNT]',
          response.status,
          detail.slice(0, 300)
        );
        return json(res, 503, {
          error: 'Không thể xóa tài khoản lúc này.',
        });
      }

      clearAuthCookies(res);
      return json(res, 200, { deleted: true });
    }

    const preferences = normalize(req.body?.preferences);
    const base = `${SUPABASE_URL}/rest/v1/lina_privacy_preferences`;
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
      return json(res, 503, {
        error: 'Privacy database unavailable',
        code: 'PRIVACY_DB_WRITE_FAILED',
      });
    }

    return json(res, 200, { preferences });
  } catch (err) {
    console.error('[Lina][PRIVACY_ERROR]', err?.message || err);
    return json(res, 503, { error: 'Privacy preferences unavailable' });
  }
}
