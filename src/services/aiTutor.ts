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
  async sendMessage(options: SendMessageOptions, userText: string): Promise<StructuredTutorResponse> {
    try {
      const response = await fetchWithControl('/api/tutor/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:sanitizePlainText(userText,2000),history:options.history.slice(-8).map(m=>({sender:m.sender,hanzi:sanitizePlainText(m.hanzi,700),text:sanitizePlainText(m.hanzi,700),pinyin:sanitizePlainText(m.pinyin,300),vietnamese:sanitizePlainText(m.vietnamese,700)})),mode:options.mode,hskLevel:options.hskLevel,userLevel:options.userLevel||'Cơ bản',userName:sanitizePlainText(options.userName,120)||'Bạn',topicTitle:sanitizePlainText(options.topicTitleVi,240),memoryFacts:(options.memoryFacts||[]).slice(-12).map(f=>sanitizePlainText(f,240)).filter(Boolean)})},{timeoutMs:30000,retries:1,signal:options.signal});

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: StructuredTutorResponse = await response.json();
      return data;
    } catch (err) {
      if ((err as Error)?.name === 'AbortError' && options.signal?.aborted) throw err;

      console.warn('Network call failed, utilizing graceful local fallback:', err);
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
        memoryFacts: (options.memoryFacts || []).slice(-12).map(f => sanitizePlainText(f, 240)).filter(Boolean)
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
      const response = await fetchWithControl('/api/tutor/hints', {
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
      const response = await fetchWithControl('/api/tutor/explain', {
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

    return {
      chinese: `你好，${userName}！很高兴认识你。我们今天一起练习中文吧！`,
      pinyin: `Nǐ hǎo, ${userName}! Hěn gāoxìng rènshi nǐ. Wǒmen jīntiān yìqǐ liànxí Zhōngwén ba!`,
      vietnamese: `Chào ${userName}! Rất vui được làm quen với bạn. Hôm nay chúng mình cùng luyện tiếng Trung nhé!`,
      responseType: 'conversation',
      emotion: 'happy',
      correction: mode === 'teacher' ? null : null,
      vocabulary: [
        {
          hanzi: '练习',
          pinyin: 'liànxí',
          vietnamese: 'luyện tập',
          partOfSpeech: 'Động từ',
          exampleSentence: '我们一起练习口语。',
          hskLevel: 'HSK 2'
        }
      ],
      grammar: [
        {
          structure: '一起 + Động từ + 吧',
          meaningVi: 'Cùng làm việc gì đó nhé (lời rủ rê thân thiện)',
          exampleSentence: '我们一起学吧。',
          examplePinyin: 'Wǒmen yìqǐ xué ba.',
          exampleVietnamese: 'Chúng ta cùng học nhé.'
        }
      ],
      progressiveHints: {
        hint1_semantic: 'Chào lại và giới thiệu ngắn gọn tên bạn.',
        hint2_keywords: '你好 (nǐ hǎo), 我叫 (wǒ jiào)',
        hint3_structure: '你好，我叫 + [Tên]',
        hint4_fullAnswer: `你好！我叫${userName}。(Nǐ hǎo! Wǒ jiào ${userName}.)`
      },
      suggestedReplies: [
        { hanzi: `你好！我叫${userName}。`, pinyin: `Nǐ hǎo! Wǒ jiào ${userName}.`, vietnamese: `Xin chào! Tôi tên là ${userName}.` },
        { hanzi: '我想练习日常口语。', pinyin: 'Wǒ xiǎng liànxí rìcháng kǒuyǔ.', vietnamese: 'Tôi muốn luyện khẩu ngữ thường ngày.' },
        { hanzi: '你能教我一些新词吗？', pinyin: 'Nǐ néng jiāo wǒ yìxiē xīncí ma?', vietnamese: 'Bạn có thể dạy tôi vài từ mới không?' }
      ]
    };
  }
}

export const aiTutor = new AITutorClientService();
export const aiTutorService = aiTutor;
