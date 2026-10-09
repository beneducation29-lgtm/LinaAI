import type { ActivityItem, ActivitySRSItem, ActivityType, LearningSession, LearningSessionInput, RetrievalStage } from '../types/activity';
import type { HSKLevel } from '../types';

const DAY = 24 * 60 * 60 * 1000;
const skillTypes: Record<string, ActivityType[]> = {
  vocabulary: ['vocabulary-recall', 'multiple-choice', 'fill-blank', 'pinyin-recognition'],
  grammar: ['grammar-transformation', 'fill-blank', 'multiple-choice'],
  listening: ['listening-choice', 'listening-dictation', 'tone-discrimination'],
  speaking: ['speaking', 'roleplay', 'free-response'],
  reading: ['reading-comprehension', 'multiple-choice', 'translation'],
  writing: ['writing', 'free-response', 'translation'],
  pronunciation: ['pinyin-recognition', 'tone-recognition', 'tone-discrimination', 'shadowing'],
};

const stageFor = (type: ActivityType): RetrievalStage => {
  if (['multiple-choice','pinyin-recognition','tone-recognition','listening-choice','chinese-to-vietnamese'].includes(type)) return 'recognize';
  if (['vocabulary-recall','fill-blank','sentence-ordering','listening-dictation','tone-discrimination','grammar-transformation','translation'].includes(type)) return 'recall';
  return 'produce';
};

export function createActivity(input: Omit<ActivityItem, 'retrievalStage'>): ActivityItem {
  return { ...input, retrievalStage: stageFor(input.type) };
}

export function chooseAdaptiveDifficulty(mastery: number, recentErrorRate: number): Exclude<LearningSessionInput['reviewDue'][number], never>['schedule'] extends never ? never : 'EASY'|'NORMAL'|'CHALLENGING' {
  if (mastery < 40 || recentErrorRate >= 0.5) return 'EASY';
  if (mastery >= 80 && recentErrorRate < 0.2) return 'CHALLENGING';
  return 'NORMAL';
}

export function buildRetrievalSequence(base: ActivityItem): ActivityItem[] {
  const target = base.targetIds;
  const prefix = base.id;
  return [
    { ...base, id: prefix + '-recognize', retrievalStage: 'recognize', type: 'multiple-choice', targetIds: target },
    { ...base, id: prefix + '-recall', retrievalStage: 'recall', type: base.type === 'multiple-choice' ? 'vocabulary-recall' : base.type },
    { ...base, id: prefix + '-produce', retrievalStage: 'produce', type: 'free-response' },
  ];
}

export function scheduleActivityReview(current: ActivitySRSItem | undefined, correct: boolean, quality: 0|1|2|3|4|5 = correct ? 4 : 1): ActivitySRSItem {
  const now = new Date();
  const old = current?.schedule ?? { lastReviewed:null, nextReview:now.toISOString(), interval:0, ease:2.5, correctCount:0, incorrectCount:0, mastery:0 };
  let ease = old.ease;
  let interval = old.interval;
  if (!correct) { interval = 1; ease = Math.max(1.3, ease - 0.2); }
  else {
    ease = Math.max(1.3, Math.min(3, ease + (quality >= 5 ? 0.15 : quality <= 2 ? -0.1 : 0)));
    interval = Math.max(1, Math.round((interval || 1) * (quality >= 5 ? 2.5 : quality <= 2 ? 1.2 : ease)));
  }
  const correctCount = old.correctCount + (correct ? 1 : 0);
  const incorrectCount = old.incorrectCount + (correct ? 0 : 1);
  const attempts = correctCount + incorrectCount;
  const mastery = Math.min(100, Math.round((correctCount / Math.max(1, attempts)) * 70 + Math.min(interval,30) / 30 * 30));
  return {
    itemId: current?.itemId || 'unknown',
    itemType: current?.itemType || 'vocabulary',
    schedule: { lastReviewed:now.toISOString(), nextReview:new Date(now.getTime()+interval*DAY).toISOString(), interval, ease, correctCount, incorrectCount, mastery },
  };
}

export function isReviewDue(item: ActivitySRSItem, now = new Date()): boolean {
  return new Date(item.schedule.nextReview).getTime() <= now.getTime();
}

function minutesFor(total:number, count:number): number { return Math.max(1, Math.floor(total / Math.max(1,count))); }

export function generatePracticeSession(input: LearningSessionInput, catalog: ActivityItem[] = []): LearningSession {
  const minutes = Math.max(5, Math.round(input.availableTime));
  const dueIds = new Set(input.reviewDue.filter(item => isReviewDue(item)).map(x => x.itemId));
  const due = catalog.filter(x => dueIds.has(x.id));
  const weak = new Set(input.weakAreas.map(x => x.toLowerCase()));
  const eligible = catalog.filter(x => x.hskLevel === input.hskLevel && (weak.size === 0 || x.targetIds.some(id => weak.has(id.toLowerCase()))));
  const source = [...due, ...eligible.filter(x => !due.some(d => d.id === x.id)), ...catalog.filter(x => x.hskLevel === input.hskLevel)];
  const selected: ActivityItem[] = [];
  const usedTypes = new Set<ActivityType>();
  const skills = ['vocabulary','grammar','listening','speaking','reading','writing','pronunciation'];
  let cursor = 0;
  while (selected.length < Math.min(7, Math.max(3, Math.floor(minutes / 2))) && source.length) {
    const preferredSkill = skills[cursor % skills.length];
    const candidate = source.find(x => x.skill === preferredSkill && !usedTypes.has(x.type)) || source.find(x => !usedTypes.has(x.type)) || source[0];
    if (!candidate) break;
    selected.push(candidate);
    usedTypes.add(candidate.type);
    cursor++;
    const idx = source.indexOf(candidate);
    if (idx >= 0) source.splice(idx, 1);
  }
  const activities = selected.length ? selected : catalog.filter(x => x.hskLevel === input.hskLevel).slice(0,3);
  return {
    id: 'session-' + Date.now(),
    userId: input.userId,
    hskLevel: input.hskLevel,
    availableTime: minutes,
    activities,
    rationale: [
      due.length ? `Ưu tiên ${due.length} mục đến hạn ôn.` : 'Không có mục ôn bắt buộc trong dữ liệu đầu vào.',
      weak.size ? 'Xen kẽ nội dung thuộc vùng còn yếu.' : 'Phân bổ đa kỹ năng để tránh luyện một dạng quá lâu.',
      'Activity được trải từ recognition → recall → production khi catalog đủ dữ liệu.',
    ],
    generatedAt: new Date().toISOString(),
  };
}

export function getActivityTypesForSkill(skill: keyof typeof skillTypes): ActivityType[] {
  return [...skillTypes[skill]];
}

export function getListeningLadder(): Array<'slow'|'normal'|'no-pinyin'|'no-vietnamese'|'question'|'dictation'> {
  return ['slow','normal','no-pinyin','no-vietnamese','question','dictation'];
}

export function getReadingSupport(level: 'beginner'|'intermediate'|'advanced'): { chinese:boolean; pinyin:boolean; vietnamese:boolean } {
  if (level === 'beginner') return { chinese:true, pinyin:true, vietnamese:true };
  if (level === 'intermediate') return { chinese:true, pinyin:true, vietnamese:false };
  return { chinese:true, pinyin:false, vietnamese:false };
}
