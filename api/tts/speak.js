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
      console.error('[Lina][GEMINI_TTS_ERROR]', response.status, data?.error?.message || raw.slice(0, 300));
      return res.status(response.status === 429 ? 429 : 502).json({ error: data?.error?.message || 'Gemini TTS request failed.' });
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
