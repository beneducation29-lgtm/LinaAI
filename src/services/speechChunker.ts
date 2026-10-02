import type { StructuredTutorResponse } from '../types';

const SENTENCE_BOUNDARY = /([。！？!?；;]+|\\n+)/g;

export class SpeechChunker {
  split(text: string): string[] {
    const normalized = text.replace(/\\s+/g, ' ').trim();
    if (!normalized) return [];
    const chunks: string[] = [];
    let start = 0;
    let match: RegExpExecArray | null;
    const re = new RegExp(SENTENCE_BOUNDARY.source, 'g');
    while ((match = re.exec(normalized))) {
      const end = match.index + match[0].length;
      const chunk = normalized.slice(start, end).trim();
      if (chunk) chunks.push(chunk);
      start = end;
    }
    const tail = normalized.slice(start).trim();
    if (tail) chunks.push(tail);
    return chunks.length ? chunks : [normalized];
  }

  fromResponse(response: StructuredTutorResponse): string[] {
    return this.split(response.chinese);
  }
}
export const speechChunker = new SpeechChunker();
