/**
 * Text-to-Speech Service Interface & Standard Web Speech Implementation
 */

export interface ITextToSpeechService {
  speak(text: string, lang?: string, onEnd?: () => void): Promise<void>;
  stop(): void;
  isSupported(): boolean;
}

class BrowserTextToSpeechService implements ITextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  isSupported(): boolean {
    return this.synth !== null;
  }

  speak(text: string, lang = 'zh-CN', onEnd?: () => void): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        onEnd?.();
        resolve();
        return;
      }

      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9; // Slightly slower, ideal for language learners

      // Find Chinese voice if available
      const voices = this.synth.getVoices();
      const cjkVoice = voices.find(v => v.lang.startsWith('zh') || v.lang === 'zh-CN' || v.lang === 'zh-TW');
      if (cjkVoice) {
        utterance.voice = cjkVoice;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        onEnd?.();
        resolve();
      };

      utterance.onerror = () => {
        this.currentUtterance = null;
        onEnd?.();
        resolve();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }
}

export const textToSpeechService: ITextToSpeechService = new BrowserTextToSpeechService();
