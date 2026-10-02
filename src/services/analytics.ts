import type {
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsEventProperties,
  AnalyticsPreferences,
  LearnerAnalyticsSummary,
} from '../types/analytics';

const PREF_KEY = 'lina_analytics_preferences_v1';
const ANON_KEY = 'lina_analytics_anonymous_id_v1';
const SESSION_KEY = 'lina_analytics_session_v1';
const QUEUE_KEY = 'lina_analytics_queue_v1';
const MAX_QUEUE = 200;

const blockedKeys = new Set([
  'email', 'name', 'userName', 'displayName', 'rawAudio', 'audioBase64',
  'audio', 'transcript', 'message', 'originalSentence', 'correctedSentence',
]);

const safeId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

const getStored = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch { return fallback; }
};

const setStored = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

const preferences = (): AnalyticsPreferences =>
  getStored<AnalyticsPreferences>(PREF_KEY, { enabled: true });

const sanitize = (input: AnalyticsEventProperties): AnalyticsEventProperties => {
  const output: AnalyticsEventProperties = {};
  for (const [key, value] of Object.entries(input || {})) {
    if (blockedKeys.has(key)) continue;
    if (value === null || value === undefined) continue;
    if (typeof value === 'string') output[key] = value.slice(0, 120);
    else if (typeof value === 'number' && Number.isFinite(value)) output[key] = value;
    else if (typeof value === 'boolean') output[key] = value;
  }
  return output;
};

const anonymousId = () => {
  const current = getStored<string>(ANON_KEY, '');
  if (current) return current;
  const next = safeId();
  setStored(ANON_KEY, next);
  return next;
};

const sessionId = () => {
  const current = getStored<{ id: string; startedAt: number }>(SESSION_KEY, { id: '', startedAt: 0 });
  if (current.id && Date.now() - current.startedAt < 30 * 60 * 1000) return current.id;
  const next = { id: safeId(), startedAt: Date.now() };
  setStored(SESSION_KEY, next);
  return next.id;
};

const loadQueue = (): AnalyticsEvent[] => getStored<AnalyticsEvent[]>(QUEUE_KEY, []);
const saveQueue = (events: AnalyticsEvent[]) => setStored(QUEUE_KEY, events.slice(-MAX_QUEUE));

async function flush() {
  if (!preferences().enabled || typeof fetch === 'undefined') return;
  const queue = loadQueue();
  if (!queue.length) return;
  try {
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: queue.slice(0, 50) }),
      keepalive: true,
    });
    if (!response.ok) return;
    saveQueue(queue.slice(50));
  } catch {
    // Analytics must never affect the learning experience.
  }
}

export const analytics = {
  getPreferences: preferences,
  setEnabled(enabled: boolean) {
    setStored(PREF_KEY, { enabled });
    if (!enabled) saveQueue([]);
  },
  clearLocalData() {
    try {
      localStorage.removeItem(QUEUE_KEY);
      localStorage.removeItem(ANON_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {}
  },
  track(eventName: AnalyticsEventName, properties: AnalyticsEventProperties = {}) {
    try {
      if (!preferences().enabled) return;
      const event: AnalyticsEvent = {
        eventId: safeId(),
        eventName,
        anonymousId: anonymousId(),
        sessionId: sessionId(),
        occurredAt: new Date().toISOString(),
        properties: sanitize(properties),
      };
      const queue = [...loadQueue(), event].slice(-MAX_QUEUE);
      saveQueue(queue);
      void flush();
    } catch {
      // Provider/storage errors are intentionally swallowed.
    }
  },
  flush,
  getLearnerSummary(): LearnerAnalyticsSummary {
    const events = loadQueue();
    const sessions = new Set(events.map(e => e.sessionId)).size;
    const starts = events.filter(e => e.eventName === 'lesson_start').length;
    const completes = events.filter(e => e.eventName === 'lesson_complete').length;
    const studyMinutes = events.reduce((sum, e) => {
      const minutes = e.properties.minutes;
      return sum + (typeof minutes === 'number' ? Math.max(0, Math.min(180, minutes)) : 0);
    }, 0);
    const review = events.filter(e => e.eventName === 'vocabulary_review').length;
    const mastery = events.filter(e => e.eventName === 'vocabulary_mastered').length;
    return {
      studyMinutes: Math.round(studyMinutes),
      sessions,
      lessonCompletion: starts ? Math.round((completes / starts) * 100) : 0,
      vocabularyMastery: review ? Math.round((mastery / review) * 100) : 0,
      grammarWeaknesses: events.filter(e => e.eventName === 'mistake' && e.properties.category === 'grammar').length,
      speakingFrequency: events.filter(e => e.eventName === 'speaking_start').length,
      pronunciationPractice: events.filter(e => e.eventName === 'pronunciation_practice').length,
      reviewConsistency: new Set(events.filter(e => e.eventName === 'vocabulary_review').map(e => String(e.occurredAt).slice(0, 10))).size,
      eventsTracked: events.length,
    };
  },
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void analytics.flush());
}
