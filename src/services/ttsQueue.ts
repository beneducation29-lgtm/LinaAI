import { streamingTTSProvider } from './streamingTTS';

export interface TTSQueueCallbacks { onStart?: () => void; onEnd?: () => void; onError?: (error: Error) => void; }
export class TTSQueue {
  private pending: Array<{ text: string; rate: number }> = [];
  private running = false; private cancelled = false; private callbacks: TTSQueueCallbacks = {};
  private readonly maxPending = 6;
  enqueue(chunks: string[], rate = 1, callbacks: TTSQueueCallbacks = {}): void {
    this.callbacks = callbacks; this.cancelled = false;
    for (const text of chunks) if (text && this.pending.length < this.maxPending) this.pending.push({ text, rate });
    void this.drain();
  }
  clear(): void { this.pending = []; this.cancelled = true; streamingTTSProvider.stop(); this.running = false; }
  reset(): void { this.cancelled = false; }
  size(): number { return this.pending.length; }
  isBusy(): boolean { return this.running || this.pending.length > 0 || streamingTTSProvider.isSpeaking(); }
  private async drain(): Promise<void> {
    if (this.running || this.cancelled) return;
    this.running = true; this.callbacks.onStart?.();
    try {
      while (this.pending.length && !this.cancelled) {
        const item = this.pending.shift()!;
        try { await streamingTTSProvider.start({ text: item.text, lang: 'zh-CN', rate: item.rate }); }
        catch (error) { this.callbacks.onError?.(error instanceof Error ? error : new Error('TTS queue failed')); break; }
      }
    } finally { this.running = false; if (!this.cancelled) this.callbacks.onEnd?.(); }
  }
}
export const ttsQueue = new TTSQueue();
