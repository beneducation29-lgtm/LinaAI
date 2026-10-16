import { json, parseCookies, getUser } from '../auth/_utils.js';
import { normalizeAnalyticsEvents } from '../../lib/analyticsIngestion.js';

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVER_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function isAdminEmail(email) {
  const allowlist = String(process.env.LINA_ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(String(email || '').trim().toLowerCase());
}

function identity(event) {
  return event.user_id || event.anonymous_id;
}

function summarize(rows, days) {
  const now = Date.now();
  const since = now - days * 86400000;
  const active = (windowDays) => {
    const cutoff = now - windowDays * 86400000;
    return new Set(
      rows
        .filter((event) => new Date(event.occurred_at).getTime() >= cutoff)
        .map(identity)
        .filter(Boolean)
    ).size;
  };

  const appOpens = rows.filter((event) => event.event_name === 'app_open');
  const firstOpenByUser = new Map();
  for (const event of appOpens) {
    const id = identity(event);
    const timestamp = new Date(event.occurred_at).getTime();
    if (!id || !Number.isFinite(timestamp)) continue;
    if (!firstOpenByUser.has(id) || timestamp < firstOpenByUser.get(id)) {
      firstOpenByUser.set(id, timestamp);
    }
  }
  const newUsers = [...firstOpenByUser.entries()].filter(([, timestamp]) => timestamp >= since);

  const retention = (offsetDays) => {
    if (!newUsers.length) return 0;
    let retained = 0;
    for (const [id, firstOpen] of newUsers) {
      const returned = appOpens.some((event) => {
        const timestamp = new Date(event.occurred_at).getTime();
        return identity(event) === id && timestamp >= firstOpen + offsetDays * 86400000;
      });
      if (returned) retained += 1;
    }
    return Math.round((retained / newUsers.length) * 100);
  };

  const starts = rows.filter((event) => event.event_name === 'lesson_start').length;
  const completes = rows.filter((event) => event.event_name === 'lesson_complete').length;
  const lessonStarts = {};
  for (const event of rows) {
    if (event.event_name !== 'lesson_start') continue;
    const lessonId = String(event.properties?.lessonId || 'unknown').slice(0, 120);
    lessonStarts[lessonId] = (lessonStarts[lessonId] || 0) + 1;
  }

  const popularLessons = Object.entries(lessonStarts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, count]) => ({ id, label: id, count }));

  const dropOffPoints = popularLessons
    .map((lesson) => ({
      point: lesson.label,
      count: Math.max(
        0,
        lesson.count -
          rows.filter(
            (event) =>
              event.event_name === 'lesson_complete' &&
              String(event.properties?.lessonId || 'unknown') === lesson.id
          ).length
      ),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const aiUsage = rows.filter((event) => event.properties?.ai === true).length;
  const voiceUsage = rows.filter((event) =>
    ['speaking_start', 'speaking_complete', 'roleplay_start', 'roleplay_complete', 'pronunciation_practice'].includes(event.event_name)
  ).length;
  const cost = rows.reduce(
    (sum, event) =>
      sum + (typeof event.properties?.costUsd === 'number' && Number.isFinite(event.properties.costUsd)
        ? event.properties.costUsd
        : 0),
    0
  );
  const subscriptions = rows.filter((event) => event.event_name === 'subscription_start').length;
  const cancellations = rows.filter((event) => event.event_name === 'subscription_cancel').length;
  const mau = active(30);

  return {
    rangeDays: days,
    dau: active(1),
    wau: active(7),
    mau,
    newUsers: newUsers.length,
    retentionD1: retention(1),
    retentionD7: retention(7),
    lessonCompletion: starts ? Math.round((completes / starts) * 100) : 0,
    popularLessons,
    dropOffPoints,
    aiUsage,
    voiceUsage,
    costPerActiveUser: Number((cost / Math.max(1, mau)).toFixed(4)),
    subscriptionConversion: newUsers.length ? Math.round((subscriptions / newUsers.length) * 100) : 0,
    churn: subscriptions ? Math.round((cancellations / subscriptions) * 100) : 0,
    events: rows.length,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Share the existing serverless function so event ingestion does not add
  // another Vercel function to the project.
  if (req.method === 'POST') {
    if (!SUPABASE_URL || !SUPABASE_SERVER_KEY) {
      return json(res, 503, { error: 'Analytics database chưa được cấu hình.', code: 'ANALYTICS_DATABASE_NOT_CONFIGURED' });
    }
    const contentLength = Number(req.headers['content-length'] || 0);
    if (Number.isFinite(contentLength) && contentLength > 65536) {
      return json(res, 413, { error: 'Analytics payload quá lớn.' });
    }
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { return json(res, 400, { error: 'Analytics payload không hợp lệ.' }); }
    }
    const incoming = body && typeof body === 'object' && !Array.isArray(body) ? body.events : null;
    if (!Array.isArray(incoming)) return json(res, 400, { error: 'Thiếu danh sách analytics events.' });
    if (incoming.length > 50) return json(res, 413, { error: 'Mỗi lần chỉ nhận tối đa 50 sự kiện.' });
    try {
      const user = await getUser(parseCookies(req).lina_access);
      const rows = normalizeAnalyticsEvents(incoming, { userId: user?.id || null });
      if (!rows.length) return res.status(204).end();
      const response = await fetch(SUPABASE_URL + '/rest/v1/lina_analytics_events?on_conflict=event_id', {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVER_KEY,
          Authorization: 'Bearer ' + SUPABASE_SERVER_KEY,
          'Content-Type': 'application/json',
          Prefer: 'resolution=ignore-duplicates,return=minimal',
        },
        body: JSON.stringify(rows),
      });
      if (!response.ok) {
        console.error('[Lina][ANALYTICS_INGEST_DB_ERROR]', { status: response.status });
        return json(res, 503, { error: 'Không thể lưu analytics lúc này.' });
      }
      return res.status(204).end();
    } catch (error) {
      console.error('[Lina][ANALYTICS_INGEST_ERROR]', { name: error?.name || 'Error' });
      return json(res, 503, { error: 'Không thể lưu analytics lúc này.' });
    }
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { error: 'Method Not Allowed' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVER_KEY) {
    return json(res, 503, {
      error: 'Analytics database chưa được cấu hình.',
      code: 'ANALYTICS_DATABASE_NOT_CONFIGURED',
    });
  }

  if (!String(process.env.LINA_ADMIN_EMAILS || '').trim()) {
    return json(res, 503, {
      error: 'Danh sách email quản trị chưa được cấu hình.',
      code: 'ADMIN_ALLOWLIST_MISSING',
    });
  }

  try {
    const user = await getUser(parseCookies(req).lina_access);
    if (!user) return json(res, 401, { error: 'Unauthorized' });
    if (!isAdminEmail(user.email)) return json(res, 403, { error: 'Admin access required' });

    const parsedDays = Number.parseInt(String(req.query?.days || '30'), 10);
    const days = Math.min(90, Math.max(7, Number.isFinite(parsedDays) ? parsedDays : 30));
    // DAU/WAU/MAU and D7 retention need at least a 30-day window even when
    // the admin selects a shorter reporting range.
    const queryDays = Math.max(30, days);
    const since = new Date(Date.now() - queryDays * 86400000).toISOString();
    const url = new URL(SUPABASE_URL + '/rest/v1/lina_analytics_events');
    url.searchParams.set('select', 'event_id,user_id,anonymous_id,session_id,event_name,properties,occurred_at');
    url.searchParams.set('occurred_at', 'gte.' + since);
    url.searchParams.set('order', 'occurred_at.asc');
    url.searchParams.set('limit', '20000');

    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVER_KEY,
        Authorization: 'Bearer ' + SUPABASE_SERVER_KEY,
      },
    });
    if (!response.ok) {
      console.error('[Lina][ADMIN_ANALYTICS_DB_ERROR]', { status: response.status });
      return json(res, 503, { error: 'Không thể đọc dữ liệu analytics.' });
    }

    const rows = await response.json();
    if (!Array.isArray(rows)) return json(res, 503, { error: 'Dữ liệu analytics không hợp lệ.' });
    return json(res, 200, summarize(rows, days));
  } catch (error) {
    console.error('[Lina][ADMIN_ANALYTICS_ERROR]', {
      name: error?.name || 'Error',
    });
    return json(res, 503, { error: 'Không thể tải analytics.' });
  }
}
