/**
 * Modular Speech Service for Lina AI Chinese
 * Encapsulates Speech-to-Text (STT), Text-to-Speech (TTS), and Pronunciation Analysis Architecture.
 */

export type SpeechLanguage = 'zh-CN' | 'zh-TW' | 'en-US' | 'vi-VN';
export type PlaybackSpeed = 0.75 | 1.0 | 1.25;
export type MicrophoneState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'AI_SPEAKING' | 'ERROR';

export interface VoiceSettings {
  speechLanguage: SpeechLanguage;
  selectedVoiceURI: string;
  playbackSpeed: PlaybackSpeed;
  autoPlayAiResponse: boolean;
  pushToTalk: boolean;
  useGeminiTTS?: boolean;
}

export type PronunciationAnalysisStatus = 'analyzed' | 'insufficient-data' | 'provider-unavailable';

export interface PronunciationScore {
  overall: number | null;
  tones: number | null;
  initials: number | null;
  finals: number | null;
  fluency: number | null;
  feedback: string;
  isAcousticAvailable: boolean;
  status: PronunciationAnalysisStatus;
  provider?: string;
  recognizedText?: string;
}

export interface ToneItem {
  toneNumber: 1 | 2 | 3 | 4 | 5;
  toneNameVi: string;
  pinyin: string;
  hanzi: string;
  meaningVi: string;
  pitchContour: string; // SVG path or description
  sampleAudioText: string;
}

export const CHINESE_TONES: ToneItem[] = [
  {
    toneNumber: 1,
    toneNameVi: 'Thanh 1 (Âm cao - bằng)',
    pinyin: 'mā',
    hanzi: '妈',
    meaningVi: 'mẹ',
    pitchContour: 'M10 20 L90 20', // Flat high line 55
    sampleAudioText: '妈'
  },
  {
    toneNumber: 2,
    toneNameVi: 'Thanh 2 (Âm đi lên)',
    pinyin: 'má',
    hanzi: '麻',
    meaningVi: 'cây gai / tê',
    pitchContour: 'M10 50 Q50 35 90 10', // Rising line 35
    sampleAudioText: '麻'
  },
  {
    toneNumber: 3,
    toneNameVi: 'Thanh 3 (Xuống thấp rồi lên)',
    pinyin: 'mǎ',
    hanzi: '马',
    meaningVi: 'con ngựa',
    pitchContour: 'M10 30 Q50 65 90 20', // Dip and rise 214
    sampleAudioText: '马'
  },
  {
    toneNumber: 4,
    toneNameVi: 'Thanh 4 (Đi xuống dứt khoát)',
    pinyin: 'mà',
    hanzi: '骂',
    meaningVi: 'mắng / chửi',
    pitchContour: 'M10 10 L90 60', // Falling sharp line 51
    sampleAudioText: '骂'
  },
  {
    toneNumber: 5,
    toneNameVi: 'Thanh nhẹ (Ngắn & nhẹ)',
    pinyin: 'ma',
    hanzi: '吗',
    meaningVi: 'trợ từ nghi vấn (...phải không?)',
    pitchContour: 'M45 40 A5 5 0 1 0 55 40 A5 5 0 1 0 45 40', // Soft dot
    sampleAudioText: '好吗'
  }
];

