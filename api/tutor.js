const MODEL = process.env.GEMINI_TUTOR_MODEL || 'gemini-3.8-flash';
const MODEL_FALLBACKS = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];
const MAX_MESSAGE = 2000;
const MAX_HISTORY = 6;
const MAX_MEMORY_FACTS = 8;

const FALLBACK = (message, userName = 'Bạn') => ({
  chinese: `你好，${userName}！很高兴和你练习中文。你刚才说：“${message.slice(0, 80)}”。我们继续练习吧！`,
  pinyin: `Nǐ hǎo, ${userName}! Hěn gāoxìng hé nǐ liànxí Zhōngwén.`,
  vietnamese: `Chào ${userName}! Rất vui được luyện tiếng Trung cùng bạn. Mình cùng tiếp tục nhé!`,
  responseType: 'conversation',
  emotion: 'encouraging',
  correction: null,
  vocabulary: [],
  grammar: [],
  progressiveHints: {
    hint1_semantic: 'Hãy diễn đạt ý chính bằng một câu ngắn.',
    hint2_keywords: '你好 (nǐ hǎo), 练习 (liànxí), 中文 (Zhōngwén)',
    hint3_structure: '我 + 想 + Động từ',
    hint4_fullAnswer: '我想练习中文。(Wǒ xiǎng liànxí Zhōngwén.)'
  },
  speakingCoach: {
    enabled: false,
    needsRetry: false,
    naturalnessScore: 100,
    issueType: 'none',
    focus: '',
    betterSentence: '',
    feedbackVi: '',
    retryPromptVi: ''
  },
  suggestedReplies: [
    { hanzi: '你好！', pinyin: 'Nǐ hǎo!', vietnamese: 'Xin chào!' },
    { hanzi: '我想练习中文。', pinyin: 'Wǒ xiǎng liànxí Zhōngwén.', vietnamese: 'Mình muốn luyện tiếng Trung.' }
  ]
});

const SYSTEM = `Bạn là Lina (林娜), gia sư tiếng Trung cho người học Việt Nam.
Luôn thân thiện, kiên nhẫn, ngắn gọn và khuyến khích.
Nếu người học sai, nói: “Bạn diễn đạt đúng ý rồi. Mình sửa một chút để câu tự nhiên hơn nhé.”
Chế độ conversation: ưu tiên hội thoại tự nhiên, chỉ sửa lỗi quan trọng.
Chế độ teacher: ưu tiên sửa lỗi, giải thích ngữ pháp/từ vựng bằng tiếng Việt dễ hiểu.
Điều chỉnh câu và từ vựng theo HSK/user level. Không bịa pinyin, nghĩa hoặc cấp độ HSK.

QUAN TRỌNG:
- Trả về DUY NHẤT một JSON object hợp lệ.
- Không markdown, không code fence.
- Bắt buộc có chinese, pinyin, vietnamese, responseType, suggestedReplies.
- suggestedReplies là mảng 2-4 object có hanzi, pinyin, vietnamese.
- Luôn trả lời dựa trên tin nhắn MỚI NHẤT.
- Không dùng câu trả lời mẫu cố định cho mọi tin nhắn.
- Nếu isSpoken=true, hãy đóng vai Speaking Coach: đánh giá độ tự nhiên của chính câu người học vừa nói (không chấm âm thanh/acoustic vì bạn chỉ có transcript). Chỉ bật speakingCoach.enabled=true khi câu cần sửa hoặc có cách nói tự nhiên hơn đáng kể. Nếu cần sửa, needsRetry=true, issueType phù hợp, naturalnessScore 0-100, betterSentence là câu người học nên nói lại, feedbackVi ngắn gọn, retryPromptVi khuyến khích nói lại. Nếu câu tự nhiên, enabled=false và naturalnessScore 90-100.`;

function cleanString(value, max) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, max)
    : '';
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-MAX_HISTORY).map((m) => ({
    sender: m?.sender === 'ai' ? 'ai' : 'user',
    hanzi: cleanString(m?.hanzi, 700),
    pinyin: cleanString(m?.pinyin, 300),
    vietnamese: cleanString(m?.vietnamese, 700)
  }));
}

function parseTutorJson(text) {
  const raw = String(text || '').trim();
  if (!raw) throw new Error('Gemini returned empty text');
  const clean = raw
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(clean);
  } catch {
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(clean.slice(start, end + 1));
    throw new Error('Gemini returned invalid JSON');
  }
}

