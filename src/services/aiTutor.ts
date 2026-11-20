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
  sessionTurnNumber?: number;
  sessionElapsedMinutes?: number;
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
      const code = String((err as any)?.code || '');
      if (['TUTOR_PROVIDER_UNAVAILABLE', 'TUTOR_NOT_CONFIGURED', 'TUTOR_REPETITIVE_RESPONSE'].includes(code)) throw err;

      // Never fabricate a conversational turn from a fixed local template.
      // A fallback that ignores the latest utterance looks like Lina understood
      // the learner and causes the repeated "I understand, continue" loop.
      console.warn('[Lina] Tutor response unavailable; preserving the learner turn without a canned reply:', err);
      throw Object.assign(
        new Error('Lina chưa nhận được phản hồi phù hợp từ AI. Câu nói của bạn vẫn được giữ; hãy thử gửi lại nhé.'),
        { code: 'TUTOR_PROVIDER_UNAVAILABLE', cause: err }
      );
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
        memoryFacts: (options.memoryFacts || []).slice(-8).map(f => sanitizePlainText(f, 240)).filter(Boolean),
        isSpoken: Boolean(options.isSpoken),
        isSpeakingRetry: Boolean(options.isSpeakingRetry),
        speakingCoachTarget: options.speakingCoachTarget ? sanitizePlainText(options.speakingCoachTarget, 500) : '',
        speakingAttempt: options.speakingAttempt || 0,
        sessionTurnNumber: options.sessionTurnNumber || 1,
        sessionElapsedMinutes: options.sessionElapsedMinutes || 0
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
      if (payload.type === 'error') {
        throw Object.assign(new Error(payload.error || 'Streaming tutor error'), {
          code: payload.code || 'TUTOR_API_ERROR'
        });
      }
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


}

export const aiTutor = new AITutorClientService();
export const aiTutorService = aiTutor;
