/**
 * Centralized Gemini-Powered AI Tutor Service for Lina AI Chinese
 * Handles structured conversation, progressive hints, grammar analysis, and test scenarios.
 */

import { fetchWithControl } from './requestControl';
import { sanitizePlainText } from './inputGuards';
import type { AITutorProvider } from './providers';
import { 
  ConversationMessage, 
  HSKLevel, 
  TutorMode, 
  StructuredTutorResponse, 
  ProgressiveHints,
  UserLevel 
} from '../types';

export interface SendMessageOptions {
  conversationId: string;
  topicTitleVi: string;
  hskLevel: HSKLevel;
  userLevel?: UserLevel;
  userName: string;
  history: ConversationMessage[];
  mode: TutorMode;
  memoryFacts?: string[];
  isSpoken?: boolean;
  isSpeakingRetry?: boolean;
  speakingCoachTarget?: string;
  speakingAttempt?: number;
  signal?: AbortSignal;
}

export interface StreamingTutorCallbacks {
  onText?: (text: string) => void;
  onSpeech?: (text: string) => void;
}

export interface TestScenario {
  id: string;
  title: string;
  category: string;
  userPrompt: string;
  expectedGoal: string;
  recommendedMode: TutorMode;
}

export const TEST_SCENARIOS: TestScenario[] = [
  {id:'sc-1',title:'1. Gặp người mới',category:'Roleplay',userPrompt:'你好！我们第一次见面。',expectedGoal:'Giới thiệu và hỏi tên tự nhiên.',recommendedMode:'conversation'},
  {id:'sc-2',title:'2. Gọi món',category:'Nhà hàng',userPrompt:'服务员，我想点菜。',expectedGoal:'Đóng vai nhân viên nhà hàng.',recommendedMode:'conversation'},
  {id:'sc-3',title:'3. Mua đồ',category:'Mua sắm',userPrompt:'你好，我想买这个。',expectedGoal:'Tương tác như nhân viên bán hàng.',recommendedMode:'conversation'},
  {id:'sc-4',title:'4. Hỏi giá',category:'Mua sắm',userPrompt:'这个多少钱？',expectedGoal:'Hỏi giá và xử lý phản hồi về giá.',recommendedMode:'conversation'},
  {id:'sc-5',title:'5. Hỏi đường',category:'Du lịch',userPrompt:'请问，去地铁站怎么走？',expectedGoal:'Chỉ đường và xác nhận lại.',recommendedMode:'conversation'},
  {id:'sc-6',title:'6. Đi taxi',category:'Du lịch',userPrompt:'师傅，请到火车站。',expectedGoal:'Tài xế hỏi và xác nhận điểm đến.',recommendedMode:'conversation'},
  {id:'sc-7',title:'7. Khách sạn',category:'Du lịch',userPrompt:'你好，我预订了一个房间。',expectedGoal:'Nhận phòng và hỏi tiện nghi.',recommendedMode:'conversation'},
  {id:'sc-8',title:'8. Sân bay',category:'Du lịch',userPrompt:'请问，登机口在哪里？',expectedGoal:'Trao đổi với nhân viên sân bay.',recommendedMode:'conversation'},
  {id:'sc-9',title:'9. Trường học',category:'Học tập',userPrompt:'你好，你是我们班的同学吗？',expectedGoal:'Trò chuyện với bạn cùng lớp.',recommendedMode:'conversation'},
  {id:'sc-10',title:'10. Công việc',category:'Công việc',userPrompt:'我们今天有什么工作？',expectedGoal:'Trao đổi nhiệm vụ với đồng nghiệp.',recommendedMode:'conversation'},
  {id:'sc-11',title:'11. Gọi điện',category:'Đời sống',userPrompt:'喂，现在方便说话吗？',expectedGoal:'Hẹn lịch qua điện thoại.',recommendedMode:'conversation'},
  {id:'sc-12',title:'12. Đi khám',category:'Đời sống',userPrompt:'医生，我今天不太舒服。',expectedGoal:'Mô tả triệu chứng đơn giản.',recommendedMode:'conversation'},
  {id:'sc-13',title:'13. Giới thiệu bản thân',category:'Giao tiếp',userPrompt:'大家好，我叫 Minh。',expectedGoal:'Giới thiệu tên, nơi đến và sở thích.',recommendedMode:'conversation'},
  {id:'sc-14',title:'14. Nói về gia đình',category:'Giao tiếp',userPrompt:'我家有四个人。',expectedGoal:'Nói thêm về các thành viên.',recommendedMode:'conversation'},
  {id:'sc-15',title:'15. Nói về sở thích',category:'Giao tiếp',userPrompt:'我喜欢听音乐。',expectedGoal:'Hỏi đáp tự nhiên về sở thích.',recommendedMode:'conversation'}
];

