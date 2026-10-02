/**
 * Professional AI Tutor Avatar System Architecture for Lina AI Chinese
 * Supports 3 Provider Levels:
 * - Level 1: Static / CSS Animated Fallback Avatar
 * - Level 2: Local Interactive Canvas / SVG Visemes, Eye-blinking & Breathing
 * - Level 3: Real-time External Avatar Adapter (with graceful auto-fallback)
 */

import { AvatarState, AvatarProviderLevel, CharacterDesignConfig } from '../types';
import { speechService } from './speech';
import { audioStreamController } from './audioStreamController';
import { audioAnalyzer } from './audioAnalyzer';
import { lipSyncEngine } from './lipSyncEngine';

export type VisemeEvent = {
  viseme: 'sil' | 'aa' | 'ee' | 'oo' | 'mm' | 'oh' | 'f' | 's';
  amplitude: number; // 0 to 1
};

export type AvatarListener = (
  state: AvatarState,
  level: AvatarProviderLevel,
  labelVi: string,
  viseme: VisemeEvent
) => void;

export interface SpeakOptions {
  rate?: number;
  useGeminiTTS?: boolean;
  onEnd?: () => void;
  onError?: () => void;
  onViseme?: (viseme: VisemeEvent) => void;
}

export interface AvatarProvider {
  readonly level: AvatarProviderLevel;
  readonly name: string;
  readonly descriptionVi: string;
  initialize(): Promise<boolean>;
  setState(state: AvatarState): void;
  speak(text: string, options?: SpeakOptions): Promise<void>;
  stop(): void;
  destroy(): void;
  isReady(): boolean;
}

/**
 * Character Design System specification for Lina
 */
export const DEFAULT_LINA_CHARACTER_CONFIG: CharacterDesignConfig = {
  name: 'Lina',
  chineseName: '林娜 (Lìnà)',
  taglineVi: 'Gia sư tiếng Trung AI hư cấu, đồng hành tận tâm cùng người Việt',
  face: {
    eyeColor: 'Hổ phách ấm (Warm Amber, attentive & gentle)',
    skinTone: 'Á Đông tự nhiên, sáng ấm (Natural Warm Porcelain)',
    style: 'Nhân vật 3D số hư cấu (Original Fictional 3D Digital Human)',
  },
  hair: {
    color: 'Nâu đen bóng mượt (Soft Dark Brunette)',
    style: 'Búi tóc thanh lịch sau gáy kèm vài lọn tóc mai buông tự nhiên',
  },
  outfit: {
    top: 'Áo dệt kim cổ lọ thanh nhã màu kem be (Elegant Cream Knit)',
    accessory: 'Ghim cài áo ngọc nhỏ hình hoa mai (Delicate blossom pin)',
  },
  background: {
    environment: 'Phòng học hiện đại phong cách Bắc Âu tối giản (Minimalist Bright Studio)',
    ambientColor: 'Tone ấm kem Terracotta & Xanh ngọc nhạt (#FDFBF7 & #F5F1EB)',
  },
  expression: 'Nụ cười khích lệ tự nhiên, đôi mắt tập trung lắng nghe học viên',
  lighting: 'Ánh sáng studio chân dung mềm mại (Soft cinematic studio key & rim light)',
  cameraAngle: 'Góc chụp ngang tầm mắt, trung cảnh chân dung (Eye-level portrait medium shot)',
};

/**
 * Vietnamese description for each state
 */
