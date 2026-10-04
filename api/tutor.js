import { GoogleGenAI } from '@google/genai';

const MODEL = process.env.GEMINI_TUTOR_MODEL || 'gemini-3.8-flash';
const MAX_MESSAGE = 2000;
const MAX_HISTORY = 8;
const MAX_MEMORY_FACTS = 12;

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
  suggestedReplies: [
    { hanzi: '你好！', pinyin: 'Nǐ hǎo!', vietnamese: 'Xin chào!' },
    { hanzi: '我想练习中文。', pinyin: 'Wǒ xiǎng liànxí Zhōngwén.', vietnamese: 'Mình muốn luyện tiếng Trung.' }
  ]
});

const SYSTEM = `Bạn là Lina (林娜), gia sư tiếng Trung cho người học Việt Nam.
Luôn thân thiện, kiên nhẫn, ngắn gọn và khuyến khích. Không làm người học xấu hổ.
Nếu người học sai, nói: “Bạn diễn đạt đúng ý rồi. Mình sửa một chút để câu tự nhiên hơn nhé.”
Chế độ conversation: ưu tiên hội thoại tự nhiên, chỉ sửa lỗi quan trọng.
Chế độ teacher: ưu tiên sửa lỗi, giải thích ngữ pháp/từ vựng bằng tiếng Việt dễ hiểu.
Điều chỉnh câu và từ vựng theo HSK/user level. Không bịa pinyin, nghĩa hoặc cấp độ HSK.

QUAN TRỌNG:
- Trả về DUY NHẤT một JSON object hợp lệ, không markdown, không code fence.
- Các trường bắt buộc: chinese, pinyin, vietnamese, responseType, suggestedReplies.
- suggestedReplies là mảng 2-4 object, mỗi object có hanzi, pinyin, vietnamese.
- Có thể bỏ qua correction, vocabulary, grammar, progressiveHints, memoryUpdate nếu không cần.
- Luôn trả lời dựa trên tin nhắn MỚI NHẤT của học viên và lịch sử được cung cấp.
- Không lặp lại một câu trả lời chung chung nếu học viên vừa nói một câu khác.`;

function cleanString(value, max) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, max) : '';
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

  const withoutFence = raw
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(withoutFence);
  } catch {
    const start = withoutFence.indexOf('{');
    const end = withoutFence.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(withoutFence.slice(start, end + 1));
    throw new Error('Gemini returned invalid JSON');
  }
}

function validateTutorResponse(parsed) {
  if (!parsed || typeof parsed !== 'object') throw new Error('Tutor response is not an object');
  if (typeof parsed.chinese !== 'string' || !parsed.chinese.trim()) throw new Error('Missing chinese');
  if (typeof parsed.pinyin !== 'string') throw new Error('Missing pinyin');
  if (typeof parsed.vietnamese !== 'string') throw new Error('Missing vietnamese');
  if (!Array.isArray(parsed.suggestedReplies)) throw new Error('Missing suggestedReplies');

  parsed.responseType = ['conversation', 'lesson', 'roleplay', 'correction'].includes(parsed.responseType)
    ? parsed.responseType
    : 'conversation';

  parsed.suggestedReplies = parsed.suggestedReplies
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      hanzi: cleanString(item.hanzi, 240),
      pinyin: cleanString(item.pinyin, 240),
      vietnamese: cleanString(item.vietnamese, 300)
    }))
    .filter((item) => item.hanzi && item.pinyin && item.vietnamese)
    .slice(0, 4);

  if (!parsed.suggestedReplies.length) throw new Error('No valid suggestedReplies');
  return parsed;
}

async function generateTutor(body) {
  const message = cleanString(body.message, MAX_MESSAGE).trim();
  if (!message) throw Object.assign(new Error('Message string is required'), { status: 400 });

  const userName = cleanString(body.userName, 120) || 'Bạn';
  const mode = body.mode === 'teacher' ? 'teacher' : 'conversation';
  const hskLevel = cleanString(body.hskLevel, 20) || 'HSK 1';
  const userLevel = cleanString(body.userLevel, 40) || 'Cơ bản';
  const topicTitle = cleanString(body.topicTitle, 240) || 'Tự do';
  const memoryFacts = Array.isArray(body.memoryFacts)
    ? body.memoryFacts.slice(-MAX_MEMORY_FACTS).map((x) => cleanString(x, 240)).filter(Boolean)
    : [];

  if (!process.env.GEMINI_API_KEY) {
    console.error('[Lina][TUTOR_API_ERROR]', { reason: 'Missing GEMINI_API_KEY', model: MODEL });
    return FALLBACK(message, userName);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const history = normalizeHistory(body.history);
  const context = [
    `Chủ đề: ${topicTitle}`,
    `Chế độ: ${mode}`,
    `Trình độ: ${userLevel}; ${hskLevel}`,
    `Tên học viên: ${userName}`,
    memoryFacts.length ? `Thông tin đã nhớ: ${memoryFacts.join('; ')}` : '',
    history.length ? `Lịch sử:${JSON.stringify(history)}` : ''
  ].filter(Boolean).join('\n');

  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [{
            text: `${context}\n\nTin nhắn MỚI NHẤT của học viên:\n${message}\n\nHãy trả lời đúng ngữ cảnh của tin nhắn mới nhất. JSON duy nhất.`
          }]
        }
      ],
      config: {
        systemInstruction: SYSTEM,
        maxOutputTokens: 1400,
        responseMimeType: 'application/json'
      }
    });

    const parsed = validateTutorResponse(parseTutorJson(result.text));
    return parsed;
  } catch (error) {
    console.error('[Lina][TUTOR_API_ERROR]', {
      name: error?.name || 'Error',
      message: String(error?.message || 'Unknown error').slice(0, 500),
      status: error?.status,
      model: MODEL
    });
    return FALLBACK(message, userName);
  }
}

function sendSse(res, payload) {
  if (!res.writableEnded) res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const path = req.url?.split('?')[0] || '/api/tutor';
  const action = new URL(req.url || '/api/tutor', 'http://localhost').searchParams.get('action');

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
      grammarBreakdown: (result.grammar || []).map((g) => ({ part: g.structure, role: g.meaningVi })),
      culturalTipVi: ''
    });
  }

  const response = await generateTutor(req.body || {});
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  sendSse(res, { type: 'text', text: response.chinese });
  sendSse(res, { type: 'response', response });
  sendSse(res, { type: 'done' });
  return res.end();
};
