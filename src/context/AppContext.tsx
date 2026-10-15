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
import { ReviewSchedule, MistakeRecord, MistakeType, AIStoredMemory, LearnerProfile, MemoryRepository } from '../types/learning';
import { LessonEngineLesson, LessonQuizResult, LessonCompletionResult } from '../types/lessonEngine';
import { syncEngine } from '../services/syncEngine';
import { accountStorageKey } from '../services/accountStorage';
import { analytics } from '../services/analytics';
import { getCurrentUser, login as loginAccountRequest, signup as signupAccountRequest, logout as logoutAccountRequest } from '../services/authService';
import type { AuthUser } from '../services/authService';
import type { SyncState, SyncRecord } from '../types/sync';
import { storage } from '../services/storage';
import { recordListeningAnswer, sanitizeListeningProgress } from '../services/listeningProgress';
import type { ListeningProgress } from '../services/listeningProgress';
import { findLessonForItem, updateLessonProgress } from '../services/progressService';
import { createLocalMemoryRepository, emptyMemory, updateMemory, syncMistakeMemory } from '../services/aiMemory';
import { buildLearnerMemory } from '../services/learningEngine';
import { scheduleReview, isDue, recordMistake } from '../services/learningEngine';
import { HSK1_LESSONS } from '../data/hsk1Lessons';
import { completeLesson } from '../services/lessonEngine';
import { MotivationState, MotivationActivityType } from '../types/motivation';
import { DailyGoalMinutes, getTodayStats, getMotivationSnapshot, loadMotivationState, recordMotivationActivity as applyMotivationActivity, saveMotivationState, MOTIVATION_STORAGE_KEY } from '../services/motivationEngine';
import { HSK_SPEAKING_VOCABULARY } from '../data/hskSpeakingVocabulary';
import { HSK_CLASSIC_VOCABULARY } from '../data/hskClassicVocabulary';
import { HSK_VI_MEANINGS } from '../data/hskVietnameseMeanings';
import { 
  INITIAL_USER_PROFILE, 
  LESSON_HSK1_1, 
  INITIAL_CONVERSATION, 
  INITIAL_FLASHCARDS,
  INITIAL_VOCABULARIES 
} from '../data/mockData';

export type TabType = 'home' | 'learn' | 'speak' | 'listening' | 'review' | 'profile';

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
  recordTutorMemory: (input: { fact?: string; topic?: string; summary?: string; goal?: string; preference?: string }) => void;
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
  listeningProgress: ListeningProgress;
  recordListeningQuizResult: (itemId: string, correct: boolean) => void;
  addMistake: (input: { type: MistakeType; original: string; corrected: string; explanation: string; mastery?: number; severity?: 'low'|'medium'|'high'; resolved?: boolean; relatedVocabulary?: string[]; relatedGrammar?: string[]; relatedPronunciation?: string[] }) => void;
  resolveMistake: (mistakeId: string) => void;
  reopenMistake: (mistakeId: string) => void;
  getDueReviewCount: () => number;
  learnerProfileMemory: () => ReturnType<typeof buildLearnerMemory>;
  aiMemory: AIStoredMemory;
  learnerProfile: LearnerProfile;
  clearLearningMemory: () => void;
  resetProgress: () => void;
  completeGeneratedLesson: (lesson: LessonEngineLesson, results: LessonQuizResult[]) => LessonCompletionResult;
  motivation: MotivationState;
  authUser: AuthUser | null;
  authScopeReady: boolean;
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
  STRUCTURED_SAVED: 'lina_structured_saved_v1',
  LISTENING_PROGRESS: 'lina_listening_progress_v1'
};

