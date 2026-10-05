import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  DisplayPreferences, 
  Lesson, 
  Conversation, 
  ConversationMessage, 
  Flashcard, 
  ReviewRating,
  Vocabulary,
  TutorMode 
} from '../types';
import { ReviewSchedule, MistakeRecord, MistakeType, AIStoredMemory, LearnerProfile } from '../types/learning';
import { LessonEngineLesson, LessonQuizResult, LessonCompletionResult } from '../types/lessonEngine';
import { syncEngine } from '../services/syncEngine';
import { analytics } from '../services/analytics';
import { getCurrentUser, login as loginAccountRequest, signup as signupAccountRequest, logout as logoutAccountRequest } from '../services/authService';
import type { AuthUser } from '../services/authService';
import type { SyncState, SyncRecord } from '../types/sync';
import { storage } from '../services/storage';
import { findLessonForItem, updateLessonProgress } from '../services/progressService';
import { createLocalMemoryRepository, emptyMemory, updateMemory } from '../services/aiMemory';
import { buildLearnerMemory } from '../services/learningEngine';
import { scheduleReview, isDue, recordMistake } from '../services/learningEngine';
import { HSK1_LESSONS } from '../data/hsk1Lessons';
import { completeLesson } from '../services/lessonEngine';
import { MotivationState, MotivationActivityType } from '../types/motivation';
import { DailyGoalMinutes, getTodayStats, getMotivationSnapshot, loadMotivationState, recordMotivationActivity as applyMotivationActivity, saveMotivationState } from '../services/motivationEngine';
import { HSK_SPEAKING_VOCABULARY } from '../data/hskSpeakingVocabulary';
import { 
  INITIAL_USER_PROFILE, 
  LESSON_HSK1_1, 
  INITIAL_CONVERSATION, 
  INITIAL_FLASHCARDS,
  INITIAL_VOCABULARIES 
} from '../data/mockData';

export type TabType = 'home' | 'learn' | 'speak' | 'review' | 'profile';

