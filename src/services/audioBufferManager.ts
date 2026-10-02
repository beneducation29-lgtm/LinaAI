export interface PreparedAudio { id: string; blob: Blob; mimeType: string; createdAt: number; sizeBytes: number; }

export class AudioBufferManager {
  private items = new Map<string, PreparedAudio>();
  private readonly maxItems: number;
  private readonly maxBytes: number;
  private totalBytes = 0;

  constructor(maxItems = 3, maxBytes = 12 * 1024 * 1024) { this.maxItems = maxItems; this.maxBytes = maxBytes; }

  put(audio: PreparedAudio): void {
    this.remove(audio.id);
    this.items.set(audio.id, audio);
    this.totalBytes += audio.sizeBytes;
    this.evict();
  }

  take(id: string): PreparedAudio | undefined {
    const audio = this.items.get(id);
    if (!audio) return undefined;
    this.items.delete(id);
    this.totalBytes = Math.max(0, this.totalBytes - audio.sizeBytes);
    return audio;
  }

  remove(id: string): void {
    const audio = this.items.get(id);
    if (!audio) return;
    this.items.delete(id);
    this.totalBytes = Math.max(0, this.totalBytes - audio.sizeBytes);
  }

  clear(): void { this.items.clear(); this.totalBytes = 0; }
  size(): number { return this.items.size; }
  bytes(): number { return this.totalBytes; }

  private evict(): void {
    while (this.items.size > this.maxItems || this.totalBytes > this.maxBytes) {
      const oldest = this.items.values().next().value as PreparedAudio | undefined;
      if (!oldest) break;
      this.remove(oldest.id);
    }
  }
}

export const audioBufferManager = new AudioBufferManager();
