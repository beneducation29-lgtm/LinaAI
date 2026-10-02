import { speechService } from './speech';
import { audioStreamController } from './audioStreamController';
import type { StreamingTTSOptions, StreamingTTSProvider } from '../types/realtimeSpeech';

const configuredEndpoint = typeof import.meta !== 'undefined'
  ? (import.meta.env?.VITE_TTS_STREAMING_ENDPOINT as string | undefined)
  : undefined;
const configuredMimeType = typeof import.meta !== 'undefined'
  ? ((import.meta.env?.VITE_TTS_STREAMING_MIME_TYPE as string | undefined) || 'audio/mpeg')
  : 'audio/mpeg';

export class BufferedGeminiTTSProvider implements StreamingTTSProvider {
  readonly name = 'Gemini TTS (buffered fallback)';
  readonly supportsStreaming = false;
  private speaking = false;

  async start(options: StreamingTTSOptions): Promise<void> {
    this.stop();
    this.speaking = true;
    try {
      options.onStart?.();
      const source = await speechService.fetchGeminiTTSAudio(options.text);
      if (source) {
        const response = await fetch(source);
        const buffer = await response.arrayBuffer();
        options.onAudioChunk?.(buffer);
        await audioStreamController.playSource(source, options.rate || 1);
      } else {
        await speechService.speakChinese(options.text, {
          rate: (options.rate || 1) as 0.75 | 1 | 1.25,
          lang: options.lang || 'zh-CN'
        });
      }
      options.onEnd?.();
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('TTS failed'));
      throw error;
    } finally {
      this.speaking = false;
    }
  }

  pause(): void { audioStreamController.pause(); speechService.pauseSpeaking(); }
  resume(): void { void audioStreamController.resume().catch(() => speechService.resumeSpeaking()); }
  stop(): void { audioStreamController.stop(); speechService.stopSpeaking(); this.speaking = false; }
  isSpeaking(): boolean { return this.speaking || speechService.isSpeaking(); }
}

export class ConfiguredStreamingTTSProvider implements StreamingTTSProvider {
  readonly name = 'Configured streaming TTS';
  readonly supportsStreaming = true;
  private speaking = false;
  private controller: AbortController | null = null;

  async start(options: StreamingTTSOptions): Promise<void> {
    if (!configuredEndpoint) throw new Error('Streaming TTS endpoint is not configured.');
    this.stop();
    this.controller = new AbortController();
    this.speaking = true;
    const signal = options.signal || this.controller.signal;
    try {
      const response = await fetch(configuredEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: options.text, lang: options.lang || 'zh-CN', rate: options.rate || 1 }),
        signal
      });
      if (!response.ok || !response.body) throw new Error(`Streaming TTS unavailable (HTTP ${response.status}).`);
      options.onStart?.();
      await audioStreamController.playStream(response.body, options.audioMimeType || configuredMimeType, options.rate || 1);
      options.onEnd?.();
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('Streaming TTS failed'));
      throw error;
    } finally {
      this.speaking = false;
      this.controller = null;
    }
  }

  pause(): void { audioStreamController.pause(); }
  resume(): void { void audioStreamController.resume().catch(() => undefined); }
  stop(): void { this.controller?.abort(); audioStreamController.stop(); this.speaking = false; }
  isSpeaking(): boolean { return this.speaking; }
}

class ResilientStreamingTTSProvider implements StreamingTTSProvider {
  readonly name = configuredEndpoint
    ? 'Configured streaming TTS with buffered fallback'
    : 'Gemini TTS buffered fallback';
  readonly supportsStreaming = Boolean(configuredEndpoint);
  private active: StreamingTTSProvider = configuredEndpoint
    ? new ConfiguredStreamingTTSProvider()
    : new BufferedGeminiTTSProvider();

  async start(options: StreamingTTSOptions): Promise<void> {
    try {
      await this.active.start(options);
    } catch (error) {
      if (this.active instanceof BufferedGeminiTTSProvider) throw error;
      this.active = new BufferedGeminiTTSProvider();
      await this.active.start(options);
    }
  }

  pause(): void { this.active.pause(); }
  resume(): void { this.active.resume(); }
  stop(): void { this.active.stop(); }
  isSpeaking(): boolean { return this.active.isSpeaking(); }
}

export const streamingTTSProvider: StreamingTTSProvider = new ResilientStreamingTTSProvider();
