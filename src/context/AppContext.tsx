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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'lina_user_profile_v1',
  CONVERSATION: 'lina_conversation_v1',
  FLASHCARDS: 'lina_flashcards_v1',
  PREFERENCES: 'lina_preferences_v1',
  TUTOR_MODE: 'lina_tutor_mode_v1',
  LEARNER_MEMORY: 'lina_learner_memory_v1'
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
  const [allVocabularies] = useState<Vocabulary[]>(INITIAL_VOCABULARIES);

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
        completeOnboarding
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
