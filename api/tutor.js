// Conversation room prioritizes latency and capacity over deep reasoning.
// Google currently describes 3.5 Flash-Lite as its fastest, most cost-efficient Flash model.
// Keep an override available for production tuning.
const MODEL = process.env.GEMINI_TUTOR_MODEL || 'gemini-3.5-flash-lite';
const MODEL_FALLBACKS = ['gemini-3.6-flash'];
const MAX_MESSAGE = 2000;
const MAX_HISTORY = 8;
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

const SYSTEM = `Bạn là Lina (林娜), gia sư tiếng Trung cho người học Việt Nam. Thân thiện, kiên nhẫn, tự nhiên và chủ động dẫn dắt.
Nếu người học sai, động viên ngắn gọn rồi sửa câu tự nhiên hơn. Chế độ teacher ưu tiên sửa lỗi và giải thích bằng tiếng Việt; conversation/roleplay ưu tiên đối thoại thực tế.
Điều chỉnh chính xác độ khó, từ vựng, cấu trúc và độ dài theo HSK/user level. Không bịa pinyin, nghĩa, cấp độ hay trải nghiệm đời thực của Lina.

CHÍNH SÁCH HỘI THOẠI CHỦ ĐỘNG:
- HSK 1-2: thường 2-3 câu ngắn, 20-45 chữ Hán; cấu trúc đơn giản, từ quen thuộc.
- HSK 3-4: thường 3-4 câu liên kết, 45-80 chữ Hán; thêm lý do, trình tự hoặc so sánh đơn giản.
- HSK 5-6: thường 4-6 câu tự nhiên, 70-120 chữ Hán; có thể dùng sắc thái, lập luận và cách diễn đạt phong phú.
- Nếu userLevel thấp hơn HSK đã chọn, ưu tiên mức thấp hơn. Đây là mục tiêu mềm; luôn tôn trọng yêu cầu trả lời ngắn.
- Mỗi lượt cần có ba nhịp tự nhiên: phản hồi đúng một chi tiết người học vừa nói → mở rộng bằng một ý/quan sát/ví dụ mới → đặt đúng một câu hỏi tiếp nối cụ thể. Không chỉ xác nhận rồi hỏi câu chung chung.
- Lina phải chủ động dẫn chuyện. Khi người học chia sẻ sở thích, công việc, cuộc sống, gia đình, quê quán, thói quen, trải nghiệm, chuyến đi hoặc mục tiêu, hãy ghi nhận đúng điều họ nói và thỉnh thoảng khai thác sâu khi phù hợp.
- Dùng memoryFacts như ký ức dài hạn, nhưng chỉ nhắc khi liên quan; phân biệt sự thật người học xác nhận với suy đoán. Không gán cho người học thông tin họ chưa nói.
- Phát triển nhánh theo trình tự linh hoạt: chi tiết mới → lý do/cảm xúc/bối cảnh → ví dụ/trải nghiệm cụ thể → lựa chọn/kế hoạch/góc nhìn. Mỗi lượt chỉ khai thác một nhánh, không hỏi dồn.
- Trước khi đặt câu hỏi, kiểm tra history để không hỏi lại câu đã hỏi hoặc dữ kiện đã được trả lời. Không đổi chủ đề đột ngột; chỉ chuyển khi người học muốn hoặc nhánh hiện tại đã khép tự nhiên, và dùng một câu chuyển ý ngắn.
- Nếu người học bí ý, chủ động đưa ra tình huống gần gũi hoặc hai lựa chọn dễ trả lời thay vì hỏi “你呢？”.
- Nhịp phiên 10-15 phút: lượt 1-2 làm quen/chọn điểm chung; lượt 3-7 đào sâu câu chuyện; lượt 8-11 mở rộng sang góc nhìn hoặc tình huống thực tế; từ lượt 12 có thể tổng kết nhẹ, hỏi muốn khám phá gì tiếp hoặc kết thúc tự nhiên. Đây là gợi ý linh hoạt, không phải kịch bản cứng; không nhắc bộ đếm lượt.
- Mỗi lượt phải tiến triển, không lặp câu trả lời trước. Pinyin dấu thanh và tiếng Việt phải bao phủ đầy đủ, đúng thứ tự, khớp toàn bộ chinese.
- suggestedReplies có 2-4 lựa chọn đa dạng, bám sát câu hỏi cuối, mỗi lựa chọn có hanzi, pinyin và tiếng Việt.

QUAN TRỌNG:
- Chỉ trả về một JSON object hợp lệ, không markdown/code fence.
- Bắt buộc có chinese, pinyin, vietnamese, responseType, suggestedReplies.
- Luôn phản hồi tin nhắn mới nhất và history; không dùng câu mẫu cố định.
- isSpoken=true: Speaking Coach chỉ đánh giá transcript, không giả vờ chấm chất lượng âm thanh. Chỉ bật speakingCoach khi cần sửa; trả naturalnessScore, betterSentence, feedbackVi và retryPromptVi phù hợp.
- isSpeakingRetry=true: so sánh transcript mới với speakingCoachTarget; retryResolved=true khi câu đạt tự nhiên (score >=85); tối đa 3 lần, sau đó chốt phiên bản đủ hiểu.
- memoryUpdate luôn là object. learnedFact: sự thật ổn định người học vừa xác nhận; interest: sở thích; experience: trải nghiệm; goal: mục tiêu/kế hoạch; topicContext: nhánh hiện tại; conversationSummary: tóm tắt ngắn; nextBranch: nhánh tiếp theo gợi ý. Trường không có dữ liệu để chuỗi rỗng. Không suy đoán.`;

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

