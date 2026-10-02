import type { CMSContentItem } from '../types/cms';
import { validateCMSItem } from './cmsValidation';

export interface ContentHealthIssue {
  id: string;
  type: CMSContentItem['type'];
  severity: 'error'|'warning';
  code: 'MISSING_AUDIO'|'BROKEN_REFERENCE'|'MISSING_TRANSLATION'|'INVALID_PINYIN'|'ORPHAN'|'VALIDATION';
  message: string;
}

export interface HSKCoverage {
  level: string;
  vocabulary: number;
  grammar: number;
  listening: number;
  speaking: number;
  reading: number;
  writing: number;
  lessons: number;
  status: 'READY'|'PARTIAL'|'CONTENT GAP';
}

const hskOf = (item: CMSContentItem): string => String(item.data?.hsk || item.data?.hskLevel || '');
const refs = (item: CMSContentItem): string[] => {
  const raw = item.data?.references || item.data?.prerequisites || [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') return raw.split(',').map(x=>x.trim()).filter(Boolean);
  return [];
};

export function inspectContentHealth(items: CMSContentItem[]): ContentHealthIssue[] {
  const ids = new Set(items.map(x=>x.id));
  const issues: ContentHealthIssue[] = [];
  for (const item of items) {
    const validation = validateCMSItem(item, items);
    for (const v of validation) if (v.severity === 'error') issues.push({id:item.id,type:item.type,severity:'error',code:v.field==='pinyin'?'INVALID_PINYIN':'VALIDATION',message:v.message});
    if (['audio','vocabulary','listening','dialogue'].includes(item.type) && item.data?.audio === undefined && item.type !== 'vocabulary') {
      issues.push({id:item.id,type:item.type,severity:'warning',code:'MISSING_AUDIO',message:'Thiếu audio reference.'});
    }
    for (const ref of refs(item)) if (!ids.has(ref)) issues.push({id:item.id,type:item.type,severity:'error',code:'BROKEN_REFERENCE',message:`Reference không tồn tại: ${ref}`});
    if (['vocabulary','grammar','lesson','dialogue','reading','writing'].includes(item.type) && !String(item.data?.vietnamese || item.data?.translation || '').trim()) {
      issues.push({id:item.id,type:item.type,severity:'warning',code:'MISSING_TRANSLATION',message:'Thiếu bản dịch tiếng Việt.'});
    }
  }
  return issues;
}

export function buildHSKCoverage(items: CMSContentItem[]): HSKCoverage[] {
  return Array.from({length:6},(_,i)=>`HSK ${i+1}`).map(level => {
    const published=items.filter(x=>x.status==='published' && hskOf(x)===level);
    const count=(type:string)=>published.filter(x=>x.type===type).length;
    const core=[count('vocabulary'),count('grammar'),count('listening'),count('speaking'),count('reading'),count('writing')];
    const status=core.every(n=>n>0)?'READY':core.some(n=>n>0)?'PARTIAL':'CONTENT GAP';
    return {level,vocabulary:core[0],grammar:core[1],listening:core[2],speaking:core[3],reading:core[4],writing:core[5],lessons:count('lesson'),status};
  });
}