function validateTutorResponse(value) {
  if (!value || typeof value !== 'object') throw new Error('Tutor response is not an object');
  if (!cleanString(value.chinese, 4000)) throw new Error('Missing chinese');
  if (!cleanString(value.pinyin, 4000)) throw new Error('Missing pinyin');
  if (!cleanString(value.vietnamese, 4000)) throw new Error('Missing vietnamese');
  if (!Array.isArray(value.suggestedReplies)) throw new Error('Missing suggestedReplies');

  const responseType = ['conversation', 'lesson', 'roleplay', 'correction'].includes(value.responseType)
    ? value.responseType
    : 'conversation';

  const suggestedReplies = value.suggestedReplies
    .filter((x) => x && typeof x === 'object')
    .map((x) => ({
      hanzi: cleanString(x.hanzi, 240),
      pinyin: cleanString(x.pinyin, 240),
      vietnamese: cleanString(x.vietnamese, 300)
    }))
    .filter((x) => x.hanzi && x.pinyin && x.vietnamese)
    .slice(0, 4);

  if (!suggestedReplies.length) throw new Error('No valid suggestedReplies');

  const rawCoach = value.speakingCoach && typeof value.speakingCoach === 'object' ? value.speakingCoach : {};
  const coachTypes = ['none', 'naturalness', 'grammar', 'word-order', 'vocabulary'];
  const speakingCoach = {
    enabled: rawCoach.enabled === true,
    needsRetry: rawCoach.needsRetry === true,
    naturalnessScore: Math.max(0, Math.min(100, Number(rawCoach.naturalnessScore) || 0)),
    issueType: coachTypes.includes(rawCoach.issueType) ? rawCoach.issueType : 'none',
    focus: cleanString(rawCoach.focus, 160),
    betterSentence: cleanString(rawCoach.betterSentence, 500),
    feedbackVi: cleanString(rawCoach.feedbackVi, 500),
    retryPromptVi: cleanString(rawCoach.retryPromptVi, 300)
  };

  return {
    ...value,
    chinese: cleanString(value.chinese, 4000),
    pinyin: cleanString(value.pinyin, 4000),
    vietnamese: cleanString(value.vietnamese, 4000),
    responseType,
    emotion: cleanString(value.emotion, 40) || 'encouraging',
    speakingCoach,
    suggestedReplies
  };
}

async function callGemini({ apiKey, model, prompt }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: 900,
            ...(model === 'gemini-3.8-flash' ? { thinkingConfig: { thinkingLevel: 'low' } } : {})
          }
        }),
        signal: controller.signal
      }
    );

    const raw = await response.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch {}

    if (!response.ok) {
      const apiMessage = data?.error?.message || `HTTP ${response.status}`;
      throw new Error(`Gemini ${response.status}: ${apiMessage}`);
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || '')
      .join('')
      .trim();

    if (!text) {
      const finish = data?.candidates?.[0]?.finishReason || 'unknown';
      throw new Error(`Gemini returned no text (finishReason=${finish})`);
    }

    return text;
  } finally {
    clearTimeout(timer);
  }
}

async function generateTutor(body) {
  const message = cleanString(body.message, MAX_MESSAGE).trim();
  if (!message) throw Object.assign(new Error('Message string is required'), { status: 400 });

  const userName = cleanString(body.userName, 120) || 'Bạn';
  const mode = body.mode === 'teacher' ? 'teacher' : 'conversation';
  const hskLevel = cleanString(body.hskLevel, 20) || 'HSK 1';
  const userLevel = cleanString(body.userLevel, 40) || 'Cơ bản';
  const topicTitle = cleanString(body.topicTitle, 240) || 'Tự do';
  const isSpoken = body.isSpoken === true;
  const memoryFacts = Array.isArray(body.memoryFacts)
    ? body.memoryFacts.slice(-MAX_MEMORY_FACTS).map((x) => cleanString(x, 240)).filter(Boolean)
    : [];

  const apiKey = cleanString(process.env.GEMINI_API_KEY, 500);
  if (!apiKey) {
    console.error('[Lina][TUTOR_API_ERROR] GEMINI_API_KEY is missing');
    return FALLBACK(message, userName);
  }

  const history = normalizeHistory(body.history);
  const prompt = [
    `Chủ đề: ${topicTitle}`,
    `Trình độ: ${userLevel}; ${hskLevel}; chế độ: ${mode}`,
    `Tên học viên: ${userName}`,
    `isSpoken: ${isSpoken}`,
    isSpoken ? 'Speaking Coach: hãy kiểm tra câu transcript người học vừa nói về độ tự nhiên và đưa ra một lần sửa lại nếu cần.' : '',
    memoryFacts.length ? `Thông tin nhớ: ${memoryFacts.join('; ')}` : '',
    history.length ? `Lịch sử gần đây:\n${JSON.stringify(history)}` : '',
    `TIN NHẮN MỚI NHẤT:\n${message}`,
    'Phản hồi ngay, tự nhiên và đúng ngữ cảnh; ưu tiên câu trả lời ngắn gọn. Không lặp lại câu mẫu.'
  ].filter(Boolean).join('\n');

  const models = [MODEL, ...MODEL_FALLBACKS.filter((model) => model !== MODEL)];
  let lastError = null;

  for (const model of models) {
    try {
      const text = await callGemini({ apiKey, model, prompt });
      return validateTutorResponse(parseTutorJson(text));
    } catch (error) {
      lastError = error;
      const message = String(error?.message || 'Unknown error');
      const retryable = /Gemini (429|500|502|503|504):/i.test(message);
      console.error('[Lina][TUTOR_API_ERROR]', {
        model,
        name: error?.name || 'Error',
        retryable,
        message: message.slice(0, 800)
      });
      if (!retryable) break;
    }
  }

  throw lastError || new Error('Gemini tutor request failed');
}

