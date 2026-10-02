import type { CMSContentItem, CMSWorkflowStatus } from '../types/cms';
import { validateCMSItem } from './cmsValidation';

export interface CMSQualityChecklist {
  pinyin: boolean;
  vietnamese: boolean;
  grammar: boolean;
  audio: boolean;
  examples: boolean;
  level: boolean;
  review: boolean;
}
export interface CMSDiff { field: string; before: unknown; after: unknown; }
export interface AICMSReview {
  duplicate: boolean;
  translationIssue: boolean;
  grammarIssue: boolean;
  levelMismatch: boolean;
  suggestions: string[];
}

export function qualityChecklist(item: CMSContentItem): CMSQualityChecklist {
  const d = item.data || {};
  return {
    pinyin: item.type !== 'vocabulary' || Boolean(String(d.pinyin || '').trim()),
    vietnamese: item.type !== 'vocabulary' || Boolean(String(d.vietnamese || '').trim()),
    grammar: item.type !== 'grammar' || Boolean(String(d.pattern || d.explanation || '').trim()),
    audio: !['audio','listening'].includes(item.type) || Boolean(String(d.audio || d.audioUrl || '').trim()),
    examples: !['vocabulary','grammar','lesson'].includes(item.type) || Boolean(d.example || d.examples || d.dialogue),
    level: Boolean(d.hsk || d.hskLevel || item.type === 'hsk_level'),
    review: item.status === 'review' || item.status === 'published',
  };
}
export function qualityCount(item: CMSContentItem) {
  const c = qualityChecklist(item);
  return Object.values(c).filter(Boolean).length + '/7 checks passed';
}
export function diffContent(before: CMSContentItem, after: CMSContentItem): CMSDiff[] {
  return ['title','slug','status','data','contentVersion']
    .filter(field => JSON.stringify(before[field as keyof CMSContentItem]) !== JSON.stringify(after[field as keyof CMSContentItem]))
    .map(field => ({ field, before: before[field as keyof CMSContentItem], after: after[field as keyof CMSContentItem] }));
}
export function canTransitionTo(item: CMSContentItem, next: CMSWorkflowStatus, existing: CMSContentItem[]) {
  if (next === 'published') {
    const valid = validateCMSItem({ ...item, status: next }, existing).every(x => x.severity !== 'error');
    return valid && qualityCount({ ...item, status: 'review' }) === '7/7 checks passed';
  }
  if (next === 'review') return validateCMSItem({ ...item, status: next }, existing).every(x => x.severity !== 'error');
  return true;
}
export function aiReviewContent(item: CMSContentItem, existing: CMSContentItem[]): AICMSReview {
  const d = item.data || {};
  const duplicate = existing.some(x => x.id !== item.id && (x.slug === item.slug || (item.type === 'vocabulary' && x.type === 'vocabulary' && x.data?.hanzi === d.hanzi)));
  const translationIssue = Boolean(d.vietnamese && typeof d.vietnamese === 'string' && d.vietnamese.length > 180);
  const grammarIssue = item.type === 'grammar' && !String(d.pattern || '').trim();
  const levelMismatch = Boolean(d.hsk && !/^HSK [1-6]$/.test(String(d.hsk)));
  const suggestions = [
    ...(duplicate ? ['Kiểm tra nội dung trùng trước khi xuất bản.'] : []),
    ...(translationIssue ? ['Rà soát bản dịch vì độ dài bất thường.'] : []),
    ...(grammarIssue ? ['Bổ sung grammar pattern trước khi review.'] : []),
    ...(levelMismatch ? ['Kiểm tra lại HSK level.'] : []),
  ];
  return { duplicate, translationIssue, grammarIssue, levelMismatch, suggestions };
}
export function bulkPublish(items: CMSContentItem[], existing: CMSContentItem[]) {
  const results = items.map(item => ({ id: item.id, published: canTransitionTo(item, 'published', existing), issues: validateCMSItem({ ...item, status: 'published' }, existing) }));
  return { allowed: results.every(x => x.published), results };
}