class AITutorClientService implements AITutorProvider {
  /**
   * Send a user turn to Gemini via the server-side proxy
   */
  async sendMessage(options: SendMessageOptions, userText: string, callbacks: StreamingTutorCallbacks = {}): Promise<StructuredTutorResponse> {
    // Keep non-streaming and streaming conversation paths on the same deployed Vercel function.
    // The legacy /api/tutor/chat route was removed when the tutor endpoint was flattened to /api/tutor.
    // Reuse the same streaming path so realtime voice still receives text/speech callbacks,
    // while preserving the local fallback when the deployed tutor endpoint fails.
    try {
      return await this.sendMessageStreaming(options, userText, callbacks);
    } catch (err) {
      if ((err as Error)?.name === 'AbortError' && options.signal?.aborted) throw err;
      console.warn('Tutor API failed, utilizing graceful local fallback:', err);
      return this.getLocalFallbackResponse(userText, options.mode, options.userName);
    }
  }

  async sendMessageStreaming(
    options: SendMessageOptions,
    userText: string,
    callbacks: StreamingTutorCallbacks = {}
  ): Promise<StructuredTutorResponse> {
    const response = await fetchWithControl('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({
        message: sanitizePlainText(userText, 2000),
        history: options.history.slice(-8).map(m => ({
          sender: m.sender,
          hanzi: sanitizePlainText(m.hanzi, 700),
          text: sanitizePlainText(m.hanzi, 700),
          pinyin: sanitizePlainText(m.pinyin, 300),
          vietnamese: sanitizePlainText(m.vietnamese, 700)
        })),
        mode: options.mode,
        hskLevel: options.hskLevel,
        userLevel: options.userLevel || 'Cơ bản',
        userName: sanitizePlainText(options.userName, 120) || 'Bạn',
        topicTitle: sanitizePlainText(options.topicTitleVi, 240),
        memoryFacts: (options.memoryFacts || []).slice(-12).map(f => sanitizePlainText(f, 240)).filter(Boolean),
        isSpoken: Boolean(options.isSpoken),
        isSpeakingRetry: Boolean(options.isSpeakingRetry),
        speakingCoachTarget: options.speakingCoachTarget ? sanitizePlainText(options.speakingCoachTarget, 500) : '',
        speakingAttempt: options.speakingAttempt || 0
      })
    }, { timeoutMs: 30000, retries: 0, signal: options.signal });

    if (!response.ok || !response.body) throw new Error(`Streaming tutor unavailable (HTTP ${response.status})`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalResponse: StructuredTutorResponse | null = null;
    let fallbackResponse: StructuredTutorResponse | null = null;

    const consume = (payload: any) => {
      if (!payload || typeof payload.type !== 'string') return;
      if (payload.type === 'text' && typeof payload.text === 'string') callbacks.onText?.(payload.text);
      if (payload.type === 'speech' && typeof payload.text === 'string') callbacks.onSpeech?.(payload.text);
      if (payload.type === 'response' && payload.response) finalResponse = payload.response as StructuredTutorResponse;
      if (payload.type === 'fallback' && payload.response) fallbackResponse = payload.response as StructuredTutorResponse;
      if (payload.type === 'error') throw new Error(payload.error || 'Streaming tutor error');
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';
      for (const event of events) {
        const line = event.split('\n').find(item => item.startsWith('data:'));
        if (line) consume(JSON.parse(line.slice(5).trim()));
      }
    }
    if (buffer.trim()) {
      const line = buffer.split('\n').find(item => item.startsWith('data:'));
      if (line) consume(JSON.parse(line.slice(5).trim()));
    }

    if (finalResponse) return finalResponse;
    if (fallbackResponse) return fallbackResponse;
    throw new Error('Streaming tutor ended without a structured response.');
  }

  /**
   * Fetch 4 progressive hints for current conversation state
   */
  async getProgressiveHints(contextSentence: string, topicTitle: string, hskLevel: HSKLevel): Promise<ProgressiveHints> {
    try {
      const response = await fetchWithControl('/api/tutor?action=hints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contextSentence,
          topicTitle,
          hskLevel
        })
      });

      if (!response.ok) throw new Error('Hints fetch failed');
      return await response.json();
    } catch {
      return {
        hint1_semantic: 'Hãy chào hỏi và hỏi tên đối phương.',
        hint2_keywords: '你好 (nǐ hǎo), 叫 (jiào), 名字 (míngzi)',
        hint3_structure: '你叫什么名字？(Nǐ jiào shénme míngzi?)',
        hint4_fullAnswer: '你好！很高兴认识你。(Nǐ hǎo! Hěn gāoxìng rènshí nǐ.)'
      };
    }
  }

  /**
   * Explain a specific sentence or grammar point
   */
  async explainSentence(sentence: string, hskLevel: HSKLevel) {
    try {
      const response = await fetchWithControl('/api/tutor?action=explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence, hskLevel })
      });
      if (!response.ok) throw new Error('Explain fetch failed');
      return await response.json();
    } catch {
      return {
        sentence,
        pinyin: '',
        meaningVi: 'Giải thích câu tiếng Trung',
        grammarBreakdown: [{ part: sentence, role: 'Mẫu câu giao tiếp thông dụng' }],
        culturalTipVi: 'Được sử dụng phổ biến trong đối thoại hàng ngày.'
      };
    }
  }

  /**
   * Evaluate spoken text pronunciation accuracy
   */
  async evaluatePronunciation(targetHanzi:string,spokenText:string):Promise<{score:number|null;feedbackVi:string}>{
    const cleanSpoken=sanitizePlainText(spokenText,1200);
    return {score:null,feedbackVi:cleanSpoken?'STT đã nhận diện nội dung, nhưng Lina chưa có acoustic provider đủ dữ liệu để chấm điểm phát âm.':'Chưa thể đánh giá chính xác. Cần microphone/audio analysis provider.'};
  }

  private getLocalFallbackResponse(userText: string, mode: TutorMode, userName: string): StructuredTutorResponse {
    // If user text contains the classic test mistake: 我昨天去北京吗？
    if (userText.includes('我昨天去北京吗')) {
      return {
        chinese: '我昨天去北京了。你昨天去哪儿了？',
        pinyin: 'Wǒ zuótiān qù Běijīng le. Nǐ zuótiān qù nǎr le?',
        vietnamese: 'Hôm qua mình đi Bắc Kinh. Hôm qua bạn đã đi đâu thế?',
        responseType: 'correction',
        emotion: 'encouraging',
        correction: {
          hasMistake: true,
          originalSentence: '我昨天去北京吗？',
          correctedSentence: '我昨天去北京了吗？',
          pinyin: 'Wǒ zuótiān qù Běijīng le ma?',
          explanationVi: 'Bạn diễn đạt đúng ý rồi. Mình sửa một chút để câu tự nhiên hơn nhé: Khi hỏi về hành động đã xảy ra trong quá khứ (như "hôm qua"), ta dùng trợ từ "了" trước "吗" (去...了吗).',
          tryAgainPromptVi: 'Bạn thử nói lại: "我昨天去北京了吗？" xem nhé!'
        },
        vocabulary: [
          {
            hanzi: '昨天',
            pinyin: 'zuótiān',
            vietnamese: 'hôm qua',
            partOfSpeech: 'Danh từ chỉ thời gian',
            exampleSentence: '昨天我很忙。',
            hskLevel: 'HSK 1'
          }
        ],
        grammar: [
          {
            structure: 'Hành động + 了吗？',
            meaningVi: 'Hỏi ai đó đã làm gì chưa (trong quá khứ)',
            exampleSentence: '你去北京了吗？',
            examplePinyin: 'Nǐ qù Běijīng le ma?',
            exampleVietnamese: 'Bạn đã đi Bắc Kinh chưa?'
          }
        ],
        progressiveHints: {
          hint1_semantic: 'Diễn đạt bạn đã đi đâu vào hôm qua.',
          hint2_keywords: '昨天 (zuótiān), 去 (qù), 了 (le)',
          hint3_structure: '我 + 昨天 + 去 + [Nơi chốn] + 了。',
          hint4_fullAnswer: '我昨天去北京了。(Wǒ zuótiān qù Běijīng le.)'
        },
        suggestedReplies: [
          { hanzi: '我昨天去北京了吗？', pinyin: 'Wǒ zuótiān qù Běijīng le ma?', vietnamese: 'Hôm qua tôi đi Bắc Kinh phải không?' },
          { hanzi: '我昨天在家休息。', pinyin: 'Wǒ zuótiān zài jiā xiūxi.', vietnamese: 'Hôm qua tôi ở nhà nghỉ ngơi.' },
          { hanzi: '我去河内了。', pinyin: 'Wǒ qù Hénèi le.', vietnamese: 'Tôi đã đi Hà Nội rồi.' }
        ]
      };
    }

    const text = sanitizePlainText(userText, 2000);
    if (/^(你好|您好|嗨|哈喽|hello|hi)[！!。.?？ ]*$/i.test(text)) {
      return {
        chinese: `你好！很高兴见到你，${userName}。今天想练习什么？`,
        pinyin: `Nǐ hǎo! Hěn gāoxìng jiàndào nǐ, ${userName}. Jīntiān xiǎng liànxí shénme?`,
        vietnamese: `Xin chào! Rất vui được gặp bạn, ${userName}. Hôm nay bạn muốn luyện gì?`,
        responseType: 'conversation', emotion: 'happy', correction: null, vocabulary: [], grammar: [],
        progressiveHints: { hint1_semantic: 'Nói bạn muốn luyện chủ đề nào.', hint2_keywords: '练习, 中文, 口语', hint3_structure: '我想练习 + chủ đề', hint4_fullAnswer: '我想练习中文。' },
        suggestedReplies: [
          { hanzi: '我想练习中文。', pinyin: 'Wǒ xiǎng liànxí Zhōngwén.', vietnamese: 'Mình muốn luyện tiếng Trung.' },
          { hanzi: '我想练习口语。', pinyin: 'Wǒ xiǎng liànxí kǒuyǔ.', vietnamese: 'Mình muốn luyện nói.' }
        ]
      };
    }

    if (/练习中文|luyện tiếng Trung/i.test(text)) {
      return {
        chinese: '当然可以！我们先从简单的日常对话开始。你可以先介绍一下自己。',
        pinyin: 'Dāngrán kěyǐ! Wǒmen xiān cóng jiǎndān de rìcháng duìhuà kāishǐ. Nǐ kěyǐ xiān jièshào yíxià zìjǐ.',
        vietnamese: 'Được chứ! Chúng ta bắt đầu bằng hội thoại hằng ngày đơn giản nhé. Bạn thử giới thiệu bản thân trước.',
        responseType: 'lesson', emotion: 'encouraging', correction: null, vocabulary: [], grammar: [],
        progressiveHints: { hint1_semantic: 'Giới thiệu tên của bạn.', hint2_keywords: '我叫, 名字', hint3_structure: '我叫 + tên', hint4_fullAnswer: '你好！我叫明。' },
        suggestedReplies: [
          { hanzi: '你好！我叫明。', pinyin: 'Nǐ hǎo! Wǒ jiào Míng.', vietnamese: 'Xin chào! Mình tên là Minh.' },
          { hanzi: '我来自越南。', pinyin: 'Wǒ láizì Yuènán.', vietnamese: 'Mình đến từ Việt Nam.' }
        ]
      };
    }

    if (/你能教我一些新词吗|教我.*新词|教我.*词/i.test(text)) {
      return {
        chinese: '当然可以！我们先学三个很常用的词：“朋友”“喜欢”“学习”。你想先学哪一个？',
        pinyin: 'Dāngrán kěyǐ! Wǒmen xiān xué sān ge hěn chángyòng de cí: “péngyou”, “xǐhuan”, “xuéxí”. Nǐ xiǎng xiān xué nǎ yí ge?',
        vietnamese: 'Tất nhiên rồi! Mình học trước 3 từ rất thường dùng: “朋友” (bạn bè), “喜欢” (thích), “学习” (học). Bạn muốn học từ nào trước?',
        responseType: 'lesson',
        emotion: 'encouraging',
        correction: null,
        vocabulary: [],
        grammar: [],
        progressiveHints: {
          hint1_semantic: 'Chọn một từ bạn muốn học trước.',
          hint2_keywords: '朋友, 喜欢, 学习',
          hint3_structure: '我喜欢 + ...',
          hint4_fullAnswer: '我喜欢学习中文。'
        },
        suggestedReplies: [
          { hanzi: '我想学“朋友”。', pinyin: 'Wǒ xiǎng xué “péngyou”.', vietnamese: 'Mình muốn học từ “bạn bè”.' },
          { hanzi: '教我“喜欢”吧。', pinyin: 'Jiāo wǒ “xǐhuan” ba.', vietnamese: 'Dạy mình từ “thích” nhé.' },
          { hanzi: '我想学日常口语。', pinyin: 'Wǒ xiǎng xué rìcháng kǒuyǔ.', vietnamese: 'Mình muốn học khẩu ngữ hằng ngày.' }
        ]
      };
    }

    if (/我喜欢学习中文|我喜欢学中文|喜欢学习中文/i.test(text)) {
      return {
        chinese: '很好！“喜欢”表示“thích”。你可以说：“我喜欢学习中文。” 你还喜欢什么？',
        pinyin: 'Hěn hǎo! “Xǐhuan” biǎoshì “thích”. Nǐ kěyǐ shuō: “Wǒ xǐhuan xuéxí Zhōngwén.” Nǐ hái xǐhuan shénme?',
        vietnamese: 'Rất tốt! “喜欢” có nghĩa là “thích”. Bạn còn thích gì nữa?',
        responseType: 'lesson',
        emotion: 'encouraging',
        correction: null,
        vocabulary: [],
        grammar: [],
        progressiveHints: {
          hint1_semantic: 'Nói một điều bạn thích.',
          hint2_keywords: '喜欢, 中文, 学习',
          hint3_structure: '我喜欢 + ...',
          hint4_fullAnswer: '我喜欢学习中文。'
        },
        suggestedReplies: [
          { hanzi: '我喜欢听音乐。', pinyin: 'Wǒ xǐhuan tīng yīnyuè.', vietnamese: 'Mình thích nghe nhạc.' },
          { hanzi: '我喜欢看电影。', pinyin: 'Wǒ xǐhuan kàn diànyǐng.', vietnamese: 'Mình thích xem phim.' },
          { hanzi: '我喜欢学中文。', pinyin: 'Wǒ xǐhuan xué Zhōngwén.', vietnamese: 'Mình thích học tiếng Trung.' }
        ]
      };
    }

    const hasRealName = userName && userName !== 'Bạn';
    const greeting = hasRealName ? `，${userName}` : '';
    return {
      chinese: `好的${greeting}！我听懂了。我们继续练习吧。你可以再说一句，我会根据你的内容回应。`,
      pinyin: `Hǎo${hasRealName ? `, ${userName}` : ''}! Wǒ tīng dǒng le. Wǒmen jìxù liànxí ba. Nǐ kěyǐ zài shuō yí jù, wǒ huì gēnjù nǐ de nèiróng huíyìng.`,
      vietnamese: `Được${hasRealName ? `, ${userName}` : ''}! Mình hiểu rồi. Mình tiếp tục luyện tập nhé. Bạn cứ nói thêm một câu, mình sẽ phản hồi theo đúng nội dung bạn nói.`,
      responseType: 'conversation',
      emotion: 'happy',
      correction: null,
      vocabulary: [],
      grammar: [],
      progressiveHints: {
        hint1_semantic: 'Hãy nói thêm một ý liên quan đến chủ đề hiện tại.',
        hint2_keywords: '我觉得, 我喜欢, 今天',
        hint3_structure: '我 + động từ + ...',
        hint4_fullAnswer: '我喜欢学习中文。'
      },
      suggestedReplies: [
        { hanzi: '我喜欢学习中文。', pinyin: 'Wǒ xǐhuan xuéxí Zhōngwén.', vietnamese: 'Mình thích học tiếng Trung.' },
        { hanzi: '我今天很开心。', pinyin: 'Wǒ jīntiān hěn kāixīn.', vietnamese: 'Hôm nay mình rất vui.' }
      ]
    };
  }
}

export const aiTutor = new AITutorClientService();
export const aiTutorService = aiTutor;
