import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instruction defining Lina's persona and rules
const LINA_SYSTEM_INSTRUCTION = `
Bạn là Lina (林娜 - Lìnà), gia sư tiếng Trung AI thông minh, tận tâm và thân thiện dành riêng cho người học Việt Nam.
Tính cách:
- Cực kỳ thân thiện, kiên nhẫn, luôn động viên, tự nhiên và súc tích.
- KHÔNG BAO GIỜ làm người học cảm thấy xấu hổ hay tự ti.
- Khi người học sai: TUYỆT ĐỐI KHÔNG dùng từ "Sai rồi", "Không đúng". Hãy luôn nói:
  "Bạn diễn đạt đúng ý rồi. Mình sửa một chút để câu tự nhiên hơn nhé."

Hai chế độ học tập (Modes):
1. 'conversation' (Chế độ Đàm thoại):
   - Ưu tiên đối thoại tự nhiên, trôi chảy, phản xạ nhanh.
   - Không bắt bẻ từng lỗi nhỏ ngữ pháp trừ khi lỗi đó làm biến đổi hoàn toàn ngữ nghĩa.
   - Giữ nhịp trò chuyện thú vị, hỏi thêm câu hỏi ngắn để người học tiếp tục nói.
2. 'teacher' (Chế độ Giáo viên):
   - Ưu tiên sửa lỗi, giảng giải ngữ pháp và từ vựng chi tiết.
   - Khi phát hiện lỗi: phân tích câu gốc, câu chuẩn xác, giải thích ngắn gọn bằng tiếng Việt dễ hiểu và cung cấp câu nhắc người học thử nói lại (tryAgainPromptVi).

Điều chỉnh theo trình độ (Level Adaptation):
- Người mới bắt đầu (Chưa biết gì / Cơ bản / HSK 1): Câu ngắn, từ ngữ đơn giản, cấu trúc rõ ràng.
- Trung cấp (HSK 2-3): Câu tự nhiên, kết nối phong phú hơn.
- Nâng cao (HSK 4+): Đàm thoại tự nhiên như người bản xứ.

Gợi ý lũy tiến (4 Progressive Hints):
- hint1_semantic: Gợi ý ý tứ / nghĩa tiếng Việt nên nói.
- hint2_keywords: Gợi ý 2-3 từ vựng mấu chốt tiếng Trung (chữ Hán + pinyin).
- hint3_structure: Gợi ý cấu trúc ngữ pháp (VD: Chủ ngữ + 想 + Động từ).
- hint4_fullAnswer: Câu hoàn chỉnh bằng tiếng Trung + Pinyin + Tiếng Việt.

Giải thích ngữ pháp & từ vựng:
- Tiếng Việt tự nhiên, súc tích, chuẩn văn phong giáo khoa cho người Việt.
- Không bịa đặt quy tắc ngữ pháp hoặc cấp độ HSK.

Luôn trả về kết quả JSON hợp lệ theo đúng cấu trúc yêu cầu.
`;

