const API_KEY = process.env.ELEVENLABS_API_KEY || '';
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || process.env.ELEVENLABS_DEFAULT_VOICE_ID || '';
const MODEL = process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5';

function clean(value, max = 2000) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, max).trim() : '';
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const text = clean(req.body?.text);
  const lang = clean(req.body?.lang, 20) || 'zh-CN';
  if (!text) return res.status(400).json({ error: 'text is required' });

  // Streaming provider is optional. The client automatically falls back to Gemini/browser TTS.
  if (!API_KEY || !VOICE_ID) {
    return res.status(503).json({ error: 'ElevenLabs streaming TTS chưa được cấu hình.' });
  }

  try {
    const url = 'https://api.elevenlabs.io/v1/text-to-speech/' + encodeURIComponent(VOICE_ID) + '/stream?output_format=mp3_44100_128';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        language_code: lang === 'zh-CN' ? 'zh' : lang.split('-')[0],
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true }
      })
    });

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => '');
      console.error('[Lina][ELEVENLABS_TTS_ERROR]', response.status, detail.slice(0, 300));
      return res.status(response.status === 429 ? 429 : 502).json({ error: 'ElevenLabs TTS request failed.' });
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Vary', 'Accept');
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) res.write(Buffer.from(value));
    }
    return res.end();
  } catch (error) {
    console.error('[Lina][ELEVENLABS_TTS_REQUEST_ERROR]', error?.message || error);
    if (!res.writableEnded) return res.status(503).json({ error: 'Không thể kết nối ElevenLabs TTS.' });
  }
}
