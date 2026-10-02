import type { StructuredTutorResponse } from '../types';
import type { RealtimeEmotion, RealtimeSpeechState } from '../types/realtimeSpeech';
import { facialAnimationEngine } from './facialAnimationEngine';
import { streamingTTSProvider } from './streamingTTS';

export interface RealtimeConversationCallbacks {
  onState?: (state: RealtimeSpeechState) => void;
  onResponse?: (response: StructuredTutorResponse) => void;
  onError?: (error: Error) => void;
}

export class RealtimeConversationController {
  private activeRequest: AbortController | null = null;

  async speakResponse(
    response: StructuredTutorResponse,
    callbacks: RealtimeConversationCallbacks = {},
    rate = 1
  ): Promise<void> {
    const emotion = this.validEmotion(response.emotion);
    const startedAt = Date.now();
    callbacks.onResponse?.(response);
    callbacks.onState?.({
      status: 'SPEAKING',
      text: response.chinese,
      audioState: 'buffering',
      avatarState: 'SPEAKING',
      emotion,
      lipSyncState: 'inactive',
      startedAt
    });
    try {
      await streamingTTSProvider.start({
        text: response.chinese,
        rate,
        lang: 'zh-CN',
        onStart: () => callbacks.onState?.({
          status: 'SPEAKING',
          text: response.chinese,
          audioState: 'playing',
          avatarState: 'SPEAKING',
          emotion,
          lipSyncState: 'audio-driven',
          startedAt
        }),
        onEnd: () => callbacks.onState?.({
          status: 'SPEAKING',
          text: response.chinese,
          audioState: 'ended',
          avatarState: 'IDLE',
          emotion,
          lipSyncState: 'audio-driven',
          startedAt,
          endedAt: Date.now()
        }),
        onError: error => callbacks.onError?.(error)
      });
    } catch (error) {
      callbacks.onError?.(error instanceof Error ? error : new Error('Speech failed'));
      // Text remains usable when TTS fails; do not turn a voice failure into a conversation crash.
    }
  }

  interrupt(): void {
    this.activeRequest?.abort();
    this.activeRequest = null;
    streamingTTSProvider.stop();
  }

  beginRequest(): AbortSignal {
    this.interrupt();
    this.activeRequest = new AbortController();
    return this.activeRequest.signal;
  }

  cancelRequest(): void {
    this.activeRequest?.abort();
    this.activeRequest = null;
    streamingTTSProvider.stop();
  }

  expressionFor(response: StructuredTutorResponse) {
    return facialAnimationEngine.expressionFor(this.validEmotion(response.emotion));
  }

  private validEmotion(emotion: StructuredTutorResponse['emotion']): RealtimeEmotion {
    if (emotion === 'happy' || emotion === 'encouraging' || emotion === 'confused' || emotion === 'curious' || emotion === 'correcting') return emotion;
    return 'neutral';
  }
}

export const realtimeConversationController = new RealtimeConversationController();