// Response Schema for Structured Output
const TUTOR_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    chinese: {
      type: Type.STRING,
      description: 'Câu trả lời của Lina bằng chữ Hán chuẩn',
    },
    pinyin: {
      type: Type.STRING,
      description: 'Phiên âm Pinyin có dấu thanh điệu chuẩn xác tương ứng với câu chữ Hán',
    },
    vietnamese: {
      type: Type.STRING,
      description: 'Dịch nghĩa tiếng Việt tự nhiên, súc tích',
    },
    responseType: {
      type: Type.STRING,
      description: 'Loại phản hồi: conversation, lesson, roleplay, hoặc correction',
    },
    emotion: {
      type: Type.STRING,
      description: 'Cảm xúc và biểu cảm khuôn mặt của Lina: neutral, happy, encouraging, hoặc confused',
    },
    correction: {
      type: Type.OBJECT,
      nullable: true,
      description: 'Chi tiết sửa lỗi nếu người học nói sai hoặc câu chưa tự nhiên (bắt buộc khi mode là teacher và có lỗi)',
      properties: {
        hasMistake: { type: Type.BOOLEAN },
        originalSentence: { type: Type.STRING },
        correctedSentence: { type: Type.STRING },
        pinyin: { type: Type.STRING },
        explanationVi: { type: Type.STRING },
        tryAgainPromptVi: { type: Type.STRING },
      },
    },
    vocabulary: {
      type: Type.ARRAY,
      description: 'Danh sách các từ vựng mới hoặc nổi bật trong lượt đối thoại',
      items: {
        type: Type.OBJECT,
        properties: {
          hanzi: { type: Type.STRING },
          pinyin: { type: Type.STRING },
          vietnamese: { type: Type.STRING },
          partOfSpeech: { type: Type.STRING },
          exampleSentence: { type: Type.STRING },
          hskLevel: { type: Type.STRING },
        },
      },
    },
    grammar: {
      type: Type.ARRAY,
      description: 'Điểm ngữ pháp mấu chốt được sử dụng',
      items: {
        type: Type.OBJECT,
        properties: {
          structure: { type: Type.STRING },
          meaningVi: { type: Type.STRING },
          exampleSentence: { type: Type.STRING },
          examplePinyin: { type: Type.STRING },
          exampleVietnamese: { type: Type.STRING },
        },
      },
    },
    progressiveHints: {
      type: Type.OBJECT,
      description: '4 tầng gợi ý tiến bộ để người học biết cách trả lời tiếp theo',
      properties: {
        hint1_semantic: { type: Type.STRING },
        hint2_keywords: { type: Type.STRING },
        hint3_structure: { type: Type.STRING },
        hint4_fullAnswer: { type: Type.STRING },
      },
    },
    suggestedReplies: {
      type: Type.ARRAY,
      description: '3 phương án câu trả lời nhanh mà người học có thể chọn nói tiếp',
      items: {
        type: Type.OBJECT,
        properties: {
          hanzi: { type: Type.STRING },
          pinyin: { type: Type.STRING },
          vietnamese: { type: Type.STRING },
        },
      },
    },
    memoryUpdate: {
      type: Type.OBJECT,
      nullable: true,
      description: 'Thông tin cá nhân mới học được về học viên (tên, nơi ở, sở thích...)',
      properties: {
        learnedFact: { type: Type.STRING },
        topicContext: { type: Type.STRING },
      },
    },
  },
  required: ['chinese', 'pinyin', 'vietnamese', 'responseType', 'suggestedReplies'],
};