function comparableChinese(text) {
  return cleanString(text, 4000).toLowerCase().replace(/[，。！？、；：,.!?;:“”\"'（）()\s]/g, '');
}

function repeatsPreviousTutorReply(response, history) {
  const previous = [...history].reverse().find((item) => item.sender === 'ai' && item.hanzi);
  if (!previous) return false;
  const currentText = comparableChinese(response && response.chinese);
  const previousText = comparableChinese(previous.hanzi);
  return currentText.length >= 12 && currentText === previousText;
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
  const timer = setTimeout(() => controller.abort(), 11000);

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
                  properties: { learnedFact: { type: 'STRING' }, interest: { type: 'STRING' }, experience: { type: 'STRING' }, goal: { type: 'STRING' }, topicContext: { type: 'STRING' }, conversationSummary: { type: 'STRING' }, nextBranch: { type: 'STRING' } }
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
            maxOutputTokens: 1400,
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
  const sessionTurnNumber = Math.max(1, Math.min(30, Number(body.sessionTurnNumber) || 1));
  const sessionElapsedMinutes = Math.max(0, Math.min(30, Number(body.sessionElapsedMinutes) || 0));
  const memoryFacts = Array.isArray(body.memoryFacts)
    ? body.memoryFacts.slice(-MAX_MEMORY_FACTS).map((x) => cleanString(x, 240)).filter(Boolean)
    : [];

  const apiKey = cleanString(process.env.GEMINI_API_KEY, 500);
  if (!apiKey) {
    console.error('[Lina][TUTOR_API_ERROR] GEMINI_API_KEY is missing');
    throw Object.assign(new Error('Lina AI chưa được cấu hình Gemini API key.'), {
      code: 'TUTOR_NOT_CONFIGURED',
      status: 503
    });
  }

  const history = normalizeHistory(body.history);
  const prompt = [
    `Chủ đề: ${topicTitle}`,
    `Trình độ: ${userLevel}; ${hskLevel}; chế độ: ${mode}`,
    `Tên học viên: ${userName}`,
    `isSpoken: ${isSpoken}`,
    `isSpeakingRetry: ${isSpeakingRetry}`,
    `speakingAttempt: ${speakingAttempt}`,
    `Thời lượng phiên: ${sessionElapsedMinutes} phút; lượt người học thứ ${sessionTurnNumber}.`,
    speakingCoachTarget ? `speakingCoachTarget: ${speakingCoachTarget}` : '',
    isSpoken ? (isSpeakingRetry ? 'Speaking Coach retry: so sánh câu mới với câu mục tiêu và báo đã tiến bộ hay chưa.' : 'Speaking Coach: hãy kiểm tra câu transcript người học vừa nói về độ tự nhiên và đưa ra một lần sửa lại nếu cần.') : '',
    memoryFacts.length ? `Thông tin nhớ: ${memoryFacts.join('; ')}` : '',
    history.length ? `Lịch sử gần đây:\n${JSON.stringify(history)}` : '',
    `TIN NHẮN MỚI NHẤT:\n${message}`,
    'Dùng memoryFacts để cá nhân hóa tự nhiên: sở thích, công việc, cuộc sống, trải nghiệm và mục tiêu đã xác nhận. Không nhắc máy móc mọi dữ kiện trong mọi lượt.',
    'Giữ nhịp hội thoại 10-15 phút theo số lượt và thời lượng được cung cấp: làm quen, đào sâu một câu chuyện, mở rộng sang tình huống thực tế, rồi tổng kết nhẹ khi phù hợp. Không biến thành kịch bản cứng.',
    'Nếu người học bí ý, đưa một tình huống gần gũi hoặc hai lựa chọn cụ thể. Mỗi lượt chỉ hỏi một câu mới, không hỏi lại điều đã trả lời.',
    'Ghi memoryUpdate theo các trường learnedFact, interest, experience, goal, topicContext, conversationSummary, nextBranch; chỉ ghi điều có căn cứ trong tin nhắn và history.'
    'Mục tiêu phản xạ nói: chủ động phát triển một nhánh tự nhiên, phản hồi đúng chi tiết mới và hỏi một câu cụ thể; điều chỉnh độ dài theo HSK 1-6.',
    'Lịch sử hội thoại có tối đa 8 tin nhắn gần nhất (khoảng 4 lượt trao đổi). Đọc kỹ toàn bộ lịch sử để giữ mạch; không yêu cầu học viên nhắc lại câu trả lời đã có.',
    'Cấu trúc câu trả lời: phản hồi một chi tiết cụ thể của học viên → thêm thông tin/lý do liên quan → một câu hỏi tiếp nối có mục tiêu. Không bịa dữ kiện về học viên.',
    'Trước khi trả về JSON, tự rà soát chinese, pinyin và vietnamese phải đủ câu và cùng thứ tự; suggestedReplies phải giúp trả lời trực tiếp câu hỏi cuối.',
    'Đảm bảo pinyin dấu thanh và tiếng Việt dịch đầy đủ, khớp với toàn bộ chinese. suggestedReplies là các câu trả lời thực tế cho câu hỏi cuối của Lina.',
    'Phản hồi ngay dựa trên TIN NHẮN MỚI NHẤT và tối đa 4 lượt trao đổi gần nhất. Hãy tiếp nối câu hỏi đang mở và không hỏi lại điều người học vừa trả lời.',
    'Không lặp lại câu trả lời tiếng Trung của Lina ở lượt trước. Mỗi lượt cần phản hồi vào chi tiết mới trong câu người học, hoặc tiếp tục đúng câu hỏi mà Lina vừa đặt.'
  ].filter(Boolean).join('\n');

  // Try the configured fast model first, then the maintained fallback list.
  // A provider 503 must not silently turn every learner turn into a canned reply.
  const models = [...new Set([MODEL, ...MODEL_FALLBACKS])];
  let lastError = null;

  for (const model of models) {
    try {
      const text = await callGemini({ apiKey, model, prompt });
      let response = validateTutorResponse(parseTutorJson(text), speakingAttempt);

      // Only retry when the generated Chinese exactly repeats the previous AI turn.
      if (mode !== 'teacher' && repeatsPreviousTutorReply(response, history)) {
        const previousReply = [...history].reverse().find((item) => item.sender === 'ai')?.hanzi || '';
        const retryPrompt = [
          prompt,
          'REGENERATION REQUIRED: your draft exactly repeats Lina’s previous Chinese reply.',
          'Previous Lina reply (do not repeat or paraphrase): ' + previousReply,
          'Learner latest message (respond to this specifically): ' + message,
          'Generate a genuinely new next turn that answers the learner and advances the current conversation. Do not restart or ask a question already answered.'
        ].join('\n');
        const retryText = await callGemini({ apiKey, model, prompt: retryPrompt });
        response = validateTutorResponse(parseTutorJson(retryText), speakingAttempt);
        if (repeatsPreviousTutorReply(response, history)) {
          throw Object.assign(new Error('Lina generated a repeated conversation turn.'), {
            code: 'TUTOR_REPETITIVE_RESPONSE', status: 502
          });
        }
      }
      return response;
    } catch (error) {
      lastError = error;
      const message = String(error?.message || 'Unknown error');
      const retryable = /Gemini (429|500|502|503|504):/i.test(message) || error?.name === 'AbortError';
      console.error('[Lina][TUTOR_API_ERROR]', {
        model,
        name: error?.name || 'Error',
        retryable,
        message: message.slice(0, 800)
      });
      if (!retryable) break;
    }
  }

  // Never present a canned response as if Lina understood the learner.
  // The client will show a clear temporary-unavailability message instead.
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
      code: error?.code || (/Gemini (429|500|502|503|504):/i.test(String(error?.message || ''))
        ? 'TUTOR_PROVIDER_UNAVAILABLE'
        : 'TUTOR_API_ERROR'),
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
