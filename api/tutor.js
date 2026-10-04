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

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    chinese: { type: 'string' },
    pinyin: { type: 'string' },
    vietnamese: { type: 'string' },
    responseType: { type: 'string', enum: ['conversation', 'lesson', 'roleplay', 'correction'] },
    emotion: { type: 'string', enum: ['neutral', 'happy', 'encouraging', 'curious', 'confused', 'correcting'] },
    correction: {
      type: 'object',
      properties: {
        hasMistake: { type: 'boolean' },
        originalSentence: { type: 'string' },
        correctedSentence: { type: 'string' },
        pinyin: { type: 'string' },
        explanationVi: { type: 'string' },
        tryAgainPromptVi: { type: 'string' }
      }
    },
    vocabulary: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          hanzi: { type: 'string' },
          pinyin: { type: 'string' },
          vietnamese: { type: 'string' },
          partOfSpeech: { type: 'string' },
          exampleSentence: { type: 'string' },
          hskLevel: { type: 'string' }
        }
      }
    },
    grammar: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          structure: { type: 'string' },
          meaningVi: { type: 'string' },
          exampleSentence: { type: 'string' },
          examplePinyin: { type: 'string' },
          exampleVietnamese: { type: 'string' }
        }
      }
    },
    progressiveHints: {
      type: 'object',
      properties: {
        hint1_semantic: { type: 'string' },
        hint2_keywords: { type: 'string' },
        hint3_structure: { type: 'string' },
        hint4_fullAnswer: { type: 'string' }
      }
    },
    suggestedReplies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          hanzi: { type: 'string' },
          pinyin: { type: 'string' },
          vietnamese: { type: 'string' }
        },
        required: ['hanzi', 'pinyin', 'vietnamese']
      }
    },
    memoryUpdate: {
      type: 'object',
      properties: {
        learnedFact: { type: 'string' },
        topicContext: { type: 'string' }
      }
    }
  },
  required: ['chinese', 'pinyin', 'vietnamese', 'responseType', 'suggestedReplies']
};

const SYSTEM = `Bạn là Lina (林娜), gia sư tiếng Trung cho người học Việt Nam.
Luôn thân thiện, kiên nhẫn, ngắn gọn và khuyến khích. Không làm người học xấu hổ.
Nếu người học sai, nói: “Bạn diễn đạt đúng ý rồi. Mình sửa một chút để câu tự nhiên hơn nhé.”
Chế độ conversation: ưu tiên hội thoại tự nhiên, chỉ sửa lỗi quan trọng.
Chế độ teacher: ưu tiên sửa lỗi, giải thích ngữ pháp/từ vựng bằng tiếng Việt dễ hiểu.
Điều chỉnh câu và từ vựng theo HSK/user level. Không bịa pinyin, nghĩa hoặc cấp độ HSK.
Trả về đúng JSON theo schema, không thêm markdown.`;

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

  if (!process.env.GEMINI_API_KEY) return FALLBACK(message, userName);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const history = normalizeHistory(body.history);
  const context = [
    `Chủ đề: ${topicTitle}`,
    `Chế độ: ${mode}`,
    `Trình độ: ${userLevel}; ${hskLevel}`,
    `Tên học viên: ${userName}`,
    memoryFacts.length ? `Thông tin đã nhớ: ${memoryFacts.join('; ')}` : '',
    history.length ? `Lịch sử:\n${JSON.stringify(history)}` : ''
  ].filter(Boolean).join('\n');

  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: [
        { role: 'user', parts: [{ text: `${context}\n\nTin nhắn mới của học viên:\n${message}` }] }
      ],
      config: {
        systemInstruction: SYSTEM,
        maxOutputTokens: 1400,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA
      }
    });
    const parsed = JSON.parse(result.text || '{}');
    if (!parsed.chinese || !parsed.pinyin || !parsed.vietnamese || !Array.isArray(parsed.suggestedReplies)) {
      throw new Error('Invalid tutor response schema');
    }
    return parsed;
  } catch (error) {
    console.error('[Lina][TUTOR_API_ERROR]', { name: error?.name || 'Error', model: MODEL });
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
    return res.json(result.progressiveHints);
  }

  if (path.endsWith('/explain') || action === 'explain') {
    const sentence = cleanString(req.body?.sentence, 2000);
    if (!sentence) return res.status(400).json({ error: 'Sentence is required' });
    const result = await generateTutor({ ...req.body, message: `Giải thích câu sau: ${sentence}`, mode: 'teacher' });
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