// Fallback generator when API key is unconfigured or in offline demo mode
function generateFallbackResponse(userText: string, mode: string, userName: string) {
  const isIntro = /叫|名字|你好|hello|hi/i.test(userText);
  const isQuestion = /\?|吗|什么|哪里|几/i.test(userText);

  if (isIntro) {
    return {
      chinese: `你好，${userName}！很高兴和你练习中文。你今天想聊什么话题呢？`,
      pinyin: `Nǐ hǎo, ${userName}! Hěn gāoxìng hé nǐ liànxí Zhōngwén. Nǐ jīntiān xiǎng liáo shénme huàtí ne?`,
      vietnamese: `Chào ${userName}! Rất vui được luyện tiếng Trung cùng bạn. Hôm nay bạn muốn nói về chủ đề gì nào?`,
      responseType: 'conversation',
      emotion: 'happy',
      correction: null,
      vocabulary: [
        {
          hanzi: '练习',
          pinyin: 'liànxí',
          vietnamese: 'luyện tập',
          partOfSpeech: 'Động từ',
          exampleSentence: '我们一起练习口语。',
          hskLevel: 'HSK 2',
        },
        {
          hanzi: '话题',
          pinyin: 'huàtí',
          vietnamese: 'chủ đề / đề tài',
          partOfSpeech: 'Danh từ',
          exampleSentence: '这个话题很有意思。',
          hskLevel: 'HSK 3',
        },
      ],
      grammar: [
        {
          structure: '想 + Động từ',
          meaningVi: 'Muốn làm việc gì',
          exampleSentence: '我想学汉语。',
          examplePinyin: 'Wǒ xiǎng xué Hànyǔ.',
          exampleVietnamese: 'Tôi muốn học tiếng Hán.',
        },
      ],
      progressiveHints: {
        hint1_semantic: 'Hãy nói về sở thích hoặc giới thiệu bạn là người Việt Nam.',
        hint2_keywords: '我是 (wǒ shì), 越南人 (Yuènán rén)',
        hint3_structure: 'Chủ ngữ + 是 + Danh từ',
        hint4_fullAnswer: '我是越南人，我很喜欢学中文。(Wǒ shì Yuènán rén, wǒ hěn xǐhuān xué Zhōngwén.)',
      },
      suggestedReplies: [
        { hanzi: '我想练习点餐。', pinyin: 'Wǒ xiǎng liànxí diǎncān.', vietnamese: 'Mình muốn luyện gọi món ăn.' },
        { hanzi: '我想练习问路。', pinyin: 'Wǒ xiǎng liànxí wènlù.', vietnamese: 'Mình muốn luyện hỏi đường.' },
        { hanzi: '我们可以随便聊聊。', pinyin: 'Wǒmen kěyǐ suíbiàn liáoliao.', vietnamese: 'Chúng ta có thể trò chuyện tự do.' },
      ],
      memoryUpdate: {
        learnedFact: `Người dùng tên ${userName}`,
        topicContext: 'Chào hỏi ban đầu',
      },
    };
  }

  return {
    chinese: '听起来很有趣！你能跟我多说一点吗？',
    pinyin: 'Tīng qǐlái hěn yǒuqù! Nǐ néng gēn wǒ duō shuō yìdiǎn ma?',
    vietnamese: 'Nghe thú vị quá! Bạn có thể nói thêm một chút với mình không?',
    responseType: mode === 'teacher' ? 'correction' : 'conversation',
    emotion: mode === 'teacher' ? 'encouraging' : 'neutral',
    correction: mode === 'teacher' ? {
      hasMistake: false,
      originalSentence: userText,
      correctedSentence: userText,
      pinyin: '',
      explanationVi: 'Câu của bạn diễn đạt rất tốt và tự nhiên!',
      tryAgainPromptVi: 'Hãy thử phát triển ý với câu dài hơn nhé.',
    } : null,
    vocabulary: [
      {
        hanzi: '有趣',
        pinyin: 'yǒuqù',
        vietnamese: 'thú vị / hay',
        partOfSpeech: 'Tính từ',
        exampleSentence: '这本书很有趣。',
        hskLevel: 'HSK 3',
      },
    ],
    grammar: [],
    progressiveHints: {
      hint1_semantic: 'Diễn đạt đồng ý và trả lời ngắn gọn.',
      hint2_keywords: '好的 (hǎo de), 可以 (kěyǐ)',
      hint3_structure: '好的，我想说...',
      hint4_fullAnswer: '好的，我想继续练习。(Hǎo de, wǒ xiǎng jìxù liànxí.)',
    },
    suggestedReplies: [
      { hanzi: '好的，没问题！', pinyin: 'Hǎo de, méi wèntí!', vietnamese: 'Được chứ, không thành vấn đề!' },
      { hanzi: '这个用中文怎么说？', pinyin: 'Zhège yòng Zhōngwén zěnme shuō?', vietnamese: 'Cái này tiếng Trung nói thế nào?' },
      { hanzi: '请再说一遍。', pinyin: 'Qǐng zài shuō yí biàn.', vietnamese: 'Xin nói lại một lần nữa ạ.' },
    ],
  };
}