interface AppContextType {
  user: UserProfile;
  updateUser: (partial: Partial<UserProfile>) => void;
  preferences: DisplayPreferences;
  toggleDisplayOption: (key: keyof Omit<DisplayPreferences, 'theme'>) => void;
  toggleTheme: () => void;
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  currentLesson: Lesson;
  lessonSectionIndex: number;
  setLessonSectionIndex: (index: number) => void;
  conversation: Conversation;
  addMessage: (message: ConversationMessage) => void;
  clearConversation: () => void;
  tutorMode: TutorMode;
  setTutorMode: (mode: TutorMode) => void;
  learnerMemory: string[];
  addLearnerMemory: (fact: string) => void;
  flashcards: Flashcard[];
  allVocabularies: Vocabulary[];
  updateFlashcardRating: (cardId: string, rating: ReviewRating) => void;
  toggleSaveVocabulary: (vocabId: string) => void;
  isVocabularySaved: (vocabId: string) => boolean;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  completeOnboarding: (goalCategory: any, level: any, dailyMinutes: any) => void;
  structuredProgress: Record<string, { mastery: number; speaking: number; listening: number; grammar: number }>;
  reviewSchedules: Record<string, ReviewSchedule>;
  mistakes: MistakeRecord[];
  structuredSavedVocabularyIds: string[];
  toggleSaveStructuredVocabulary: (id: string) => void;
  isStructuredVocabularySaved: (id: string) => boolean;
  recordLearningResult: (itemId: string, correct: boolean, rating?: ReviewRating) => void;
  addMistake: (input: { type: MistakeType; original: string; corrected: string; explanation: string; mastery?: number; severity?: 'low'|'medium'|'high'; resolved?: boolean; relatedVocabulary?: string[]; relatedGrammar?: string[]; relatedPronunciation?: string[] }) => void;
  getDueReviewCount: () => number;
  learnerProfileMemory: () => ReturnType<typeof buildLearnerMemory>;
  aiMemory: AIStoredMemory;
  learnerProfile: LearnerProfile;
  clearLearningMemory: () => void;
  resetProgress: () => void;
  completeGeneratedLesson: (lesson: LessonEngineLesson, results: LessonQuizResult[]) => LessonCompletionResult;
  motivation: MotivationState;
  authUser: AuthUser | null;
  syncState: SyncState;
  loginAccount: (email: string, password: string) => Promise<void>;
  signupAccount: (email: string, password: string, name?: string) => Promise<void>;
  logoutAccount: () => Promise<void>;
  syncNow: () => Promise<void>;
  motivationSnapshot: ReturnType<typeof getMotivationSnapshot>;
  setDailyGoalMinutes: (minutes: DailyGoalMinutes) => void;
  recordMotivationActivity: (input: { id: string; type: MotivationActivityType; minutes: number; lessonId?: string; vocabularyCount?: number; metadata?: Record<string, string | number | boolean> }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'lina_user_profile_v1',
  CONVERSATION: 'lina_conversation_v1',
  FLASHCARDS: 'lina_flashcards_v1',
  PREFERENCES: 'lina_preferences_v1',
  TUTOR_MODE: 'lina_tutor_mode_v1',
  LEARNER_MEMORY: 'lina_learner_memory_v1',
  STRUCTURED_PROGRESS: 'lina_structured_progress_v1',
  REVIEW_SCHEDULES: 'lina_review_schedules_v1',
  MISTAKES: 'lina_mistakes_v1',
  STRUCTURED_SAVED: 'lina_structured_saved_v1'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = storage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_USER_PROFILE;
  });

  const [preferences, setPreferences] = useState<DisplayPreferences>(() => {
    try {
      const saved = storage.getItem(STORAGE_KEYS.PREFERENCES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_USER_PROFILE.preferences;
  });

  const [tutorMode, setTutorModeState] = useState<TutorMode>(() => {
    try {
      const saved = storage.getItem(STORAGE_KEYS.TUTOR_MODE);
      if (saved === 'teacher' || saved === 'conversation') return saved;
    } catch {
      // fallback
    }
    return 'conversation';
  });

  const [learnerMemory, setLearnerMemory] = useState<string[]>(() => {
    try {
      const saved = storage.getItem(STORAGE_KEYS.LEARNER_MEMORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [`Học viên tên là: ${INITIAL_USER_PROFILE.name}`, 'Quốc tịch: Việt Nam', 'Mục tiêu: Giao tiếp'];
  });

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [lessonSectionIndex, setLessonSectionIndex] = useState<number>(0);
  const [currentLesson] = useState<Lesson>(LESSON_HSK1_1);
  const [structuredProgress, setStructuredProgress] = useState<Record<string, { mastery: number; speaking: number; listening: number; grammar: number }>>(() => {
    try { const saved=storage.getItem(STORAGE_KEYS.STRUCTURED_PROGRESS); if(saved) return JSON.parse(saved); } catch {} return {};
  });
  const [reviewSchedules, setReviewSchedules] = useState<Record<string, ReviewSchedule>>(() => {
    try { const saved=storage.getItem(STORAGE_KEYS.REVIEW_SCHEDULES); if(saved) return JSON.parse(saved); } catch {} return {};
  });
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => {
    try { const saved=storage.getItem(STORAGE_KEYS.MISTAKES); if(saved) return JSON.parse(saved); } catch {} return [];
  });
  const [structuredSavedVocabularyIds, setStructuredSavedVocabularyIds] = useState<string[]>(() => {
    try { const saved=storage.getItem(STORAGE_KEYS.STRUCTURED_SAVED); if(saved) return JSON.parse(saved); } catch {} return [];
  });
  const [allVocabularies] = useState<Vocabulary[]>(() => {
    const merged = [...INITIAL_VOCABULARIES, ...HSK_SPEAKING_VOCABULARY];
    return Array.from(new Map(merged.map(v => [v.id, v])).values());
  });
  const memoryRepoRef = React.useRef<MemoryRepository | null>(null);
  if (!memoryRepoRef.current) memoryRepoRef.current = createLocalMemoryRepository();
  const [aiMemory, setAiMemory] = useState<AIStoredMemory>(() => memoryRepoRef.current!.load());
  const [motivation, setMotivation] = useState<MotivationState>(() => loadMotivationState(INITIAL_USER_PROFILE.dailyGoalMinutes, INITIAL_USER_PROFILE.streakDays));
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [syncState, setSyncState] = useState<SyncState>(() => ({ status: 'offline', lastSyncedAt: null, pendingCount: 0, error: null, userId: null }));
  const syncReadyRef = React.useRef(false);
  const applyingRemoteRef = React.useRef(false);

  const [conversation, setConversation] = useState<Conversation>(() => {
    try {
      const saved = storage.getItem(STORAGE_KEYS.CONVERSATION);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CONVERSATION;
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = storage.getItem(STORAGE_KEYS.FLASHCARDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_FLASHCARDS;
  });

  useEffect(() => syncEngine.subscribe(setSyncState), []);
  useEffect(() => {
    analytics.track('app_open', { hskLevel: user.currentHsk });
  }, []);
  useEffect(() => {
    let mounted = true;
    void getCurrentUser().then(account => { if (mounted) setAuthUser(account); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    syncEngine.setUser(authUser?.id || null);
    syncReadyRef.current = false;
    if (!authUser) return;
    setUser(prev => prev.id === authUser.id ? prev : { ...prev, id: authUser.id, name: authUser.name || prev.name });
    void syncEngine.initialSync().then(() => { syncReadyRef.current = true; });
  }, [authUser?.id]);
  useEffect(() => {
    const handler = (event: Event) => {
      const record = (event as CustomEvent<SyncRecord>).detail;
      if (!record) return;
      applyingRemoteRef.current = true;
      try {
        switch(record.key) {
          case 'profile': setUser(record.data as UserProfile); break;
          case 'preferences': setPreferences(record.data as DisplayPreferences); break;
          case 'conversation': setConversation(record.data as Conversation); break;
          case 'flashcards': setFlashcards(record.data as Flashcard[]); break;
          case 'structuredProgress': setStructuredProgress(record.data as typeof structuredProgress); break;
          case 'reviewSchedules': setReviewSchedules(record.data as Record<string, ReviewSchedule>); break;
          case 'mistakes': setMistakes(record.data as MistakeRecord[]); break;
          case 'structuredSavedVocabulary': setStructuredSavedVocabularyIds(record.data as string[]); break;
          case 'aiMemory': setAiMemory(record.data as AIStoredMemory); break;
          case 'motivation': setMotivation(record.data as MotivationState); break;
          case 'learnerMemory': setLearnerMemory(record.data as string[]); break;
        }
      } finally { window.setTimeout(() => { applyingRemoteRef.current = false; }, 0); }
    };
    window.addEventListener('lina:sync-remote', handler);
    return () => window.removeEventListener('lina:sync-remote', handler);
  }, []);
  const loginAccount = async (email: string, password: string) => { const account = await loginAccountRequest(email, password); setAuthUser(account); };
  const signupAccount = async (email: string, password: string, name?: string) => { const account = await signupAccountRequest(email, password, name); if (account) setAuthUser(account); };
  const logoutAccount = async () => { await logoutAccountRequest(); syncEngine.setUser(null); setAuthUser(null); };
  const syncNow = async () => { await syncEngine.sync(); };
  useEffect(() => {
    if (!authUser || !syncReadyRef.current || applyingRemoteRef.current) return;
    const enqueue = (key: any, data: unknown) => syncEngine.enqueue(key, data);
    enqueue('profile', user);
    enqueue('preferences', preferences);
    enqueue('conversation', conversation);
    enqueue('flashcards', flashcards);
    enqueue('structuredProgress', structuredProgress);
    enqueue('reviewSchedules', reviewSchedules);
    enqueue('mistakes', mistakes);
    enqueue('structuredSavedVocabulary', structuredSavedVocabularyIds);
    enqueue('aiMemory', aiMemory);
    enqueue('motivation', motivation);
    enqueue('learnerMemory', learnerMemory);
  }, [authUser, user, preferences, conversation, flashcards, structuredProgress, reviewSchedules, mistakes, structuredSavedVocabularyIds, aiMemory, motivation, learnerMemory]);

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return !user.onboardingCompleted;
  });

  const learnerProfile: LearnerProfile = {
    id: user.id, displayName: user.name, nativeLanguage: 'vi', targetLanguage: 'zh-CN', currentLevel: user.currentLevel, hskLevel: user.currentHsk,
    pinyinLevel: preferences.showPinyin ? 'marks' : 'hidden', learningGoal: user.learningGoal.category, dailyGoalMinutes: user.dailyGoalMinutes, streak: user.streakDays,
    totalStudyMinutes: user.todayMinutesSpent, vocabularyStats: { learned: user.vocabularyLearnedCount, mastered: user.vocabularyLearnedCount, weak: aiMemory.weakVocabulary.length },
    grammarStats: { learned: 0, weak: aiMemory.grammarWeaknesses.length }, pronunciationStats: { accuracy: user.pronunciationAccuracy, weakTones: aiMemory.pronunciationWeaknesses },
    speakingStats: { practiceCount: 0, accuracy: 0 }, listeningStats: { practiceCount: 0, accuracy: 0 }, readingStats: { practiceCount: 0, accuracy: 0 }, writingStats: { practiceCount: 0, accuracy: 0 },
    weakAreas: [...new Set([...aiMemory.weakVocabulary, ...aiMemory.grammarWeaknesses, ...aiMemory.pronunciationWeaknesses])].slice(0,10), strongAreas: [], recentLessons: aiMemory.learningHistory.map(x=>x.lessonId).slice(-5), recentMistakes: aiMemory.mistakes.map(x=>x.original).slice(-5), preferredTopics: aiMemory.preferences, lastActiveAt: new Date().toISOString()
  };

  useEffect(() => { memoryRepoRef.current!.save(aiMemory); }, [aiMemory]);
  useEffect(() => { saveMotivationState(motivation); }, [motivation]);
  useEffect(() => {
    const today=getTodayStats(motivation);
    const lessonCount=motivation.activities.filter(a=>a.type==='lesson').length;
    const vocabularyCount=motivation.activities.reduce((sum,a)=>sum+(a.type==='vocabulary'?Math.max(1,a.vocabularyCount||1):0),0);
    setUser(prev=>({...prev,dailyGoalMinutes:motivation.dailyGoalMinutes,todayMinutesSpent:today.minutes,streakDays:motivation.streakDays,
      ...(lessonCount ? { lessonsCompletedCount: lessonCount } : {}),
      ...(vocabularyCount ? { vocabularyLearnedCount: Math.max(prev.vocabularyLearnedCount, vocabularyCount) } : {})
    }));
  }, [motivation]);

  // Sync dark class on document element
  useEffect(() => {
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      storage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch {
      // ignore
    }
  }, [preferences]);

  // Sync user to storage
  useEffect(() => {
    try {
      storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {
      // ignore
    }
  }, [user]);

  // Sync conversation
  useEffect(() => {
    try {
      storage.setItem(STORAGE_KEYS.CONVERSATION, JSON.stringify(conversation));
    } catch {
      // ignore
    }
  }, [conversation]);

  // Sync flashcards
  useEffect(() => {
    try {
      storage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(flashcards));
    } catch {
      // ignore
    }
  }, [flashcards]);

  // Sync tutor mode
  useEffect(() => {
    try {
      storage.setItem(STORAGE_KEYS.TUTOR_MODE, tutorMode);
    } catch {
      // ignore
    }
  }, [tutorMode]);

  useEffect(() => { try { storage.setItem(STORAGE_KEYS.STRUCTURED_PROGRESS, JSON.stringify(structuredProgress)); } catch {} }, [structuredProgress]);
  useEffect(() => { try { storage.setItem(STORAGE_KEYS.REVIEW_SCHEDULES, JSON.stringify(reviewSchedules)); } catch {} }, [reviewSchedules]);
  useEffect(() => { try { storage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes)); } catch {} }, [mistakes]);
  useEffect(() => { try { storage.setItem(STORAGE_KEYS.STRUCTURED_SAVED, JSON.stringify(structuredSavedVocabularyIds)); } catch {} }, [structuredSavedVocabularyIds]);

  // Sync learner memory
  useEffect(() => {
    try {
      storage.setItem(STORAGE_KEYS.LEARNER_MEMORY, JSON.stringify(learnerMemory));
    } catch {
      // ignore
    }
  }, [learnerMemory]);

  const updateUser = (partial: Partial<UserProfile>) => { setUser(prev => ({ ...prev, ...partial })); };
  const setDailyGoalMinutes = (minutes: DailyGoalMinutes) => {
    setMotivation(prev => {
      const next = { ...prev, dailyGoalMinutes: minutes };
      const today = getTodayStats(next);
      if (today.minutes >= minutes && !next.activities.some(a => a.id === `daily-goal:${next.lastStudyDate || 'today'}`)) {
        return applyMotivationActivity(next, { id: `daily-goal:${next.lastStudyDate || 'today'}`, type: 'daily_goal', minutes: 0 });
      }
      return next;
    });
    setUser(prev => ({ ...prev, dailyGoalMinutes: minutes, learningGoal: { ...prev.learningGoal, targetMinutesPerDay: minutes } }));
  };
  const recordMotivationActivity = (input: { id: string; type: MotivationActivityType; minutes: number; lessonId?: string; vocabularyCount?: number; metadata?: Record<string, string | number | boolean> }) => {
    setMotivation(prev => applyMotivationActivity(prev, input));
  };

  const setTutorMode = (mode: TutorMode) => {
    setTutorModeState(mode);
  };

  const addLearnerMemory = (fact: string) => {
    if (!fact) return;
    setLearnerMemory(prev => {
      if (prev.includes(fact)) return prev;
      return [...prev.slice(-8), fact]; // Keep last 8 compact facts
    });
  };

  const toggleDisplayOption = (key: keyof Omit<DisplayPreferences, 'theme'>) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: !prev[key] };
      // Ensure at least one is enabled
      if (!next.showChinese && !next.showPinyin && !next.showVietnamese) {
        return prev;
      }
      return next;
    });
  };

  const toggleTheme = () => {
    setPreferences(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  const addMessage = (message: ConversationMessage) => {
    setConversation(prev => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      messages: [...prev.messages, message]
    }));
  };

  const clearConversation = () => {
    setConversation({
      ...INITIAL_CONVERSATION,
      id: `conv-${Date.now()}`,
      messages: [INITIAL_CONVERSATION.messages[0]]
    });
  };

  const updateFlashcardRating = (cardId: string, rating: ReviewRating) => {
    setFlashcards(prev => prev.map(card => {
      if (card.id !== cardId) return card;
      let intervalDelta = 1;
      if (rating === 'easy') intervalDelta = 4;
      if (rating === 'good') intervalDelta = 2;
      if (rating === 'hard') intervalDelta = 1;
      if (rating === 'again') intervalDelta = 0;

      return {
        ...card,
        intervalDays: Math.max(1, card.intervalDays + intervalDelta),
        repetitionCount: card.repetitionCount + 1,
        lastRating: rating
      };
    }));

    recordMotivationActivity({ id: `review:${cardId}:${Date.now()}`, type: 'review', minutes: 1, vocabularyCount: 1, metadata: { cardId } });
    analytics.track('vocabulary_review', { cardId, rating });
    if (rating === 'easy') analytics.track('vocabulary_mastered', { cardId });
  };

  const toggleSaveStructuredVocabulary = (id: string) => {
    setStructuredSavedVocabularyIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const isStructuredVocabularySaved = (id: string) => structuredSavedVocabularyIds.includes(id);
  const recordLearningResult = (itemId: string, correct: boolean, rating: ReviewRating = correct ? 'good' : 'again') => {
    setReviewSchedules(prev => ({ ...prev, [itemId]: scheduleReview({ ...(prev[itemId] || { itemId, lastReviewed: null, nextReview: new Date().toISOString(), interval: 0, ease: 2.5, correctCount: 0, incorrectCount: 0, mastery: 0 }) }, rating) }));
    const lesson = findLessonForItem(HSK1_LESSONS, itemId);
    if (lesson) setStructuredProgress(prev => updateLessonProgress(prev, lesson.id, itemId, correct));
    const isSpeaking = itemId.includes('-sp') || itemId.includes('-rp');
    recordMotivationActivity({ id: `learning:${itemId}:${Date.now()}`, type: isSpeaking ? 'speaking' : 'review', minutes: 1, lessonId: lesson?.id, metadata: { correct } });
    if (lesson?.vocabulary.some(v => v.id === itemId)) { recordMotivationActivity({ id: `vocabulary:${itemId}:${Date.now()}`, type: 'vocabulary', minutes: 1, lessonId: lesson.id, vocabularyCount: 1, metadata: { correct } }); analytics.track('vocabulary_review', { vocabularyId: itemId, lessonId: lesson.id, correct, rating }); if (correct && rating !== 'again') analytics.track('vocabulary_mastered', { vocabularyId: itemId, lessonId: lesson.id }); }
  };
  const addMistake = (input: { type: MistakeType; original: string; corrected: string; explanation: string; mastery?: number; severity?: 'low'|'medium'|'high'; resolved?: boolean; relatedVocabulary?: string[]; relatedGrammar?: string[]; relatedPronunciation?: string[] }) => {
    const created = { ...input, id: 'mistake-' + Date.now(), frequency: 1, firstSeen: new Date().toISOString(), lastSeen: new Date().toISOString() } as MistakeRecord;
    analytics.track('mistake', { category: input.type, severity: input.severity || 'medium' });
    setMistakes(prev => recordMistake(prev, input));
    setAiMemory(prev => updateMemory(prev, { mistake: created, weakVocabulary: input.type === 'vocabulary' ? input.original : undefined, grammarWeakness: input.type === 'grammar' ? input.corrected : undefined, pronunciationWeakness: input.type === 'tone' || input.type === 'pronunciation' ? input.original : undefined }));
  };
  const completeGeneratedLesson = (lesson: LessonEngineLesson, results: LessonQuizResult[]): LessonCompletionResult => {
    const outcome = completeLesson(lesson, results, reviewSchedules);
    setReviewSchedules(outcome.schedules);
    const generatedMistakes = results.filter(result => !result.correct && result.mistake).map(result => ({
      ...result.mistake!,
      id: 'lesson-mistake-' + Date.now() + '-' + result.questionId,
      frequency: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      severity: 'medium' as const,
      resolved: false,
      mastery: 0
    } as MistakeRecord));
    if (generatedMistakes.length) setMistakes(prev => generatedMistakes.reduce((acc, mistake) => recordMistake(acc, mistake), prev));
    setAiMemory(prev => {
      let next = updateMemory(prev, { lessonId: lesson.id, preference: lesson.title });
      for (const mistake of generatedMistakes) next = updateMemory(next, { mistake });
      return next;
    });
    setUser(prev => ({ ...prev, lessonsCompletedCount: prev.lessonsCompletedCount + 1 }));
    analytics.track('lesson_complete', { lessonId: lesson.id, hskLevel: lesson.hskLevel, minutes: lesson.estimatedMinutes });
    recordMotivationActivity({ id: `lesson:${lesson.id}:${outcome.completion.completedAt}`, type: 'lesson', minutes: Math.max(1, lesson.estimatedMinutes), lessonId: lesson.id, metadata: { hskLevel: lesson.hskLevel, lessonNumber: lesson.id.match(/(?:lesson-|hsk1-lesson-)(\d+)/)?.[1] || '', source: lesson.source } });
    setStructuredProgress(prev => {
      const current = prev[lesson.id] || { mastery: 0, speaking: 0, listening: 0, grammar: 0 };
      return { ...prev, [lesson.id]: {
        mastery: Math.max(current.mastery, outcome.completion.mastery),
        speaking: lesson.speaking.length ? Math.max(current.speaking, outcome.completion.accuracy) : current.speaking,
        listening: lesson.listening.length ? Math.max(current.listening, outcome.completion.accuracy) : current.listening,
        grammar: lesson.grammar.length ? Math.max(current.grammar, outcome.completion.accuracy) : current.grammar
      }};
    });
    return outcome.completion;
  };

  const getDueReviewCount = () => Object.values(reviewSchedules).filter(s => isDue(s.nextReview)).length;
  const learnerProfileMemory = () => buildLearnerMemory({ level: user.currentHsk, goal: 'conversation', dailyMinutes: user.dailyGoalMinutes, weakGrammar: aiMemory.grammarWeaknesses, weakVocabulary: aiMemory.weakVocabulary, weakTones: aiMemory.pronunciationWeaknesses, preferredTopics: aiMemory.preferences, recentMistakes: aiMemory.mistakes.slice(-5).map(m=>m.original) }, aiMemory.mistakes);

  const toggleSaveVocabulary = (vocabId: string) => {
    setUser(prev => {
      const isSaved = prev.savedVocabularyIds.includes(vocabId);
      const nextSaved = isSaved
        ? prev.savedVocabularyIds.filter(id => id !== vocabId)
        : [...prev.savedVocabularyIds, vocabId];
      return {
        ...prev,
        savedVocabularyIds: nextSaved
      };
    });
  };

  const isVocabularySaved = (vocabId: string) => {
    return user.savedVocabularyIds.includes(vocabId);
  };

  const completeOnboarding = (goalCategory: any, level: any, dailyMinutes: any) => {
    updateUser({
      currentLevel: level,
      dailyGoalMinutes: dailyMinutes,
      learningGoal: {
        ...user.learningGoal,
        category: goalCategory,
        targetMinutesPerDay: dailyMinutes
      },
      onboardingCompleted: true
    });
    addLearnerMemory(`Trình độ xuất phát: ${level}`);
    addLearnerMemory(`Mục tiêu học: ${goalCategory}`);
    setShowOnboarding(false);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        preferences,
        toggleDisplayOption,
        toggleTheme,
        currentTab,
        setCurrentTab,
        currentLesson,
        lessonSectionIndex,
        setLessonSectionIndex,
        conversation,
        addMessage,
        clearConversation,
        tutorMode,
        setTutorMode,
        learnerMemory,
        addLearnerMemory,
        flashcards,
        allVocabularies,
        updateFlashcardRating,
        toggleSaveVocabulary,
        isVocabularySaved,
        showOnboarding,
        setShowOnboarding,
        completeOnboarding,
        structuredProgress,
        reviewSchedules,
        mistakes,
        structuredSavedVocabularyIds,
        toggleSaveStructuredVocabulary,
        isStructuredVocabularySaved,
        recordLearningResult,
        addMistake,
        getDueReviewCount,
        learnerProfileMemory,
        aiMemory,
        learnerProfile,
        motivation,
      authUser,
      syncState,
      loginAccount,
      signupAccount,
      logoutAccount,
      syncNow,
        motivationSnapshot: getMotivationSnapshot(motivation, mistakes.map(m => m.original)),
        setDailyGoalMinutes,
        recordMotivationActivity,
        clearLearningMemory: () => { memoryRepoRef.current!.clear(); setAiMemory(emptyMemory()); setMistakes([]); },
        resetProgress: () => { setStructuredProgress({}); setReviewSchedules({}); setMistakes([]); memoryRepoRef.current!.clear(); setAiMemory(emptyMemory()); },
        completeGeneratedLesson
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
