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
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_USER_PROFILE;
  });

  const [preferences, setPreferences] = useState<DisplayPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_USER_PROFILE.preferences;
  });

  const [tutorMode, setTutorModeState] = useState<TutorMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TUTOR_MODE);
      if (saved === 'teacher' || saved === 'conversation') return saved;
    } catch {
      // fallback
    }
    return 'conversation';
  });

  const [learnerMemory, setLearnerMemory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEARNER_MEMORY);
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
    try { const saved=localStorage.getItem(STORAGE_KEYS.STRUCTURED_PROGRESS); if(saved) return JSON.parse(saved); } catch {} return {};
  });
  const [reviewSchedules, setReviewSchedules] = useState<Record<string, ReviewSchedule>>(() => {
    try { const saved=localStorage.getItem(STORAGE_KEYS.REVIEW_SCHEDULES); if(saved) return JSON.parse(saved); } catch {} return {};
  });
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => {
    try { const saved=localStorage.getItem(STORAGE_KEYS.MISTAKES); if(saved) return JSON.parse(saved); } catch {} return [];
  });
  const [structuredSavedVocabularyIds, setStructuredSavedVocabularyIds] = useState<string[]>(() => {
    try { const saved=localStorage.getItem(STORAGE_KEYS.STRUCTURED_SAVED); if(saved) return JSON.parse(saved); } catch {} return [];
  });
  const [allVocabularies] = useState<Vocabulary[]>(INITIAL_VOCABULARIES);
  const memoryRepoRef = React.useRef<MemoryRepository | null>(null);
  if (!memoryRepoRef.current) memoryRepoRef.current = createLocalMemoryRepository();
  const [aiMemory, setAiMemory] = useState<AIStoredMemory>(() => memoryRepoRef.current!.load());

  const [conversation, setConversation] = useState<Conversation>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATION);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CONVERSATION;
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_FLASHCARDS;
  });

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

  // Sync dark class on document element
  useEffect(() => {
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch {
      // ignore
    }
  }, [preferences]);

  // Sync user to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {
      // ignore
    }
  }, [user]);

  // Sync conversation
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATION, JSON.stringify(conversation));
    } catch {
      // ignore
    }
  }, [conversation]);

  // Sync flashcards
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(flashcards));
    } catch {
      // ignore
    }
  }, [flashcards]);

  // Sync tutor mode
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TUTOR_MODE, tutorMode);
    } catch {
      // ignore
    }
  }, [tutorMode]);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.STRUCTURED_PROGRESS, JSON.stringify(structuredProgress)); } catch {} }, [structuredProgress]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.REVIEW_SCHEDULES, JSON.stringify(reviewSchedules)); } catch {} }, [reviewSchedules]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes)); } catch {} }, [mistakes]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.STRUCTURED_SAVED, JSON.stringify(structuredSavedVocabularyIds)); } catch {} }, [structuredSavedVocabularyIds]);

  // Sync learner memory
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LEARNER_MEMORY, JSON.stringify(learnerMemory));
    } catch {
      // ignore
    }
  }, [learnerMemory]);

  const updateUser = (partial: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...partial }));
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

    // Increment today minutes slightly for practice
    updateUser({
      todayMinutesSpent: Math.min(user.dailyGoalMinutes, user.todayMinutesSpent + 1)
    });
  };

  const toggleSaveStructuredVocabulary = (id: string) => {
    setStructuredSavedVocabularyIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const isStructuredVocabularySaved = (id: string) => structuredSavedVocabularyIds.includes(id);
  const recordLearningResult = (itemId: string, correct: boolean, rating: ReviewRating = correct ? 'good' : 'again') => {
    setReviewSchedules(prev => ({ ...prev, [itemId]: scheduleReview({ ...(prev[itemId] || { itemId, lastReviewed: null, nextReview: new Date().toISOString(), interval: 0, ease: 2.5, correctCount: 0, incorrectCount: 0, mastery: 0 }) }, rating) }));
    const lesson = HSK1_LESSONS.find(l => l.vocabulary.some(v => v.id === itemId) || l.roleplay.id === itemId || l.speaking.some(s => s.id === itemId));
    if (lesson) setStructuredProgress(prev => {
      const current = prev[lesson.id] || { mastery: 0, speaking: 0, listening: 0, grammar: 0 };
      const next = Math.min(100, Math.max(0, current.mastery + (correct ? 10 : -5)));
      const speaking = itemId.includes('-sp') || itemId.includes('-rp') ? Math.min(100, current.speaking + (correct ? 15 : 0)) : current.speaking;
      return { ...prev, [lesson.id]: { ...current, mastery: next, speaking } };
    });
    if (correct) updateUser({ todayMinutesSpent: Math.min(user.dailyGoalMinutes, user.todayMinutesSpent + 1) });
  };
  const addMistake = (input: { type: MistakeType; original: string; corrected: string; explanation: string; mastery?: number; severity?: 'low'|'medium'|'high'; resolved?: boolean; relatedVocabulary?: string[]; relatedGrammar?: string[]; relatedPronunciation?: string[] }) => {
    const created = { ...input, id: 'mistake-' + Date.now(), frequency: 1, firstSeen: new Date().toISOString(), lastSeen: new Date().toISOString() } as MistakeRecord;
    setMistakes(prev => recordMistake(prev, input));
    setAiMemory(prev => updateMemory(prev, { mistake: created, weakVocabulary: input.type === 'vocabulary' ? input.original : undefined, grammarWeakness: input.type === 'grammar' ? input.corrected : undefined, pronunciationWeakness: input.type === 'tone' || input.type === 'pronunciation' ? input.original : undefined }));
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
        clearLearningMemory: () => { memoryRepoRef.current!.clear(); setAiMemory(emptyMemory()); setMistakes([]); },
        resetProgress: () => { setStructuredProgress({}); setReviewSchedules({}); setMistakes([]); memoryRepoRef.current!.clear(); setAiMemory(emptyMemory()); }
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
