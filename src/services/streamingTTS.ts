import { speechService } from './speech';
import { audioStreamController } from './audioStreamController';
import { audioBufferManager, type PreparedAudio } from './audioBufferManager';
import type { StreamingTTSOptions, StreamingTTSProvider } from '../types/realtimeSpeech';

const configuredEndpoint = '/api/tts/elevenlabs/stream';
const configuredMimeType = 'audio/mpeg';
const streamingEnabled = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_STREAMING_TTS_ENABLED !== 'false' : true;

async function playWithRealAudioStart(run:()=>Promise<void>, onStart?:()=>void):Promise<void>{
  let started=false;
  const unsubscribe=audioStreamController.subscribe({onState:state=>{if(state==='playing'&&!started){started=true;onStart?.();}}});
  try{await run();}finally{unsubscribe();}
}

export class BufferedGeminiTTSProvider implements StreamingTTSProvider {
  readonly name = 'Gemini TTS (buffered fallback)';
  readonly supportsStreaming = false;
  readonly supportsPrefetch = false;
  private speaking = false;
  async start(options: StreamingTTSOptions): Promise<void> {
    this.stop(); this.speaking = true;
    try {
      const source = await speechService.fetchGeminiTTSAudio(options.text);
      if (source) await playWithRealAudioStart(()=>audioStreamController.playSource(source, options.rate || 1),options.onStart);
      else { options.onStart?.(); await speechService.speakChinese(options.text, { rate: (options.rate || 1) as 0.75 | 1 | 1.25, lang: options.lang || 'zh-CN' }); }
      options.onEnd?.();
    } catch (error) { options.onError?.(error instanceof Error ? error : new Error('TTS failed')); throw error; }
    finally { this.speaking = false; }
  }
  pause(): void { audioStreamController.pause(); speechService.pauseSpeaking(); }
  resume(): void { void audioStreamController.resume().catch(() => speechService.resumeSpeaking()); }
  stop(): void { audioStreamController.stop(); speechService.stopSpeaking(); this.speaking = false; }
  isSpeaking(): boolean { return this.speaking || speechService.isSpeaking(); }
}

export class ElevenLabsStreamingTTSProvider implements StreamingTTSProvider {
  readonly name = 'ElevenLabs Flash v2.5';
  readonly supportsStreaming = true;
  readonly supportsPrefetch = true;
  private speaking = false;
  private controller: AbortController | null = null;
  private sequence = 0;

  async start(options: StreamingTTSOptions): Promise<void> {
    this.stop();
    this.controller = new AbortController();
    const signal = options.signal || this.controller.signal;
    this.speaking = true;
    const startedAt = Date.now();
    try {
      const response = await fetch(configuredEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: options.text, lang: options.lang || 'zh-CN', rate: options.rate || 1 }),
        signal
      });
      if (!response.ok || !response.body) throw new Error(`ElevenLabs streaming TTS unavailable (HTTP ${response.status}).`);
      await playWithRealAudioStart(()=>audioStreamController.playStream(response.body!, options.audioMimeType || configuredMimeType, options.rate || 1),options.onStart);
      options.onEnd?.();
      void startedAt;
    } catch (error) { options.onError?.(error instanceof Error ? error : new Error('ElevenLabs TTS failed')); throw error; }
    finally { this.speaking = false; this.controller = null; }
  }

  async prepare(options: StreamingTTSOptions): Promise<PreparedAudio> {
    const id = `sentence_audio_${++this.sequence}`;
    const response = await fetch(configuredEndpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: options.text, lang: options.lang || 'zh-CN', rate: options.rate || 1 }),
      signal: options.signal
    });
    if (!response.ok || !response.body) throw new Error(`ElevenLabs prefetch failed (HTTP ${response.status}).`);
    const reader = response.body.getReader();
    const parts: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value?.byteLength) { parts.push(value); total += value.byteLength; }
    }
    const blob = new Blob(parts, { type: options.audioMimeType || configuredMimeType });
    const prepared = { id, blob, mimeType: blob.type, createdAt: Date.now(), sizeBytes: total };
    audioBufferManager.put(prepared);
    return prepared;
  }

  async playPrepared(prepared: PreparedAudio, options: StreamingTTSOptions): Promise<void> {
    this.speaking = true;
    const url = URL.createObjectURL(prepared.blob);
    try {
      await playWithRealAudioStart(()=>audioStreamController.playSource(url, options.rate || 1),options.onStart);
      options.onEnd?.();
    } finally {
      URL.revokeObjectURL(url);
      audioBufferManager.remove(prepared.id);
      this.speaking = false;
    }
  }

  pause(): void { audioStreamController.pause(); }
  resume(): void { void audioStreamController.resume().catch(() => undefined); }
  stop(): void { this.controller?.abort(); this.controller = null; audioStreamController.stop(); this.speaking = false; }
  isSpeaking(): boolean { return this.speaking; }
}

class ResilientStreamingTTSProvider implements StreamingTTSProvider {
  readonly name = streamingEnabled ? 'ElevenLabs Flash v2.5 → buffered fallback' : 'Gemini TTS buffered fallback';
  readonly supportsStreaming = streamingEnabled;
  readonly supportsPrefetch = streamingEnabled;
  private active: StreamingTTSProvider = streamingEnabled ? new ElevenLabsStreamingTTSProvider() : new BufferedGeminiTTSProvider();

  async start(options: StreamingTTSOptions): Promise<void> {
    try { await this.active.start(options); }
    catch (error) {
      if (this.active instanceof BufferedGeminiTTSProvider) throw error;
      this.active = new BufferedGeminiTTSProvider();
      await this.active.start(options);
    }
  }

  async prepare(options: StreamingTTSOptions): Promise<PreparedAudio> {
    if ('prepare' in this.active && typeof this.active.prepare === 'function') return this.active.prepare(options);
    throw new Error('Active TTS provider does not support prefetch.');
  }

  async playPrepared(prepared: PreparedAudio, options: StreamingTTSOptions): Promise<void> {
    if ('playPrepared' in this.active && typeof this.active.playPrepared === 'function') return this.active.playPrepared(prepared, options);
    throw new Error('Active TTS provider cannot play prepared audio.');
  }
  pause(): void { this.active.pause(); }
  resume(): void { this.active.resume(); }
  stop(): void { this.active.stop(); audioBufferManager.clear(); }
  isSpeaking(): boolean { return this.active.isSpeaking(); }
}

export const streamingTTSProvider: StreamingTTSProvider = new ResilientStreamingTTSProvider();
