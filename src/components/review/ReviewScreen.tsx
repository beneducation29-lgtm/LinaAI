import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Flashcard } from '../flashcard/Flashcard';
import { VocabularyCard } from '../vocabulary/VocabularyCard';
import { LayerToggles } from '../common/LayerToggles';
import { ReviewRating } from '../../types';
import { Brain, RotateCcw, CheckCircle, Sparkles, BookMarked } from 'lucide-react';

export const ReviewScreen: React.FC = () => {
  const { flashcards, allVocabularies, updateFlashcardRating, setCurrentTab, user } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'saved'>('flashcards');
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const currentCard = flashcards[currentIndex];

  const handleRate = (rating: ReviewRating) => {
    if (!currentCard) return;

    updateFlashcardRating(currentCard.id, rating);
    setReviewedCount(count => count + 1);
    if (rating === 'good' || rating === 'easy') setCorrectCount(count => count + 1);

    if (currentIndex + 1 < flashcards.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsCompleted(false);
    setReviewedCount(0);
    setCorrectCount(0);
  };

  const savedVocabularies = allVocabularies.filter(v => user.savedVocabularyIds.includes(v.id));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-5">
      {/* Top Header & Segmented Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-amber-600" />
            <span>Ôn tập trí nhớ</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Lặp lại ngắt quãng (Spaced Repetition) để nhớ chữ Hán lâu dài
          </p>
        </div>

        {/* Tab switch: Flashcards vs Sổ từ đã lưu */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Thẻ nhớ ({flashcards.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] cursor-pointer flex items-center gap-1 ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Đã lưu ({savedVocabularies.length})</span>
          </button>
        </div>
      </div>

      <LayerToggles compact />

      {activeTab === 'flashcards' ? (
        !isCompleted && currentCard ? (
          <div className="space-y-4">
            {/* Progress Header */}
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
              <span>Thẻ số {currentIndex + 1} / {flashcards.length}</span>
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                Mục tiêu hôm nay: {flashcards.length} từ
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.round(((currentIndex) / flashcards.length) * 100)}%` }}
              />
            </div>

            {/* Flashcard Component */}
            <Flashcard
              key={currentCard.id}
              card={currentCard}
              onRate={handleRate}
            />
          </div>
        ) : (
          /* COMPLETION CARD */
          <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 text-center space-y-4 shadow-md">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              Hoàn thành ôn tập hôm nay!
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
              Bạn vừa hoàn thành <strong>{reviewedCount || flashcards.length} lượt ôn</strong>. Lina sẽ dùng kết quả này để đưa những từ khó quay lại sớm hơn và giãn những từ bạn đã nhớ.
            </p>

            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl max-w-sm mx-auto flex items-center justify-around text-center">
              <div>
                <span className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                  {flashcards.length}
                </span>
                <span className="text-[11px] text-stone-400 block">Từ đã ôn</span>
              </div>
              <div className="w-px h-8 bg-stone-200 dark:bg-stone-700" />
              <div>
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                  {reviewedCount ? Math.round((correctCount / reviewedCount) * 100) : 0}%
                </span>
                <span className="text-[11px] text-stone-400 block">Đúng</span>
              </div>
              <div className="w-px h-8 bg-stone-200 dark:bg-stone-700" />
              <div>
                <span className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                  {user.streakDays}
                </span>
                <span className="text-[11px] text-stone-400 block">Ngày chuỗi</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleRestart}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-stone-50 transition-colors min-h-[44px] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ôn lại lần nữa</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentTab('home')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs transition-colors min-h-[44px] cursor-pointer"
              >
                Trở về Trang chủ
              </button>
            </div>
          </div>
        )
      ) : (
        /* SAVED VOCABULARY LIST */
        <div className="space-y-3">
          {savedVocabularies.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
              <p className="text-sm text-stone-500">
                Bạn chưa lưu từ vựng nào. Hãy nhấn biểu tượng ⭐ trong bài học để lưu lại từ cần nhớ nhé!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedVocabularies.map((v) => (
                <VocabularyCard key={v.id} vocabulary={v} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