function sendSse(res, payload) {
  if (!res.writableEnded) res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const path = req.url?.split('?')[0] || '/api/tutor';
  const action = new URL(req.url || '/api/tutor', 'http://localhost').searchParams.get('action');

  // Safe runtime diagnostic: exposes configuration presence only, never secret values.
  // This lets us distinguish Vercel environment configuration problems from auth/client issues
  // without adding another serverless function (important for Vercel Hobby function limits).
  if (req.method === 'GET' && action === 'health') {
    const geminiConfigured = Boolean(cleanString(process.env.GEMINI_API_KEY, 500));
    const supabaseConfigured = Boolean(
      cleanString(process.env.SUPABASE_URL, 500) &&
      cleanString(process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY, 500)
    );
    return res.status(200).json({
      ok: geminiConfigured,
      tutor: {
        geminiConfigured,
        model: MODEL
      },
      auth: {
        supabaseConfigured
      }
    });
  }

  // Safe provider diagnostic: performs one tiny Gemini request without exposing the API key.
  // Useful for distinguishing invalid/restricted keys, quota errors, model errors, or network failures.
  if (req.method === 'GET' && action === 'gemini-test') {
    const apiKey = cleanString(process.env.GEMINI_API_KEY, 500);
    if (!apiKey) {
      return res.status(200).json({ ok: false, configured: false, model: MODEL, error: 'GEMINI_API_KEY is missing' });
    }
    try {
      const text = await callGemini({
        apiKey,
        model: MODEL,
        prompt: 'Reply with exactly one short Vietnamese word: OK'
      });
      return res.status(200).json({
        ok: true,
        configured: true,
        model: MODEL,
        responseReceived: Boolean(text)
      });
    } catch (error) {
      console.error('[Lina][GEMINI_HEALTH_ERROR]', {
        model: MODEL,
        name: error?.name || 'Error',
        message: String(error?.message || 'Unknown error').slice(0, 800)
      });
      return res.status(200).json({
        ok: false,
        configured: true,
        model: MODEL,
        error: String(error?.message || 'Gemini request failed').slice(0, 800)
      });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (path.endsWith('/hints') || action === 'hints') {
    const body = req.body || {};
    const sentence = cleanString(body.contextSentence, 1200);
    if (!sentence) return res.status(400).json({ error: 'contextSentence is required' });

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        hint1_semantic: 'Hãy nói ý chính bằng tiếng Việt.',
        hint2_keywords: '我叫 (wǒ jiào), 名字 (míngzi)',
        hint3_structure: '我叫 + Tên',
        hint4_fullAnswer: '你好！我叫阿明。(Nǐ hǎo! Wǒ jiào Ā Míng.)'
      });
    }

    const result = await generateTutor({
      ...body,
      message: `Hãy tạo 4 tầng gợi ý cho câu: ${sentence}`,
      mode: 'teacher'
    });
    return res.json(result.progressiveHints || FALLBACK(sentence, body.userName).progressiveHints);
  }

  if (path.endsWith('/explain') || action === 'explain') {
    const sentence = cleanString(req.body?.sentence, 2000);
    if (!sentence) return res.status(400).json({ error: 'Sentence is required' });

    const result = await generateTutor({
      ...req.body,
      message: `Giải thích câu sau: ${sentence}`,
      mode: 'teacher'
    });

    return res.json({
      sentence,
      pinyin: result.pinyin,
      meaningVi: result.vietnamese,
      grammarBreakdown: (result.grammar || []).map((g) => ({
        part: g.structure,
        role: g.meaningVi
      })),
      culturalTipVi: ''
    });
  }

  let response;
  try {
    response = await generateTutor(req.body || {});
  } catch (error) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    sendSse(res, {
      type: 'error',
      error: String(error?.message || 'Gemini tutor request failed').slice(0, 800),
      model: MODEL
    });
    sendSse(res, { type: 'done' });
    return res.end();
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sendSse(res, { type: 'text', text: response.chinese });
  // Dedicated speech event lets realtime voice start TTS without waiting for UI-only response handling.
  sendSse(res, { type: 'speech', text: response.chinese });
  sendSse(res, { type: 'response', response });
  sendSse(res, { type: 'done' });

  return res.end();
};
