import type { AudioMetrics, VisemeFrame } from '../types/realtimeSpeech';

export class LipSyncEngine {
  private lastFrame: VisemeFrame = { timestamp: 0, duration: 0, viseme: 'sil', intensity: 0, source: 'audio' };

  fromAudio(metrics: AudioMetrics): VisemeFrame {
    if (!metrics.isSpeaking || metrics.energy < 0.04) {
      return this.setFrame('sil', 0, 'audio');
    }

    let viseme: VisemeFrame['viseme'] = 'aa';
    if (metrics.highFrequency > metrics.lowFrequency * 1.25) viseme = 'ee';
    else if (metrics.lowFrequency > metrics.highFrequency * 1.2) viseme = 'oo';
    else if (metrics.midFrequency > metrics.lowFrequency * 1.15) viseme = 'oh';

    return this.setFrame(viseme, Math.min(1, metrics.energy * 1.4), 'audio');
  }

  fromTiming(viseme: VisemeFrame['viseme'], timestamp: number, duration: number, intensity = 1): VisemeFrame {
    this.lastFrame = { timestamp, duration, viseme, intensity: Math.max(0, Math.min(1, intensity)), source: 'timing' };
    return this.lastFrame;
  }

  silence(): VisemeFrame {
    return this.setFrame('sil', 0, 'audio');
  }

  getLastFrame(): VisemeFrame {
    return this.lastFrame;
  }

  private setFrame(viseme: VisemeFrame['viseme'], intensity: number, source: VisemeFrame['source']): VisemeFrame {
    this.lastFrame = { timestamp: Date.now(), duration: 0, viseme, intensity, source };
    return this.lastFrame;
  }
}

export const lipSyncEngine = new LipSyncEngine();
