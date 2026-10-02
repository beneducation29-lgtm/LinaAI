/**
 * Speech-to-Text Service Interface & Web Speech Recognition implementation
 */

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
}

export interface ISpeechToTextService {
  startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    lang?: string
  ): void;
  stopListening(): void;
  isSupported(): boolean;
  isListening(): boolean;
}

class BrowserSpeechToTextService implements ISpeechToTextService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;
  private active = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  isListening(): boolean {
    return this.active;
  }

  startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    lang = 'zh-CN'
  ): void {
    if (!this.recognition) {
      onError('Trình duyệt không hỗ trợ nhận diện giọng nói trực tiếp.');
      onEnd();
      return;
    }

    try {
      this.recognition.lang = lang;
      this.active = true;

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

        onResult({ transcript, isFinal, confidence });
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onerror = (event: any) => {
        this.active = false;
        onError(event.error || 'Lỗi nhận diện âm thanh.');
      };

      this.recognition.onend = () => {
        this.active = false;
        onEnd();
      };

      this.recognition.start();
    } catch (err) {
      this.active = false;
      onError((err as Error).message || 'Không thể khởi động microphone.');
      onEnd();
    }
  }

  stopListening(): void {
    if (this.recognition && this.active) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.active = false;
    }
  }
}

export const speechToTextService: ISpeechToTextService = new BrowserSpeechToTextService();
