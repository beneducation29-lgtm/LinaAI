import type { AudioMetrics } from '../types/realtimeSpeech';

export type AudioAnalyzerListener = (metrics: AudioMetrics) => void;

export class AudioAnalyzer {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private data: Uint8Array | null = null;
  private frameId: number | null = null;
  private listeners = new Set<AudioAnalyzerListener>();
  private element: HTMLAudioElement | null = null;

  attachMediaElement(element: HTMLAudioElement): boolean {
    if (typeof window === 'undefined') return false;
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return false;
    if (this.element === element && this.analyser) return true;
    this.detach();
    try {
      this.context = new AudioContextCtor();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.72;
      this.data = new Uint8Array(this.analyser.frequencyBinCount);
      this.source = this.context.createMediaElementSource(element);
      this.source.connect(this.analyser);
      this.analyser.connect(this.context.destination);
      this.element = element;
      void this.context.resume().catch(() => undefined);
      this.startLoop();
      return true;
    } catch {
      this.detach();
      return false;
    }
  }

  subscribe(listener: AudioAnalyzerListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getMetrics(): AudioMetrics {
    if (!this.analyser || !this.data) {
      return { volume: 0, energy: 0, isSpeaking: false, lowFrequency: 0, midFrequency: 0, highFrequency: 0, timestamp: Date.now() };
    }
    this.analyser.getByteFrequencyData(this.data);
    let sum = 0;
    let low = 0;
    let mid = 0;
    let high = 0;
    const third = Math.max(1, Math.floor(this.data.length / 3));
    for (let i = 0; i < this.data.length; i += 1) {
      const value = this.data[i] / 255;
      sum += value * value;
      if (i < third) low += value;
      else if (i < third * 2) mid += value;
      else high += value;
    }
    const energy = Math.min(1, Math.sqrt(sum / this.data.length) * 1.8);
    const volume = Math.min(1, energy * 1.25);
    return {
      volume,
      energy,
      isSpeaking: energy > 0.045 && Boolean(this.element && !this.element.paused),
      lowFrequency: low / third,
      midFrequency: mid / third,
      highFrequency: high / Math.max(1, this.data.length - third * 2),
      timestamp: Date.now()
    };
  }

  stop(): void {
    if (this.frameId !== null && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(this.frameId);
    this.frameId = null;
    this.listeners.forEach(listener => listener({
      volume: 0, energy: 0, isSpeaking: false, lowFrequency: 0, midFrequency: 0, highFrequency: 0, timestamp: Date.now()
    }));
  }

  detach(): void {
    this.stop();
    try { this.source?.disconnect(); } catch {}
    try { this.analyser?.disconnect(); } catch {}
    if (this.context) void this.context.close().catch(() => undefined);
    this.source = null;
    this.analyser = null;
    this.data = null;
    this.context = null;
    this.element = null;
  }

  destroy(): void {
    this.detach();
    this.listeners.clear();
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame === 'undefined' || this.frameId !== null) return;
    const tick = () => {
      this.frameId = requestAnimationFrame(tick);
      const metrics = this.getMetrics();
      this.listeners.forEach(listener => listener(metrics));
    };
    this.frameId = requestAnimationFrame(tick);
  }
}

export const audioAnalyzer = new AudioAnalyzer();
