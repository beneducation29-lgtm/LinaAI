import { HSK1_VOCABULARY } from '../data/hsk1Structured';
import { GrammarRecord, StructuredSentence, StructuredVocabulary } from '../types/learning';
import {
  LessonCompletionResult, LessonEngineLesson, LessonGenerationParameters,
  LessonQuizResult, LessonValidationResult
} from '../types/lessonEngine';
import { ReviewSchedule } from '../types/learning';
import { scheduleReview } from './learningEngine';
import { fetchWithControl } from './requestControl';
import { readCache, writeCache } from './cache';

const HSK_LEVELS = new Set(['HSK 1','HSK 2','HSK 3','HSK 4','HSK 5','HSK 6']);

const clean = (value: unknown, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export function validateLesson(lesson: LessonEngineLesson): LessonValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!lesson.id || !lesson.title || !lesson.description) errors.push('Lesson metadata is incomplete.');
  if (!HSK_LEVELS.has(lesson.hskLevel)) errors.push('Invalid HSK level.');
  if (!lesson.objectives.length) errors.push('Lesson must contain objectives.');
  if (!Number.isFinite(lesson.estimatedMinutes) || lesson.estimatedMinutes < 5 || lesson.estimatedMinutes > 180) errors.push('estimatedMinutes must be between 5 and 180.');
  if (!lesson.vocabulary.length) warnings.push('Lesson has no vocabulary.');

  const knownHsk1 = new Map(HSK1_VOCABULARY.map(v => [v.hanzi, v]));
  for (const v of lesson.vocabulary) {
    if (!v.hanzi || !v.pinyin || !v.vietnamese) errors.push(`Vocabulary ${v.id || '(unknown)'} must contain Chinese, Pinyin and Vietnamese.`);
    if (lesson.hskLevel === 'HSK 1') {
      const standard = knownHsk1.get(v.hanzi);
      if (!standard) errors.push(`HSK 1 vocabulary is not in the verified HSK 1 dataset: ${v.hanzi}`);
      else if (v.pinyin !== standard.pinyin || v.vietnamese !== standard.vietnamese) errors.push(`Vocabulary mismatch for ${v.hanzi}; generated content must match the verified HSK 1 record.`);
      else if (v.hskLevel !== standard.hskLevel) errors.push(`Invalid HSK label for ${v.hanzi}.`);
    }
  }

  const checkSentence = (s: StructuredSentence, label: string) => {
    if (!s.chinese || !s.pinyin || !s.vietnamese) errors.push(`${label} must contain Chinese, Pinyin and Vietnamese.`);
  };
  [...lesson.dialogue,...lesson.listening,...lesson.speaking,...lesson.reading,...lesson.writing].forEach((s,i)=>checkSentence(s, `Sentence ${i+1}`));

  lesson.grammar.forEach(g => {
    if (!g.pattern || !g.meaning || !g.explanationVi) errors.push(`Grammar ${g.id} is incomplete.`);
    g.examples.forEach(e => { if (!e.hanzi || !e.pinyin || !e.vietnamese) errors.push(`Grammar example in ${g.id} is incomplete.`); });
  });

  const vocabIds = new Set(lesson.vocabulary.map(v => v.id));
  const grammarIds = new Set(lesson.grammar.map(g => g.id));
  lesson.quiz.forEach(q => {
    if (!q.question || q.answer === undefined || !q.explanation) errors.push(`Quiz ${q.id} is incomplete.`);
    q.relatedVocabulary.forEach(id => { if (!vocabIds.has(id)) errors.push(`Quiz ${q.id} references unknown vocabulary ${id}.`); });
    q.relatedGrammar.forEach(id => { if (!grammarIds.has(id)) errors.push(`Quiz ${q.id} references unknown grammar ${id}.`); });
  });
  if (!lesson.quiz.length) errors.push('Lesson must contain at least one quiz question.');
  if (!lesson.review.length) errors.push('Lesson must contain review items.');
  return { valid: errors.length === 0, errors, warnings };
}

