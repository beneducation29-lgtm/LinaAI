import { speechService, PronunciationScore } from './speech';

export type PronunciationInput = { targetText: string; recognizedText?: string; audio?: Blob | ArrayBuffer | Float32Array; };
export type PronunciationAnalysis = PronunciationScore & { confidence?: number; providerAvailable: boolean; };

export interface PronunciationEngine {
  analyzeWord(input: PronunciationInput): Promise<PronunciationAnalysis>;
  analyzeSentence(input: PronunciationInput): Promise<PronunciationAnalysis>;
  analyzeTone(input: PronunciationInput & { targetTone?: 1|2|3|4|5 }): Promise<PronunciationAnalysis>;
  comparePronunciation(input: PronunciationInput): Promise<PronunciationAnalysis>;
}

const unavailable=(recognizedText=''):PronunciationAnalysis=>({
  overall:null,tones:null,initials:null,finals:null,fluency:null,
  feedback:recognizedText?'STT đã nhận diện nội dung, nhưng chưa có acoustic provider đủ dữ liệu để đánh giá phát âm.':'Chưa thể đánh giá chính xác. Cần microphone/audio analysis provider.',
  isAcousticAvailable:false,status:'provider-unavailable',provider:'speech-service-stt',providerAvailable:false,recognizedText
});

class SpeechPronunciationEngine implements PronunciationEngine {
  async analyzeWord(input:PronunciationInput){return this.analyze(input);}
  async analyzeSentence(input:PronunciationInput){return this.analyze(input);}
  async analyzeTone(input:PronunciationInput & {targetTone?:1|2|3|4|5}){return this.analyze(input);}
  async comparePronunciation(input:PronunciationInput){return this.analyze(input);}
  private async analyze(input:PronunciationInput):Promise<PronunciationAnalysis>{
    const recognized=input.recognizedText || '';
    // The existing Voice Service currently exposes STT/TTS, not acoustic pitch/formant analysis.
    // Do not infer tone, initials, finals or numeric pronunciation scores from transcript matching.
    if(!input.audio || input.audio instanceof Blob && input.audio.size===0) return unavailable(recognized);
    return unavailable(recognized);
  }
}

export const pronunciationEngine: PronunciationEngine = new SpeechPronunciationEngine();
