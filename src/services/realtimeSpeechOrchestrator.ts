import type { StructuredTutorResponse } from '../types';
import type { SendMessageOptions } from './aiTutor';
import { aiTutor } from './aiTutor';
import { ttsQueue } from './ttsQueue';
import { speechChunker } from './speechChunker';
import { realtimeConversationController } from './realtimeConversationController';
import { streamingTTSProvider } from './streamingTTS';

export interface RealtimeTurnMetrics { turnId: string; turnStartedAt: number; geminiFirstTokenAt?: number; ttsFirstChunkAt?: number; audioFirstPlayedAt?: number; turnCompletedAt?: number; }
export interface RealtimeOrchestratorCallbacks { onText?: (text: string) => void; onResponse?: (response: StructuredTutorResponse) => void; onState?: (state: 'THINKING' | 'SPEAKING' | 'IDLE' | 'ERROR') => void; onMetrics?: (metrics: RealtimeTurnMetrics) => void; onError?: (error: Error) => void; }
export class RealtimeSpeechOrchestrator {
  private turnSequence = 0; private activeTurnId: string | null = null; private controller: AbortController | null = null;
  async startConversationTurn(options: SendMessageOptions, userText: string, callbacks: RealtimeOrchestratorCallbacks = {}, rate = 1, enableSpeech = true): Promise<StructuredTutorResponse> {
    this.stopPreviousTurn();
    const turnId = `turn_${String(++this.turnSequence).padStart(3, '0')}`;
    this.activeTurnId = turnId; this.controller = new AbortController();
    const metrics: RealtimeTurnMetrics = { turnId, turnStartedAt: Date.now() };
    callbacks.onState?.('THINKING');
    try {
      const response = await aiTutor.sendMessageStreaming({ ...options, signal: this.controller.signal }, userText, {
        onText: text => { if (!this.isCurrent(turnId)) return; metrics.geminiFirstTokenAt ??= Date.now(); callbacks.onText?.(text); callbacks.onMetrics?.({ ...metrics }); },
        onSpeech: text => {
          if (!enableSpeech || !this.isCurrent(turnId)) return;
          const chunks = speechChunker.split(text);
          if (!chunks.length) return;
          metrics.ttsFirstChunkAt ??= Date.now();
          ttsQueue.enqueue(chunks, rate, {
            onStart: () => { if (!this.isCurrent(turnId)) return; metrics.audioFirstPlayedAt ??= Date.now(); callbacks.onState?.('SPEAKING'); callbacks.onMetrics?.({ ...metrics }); },
            onError: error => { if (this.isCurrent(turnId)) callbacks.onError?.(error); }
          });
        }
      });
      if (!this.isCurrent(turnId)) return response;
      callbacks.onResponse?.(response);
      while (enableSpeech && ttsQueue.isBusy()) {
        await new Promise(resolve => setTimeout(resolve, 30));
        if (!this.isCurrent(turnId)) return response;
      }
      callbacks.onState?.('IDLE'); metrics.turnCompletedAt = Date.now(); callbacks.onMetrics?.({ ...metrics });
      return response;
    } catch (error) {
      if (!this.isCurrent(turnId)) throw error;
      const err = error instanceof Error ? error : new Error('Realtime turn failed');
      callbacks.onError?.(err); callbacks.onState?.('ERROR'); throw err;
    } finally {
      if (this.isCurrent(turnId)) { this.controller = null; this.activeTurnId = null; }
    }
  }
  stopPreviousTurn(): void { this.controller?.abort(); this.controller = null; ttsQueue.clear(); streamingTTSProvider.stop(); realtimeConversationController.interrupt(); this.activeTurnId = null; }
  interrupt(): void { this.stopPreviousTurn(); }
  private isCurrent(turnId: string): boolean { return this.activeTurnId === turnId && !this.controller?.signal.aborted; }
}
export const realtimeSpeechOrchestrator = new RealtimeSpeechOrchestrator();
