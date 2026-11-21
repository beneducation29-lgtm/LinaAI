const MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts';
const API_KEY = process.env.GEMINI_API_KEY || '';

function clean(value, max = 2000) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, max).trim() : '';
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const text = clean(req.body?.text);
  const voice = clean(req.body?.voice, 80) || 'Kore';
  if (!text) return res.status(400).json({ error: 'text is required' });
  if (!API_KEY) return res.status(503).json({ error: 'Gemini TTS chưa được cấu hình.' });

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(MODEL) + ':generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Read this Chinese learning sentence naturally and clearly in Mandarin. Do not add words. Sentence: ${text}` }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } }
          }
        })
      }
    );
    const raw = await response.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch {}
    if (!response.ok) {
      const providerMessage = data?.error?.message || 'Gemini TTS request failed.';
      console.error('[Lina][GEMINI_TTS_ERROR]', response.status, providerMessage);
      // A 403 caused by unavailable billing/free-tier access is a persistent
      // provider configuration failure, not a transient audio playback error.
      // Tell the client to use native speech and keep this provider in cooldown.
      if (response.status === 403) {
        return res.status(503).json({
          code: 'TTS_PROVIDER_DISABLED',
          error: 'Giọng đọc AI tạm thời không khả dụng. Lina sẽ chuyển sang giọng đọc trên thiết bị.',
          cooldownSeconds: 300
        });
      }
      if (response.status === 429) {
        return res.status(429).json({
          code: 'TTS_RATE_LIMITED',
          error: 'Giọng đọc AI đang quá tải. Lina sẽ tạm dùng giọng đọc trên thiết bị.',
          cooldownSeconds: 30
        });
      }
      return res.status(502).json({
        code: 'TTS_PROVIDER_ERROR',
        error: providerMessage,
        cooldownSeconds: 15
      });
    }

    const part = data?.candidates?.[0]?.content?.parts?.find(p => p?.inlineData?.data);
    const audioBase64 = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType || 'audio/wav';
    if (!audioBase64) return res.status(502).json({ error: 'Gemini TTS không trả về audio.' });
    return res.status(200).json({ audioBase64, mimeType, model: MODEL });
  } catch (error) {
    console.error('[Lina][GEMINI_TTS_REQUEST_ERROR]', error?.message || error);
    return res.status(503).json({ error: 'Không thể kết nối Gemini TTS.' });
  }
}
