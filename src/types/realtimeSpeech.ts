export type RealtimeSpeechStatus = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR';

export type RealtimeEmotion = 'neutral' | 'happy' | 'encouraging' | 'curious' | 'confused' | 'correcting';

export interface AudioMetrics {
  volume: number;
  energy: number;
  isSpeaking: boolean;
  lowFrequency: number;
  midFrequency: number;
  highFrequency: number;
  timestamp: number;
}

export interface VisemeFrame {
  timestamp: number;
  duration: number;
  viseme: 'sil' | 'aa' | 'ee' | 'oo' | 'mm' | 'oh' | 'f' | 's';
  intensity: number;
  source: 'audio' | 'timing';
}

export interface FacialExpression {
  emotion: RealtimeEmotion;
  smile: number;
  eyeFocus: number;
  eyebrowLift: number;
  headTilt: number;
  nod: number;
}

export interface RealtimeSpeechState {
  status: RealtimeSpeechStatus;
  text: string;
  audioState: 'idle' | 'buffering' | 'playing' | 'paused' | 'ended' | 'error';
  avatarState: string;
  emotion: RealtimeEmotion;
  lipSyncState: 'inactive' | 'audio-driven' | 'timing-driven';
  startedAt?: number;
  endedAt?: number;
}

export interface StreamingTTSOptions {
  text: string;
  rate?: number;
  lang?: string;
  signal?: AbortSignal;
  audioMimeType?: string;
  onStart?: () => void;
  onAudioChunk?: (chunk: ArrayBuffer) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface StreamingTTSProvider {
  readonly name: string;
  readonly supportsStreaming: boolean;
  start(options: StreamingTTSOptions): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  isSpeaking(): boolean;
}