class SpeechService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;
  private isListeningActive = false;
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private audioCache = new Map<string, string>();

  constructor() {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      }

      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
    }
  }

  // ===================== SPEECH-TO-TEXT (STT) =====================

  isSttSupported(): boolean {
    return this.recognition !== null;
  }

  isCurrentlyListening(): boolean {
    return this.isListeningActive;
  }

  startListening(options: {
    lang?: SpeechLanguage;
    onResult: (res: { transcript: string; isFinal: boolean; confidence?: number }) => void;
    onError: (friendlyErrorMessage: string) => void;
    onEnd: () => void;
  }): void {
    if (!this.recognition) {
      options.onError('Trình duyệt hiện tại không hỗ trợ Web Speech API trực tiếp.');
      options.onEnd();
      return;
    }

    try {
      this.recognition.lang = options.lang || 'zh-CN';
      this.isListeningActive = true;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;
        let confidence = 0.9;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
            confidence = event.results[i][0].confidence || 0.9;
          }
        }

        options.onResult({ transcript: transcript.trim(), isFinal, confidence });
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onerror = (event: any) => {
        this.isListeningActive = false;
        const errType = event.error;

        let friendlyMsg = 'Đang gặp sự cố âm thanh. Bạn thử lại nhé.';
        if (errType === 'not-allowed' || errType === 'permission-denied') {
          friendlyMsg = 'Bạn chưa cấp quyền microphone.';
        } else if (errType === 'no-speech') {
          friendlyMsg = 'Mình chưa nghe rõ. Bạn thử nói chậm hơn nhé.';
        } else if (errType === 'network') {
          friendlyMsg = 'Đang gặp sự cố kết nối. Bạn thử lại nhé.';
        }

        options.onError(friendlyMsg);
      };

      this.recognition.onend = () => {
        this.isListeningActive = false;
        options.onEnd();
      };

      this.recognition.start();
    } catch (err: any) {
      this.isListeningActive = false;
      const msg = err.name === 'NotAllowedError' 
        ? 'Bạn chưa cấp quyền microphone.' 
        : 'Mình chưa nghe rõ. Bạn thử nói chậm hơn nhé.';
      options.onError(msg);
      options.onEnd();
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListeningActive) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListeningActive = false;
    }
  }

  /**
   * Transcribe audio blob using Gemini server-side transcription service
   */
  async transcribeAudio(audioInput: Blob | string): Promise<string> {
    try {
      let audioBase64 = '';
      let mimeType = 'audio/webm';

      if (typeof audioInput === 'string') {
        audioBase64 = audioInput.replace(/^data:audio\/\w+;base64,/, '');
      } else {
        mimeType = audioInput.type || 'audio/webm';
        audioBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const res = reader.result as string;
            resolve(res.replace(/^data:audio\/\w+;base64,/, ''));
          };
          reader.onerror = reject;
          reader.readAsDataURL(audioInput);
        });
      }

      const res = await fetch('/api/stt/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.transcript || '';
      }
    } catch (err) {
      console.warn('Gemini transcribe failed, falling back:', err);
    }
    return '';
  }

  // ===================== TEXT-TO-SPEECH (TTS) =====================

  isTtsSupported(): boolean {
    return this.synth !== null;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  /**
   * Fetch audio from server-side Gemini TTS if available
   */
  async fetchGeminiTTSAudio(text: string): Promise<string | null> {
    if (this.audioCache.has(text)) {
      return this.audioCache.get(text)!;
    }
    try {
      const res = await fetch('/api/tts/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'Kore' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audioSrc = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
          this.audioCache.set(text, audioSrc);
          return audioSrc;
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  speakChinese(
    text: string, 
    options?: {
      rate?: PlaybackSpeed;
      pitch?: number;
      voiceURI?: string;
      lang?: string;
      useGeminiTTS?: boolean;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ): Promise<void> {
    return new Promise(async (resolve) => {
      this.stopSpeaking();

      const rate = options?.rate !== undefined ? options.rate : 1.0;

      // 1. Try Gemini TTS audio if explicitly requested or if no Chinese Web Speech voice is available
      const voices = this.getAvailableVoices();
      const hasNativeChineseVoice = voices.some(v => 
        v.lang.toLowerCase().startsWith('zh') || 
        v.name.includes('Chinese') || 
        v.name.includes('Mandarin')
      );

      const preferGemini = options?.useGeminiTTS || (!hasNativeChineseVoice && typeof window !== 'undefined');

      if (preferGemini) {
        const audioSrc = await this.fetchGeminiTTSAudio(text);
        if (audioSrc) {
          const audio = new Audio(audioSrc);
          audio.playbackRate = rate;
          // Preserve pitch without distortion
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (audio as any).preservesPitch = true;

          this.currentAudioElement = audio;
          options?.onStart?.();

          audio.onended = () => {
            this.currentAudioElement = null;
            options?.onEnd?.();
            resolve();
          };

          audio.onerror = () => {
            this.currentAudioElement = null;
            options?.onError?.();
            options?.onEnd?.();
            resolve();
          };

          audio.play().catch(() => {
            this.currentAudioElement = null;
            // fallback to speech synthesis if autoplay blocked
            this.speakWithSpeechSynthesis(text, options, resolve);
          });
          return;
        }
      }

      // 2. Default standard Web Speech API with selected rate and pitch
      this.speakWithSpeechSynthesis(text, options, resolve);
    });
  }

  private speakWithSpeechSynthesis(
    text: string,
    options: {
      rate?: PlaybackSpeed;
      pitch?: number;
      voiceURI?: string;
      lang?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    } | undefined,
    resolve: () => void
  ) {
    if (!this.synth) {
      options?.onEnd?.();
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options?.lang || 'zh-CN';
    utterance.rate = options?.rate !== undefined ? options.rate : 1.0;
    utterance.pitch = options?.pitch !== undefined ? options.pitch : 1.0;

    // Select matching voice
    const voices = this.getAvailableVoices();
    if (options?.voiceURI) {
      const found = voices.find(v => v.voiceURI === options.voiceURI);
      if (found) utterance.voice = found;
    } else {
      const cjkVoice = voices.find(v => 
        v.lang.toLowerCase().startsWith('zh-cn') || 
        v.lang.toLowerCase().startsWith('zh') ||
        v.name.includes('Chinese') ||
        v.name.includes('Mandarin')
      );
      if (cjkVoice) {
        utterance.voice = cjkVoice;
      }
    }

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options?.onEnd?.();
      resolve();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      options?.onError?.();
      options?.onEnd?.();
      resolve();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  pauseSpeaking(): void {
    if (this.currentAudioElement && !this.currentAudioElement.paused) {
      this.currentAudioElement.pause();
    }
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resumeSpeaking(): void {
    if (this.currentAudioElement && this.currentAudioElement.paused) {
      this.currentAudioElement.play().catch(() => {});
    }
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  isSpeaking(): boolean {
    const isAudioPlaying = Boolean(this.currentAudioElement && !this.currentAudioElement.paused);
    const isSynthSpeaking = Boolean(this.synth && this.synth.speaking);
    return isAudioPlaying || isSynthSpeaking;
  }

  // ===================== PRONUNCIATION ANALYSIS =====================

  /**
   * STT recognition alone cannot measure pitch contour, initials/finals or acoustic quality.
   * Keep this method for backward compatibility, but never fabricate a score.
   */
  analyzePronunciation(targetText: string, recognizedText: string): PronunciationScore {
    const cleanSpoken = recognizedText.trim();
    if (!cleanSpoken) {
      return {
        overall: null, tones: null, initials: null, finals: null, fluency: null,
        feedback: 'Chưa thể đánh giá chính xác. Cần microphone/audio analysis provider.',
        isAcousticAvailable: false,
        status: 'insufficient-data',
        provider: 'web-speech-stt',
        recognizedText: ''
      };
    }
    return {
      overall: null, tones: null, initials: null, finals: null, fluency: null,
      feedback: targetText.replace(/\\s+/g,' ').trim() === cleanSpoken.replace(/\\s+/g,' ').trim()
        ? 'STT nhận diện đúng nội dung. Tuy nhiên hiện chưa đủ dữ liệu âm thanh để đánh giá cao độ và phát âm.'
        : 'STT nhận diện khác với mẫu. Bạn hãy nghe lại mẫu và thử nói chậm hơn.',
      isAcousticAvailable: false,
      status: 'provider-unavailable',
      provider: 'web-speech-stt',
      recognizedText: cleanSpoken
    };
  }

}

export const speechService = new SpeechService();