// 1. API: Tutor Chat
app.post('/api/tutor/chat', async (req: Request, res: Response) => {
  try {
    const { 
      message, 
      history = [], 
      mode = 'conversation', 
      hskLevel = 'HSK 1', 
      userName = 'Bạn', 
      userLevel = 'Cơ bản', 
      topicTitle = 'Tự do',
      memoryFacts = []
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message string is required' });
      return;
    }

    if (!ai) {
      // Graceful fallback if GEMINI_API_KEY is not configured
      const fallback = generateFallbackResponse(message, mode, userName);
      res.json(fallback);
      return;
    }

    // Build compact conversation memory strategy:
    // Only send the last 6 turns + compact learner facts to maintain speed and precision
    const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
    const historyText = recentHistory.map((m: any) => `${m.sender === 'ai' ? 'Lina' : userName}: ${m.hanzi || m.text || ''}`).join('\n');
    const memoryFactsText = Array.isArray(memoryFacts) && memoryFacts.length > 0 
      ? `Thông tin đã biết về học viên:\n${memoryFacts.join('\n')}` 
      : `Học viên tên là: ${userName}`;

    const prompt = `
[THÔNG TIN NGỮ CẢNH HỌC TẬP]
${memoryFactsText}
Trình độ hiện tại: ${userLevel} (${hskLevel})
Chủ đề trò chuyện: ${topicTitle}
Chế độ hoạt động hiện tại: ${mode === 'teacher' ? 'TEACHER MODE (Ưu tiên sửa lỗi, hướng dẫn ngữ pháp, giải thích từ vựng)' : 'CONVERSATION MODE (Ưu tiên giao tiếp tự nhiên, không bắt bẻ lỗi nhỏ)'}

[LỊCH SỬ ĐỐI THOẠI GẦN ĐÂY]
${historyText || '(Bắt đầu cuộc trò chuyện)'}

[CÂU NÓI MỚI NHẤT CỦA HỌC VIÊN]
${userName}: "${message}"

Hãy đóng vai Lina, phản hồi học viên bằng tiếng Trung chuẩn, kèm Pinyin, dịch nghĩa tiếng Việt, sửa lỗi nếu có, trích xuất từ vựng, ngữ pháp và 4 tầng gợi ý lũy tiến (progressiveHints).
Trả về kết quả dưới dạng JSON theo đúng schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: LINA_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: TUTOR_RESPONSE_SCHEMA,
        temperature: 0.7,
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(jsonText);
    res.json(parsedData);
  } catch (err: any) {
    console.error('Error in /api/tutor/chat:', err);
    // Provide safe fallback so UI never fails
    const fallback = generateFallbackResponse(req.body.message || '', req.body.mode || 'conversation', req.body.userName || 'Bạn');
    res.json(fallback);
  }
});

// 2. API: Progressive Hints
app.post('/api/tutor/hints', async (req: Request, res: Response) => {
  try {
    const { contextSentence, topicTitle, hskLevel = 'HSK 1', level = 1 } = req.body;

    if (!ai) {
      res.json({
        hint1_semantic: 'Hãy chào lại và hỏi tên người đối diện.',
        hint2_keywords: '你好 (nǐ hǎo), 叫 (jiào), 名字 (míngzi)',
        hint3_structure: '你叫什么名字？(Nǐ jiào shénme míngzi?)',
        hint4_fullAnswer: '你好！我叫阿明，你叫什么名字？(Nǐ hǎo! Wǒ jiào Ā Míng, nǐ jiào shénme míngzi?)',
      });
      return;
    }

    const prompt = `
Học viên đang nói chuyện về: "${topicTitle}".
Câu nói gần nhất của Lina là: "${contextSentence}".
Hãy tạo 4 tầng gợi ý tiến bộ (Progressive Hints) cho trình độ ${hskLevel}:
Hint 1: Ý tưởng/nghĩa tiếng Việt (semantic)
Hint 2: Từ khóa chính (keywords tiếng Trung kèm pinyin)
Hint 3: Cấu trúc ngữ pháp áp dụng (structure)
Hint 4: Câu nói mẫu hoàn chỉnh (full answer tiếng Trung + pinyin + tiếng Việt)
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: LINA_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hint1_semantic: { type: Type.STRING },
            hint2_keywords: { type: Type.STRING },
            hint3_structure: { type: Type.STRING },
            hint4_fullAnswer: { type: Type.STRING },
          },
          required: ['hint1_semantic', 'hint2_keywords', 'hint3_structure', 'hint4_fullAnswer'],
        },
      },
    });

    const jsonText = response.text?.trim() || '{}';
    res.json(JSON.parse(jsonText));
  } catch (err: any) {
    console.error('Error in /api/tutor/hints:', err);
    res.json({
      hint1_semantic: 'Hãy chào lại và giới thiệu tên bạn.',
      hint2_keywords: '我叫 (wǒ jiào) + Tên',
      hint3_structure: '我叫... (Wǒ jiào...)',
      hint4_fullAnswer: '你好！很高兴认识你。(Nǐ hǎo! Hěn gāoxìng rènshí nǐ.)',
    });
  }
});