const legacyGuestStorageIsSafe = () => {
  try {
    const raw = storage.getItem(STORAGE_KEYS.USER);
    if (!raw) return true;
    const saved = JSON.parse(raw) as Partial<UserProfile>;
    return !saved.id || saved.id === INITIAL_USER_PROFILE.id;
  } catch {
    return false;
  }
};
const readStoredForGuest = (key: string) => {
  const scoped = storage.getItem(accountStorageKey(key, null));
  if (scoped !== null) return scoped;
  return legacyGuestStorageIsSafe() ? storage.getItem(key) : null;
};
const readAccountJson = <T,>(key: string, userId: string | null, fallback: T): T => {
  try {
    const raw = storage.getItem(accountStorageKey(key, userId)) ?? (!userId ? readStoredForGuest(key) : null);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
};
const readAccountString = (key: string, userId: string | null, fallback: string) => {
  const value = storage.getItem(accountStorageKey(key, userId)) ?? (!userId ? readStoredForGuest(key) : null);
  return value ?? fallback;
};
const listeningProgressStorageKey = (userId: string | null | undefined) =>
  accountStorageKey(STORAGE_KEYS.LISTENING_PROGRESS, userId);

const readListeningProgress = (userId: string | null | undefined): ListeningProgress => {
  try {
    const raw = storage.getItem(listeningProgressStorageKey(userId));
    return raw ? sanitizeListeningProgress(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [authScopeReady, setAuthScopeReady] = useState(false);
  const activeAccountIdRef = React.useRef<string | null>(null);
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = readStoredForGuest(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_USER_PROFILE;
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !user.onboardingCompleted);

  const [preferences, setPreferences] = useState<DisplayPreferences>(() => {
    try {
      const saved = readStoredForGuest(STORAGE_KEYS.PREFERENCES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_USER_PROFILE.preferences;
  });

  const [tutorMode, setTutorModeState] = useState<TutorMode>(() => {
    try {
      const saved = readStoredForGuest(STORAGE_KEYS.TUTOR_MODE);
      if (saved === 'teacher' || saved === 'conversation') return saved;
    } catch {
      // fallback
    }
    return 'conversation';
  });

  const [learnerMemory, setLearnerMemory] = useState<string[]>(() => {
    try {
      const saved = readStoredForGuest(STORAGE_KEYS.LEARNER_MEMORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [lessonSectionIndex, setLessonSectionIndex] = useState<number>(0);
  const [currentLesson] = useState<Lesson>(LESSON_HSK1_1);
  const [structuredProgress, setStructuredProgress] = useState<Record<string, { mastery: number; speaking: number; listening: number; grammar: number }>>(() => {
    try { const saved=readStoredForGuest(STORAGE_KEYS.STRUCTURED_PROGRESS); if(saved) return JSON.parse(saved); } catch {} return {};
  });
  const [reviewSchedules, setReviewSchedules] = useState<Record<string, ReviewSchedule>>(() => {
    try { const saved=readStoredForGuest(STORAGE_KEYS.REVIEW_SCHEDULES); if(saved) return JSON.parse(saved); } catch {} return {};
  });
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => {
    try { const saved=readStoredForGuest(STORAGE_KEYS.MISTAKES); if(saved) return JSON.parse(saved); } catch {} return [];
  });
  const [structuredSavedVocabularyIds, setStructuredSavedVocabularyIds] = useState<string[]>(() => {
    try { const saved=readStoredForGuest(STORAGE_KEYS.STRUCTURED_SAVED); if(saved) return JSON.parse(saved); } catch {} return [];
  });
  const [allVocabularies] = useState<Vocabulary[]>(() => {
    const byKey = new Map<string, Vocabulary>();
    for (const vocab of [...INITIAL_VOCABULARIES, ...HSK_CLASSIC_VOCABULARY]) {
      byKey.set(`${vocab.hanzi}|${vocab.pinyin.replace(/\s+/g, '')}`, vocab);
    }
    for (const vocab of HSK_SPEAKING_VOCABULARY) {
      const key = `${vocab.hanzi}|${vocab.pinyin.replace(/\s+/g, '')}`;
      const existing = byKey.get(key);
      byKey.set(key, existing ? {
        ...existing,
        ...vocab,
        tags: [...new Set([...(existing.tags || []), ...(vocab.tags || [])])]
      } : vocab);
    }
    return Array.from(byKey.values()).map(vocab => ({
      ...vocab,
      vietnamese: vocab.vietnamese?.trim() || HSK_VI_MEANINGS[vocab.hanzi] || 'Nghĩa tiếng Việt đang được bổ sung'
    }));
  });
  const memoryRepoRef = React.useRef<MemoryRepository | null>(null);
  if (!memoryRepoRef.current) memoryRepoRef.current = createLocalMemoryRepository(accountStorageKey('lina_ai_memory_v2', null));
  const [aiMemory, setAiMemory] = useState<AIStoredMemory>(() => memoryRepoRef.current!.load());
  const [motivation, setMotivation] = useState<MotivationState>(() => loadMotivationState(INITIAL_USER_PROFILE.dailyGoalMinutes, INITIAL_USER_PROFILE.streakDays, accountStorageKey(MOTIVATION_STORAGE_KEY, null)));
  const [listeningProgress, setListeningProgress] = useState<ListeningProgress>(() => readListeningProgress(null));
  const listeningProgressOwnerRef = React.useRef('guest');
  const skipListeningProgressPersistRef = React.useRef(false);
  const [syncState, setSyncState] = useState<SyncState>(() => ({ status: 'offline', lastSyncedAt: null, pendingCount: 0, error: null, userId: null }));
  const syncReadyRef = React.useRef(false);
  const [syncReady, setSyncReady] = useState(false);
  const applyingRemoteRef = React.useRef(false);

  const [conversation, setConversation] = useState<Conversation>(() => {
    try {
      const saved = readStoredForGuest(STORAGE_KEYS.CONVERSATION);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CONVERSATION;
  });

  const enrichFlashcard = (card: Flashcard): Flashcard => {
    const vocabulary = card.vocabulary;
    const curated = HSK_SPEAKING_VOCABULARY.find(item =>
      item.hanzi === vocabulary.hanzi &&
      item.pinyin.replace(/\s+/g, '') === vocabulary.pinyin.replace(/\s+/g, '')
    );
    return {
      ...card,
      vocabulary: {
        ...vocabulary,
        vietnamese: vocabulary.vietnamese?.trim() || curated?.vietnamese || HSK_VI_MEANINGS[vocabulary.hanzi] || 'Nghĩa tiếng Việt đang được bổ sung',
        exampleSentence: vocabulary.exampleSentence || curated?.exampleSentence
      }
    };
  };
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = readStoredForGuest(STORAGE_KEYS.FLASHCARDS);
      if (saved) {
        const parsed = JSON.parse(saved) as Flashcard[];
        if (Array.isArray(parsed)) {
          const existingIds = new Set(parsed.map(card => card.id));
          const starterExpansion = INITIAL_FLASHCARDS.filter(card => !existingIds.has(card.id));
          return (parsed.length < INITIAL_FLASHCARDS.length ? [...parsed, ...starterExpansion] : parsed).map(enrichFlashcard);
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_FLASHCARDS.map(enrichFlashcard);
  });

  useEffect(() => {
    const owner = authUser?.id || 'guest';
    listeningProgressOwnerRef.current = owner;
    skipListeningProgressPersistRef.current = true;
    setListeningProgress(readListeningProgress(owner));
  }, [authUser?.id]);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe(setSyncState);
    return () => { unsubscribe(); };
  }, []);
  useEffect(() => {
    analytics.track('app_open', { hskLevel: user.currentHsk });
  }, []);
  useEffect(() => {
    let mounted = true;
    void getCurrentUser().then(account => { if (mounted) { setAuthUser(account); setAuthResolved(true); } }).catch(() => { if (mounted) setAuthResolved(true); });
    return () => { mounted = false; };
  }, []);
  const resetLocalAccountState = (accountId: string | null, displayName?: string) => {
    const defaultProfile: UserProfile = {
      ...INITIAL_USER_PROFILE,
      ...(accountId ? { id: accountId, name: displayName || 'Học viên' } : {}),
    };
    const storedProfile = readAccountJson<UserProfile>(STORAGE_KEYS.USER, accountId, defaultProfile);
    const profile = !storedProfile || typeof storedProfile !== 'object' || (accountId && storedProfile.id !== accountId)
      ? defaultProfile : storedProfile;
    setUser(profile);
    const storedPreferences = readAccountJson<DisplayPreferences>(STORAGE_KEYS.PREFERENCES, accountId, profile.preferences);
    setPreferences(storedPreferences && typeof storedPreferences === 'object' ? storedPreferences : profile.preferences);
    setTutorModeState(readAccountString(STORAGE_KEYS.TUTOR_MODE, accountId, 'conversation') === 'teacher' ? 'teacher' : 'conversation');
    const storedLearnerMemory = readAccountJson<unknown>(STORAGE_KEYS.LEARNER_MEMORY, accountId, []);
    setLearnerMemory(Array.isArray(storedLearnerMemory) ? storedLearnerMemory.filter((item): item is string => typeof item === 'string').slice(-100) : []);
    const storedConversation = readAccountJson<unknown>(STORAGE_KEYS.CONVERSATION, accountId, INITIAL_CONVERSATION);
    setConversation(storedConversation && typeof storedConversation === 'object' && !Array.isArray(storedConversation) ? storedConversation as Conversation : INITIAL_CONVERSATION);
    const storedFlashcards = readAccountJson<unknown>(STORAGE_KEYS.FLASHCARDS, accountId, INITIAL_FLASHCARDS);
    setFlashcards((Array.isArray(storedFlashcards) ? storedFlashcards : INITIAL_FLASHCARDS).map(enrichFlashcard));
    const storedStructuredProgress = readAccountJson<unknown>(STORAGE_KEYS.STRUCTURED_PROGRESS, accountId, {});
    setStructuredProgress(storedStructuredProgress && typeof storedStructuredProgress === 'object' && !Array.isArray(storedStructuredProgress) ? storedStructuredProgress as Record<string, { mastery: number; speaking: number; listening: number; grammar: number }> : {});
    const storedReviewSchedules = readAccountJson<unknown>(STORAGE_KEYS.REVIEW_SCHEDULES, accountId, {});
    setReviewSchedules(storedReviewSchedules && typeof storedReviewSchedules === 'object' && !Array.isArray(storedReviewSchedules) ? storedReviewSchedules as Record<string, ReviewSchedule> : {});
    const storedMistakes = readAccountJson<unknown>(STORAGE_KEYS.MISTAKES, accountId, []);
    setMistakes(Array.isArray(storedMistakes) ? storedMistakes as MistakeRecord[] : []);
    const storedSavedVocabulary = readAccountJson<unknown>(STORAGE_KEYS.STRUCTURED_SAVED, accountId, []);
    setStructuredSavedVocabularyIds(Array.isArray(storedSavedVocabulary) ? storedSavedVocabulary.filter((item): item is string => typeof item === 'string') : []);
    memoryRepoRef.current = createLocalMemoryRepository(accountStorageKey('lina_ai_memory_v2', accountId));
    setAiMemory(memoryRepoRef.current.load());
    setMotivation(loadMotivationState(profile.dailyGoalMinutes, profile.streakDays, accountStorageKey(MOTIVATION_STORAGE_KEY, accountId)));
    const owner = accountId || 'guest';
    listeningProgressOwnerRef.current = owner;
    skipListeningProgressPersistRef.current = true;
    setListeningProgress(readListeningProgress(owner));
    setShowOnboarding(!profile.onboardingCompleted);
  };

  useEffect(() => {
    if (!authResolved) return;
    const accountId = authUser?.id || null;
    activeAccountIdRef.current = accountId;
    setAuthScopeReady(false);
    syncEngine.setUser(accountId);
    syncReadyRef.current = false;
    setSyncReady(false);
    resetLocalAccountState(accountId, authUser?.name);
    if (!authUser) { setAuthScopeReady(true); return; }
    const activeAccountId = authUser.id;
    void syncEngine.initialSync().then(synced => {
      if (activeAccountIdRef.current !== activeAccountId) return;
      setAuthScopeReady(true);
      // Do not enqueue local defaults over remote data when the initial pull failed.
      if (!synced) return;
      syncReadyRef.current = true;
      setSyncReady(true);
      setLearnerMemory(prev => {
        const seed = `Học viên tên là: ${authUser.name || 'Học viên'}`;
        return prev.includes(seed) ? prev : [...prev, seed].slice(-8);
      });
    });
  }, [authUser?.id, authResolved]);
  useEffect(() => {
    const handler = (event: Event) => {
      const record = (event as CustomEvent<SyncRecord>).detail;
      if (!record) return;
      applyingRemoteRef.current = true;
      try {
        switch(record.key) {
          case 'profile': setUser(record.data as UserProfile); break;
          case 'preferences': setPreferences(record.data as DisplayPreferences); break;
          case 'conversation': {
            const remoteConversation = record.data as Conversation;
            setConversation(local => {
              // Sync can finish while a learner is already speaking. Never replace a
              // newer local turn with a stale remote snapshot; merge messages by id
              // when both records belong to the same conversation.
              if (remoteConversation.id === local.id) {
                const merged = new Map<string, ConversationMessage>();
                for (const message of remoteConversation.messages || []) merged.set(message.id, message);
                for (const message of local.messages || []) merged.set(message.id, message);
                return {
                  ...remoteConversation,
                  ...local,
                  updatedAt: new Date(Math.max(
                    Date.parse(remoteConversation.updatedAt || '') || 0,
                    Date.parse(local.updatedAt || '') || 0
                  )).toISOString(),
                  messages: Array.from(merged.values()).sort(
                    (a, b) => Date.parse(a.timestamp || '') - Date.parse(b.timestamp || '')
                  )
                };
              }

              const remoteUpdated = Date.parse(remoteConversation.updatedAt || '') || 0;
              const localUpdated = Date.parse(local.updatedAt || '') || 0;
              return remoteUpdated > localUpdated ? remoteConversation : local;
            });
            break;
          }
          case 'flashcards': setFlashcards(record.data as Flashcard[]); break;
          case 'structuredProgress': setStructuredProgress(record.data as typeof structuredProgress); break;
          case 'reviewSchedules': setReviewSchedules(record.data as Record<string, ReviewSchedule>); break;
          case 'listeningProgress': setListeningProgress(sanitizeListeningProgress(record.data)); break;
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
  const loginAccount = async (email: string, password: string) => { const account = await loginAccountRequest(email, password); setAuthScopeReady(false); setAuthUser(account); };
  const signupAccount = async (email: string, password: string, name?: string) => { const account = await signupAccountRequest(email, password, name); if (account) { setAuthScopeReady(false); setAuthUser(account); } };
  const logoutAccount = async () => { setAuthScopeReady(false); await logoutAccountRequest(); syncEngine.setUser(null); setAuthUser(null); };
  const syncNow = async () => {
    const synced = await syncEngine.sync();
    if (!synced || !authUser || syncReadyRef.current) return;
    syncReadyRef.current = true;
    setSyncReady(true);
    setAuthScopeReady(true);
    setLearnerMemory(prev => {
      const seed = `Học viên tên là: ${authUser.name || 'Học viên'}`;
      return prev.includes(seed) ? prev : [...prev, seed].slice(-8);
    });
  };
  useEffect(() => {
    const handleOnline = () => { if (authUser && !syncReadyRef.current) void syncNow(); };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [authUser?.id]);
  useEffect(() => {
    if (!authUser || syncState.userId !== authUser.id || syncState.status !== 'synced' || syncReadyRef.current) return;
    syncReadyRef.current = true;
    setSyncReady(true);
    setAuthScopeReady(true);
    setLearnerMemory(prev => {
      const seed = `Học viên tên là: ${authUser.name || 'Học viên'}`;
      return prev.includes(seed) ? prev : [...prev, seed].slice(-8);
    });
  }, [authUser?.id, syncState.userId, syncState.status]);
  useEffect(() => {
    if (!authUser || !syncReady || !syncReadyRef.current || applyingRemoteRef.current) return;
    const enqueue = (key: any, data: unknown) => syncEngine.enqueue(key, data);
    enqueue('profile', user);
    enqueue('preferences', preferences);
    enqueue('conversation', conversation);
    enqueue('flashcards', flashcards);
    enqueue('structuredProgress', structuredProgress);
    enqueue('reviewSchedules', reviewSchedules);
    enqueue('listeningProgress', listeningProgress);
    enqueue('mistakes', mistakes);
    enqueue('structuredSavedVocabulary', structuredSavedVocabularyIds);
    enqueue('aiMemory', aiMemory);
    enqueue('motivation', motivation);
    enqueue('learnerMemory', learnerMemory);
  }, [authUser, syncReady, user, preferences, conversation, flashcards, structuredProgress, reviewSchedules, listeningProgress, mistakes, structuredSavedVocabularyIds, aiMemory, motivation, learnerMemory]);

  const speakingActivities = motivation.activities.filter(a => a.type === 'speaking' || a.type === 'pronunciation');
  const speakingScores = speakingActivities.map(a => Number(a.metadata?.score)).filter(Number.isFinite);
  const grammarLearnedCount = Object.values(structuredProgress).filter(p => p.grammar > 0).length;
  const speakingAccuracy = speakingScores.length ? Math.round(speakingScores.reduce((sum, score) => sum + score, 0) / speakingScores.length) : 0;
  const learnerProfile: LearnerProfile = {
    id: user.id, displayName: user.name, nativeLanguage: 'vi', targetLanguage: 'zh-CN', currentLevel: user.currentLevel, hskLevel: user.currentHsk,
    pinyinLevel: preferences.showPinyin ? 'marks' : 'hidden', learningGoal: user.learningGoal.category, dailyGoalMinutes: user.dailyGoalMinutes, streak: user.streakDays,
    totalStudyMinutes: motivation.activities.reduce((sum, activity) => sum + Math.max(0, activity.minutes || 0), 0),
    vocabularyStats: { learned: user.vocabularyLearnedCount, mastered: Object.values(reviewSchedules).filter(x => x.mastery >= 80).length, weak: aiMemory.weakVocabulary.length },
    grammarStats: { learned: grammarLearnedCount, weak: aiMemory.grammarWeaknesses.length },
    pronunciationStats: { accuracy: user.pronunciationAccuracy, weakTones: aiMemory.pronunciationWeaknesses },
    speakingStats: { practiceCount: speakingActivities.length, accuracy: speakingAccuracy },
    listeningStats: { practiceCount: motivation.activities.filter(a => a.type === 'listening').length, accuracy: 0 },
    readingStats: { practiceCount: motivation.activities.filter(a => a.type === 'reading').length, accuracy: 0 },
    writingStats: { practiceCount: motivation.activities.filter(a => a.type === 'writing').length, accuracy: 0 },
    weakAreas: [...new Set([...aiMemory.weakVocabulary, ...aiMemory.grammarWeaknesses, ...aiMemory.pronunciationWeaknesses])].slice(0,10),
    strongAreas: [],
    recentLessons: aiMemory.learningHistory.map(x=>x.lessonId).slice(-5),
    recentMistakes: aiMemory.mistakes.map(x=>x.original).slice(-5),
    preferredTopics: aiMemory.topics || [],
    lastActiveAt: aiMemory.lastConversationAt || new Date().toISOString()
  };

  useEffect(() => {
    const goal = user.learningGoal.category + ' · mục tiêu ' + user.learningGoal.targetHskLevel;
    setAiMemory(prev => updateMemory(prev, { goal }));
  }, [user.learningGoal.category, user.learningGoal.targetHskLevel]);

  useEffect(() => { memoryRepoRef.current!.save(aiMemory); }, [aiMemory]);
  useEffect(() => { saveMotivationState(motivation, accountStorageKey(MOTIVATION_STORAGE_KEY, authUser?.id)); }, [motivation, authUser?.id]);
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
      storage.setItem(accountStorageKey(STORAGE_KEYS.PREFERENCES, authUser?.id), JSON.stringify(preferences));
    } catch {
      // ignore
    }
  }, [preferences]);

  // Sync user to storage
  useEffect(() => {
    try {
      storage.setItem(accountStorageKey(STORAGE_KEYS.USER, authUser?.id), JSON.stringify(user));
    } catch {
      // ignore
    }
  }, [user]);

  // Sync conversation
  useEffect(() => {
    try {
      storage.setItem(accountStorageKey(STORAGE_KEYS.CONVERSATION, authUser?.id), JSON.stringify(conversation));
    } catch {
      // ignore
    }
  }, [conversation]);

  // Sync flashcards
  useEffect(() => {
    try {
      storage.setItem(accountStorageKey(STORAGE_KEYS.FLASHCARDS, authUser?.id), JSON.stringify(flashcards));
    } catch {
      // ignore
    }
  }, [flashcards]);

  // Sync tutor mode
  useEffect(() => {
    try {
      storage.setItem(accountStorageKey(STORAGE_KEYS.TUTOR_MODE, authUser?.id), tutorMode);
    } catch {
      // ignore
    }
  }, [tutorMode]);

  useEffect(() => { try { storage.setItem(accountStorageKey(STORAGE_KEYS.STRUCTURED_PROGRESS, authUser?.id), JSON.stringify(structuredProgress)); } catch {} }, [structuredProgress]);
  useEffect(() => {
    const owner = authUser?.id || 'guest';
    if (listeningProgressOwnerRef.current !== owner) return;
    if (skipListeningProgressPersistRef.current) {
      skipListeningProgressPersistRef.current = false;
      return;
    }
    try { storage.setItem(listeningProgressStorageKey(owner), JSON.stringify(listeningProgress)); } catch {}
  }, [listeningProgress, authUser?.id]);
  useEffect(() => { try { storage.setItem(accountStorageKey(STORAGE_KEYS.REVIEW_SCHEDULES, authUser?.id), JSON.stringify(reviewSchedules)); } catch {} }, [reviewSchedules]);
  useEffect(() => { try { storage.setItem(accountStorageKey(STORAGE_KEYS.MISTAKES, authUser?.id), JSON.stringify(mistakes)); } catch {} }, [mistakes]);
  useEffect(() => { try { storage.setItem(accountStorageKey(STORAGE_KEYS.STRUCTURED_SAVED, authUser?.id), JSON.stringify(structuredSavedVocabularyIds)); } catch {} }, [structuredSavedVocabularyIds]);

  // Sync learner memory
  useEffect(() => {
    try {
      storage.setItem(accountStorageKey(STORAGE_KEYS.LEARNER_MEMORY, authUser?.id), JSON.stringify(learnerMemory));
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
      return [...prev.slice(-8), fact];
    });
    setAiMemory(prev => updateMemory(prev, { fact }));
  };

  const recordTutorMemory = (input: { fact?: string; topic?: string; summary?: string; goal?: string; preference?: string }) => {
    setAiMemory(prev => updateMemory(prev, {
      fact: input.fact,
      topic: input.topic,
      conversationSummary: input.summary,
      goal: input.goal,
      preference: input.preference
    }));
    if (input.fact) {
      setLearnerMemory(prev => prev.includes(input.fact!) ? prev : [...prev.slice(-8), input.fact!]);
    }
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
    const now = new Date().toISOString();
    const ratedCard = flashcards.find(card => card.id === cardId);
    const existing = reviewSchedules[cardId] || {
      itemId: cardId,
      lastReviewed: null,
      nextReview: now,
      interval: 0,
      ease: 2.5,
      correctCount: 0,
      incorrectCount: 0,
      mastery: 0
    };
    // Compute the next schedule once so the schedule record and flashcard metadata
    // always advance from the same previous state.
    const next = scheduleReview(existing, rating);

    setReviewSchedules(prev => ({ ...prev, [cardId]: next }));
    setFlashcards(prev => prev.map(card => {
      if (card.id !== cardId) return card;
      return {
        ...card,
        nextReviewDate: next.nextReview,
        intervalDays: next.interval,
        repetitionCount: next.correctCount + next.incorrectCount,
        easeFactor: next.ease,
        lastRating: rating
      };
    }));

    setAiMemory(prev => updateMemory(prev, {
      masteredVocabulary: rating === 'easy' ? ratedCard?.vocabulary.hanzi : undefined,
      weakVocabulary: rating === 'again' || rating === 'hard' ? ratedCard?.vocabulary.hanzi : undefined
    }));
    recordMotivationActivity({ id: `review:${cardId}:${Date.now()}`, type: 'review', minutes: 1, vocabularyCount: 1, metadata: { cardId, rating } });
    analytics.track('vocabulary_review', { cardId, rating });
    if (rating === 'easy') analytics.track('vocabulary_mastered', { cardId });
  };

  const toggleSaveStructuredVocabulary = (id: string) => {
    setStructuredSavedVocabularyIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const isStructuredVocabularySaved = (id: string) => structuredSavedVocabularyIds.includes(id);
  const recordListeningQuizResult = (itemId: string, correct: boolean) => {
    setListeningProgress(previous => recordListeningAnswer(previous, itemId, correct));
    recordMotivationActivity({ id: `listening:${itemId}:${Date.now()}`, type: 'listening', minutes: 1, metadata: { itemId, correct } });
  };
  const recordLearningResult = (itemId: string, correct: boolean, rating: ReviewRating = correct ? 'good' : 'again') => {
    setReviewSchedules(prev => ({ ...prev, [itemId]: scheduleReview({ ...(prev[itemId] || { itemId, lastReviewed: null, nextReview: new Date().toISOString(), interval: 0, ease: 2.5, correctCount: 0, incorrectCount: 0, mastery: 0 }) }, rating) }));
    const lesson = findLessonForItem(HSK1_LESSONS, itemId);
    if (lesson) setStructuredProgress(prev => updateLessonProgress(prev, lesson.id, itemId, correct));
    const isSpeaking = itemId.includes('-sp') || itemId.includes('-rp');
    recordMotivationActivity({ id: `learning:${itemId}:${Date.now()}`, type: isSpeaking ? 'speaking' : 'review', minutes: 1, lessonId: lesson?.id, metadata: { correct } });
    if (lesson?.vocabulary.some(v => v.id === itemId)) { recordMotivationActivity({ id: `vocabulary:${itemId}:${Date.now()}`, type: 'vocabulary', minutes: 1, lessonId: lesson.id, vocabularyCount: 1, metadata: { correct } }); analytics.track('vocabulary_review', { vocabularyId: itemId, lessonId: lesson.id, correct, rating }); if (correct && rating !== 'again') analytics.track('vocabulary_mastered', { vocabularyId: itemId, lessonId: lesson.id }); }
  };
  const addMistake = (input: { type: MistakeType; original: string; corrected: string; explanation: string; mastery?: number; severity?: 'low'|'medium'|'high'; resolved?: boolean; relatedVocabulary?: string[]; relatedGrammar?: string[]; relatedPronunciation?: string[] }) => {
    analytics.track('mistake', { category: input.type, severity: input.severity || 'medium' });
    setMistakes(prev => {
      const next = recordMistake(prev, input);
      const match = next.find(m => m.type === input.type && m.original === input.original && m.corrected === input.corrected);
      if (match) {
        setAiMemory(memory => syncMistakeMemory(memory, match));
      }
      return next;
    });
  };
  const resolveMistake = (mistakeId: string) => {
    const now = new Date().toISOString();
    setMistakes(prev => {
      const current = prev.find(m => m.id === mistakeId);
      if (!current) return prev;
      const updated = { ...current, resolved: true, mastery: Math.max(70, current.mastery + 20), lastSeen: now };
      setAiMemory(memory => syncMistakeMemory(memory, updated));
      return prev.map(m => m.id === mistakeId ? updated : m);
    });
    analytics.track('mistake_resolved', { mistakeId });
  };

  const reopenMistake = (mistakeId: string) => {
    const now = new Date().toISOString();
    setMistakes(prev => {
      const current = prev.find(m => m.id === mistakeId);
      if (!current) return prev;
      const updated = { ...current, resolved: false, frequency: current.frequency + 1, mastery: Math.max(0, current.mastery - 10), lastSeen: now };
      setAiMemory(memory => syncMistakeMemory(memory, updated));
      return prev.map(m => m.id === mistakeId ? updated : m);
    });
    analytics.track('mistake_reopened', { mistakeId });
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
  const learnerProfileMemory = () => buildLearnerMemory({ level: user.currentHsk, goal: 'conversation', dailyMinutes: user.dailyGoalMinutes, preferredTopics: aiMemory.preferences, recentMistakes: aiMemory.mistakes.slice(-5).map(m=>m.original) }, aiMemory.mistakes);

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
        recordTutorMemory,
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
        listeningProgress,
        recordListeningQuizResult,
        addMistake,
        resolveMistake,
        reopenMistake,
        getDueReviewCount,
        learnerProfileMemory,
        aiMemory,
        learnerProfile,
        motivation,
      authUser,
      authScopeReady,
      syncState,
      loginAccount,
      signupAccount,
      logoutAccount,
      syncNow,
        motivationSnapshot: getMotivationSnapshot(motivation, mistakes.map(m => m.original)),
        setDailyGoalMinutes,
        recordMotivationActivity,
        clearLearningMemory: () => { memoryRepoRef.current!.clear(); setAiMemory(emptyMemory()); setMistakes([]); },
        resetProgress: () => { setStructuredProgress({}); setReviewSchedules({}); setListeningProgress({}); setMistakes([]); memoryRepoRef.current!.clear(); setAiMemory(emptyMemory()); },
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