export const AVATAR_STATE_DESCRIPTIONS: Record<AvatarState, { titleVi: string; badgeClass: string }> = {
  IDLE: {
    titleVi: 'Lina đang sẵn sàng trò chuyện',
    badgeClass: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  },
  LISTENING: {
    titleVi: 'Lina đang chăm chú lắng nghe bạn...',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 animate-pulse',
  },
  THINKING: {
    titleVi: 'Lina đang suy nghĩ câu trả lời...',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-bounce',
  },
  SPEAKING: {
    titleVi: 'Lina đang nói tiếng Trung...',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  HAPPY: {
    titleVi: 'Lina vui vẻ khích lệ bạn!',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  },
  ENCOURAGING: {
    titleVi: 'Lina động viên: "Bạn nói rất tự nhiên!"',
    badgeClass: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200',
  },
  CONFUSED: {
    titleVi: 'Lina đang lắng lại để hiểu rõ hơn ý bạn',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
  },
  CORRECTING: {
    titleVi: 'Lina đang giúp bạn chỉnh câu tự nhiên hơn',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
  },
  ERROR: {
    titleVi: 'Gặp chút gián đoạn, Lina vẫn luôn ở đây cùng bạn',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
  },
};

// =========================================================================
// LEVEL 1: Static / CSS Animated Fallback Provider
// =========================================================================
export class Level1FallbackAvatarProvider implements AvatarProvider {
  readonly level: AvatarProviderLevel = 'level1_fallback';
  readonly name = 'Cấp 1: Avatar hình ảnh & CSS';
  readonly descriptionVi = 'Hiển thị ảnh chân dung chất lượng cao kèm hiệu ứng hào quang CSS nhẹ nhàng.';

  private ready = true;
  private currentState: AvatarState = 'IDLE';

  async initialize(): Promise<boolean> {
    this.ready = true;
    return true;
  }

  setState(state: AvatarState): void {
    this.currentState = state;
  }

  async speak(text: string, options?: SpeakOptions): Promise<void> {
    this.setState('SPEAKING');
    await speechService.speakChinese(text, {
      rate: (options?.rate as any) || 1.0,
      useGeminiTTS: options?.useGeminiTTS,
      onEnd: () => {
        this.setState('IDLE');
        options?.onEnd?.();
      },
      onError: () => {
        this.setState('IDLE');
        options?.onError?.();
      },
    });
  }

  stop(): void {
    speechService.stopSpeaking();
    this.setState('IDLE');
  }

  destroy(): void {
    this.stop();
    this.ready = false;
  }

  isReady(): boolean {
    return this.ready;
  }
}

// =========================================================================
// LEVEL 2: Local Interactive Canvas / SVG Visemes Provider
// =========================================================================
export class Level2InteractiveAvatarProvider implements AvatarProvider {
  readonly level: AvatarProviderLevel = 'level2_interactive';
  readonly name = 'Cấp 2: Tương tác thời gian thực (Interactive Canvas)';
  readonly descriptionVi = 'Đồng bộ khẩu hình môi (visemes), nháy mắt tự nhiên và nhịp thở 60 FPS mà không cần phụ thuộc bên ngoài.';

  private ready = false;
  private currentState: AvatarState = 'IDLE';

  async initialize(): Promise<boolean> {
    this.ready = true;
    return true;
  }

  setState(state: AvatarState): void {
    this.currentState = state;
    if (state !== 'SPEAKING' && this.speechInterval) {
      clearInterval(this.speechInterval);
      this.speechInterval = null;
    }
  }

  async speak(text: string, options?: SpeakOptions): Promise<void> {
    this.setState('SPEAKING');

    try {
      await speechService.speakChinese(text, {
        rate: (options?.rate as any) || 1.0,
        useGeminiTTS: options?.useGeminiTTS,
        onEnd: () => {
          options?.onViseme?.({ viseme: 'sil', amplitude: 0 });
          this.setState('IDLE');
          options?.onEnd?.();
        },
        onError: () => {
          options?.onViseme?.({ viseme: 'sil', amplitude: 0 });
          this.setState('IDLE');
          options?.onError?.();
        },
      });
    } catch {
      this.setState('IDLE');
      options?.onError?.();
    }
  }

  stop(): void {
    speechService.stopSpeaking();
    this.setState('IDLE');
  }

  destroy(): void {
    this.stop();
  }

  isReady(): boolean {
    return this.ready;
  }
}

// =========================================================================
// LEVEL 3: External Real-Time Stream Provider (with auto-fallback to Level 2)
// =========================================================================
export class Level3RealtimeAvatarProvider implements AvatarProvider {
  readonly level: AvatarProviderLevel = 'level3_realtime';
  readonly name = 'Cấp 3: Luồng truyền hình ảnh thời gian thực (Live Stream)';
  readonly descriptionVi = 'Provider contract sẵn sàng cho live avatar; hiện dùng animated fallback an toàn vì chưa có realtime provider.';

  private ready = false;
  private currentState: AvatarState = 'IDLE';
  private fallbackLevel2 = new Level2InteractiveAvatarProvider();

  async initialize(): Promise<boolean> {
    try {
      // No external realtime provider is configured yet. Keep Level 3 provider-safe by delegating to the local animated fallback.
      await this.fallbackLevel2.initialize();
      this.ready = true;
      return true;
    } catch {
      this.ready = false;
      return false;
    }
  }

  setState(state: AvatarState): void {
    this.currentState = state;
    this.fallbackLevel2.setState(state);
  }

  async speak(text: string, options?: SpeakOptions): Promise<void> {
    // Explicitly use the local animated fallback until a real streaming avatar provider is configured.
    return this.fallbackLevel2.speak(text, options);
  }

  stop(): void {
    this.fallbackLevel2.stop();
    this.currentState = 'IDLE';
  }

  destroy(): void {
    this.fallbackLevel2.destroy();
  }

  isReady(): boolean {
    return this.ready;
  }
}

// =========================================================================
// AVATAR MANAGER (Central Service)
// =========================================================================
class AvatarSystemManager {
  private currentState: AvatarState = 'IDLE';
  private currentViseme: VisemeEvent = { viseme: 'sil', amplitude: 0 };
  private activeLevel: AvatarProviderLevel = 'level2_interactive';
  private externalRealtimeProviderConfigured = false;
  private providers: Record<AvatarProviderLevel, AvatarProvider>;
  private unsubscribeAudio: (() => void) | null = null;
  private unsubscribeMetrics: (() => void) | null = null;
  private lastAudioNotifyAt = 0;
  private listeners: Set<AvatarListener> = new Set();
  private characterConfig: CharacterDesignConfig = DEFAULT_LINA_CHARACTER_CONFIG;

  constructor() {
    this.providers = {
      level1_fallback: new Level1FallbackAvatarProvider(),
      level2_interactive: new Level2InteractiveAvatarProvider(),
      level3_realtime: new Level3RealtimeAvatarProvider(),
    };

    // Initialize default provider
    this.providers[this.activeLevel].initialize();

    // Real audio-driven lip sync. If no audio element exists, no mouth movement is synthesized.
    this.unsubscribeAudio = audioStreamController.subscribe({
      onElement: (audio) => {
        if (audio) audioAnalyzer.attachMediaElement(audio);
        else {
          audioAnalyzer.stop();
          this.currentViseme = { viseme: 'sil', amplitude: 0 };
          this.notify();
        }
      }
    });
    this.unsubscribeMetrics = audioAnalyzer.subscribe((metrics) => {
      if (this.currentState !== 'SPEAKING') return;
      const now = Date.now();
      if (metrics.isSpeaking && now - this.lastAudioNotifyAt < 66) return;
      this.lastAudioNotifyAt = now;
      const frame = lipSyncEngine.fromAudio(metrics);
      this.currentViseme = { viseme: frame.viseme, amplitude: frame.intensity };
      this.notify();
    });
  }

  getState(): AvatarState {
    return this.currentState;
  }

  getLevel(): AvatarProviderLevel {
    return this.activeLevel;
  }

  hasRealtimeProvider(): boolean {
    return this.externalRealtimeProviderConfigured;
  }

  getCharacterConfig(): CharacterDesignConfig {
    return this.characterConfig;
  }

  getStateLabelVi(): string {
    return AVATAR_STATE_DESCRIPTIONS[this.currentState]?.titleVi || 'Lina đang sẵn sàng';
  }

  getStateBadgeClass(): string {
    return AVATAR_STATE_DESCRIPTIONS[this.currentState]?.badgeClass || 'bg-stone-100 text-stone-700';
  }

  setLevel(level: AvatarProviderLevel): void {
    if (this.activeLevel === level) return;
    this.providers[this.activeLevel].stop();
    this.activeLevel = level;
    this.providers[level].initialize().catch(() => {
      // Fallback to level 1 if failed
      this.activeLevel = 'level1_fallback';
    });
    this.notify();
  }

  setState(state: AvatarState): void {
    if (this.currentState === state) return;
    this.currentState = state;
    this.providers[this.activeLevel].setState(state);
    this.notify();
  }

  setViseme(viseme: VisemeEvent): void {
    this.currentViseme = viseme;
    this.notify();
  }

  async speak(text: string, options?: SpeakOptions): Promise<void> {
    const provider = this.providers[this.activeLevel];
    try {
      await provider.speak(text, {
        ...options,
        onViseme: (v) => {
          this.currentViseme = v;
          options?.onViseme?.(v);
          this.notify();
        },
        onEnd: () => {
          this.setState('IDLE');
          options?.onEnd?.();
        },
        onError: () => {
          this.setState('IDLE');
          options?.onError?.();
        },
      });
    } catch {
      // Never claim realtime avatar when no provider is configured. Use the local animated fallback.
      this.activeLevel = 'level2_interactive';
      this.providers.level2_interactive.initialize().then(() => this.providers.level2_interactive.speak(text, options)).catch(() => {
        this.activeLevel = 'level1_fallback';
        void this.providers.level1_fallback.speak(text, options);
      });
    }
  }

  stop(): void {
    this.providers[this.activeLevel].stop();
    this.setState('IDLE');
    this.currentViseme = { viseme: 'sil', amplitude: 0 };
    this.notify();
  }

  subscribe(listener: AvatarListener): () => void {
    this.listeners.add(listener);
    listener(
      this.currentState,
      this.activeLevel,
      this.getStateLabelVi(),
      this.currentViseme
    );
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const label = this.getStateLabelVi();
    this.listeners.forEach((listener) => {
      listener(this.currentState, this.activeLevel, label, this.currentViseme);
    });
  }
}

export const avatarService = new AvatarSystemManager();