// 3. API: Grammar & Vocabulary Explanation
app.post('/api/tutor/explain', async (req: Request, res: Response) => {
  try {
    const { sentence, hskLevel = 'HSK 1' } = req.body;

    if (!sentence) {
      res.status(400).json({ error: 'Sentence is required' });
      return;
    }

    if (!ai) {
      res.json({
        sentence,
        pinyin: 'Nǐ hǎo',
        meaningVi: 'Xin chào',
        grammarBreakdown: [
          {
            part: '你 (nǐ)',
            role: 'Đại từ nhân xưng ngôi thứ 2 (bạn, anh, chị)',
          },
          {
            part: '好 (hǎo)',
            role: 'Tính từ (tốt, đẹp, an lành)',
          },
        ],
        culturalTipVi: 'Đây là câu chào thông dụng nhất, dùng khi gặp bất kỳ ai vào bất kỳ thời điểm nào trong ngày.',
      });
      return;
    }

    const prompt = `
Phân tích chi tiết câu tiếng Trung sau cho người học Việt Nam ở trình độ ${hskLevel}:
"${sentence}"
Giải thích từ vựng cấu thành, cấu trúc ngữ pháp, pinyin có dấu thanh điệu chuẩn, dịch nghĩa tiếng Việt tự nhiên và lời khuyên giao tiếp thực tế.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: LINA_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentence: { type: Type.STRING },
            pinyin: { type: Type.STRING },
            meaningVi: { type: Type.STRING },
            grammarBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  part: { type: Type.STRING },
                  role: { type: Type.STRING },
                },
              },
            },
            culturalTipVi: { type: Type.STRING },
          },
          required: ['sentence', 'pinyin', 'meaningVi', 'grammarBreakdown'],
        },
      },
    });

    const jsonText = response.text?.trim() || '{}';
    res.json(JSON.parse(jsonText));
  } catch (err: any) {
    console.error('Error in /api/tutor/explain:', err);
    res.status(500).json({ error: 'Failed to explain sentence' });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey), model: 'gemini-3.8-flash' });
});

// 4. API: Studio Quality Text-to-Speech using Gemini TTS
app.post('/api/tts/speak', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text string is required' });
      return;
    }

    if (!ai) {
      res.status(503).json({ error: 'Gemini API key not configured, fallback to client speech synthesis' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: 'Clear, gentle, and standard Mandarin Chinese tutor pronunciation for language learners',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });
    } else {
      res.status(500).json({ error: 'No audio generated by model' });
    }
  } catch (err: any) {
    console.error('Error in /api/tts/speak:', err);
    res.status(500).json({ error: 'TTS generation failed' });
  }
});

// 5. API: Speech-to-Text Transcription via Gemini Transcribe
app.post('/api/stt/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({ error: 'Audio base64 string is required' });
      return;
    }

    if (!ai) {
      res.status(503).json({ error: 'Gemini API not configured' });
      return;
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Transcribe this spoken Mandarin Chinese audio into simplified Chinese characters. Output only the Chinese transcript.' },
        ],
      },
    });

    const transcript = response.text?.trim() || '';
    res.json({ transcript });
  } catch (err: any) {
    console.error('Error in /api/stt/transcribe:', err);
    res.status(500).json({ error: 'Audio transcription failed' });
  }
});

// Mount Vite or static server
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lina AI Chinese server listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
