// Conversation room prioritizes latency and capacity over deep reasoning.
// Google currently describes 3.5 Flash-Lite as its fastest, most cost-efficient Flash model.
// Keep an override available for production tuning.
const MODEL = process.env.GEMINI_TUTOR_MODEL || 'gemini-3.5-flash-lite';
const MODEL_FALLBACKS = ['gemini-3.6-flash'];
const MAX_MESSAGE = 2000;
const MAX_HISTORY = 4;
const MAX_MEMORY_FACTS = 8;

const FALLBACK = (message, userName = 'Bạn') => {
  const text = String(message || '').trim();
  if (/我吃了[，,。.!！ ]*(你呢)?[？?]?/.test(text)) {
    return {
      chinese: '我还没吃呢。你刚下班，准备吃什么？',
      pinyin: 'Wǒ hái méi chī ne. Nǐ gāng xiàbān, zhǔnbèi chī shénme?',
      vietnamese: 'Mình vẫn chưa ăn. Bạn vừa tan làm, định ăn gì vậy?',
      responseType: 'conversation', emotion: 'friendly', correction: null, vocabulary: [], grammar: [],
      progressiveHints: {}, speakingCoach: { enabled:false, needsRetry:false,naturalnessScore:100,issueType:'none',focus:'',betterSentence:'',feedbackVi:'',retryPromptVi:'',isRetry:false,retryResolved:false,attempt:0 },
      suggestedReplies: [
        { hanzi:'我准备去吃面。',pinyin:'Wǒ zhǔnbèi qù chī miàn.',vietnamese:'Mình định đi ăn mì.' },
        { hanzi:'我想吃米饭。',pinyin:'Wǒ xiǎng chī mǐfàn.',vietnamese:'Mình muốn ăn cơm.' }
      ]
    };
  }
  if (/我们去逛街了/.test(text)) {
    return {
      chinese: '听起来不错！你们今天买了什么？',
      pinyin: 'Tīng qǐlái búcuò! Nǐmen jīntiān mǎi le shénme?',
      vietnamese: 'Nghe hay đấy! Hôm nay các bạn đã mua gì?',
      responseType:'conversation',emotion:'happy',correction:null,vocabulary:[],grammar:[],progressiveHints:{},
      speakingCoach:{enabled:false,needsRetry:false,naturalnessScore:100,issueType:'none',focus:'',betterSentence:'',feedbackVi:'',retryPromptVi:'',isRetry:false,retryResolved:false,attempt:0},
      suggestedReplies:[
        {hanzi:'我们买了衣服。',pinyin:'Wǒmen mǎi le yīfu.',vietnamese:'Tụi mình mua quần áo.'},
        {hanzi:'我们喝了咖啡。',pinyin:'Wǒmen hē le kāfēi.',vietnamese:'Tụi mình uống cà phê.'}
      ]
    };
  }
  return {
  chinese: `你好，${userName}！我听懂了。你刚才说：“${text.slice(0, 50)}”。我们继续聊吧！`,
  pinyin: `Nǐ hǎo, ${userName}! Wǒ tīng dǒng le. Wǒmen jìxù liáo ba.`,
  vietnamese: `Mình hiểu rồi, ${userName}. Mình tiếp tục trò chuyện nhé!`,
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
    retryPromptVi: '',
    isRetry: false,
    retryResolved: false,
    attempt: 0
  },
  suggestedReplies: [
    { hanzi: '你呢？', pinyin: 'Nǐ ne?', vietnamese: 'Còn bạn thì sao?' },
    { hanzi: '我们继续聊吧。', pinyin: 'Wǒmen jìxù liáo ba.', vietnamese: 'Mình tiếp tục nói chuyện nhé.' }
  ]
  };
};

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
- Nếu isSpoken=true, hãy đóng vai Speaking Coach: đánh giá độ tự nhiên của chính câu người học vừa nói (không chấm âm thanh/acoustic vì bạn chỉ có transcript). Chỉ bật speakingCoach.enabled=true khi câu cần sửa hoặc có cách nói tự nhiên hơn đáng kể. Nếu cần sửa, needsRetry=true, issueType phù hợp, naturalnessScore 0-100, betterSentence là câu người học nên nói lại, feedbackVi ngắn gọn, retryPromptVi khuyến khích nói lại. Nếu câu tự nhiên, enabled=false và naturalnessScore 90-100.
- Nếu isSpeakingRetry=true, hãy so sánh câu vừa nói với speakingCoachTarget là câu Lina yêu cầu nói lại. Không chỉ sửa lại câu: hãy xác định người học đã tiến bộ chưa. Trả về isRetry=true, attempt là số lần thử, retryResolved=true nếu câu đã tự nhiên/đạt mục tiêu (naturalnessScore >= 85); khi resolved thì needsRetry=false, issueType=none, betterSentence có thể giữ câu hiện tại. Nếu chưa đạt, retryResolved=false, needsRetry=true và betterSentence là phiên bản cần luyện tiếp. Chỉ yêu cầu tối đa 3 lần; sau attempt >= 3 hãy ưu tiên chốt câu gần đúng nhất và retryResolved=true nếu câu đủ hiểu.
- memoryUpdate: nếu tin nhắn mới cho biết một sở thích, thông tin cá nhân ổn định, mục tiêu học, hoặc chủ đề đang nói, hãy trả về learnedFact/topicContext ngắn gọn. Nếu không có thì để chuỗi rỗng. Không suy đoán thông tin cá nhân.`;

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

function validateTutorResponse(value, fallbackAttempt = 0) {
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
    retryPromptVi: cleanString(rawCoach.retryPromptVi, 300),
    isRetry: rawCoach.isRetry === true,
    retryResolved: rawCoach.retryResolved === true,
    attempt: Math.max(0, Math.min(3, Number(rawCoach.attempt) || fallbackAttempt))
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
  const timer = setTimeout(() => controller.abort(), 7000);

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
            responseSchema: {
              type: 'OBJECT',
              properties: {
                chinese: { type: 'STRING' },
                pinyin: { type: 'STRING' },
                vietnamese: { type: 'STRING' },
                responseType: { type: 'STRING', enum: ['conversation', 'lesson', 'roleplay', 'correction'] },
                emotion: { type: 'STRING' },
                correction: { type: 'OBJECT', nullable: true },
                vocabulary: { type: 'ARRAY', items: { type: 'OBJECT' } },
                grammar: { type: 'ARRAY', items: { type: 'OBJECT' } },
                progressiveHints: { type: 'OBJECT' },
                speakingCoach: { type: 'OBJECT' },
                memoryUpdate: {
                  type: 'OBJECT',
                  properties: { learnedFact: { type: 'STRING' }, topicContext: { type: 'STRING' } }
                },
                suggestedReplies: {
                  type: 'ARRAY',
                  minItems: 2,
                  maxItems: 4,
                  items: {
                    type: 'OBJECT',
                    properties: {
                      hanzi: { type: 'STRING' },
                      pinyin: { type: 'STRING' },
                      vietnamese: { type: 'STRING' }
                    },
                    required: ['hanzi', 'pinyin', 'vietnamese']
                  }
                }
              },
              required: ['chinese', 'pinyin', 'vietnamese', 'responseType', 'suggestedReplies']
            },
            maxOutputTokens: 700,
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
  const isSpeakingRetry = body.isSpeakingRetry === true;
  const speakingCoachTarget = cleanString(body.speakingCoachTarget, 500);
  const speakingAttempt = Math.max(0, Math.min(3, Number(body.speakingAttempt) || 0));
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
    `isSpeakingRetry: ${isSpeakingRetry}`,
    `speakingAttempt: ${speakingAttempt}`,
    speakingCoachTarget ? `speakingCoachTarget: ${speakingCoachTarget}` : '',
    isSpoken ? (isSpeakingRetry ? 'Speaking Coach retry: so sánh câu mới với câu mục tiêu và báo đã tiến bộ hay chưa.' : 'Speaking Coach: hãy kiểm tra câu transcript người học vừa nói về độ tự nhiên và đưa ra một lần sửa lại nếu cần.') : '',
    memoryFacts.length ? `Thông tin nhớ: ${memoryFacts.join('; ')}` : '',
    history.length ? `Lịch sử gần đây:\n${JSON.stringify(history)}` : '',
    `TIN NHẮN MỚI NHẤT:\n${message}`,
    'Nếu người học nói về tên, sở thích, quê quán, công việc, gia đình, thói quen hoặc mục tiêu HSK thì ghi nhận vào memoryUpdate. Chỉ ghi điều người học thực sự nói, không suy đoán.',
    'Phản hồi ngay dựa trên TIN NHẮN MỚI NHẤT và 2-3 lượt gần nhất. Không dùng câu xác nhận chung chung nếu có thể trả lời cụ thể. Không lặp lại câu mẫu.'
  ].filter(Boolean).join('\n');

  const models = [MODEL];
  let lastError = null;

  for (const model of models) {
    try {
      const text = await callGemini({ apiKey, model, prompt });
      return validateTutorResponse(parseTutorJson(text), speakingAttempt);
    } catch (error) {
      lastError = error;
      const message = String(error?.message || 'Unknown error');
      const retryable = /Gemini (429|500|502|504):/i.test(message);
      console.error('[Lina][TUTOR_API_ERROR]', {
        model,
        name: error?.name || 'Error',
        retryable,
        message: message.slice(0, 800)
      });
      if (!retryable) break;
    }
  }

  // A 503 means the provider is saturated. Do not wait for another model: the
  // conversation room should respond immediately with a local contextual reply.
  if (/Gemini 503:/i.test(String(lastError?.message || ''))) {
    return FALLBACK(message, userName);
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