export function normalizeLesson(raw: Partial<LessonEngineLesson>, params: LessonGenerationParameters): LessonEngineLesson {
  const fallbackSentence: StructuredSentence = { id:'fallback-sentence', chinese:'', pinyin:'', vietnamese:'' };
  const lesson: LessonEngineLesson = {
    id: clean(raw.id,120) || `ai-lesson-${Date.now()}`,
    title: clean(raw.title,160) || `${params.topic} · bài học cá nhân hóa`,
    description: clean(raw.description,500),
    hskLevel: raw.hskLevel || params.hskLevel || 'HSK 1',
    level: raw.level || params.level,
    objectives: Array.isArray(raw.objectives) ? raw.objectives.map(x=>clean(x,240)).filter(Boolean) : [],
    vocabulary: Array.isArray(raw.vocabulary) ? raw.vocabulary as StructuredVocabulary[] : [],
    grammar: Array.isArray(raw.grammar) ? raw.grammar as GrammarRecord[] : [],
    dialogue: Array.isArray(raw.dialogue) ? raw.dialogue as StructuredSentence[] : [fallbackSentence],
    listening: Array.isArray(raw.listening) ? raw.listening as StructuredSentence[] : [],
    speaking: Array.isArray(raw.speaking) ? raw.speaking as StructuredSentence[] : [],
    reading: Array.isArray(raw.reading) ? raw.reading as StructuredSentence[] : [],
    writing: Array.isArray(raw.writing) ? raw.writing as StructuredSentence[] : [],
    roleplay: Array.isArray(raw.roleplay) ? raw.roleplay as LessonEngineLesson['roleplay'] : [],
    quiz: Array.isArray(raw.quiz) ? raw.quiz as LessonEngineLesson['quiz'] : [],
    review: Array.isArray(raw.review) ? raw.review as LessonEngineLesson['review'] : [],
    estimatedMinutes: Number(raw.estimatedMinutes) || params.duration,
    lessonType: raw.lessonType || params.lessonType || 'mixed',
    generatedAt: new Date().toISOString(),
    source: params.personalized ? 'personalized' : 'gemini'
  };
  return lesson;
}

export async function generateLesson(parameters: LessonGenerationParameters): Promise<LessonEngineLesson> {
  const cacheKey = `lesson:${parameters.hskLevel}:${parameters.level}:${parameters.topic}:${parameters.lessonType || 'mixed'}:${parameters.duration}`;
  if (!parameters.personalized) {
    const cached = readCache<LessonEngineLesson>(cacheKey, 24*60*60*1000);
    if (cached) return cached;
  }
  const response = await fetchWithControl('/api/lesson/generate', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ ...parameters, verifiedVocabulary: parameters.hskLevel === 'HSK 1' ? HSK1_VOCABULARY.filter(v => (parameters.targetVocabulary || []).includes(v.hanzi)) : [] })
  }, { timeoutMs: 30000, retries: 1 });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || `Lesson generation failed: HTTP ${response.status}`);
  const lesson = normalizeLesson(payload.lesson, parameters);
  const validation = validateLesson(lesson);
  if (!validation.valid) throw new Error(`Lesson validation failed: ${validation.errors.slice(0,4).join(' | ')}`);
  if (!parameters.personalized) writeCache(cacheKey, lesson);
  return lesson;
}

export function createPersonalizedLessonParameters(base: LessonGenerationParameters, memory: { weakVocabulary:string[]; grammarWeaknesses:string[]; mistakes:string[]; recentPerformance?:string[] }): LessonGenerationParameters {
  return {
    ...base,
    personalized: true,
    learnerWeaknesses: [...new Set([...(base.learnerWeaknesses||[]),...memory.grammarWeaknesses,...memory.weakVocabulary,...memory.mistakes])].slice(-20),
    goal: base.goal || 'Củng cố các điểm yếu gần đây'
  };
}

export function completeLesson(
  lesson: LessonEngineLesson,
  results: LessonQuizResult[],
  currentSchedules: Record<string, ReviewSchedule>
): { completion: LessonCompletionResult; schedules: Record<string, ReviewSchedule> } {
  const total = Math.max(1, lesson.quiz.length);
  const correctCount = results.filter(r=>r.correct).length;
  const accuracy = Math.round(correctCount / total * 100);
  const mastery = accuracy;
  const schedules = {...currentSchedules};
  lesson.quiz.forEach(q => {
    const result = results.find(r=>r.questionId===q.id);
    const rating = result?.correct ? (accuracy >= 90 ? 'easy' : accuracy >= 70 ? 'good' : 'hard') : 'again';
    schedules[q.id] = scheduleReview(schedules[q.id] || {itemId:q.id,lastReviewed:null,nextReview:new Date().toISOString(),interval:0,ease:2.5,correctCount:0,incorrectCount:0,mastery:0}, rating as any);
  });
  const mistakeIds = results.filter(r=>!r.correct && r.mistake).map((r,i)=>r.mistake?.original || `mistake-${i}`);
  return {
    completion:{lessonId:lesson.id,completedAt:new Date().toISOString(),accuracy,mastery,correctCount,totalCount:total,mistakeIds,reviewItemIds:lesson.review.map(r=>r.id)},
    schedules
  };
}