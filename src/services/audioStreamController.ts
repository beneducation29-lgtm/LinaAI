export type AudioStreamState = 'idle' | 'buffering' | 'playing' | 'paused' | 'ended' | 'error';

export interface AudioStreamListener {
  onState?: (state: AudioStreamState) => void;
  onElement?: (element: HTMLAudioElement | null) => void;
}

export class AudioStreamController {
  private audio: HTMLAudioElement | null = null;
  private listeners = new Set<AudioStreamListener>();
  private token = 0;
  private objectUrl: string | null = null;

  subscribe(listener: AudioStreamListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async playSource(source: string, rate = 1): Promise<void> {
    const token = ++this.token;
    this.stop();
    if (typeof Audio === 'undefined') throw new Error('Audio playback is unavailable in this browser.');

    const audio = new Audio(source);
    audio.preload = 'auto';
    audio.playbackRate = rate;
    this.audio = audio;
    this.listeners.forEach(l => { l.onElement?.(audio); l.onState?.('buffering'); });

    try {
      await audio.play();
      if (token !== this.token) return;
      this.listeners.forEach(l => l.onState?.('playing'));
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('Audio playback failed.'));
      });
      if (token === this.token) this.listeners.forEach(l => l.onState?.('ended'));
    } catch (error) {
      if (token === this.token) this.listeners.forEach(l => l.onState?.('error'));
      throw error;
    } finally {
      if (token === this.token) this.cleanup();
    }
  }

  async playStream(stream: ReadableStream<Uint8Array>, mimeType = 'audio/mpeg', rate = 1): Promise<void> {
    const token = ++this.token;
    this.stop();
    if (typeof Audio === 'undefined' || typeof MediaSource === 'undefined') {
      throw new Error('Streaming audio is unavailable in this browser.');
    }
    if (!MediaSource.isTypeSupported(mimeType)) {
      throw new Error(`Streaming audio type is not supported: ${mimeType}`);
    }

    const mediaSource = new MediaSource();
    const objectUrl = URL.createObjectURL(mediaSource);
    this.objectUrl = objectUrl;
    const audio = new Audio(objectUrl);
    audio.preload = 'auto';
    audio.playbackRate = rate;
    this.audio = audio;
    this.listeners.forEach(l => { l.onElement?.(audio); l.onState?.('buffering'); });

    try {
      await new Promise<void>((resolve, reject) => {
        const open = () => resolve();
        const error = () => reject(new Error('MediaSource could not open.'));
        mediaSource.addEventListener('sourceopen', open, { once: true });
        mediaSource.addEventListener('error', error, { once: true });
      });

      const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
      const reader = stream.getReader();
      const queue: Uint8Array[] = [];
      let reading = true;
      let ended = false;

      const appendNext = () => {
        if (sourceBuffer.updating || queue.length === 0) return;
        sourceBuffer.appendBuffer(queue.shift()!);
      };

      sourceBuffer.addEventListener('updateend', appendNext);
      void audio.play().then(() => this.listeners.forEach(l => l.onState?.('playing'))).catch(error => {
        throw error;
      });

      while (reading) {
        const { done, value } = await reader.read();
        if (done) {
          reading = false;
          ended = true;
          if (!sourceBuffer.updating && queue.length === 0 && mediaSource.readyState === 'open') mediaSource.endOfStream();
          break;
        }
        if (token !== this.token) {
          await reader.cancel();
          return;
        }
        if (value?.byteLength) queue.push(value);
        appendNext();
      }

      await new Promise<void>((resolve) => {
        const finish = () => resolve();
        if (ended && !sourceBuffer.updating && queue.length === 0) finish();
        else sourceBuffer.addEventListener('updateend', finish, { once: true });
      });

      if (token === this.token) {
        this.listeners.forEach(l => l.onState?.('ended'));
        await new Promise<void>(resolve => {
          if (!this.audio || this.audio.ended) resolve();
          else this.audio.addEventListener('ended', () => resolve(), { once: true });
        });
      }
    } catch (error) {
      if (token === this.token) this.listeners.forEach(l => l.onState?.('error'));
      throw error;
    } finally {
      if (token === this.token) this.cleanup();
    }
  }

  pause(): void {
    if (!this.audio) return;
    this.audio.pause();
    this.listeners.forEach(l => l.onState?.('paused'));
  }

  resume(): Promise<void> {
    if (!this.audio) return Promise.resolve();
    return this.audio.play().then(() => this.listeners.forEach(l => l.onState?.('playing')));
  }

  stop(): void {
    this.token += 1;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.cleanup();
    this.listeners.forEach(l => l.onState?.('idle'));
  }

  destroy(): void {
    this.stop();
    this.listeners.clear();
  }

  private cleanup(): void {
    const audio = this.audio;
    this.audio = null;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.src = '';
    }
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.listeners.forEach(l => l.onElement?.(null));
  }
}

export const audioStreamController = new AudioStreamController();
