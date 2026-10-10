import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Flashcard } from '../flashcard/Flashcard';
import { VocabularyCard } from '../vocabulary/VocabularyCard';
import { LayerToggles } from '../common/LayerToggles';
import { ReviewRating } from '../../types';
import { MistakeRecord } from '../../types/learning';
import { buildReviewQueue, isDue } from '../../services/learningEngine';
import { Brain, RotateCcw, CheckCircle, Sparkles, BookMarked, Stethoscope, Check, RefreshCcw, Search } from 'lucide-react';

export const ReviewScreen: React.FC = () => {
  const { flashcards, allVocabularies, updateFlashcardRating, setCurrentTab, user, mistakes, resolveMistake, reopenMistake, reviewSchedules } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'saved' | 'clinic'>('flashcards');
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [savedQuery, setSavedQuery] = useState('');

  const reviewQueue = useMemo(() => {
    const now = new Date();
    const prioritized = buildReviewQueue(reviewSchedules, now);
    const priorityById = new Map(prioritized.map(item => [item.itemId, item.priorityScore]));
    const dueCards = [...flashcards]
      .filter(card => isDue(card.nextReviewDate || now.toISOString(), now))
      .sort((a, b) => (priorityById.get(b.id) ?? -1) - (priorityById.get(a.id) ?? -1));
    const freshCards = [...flashcards]
      .filter(card => !isDue(card.nextReviewDate || now.toISOString(), now))
      .sort((a, b) => {
        const urgency = (rating?: ReviewRating) => rating === 'again' ? 3 : rating === 'hard' ? 2 : rating === 'good' ? 1 : 0;
        return urgency(b.lastRating) - urgency(a.lastRating);
      });
    return [...dueCards, ...freshCards].slice(0, 20);
  }, [flashcards, reviewSchedules]);

  const currentCard = reviewQueue[currentIndex];

  const handleRate = (rating: ReviewRating) => {
    if (!currentCard) return;

    updateFlashcardRating(currentCard.id, rating);
    setReviewedCount(count => count + 1);
    if (rating === 'good' || rating === 'easy') setCorrectCount(count => count + 1);

    if (currentIndex + 1 < reviewQueue.length) {
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

  const normalizeSearchText = (value: unknown) =>
    String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  const savedVocabularies = allVocabularies.filter(v => user.savedVocabularyIds.includes(v.id));
  const normalizedSavedQuery = normalizeSearchText(savedQuery.trim());
  const filteredSavedVocabularies = savedVocabularies.filter(v => {
    if (!normalizedSavedQuery) return true;
    return [v.hanzi, v.pinyin, v.vietnamese, v.hskLevel]
      .some(value => normalizeSearchText(value).includes(normalizedSavedQuery));
  });
  const clinicMistakes = [...mistakes]
    .filter(m => !m.resolved)
    .sort((a, b) => {
      const severity = (value: MistakeRecord['severity']) => value === 'high' ? 3 : value === 'medium' ? 2 : 1;
      const score = (m: typeof a) => (100 - Math.min(100, m.mastery)) + Math.min(30, m.frequency * 5) + severity(m.severity) * 8;
      return score(b) - score(a) || Date.parse(b.lastSeen) - Date.parse(a.lastSeen);
    })
    .slice(0, 12);

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
          <button
            type="button"
            onClick={() => setActiveTab('clinic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] cursor-pointer flex items-center gap-1 ${
              activeTab === 'clinic'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Phòng lỗi ({clinicMistakes.length})</span>
          </button>
        </div>
      </div>

      <LayerToggles compact />

      {activeTab === 'flashcards' ? (
        !isCompleted && currentCard ? (
          <div className="space-y-4">
            {/* Progress Header */}
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
              <span>Thẻ số {currentIndex + 1} / {reviewQueue.length}</span>
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                Mục tiêu hôm nay: {reviewQueue.length} từ
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.round(((currentIndex) / Math.max(1, reviewQueue.length)) * 100)}%` }}
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
              Bạn vừa hoàn thành <strong>{reviewedCount} lượt ôn</strong>. Lina sẽ dùng kết quả này để đưa những từ khó quay lại sớm hơn và giãn những từ bạn đã nhớ.
            </p>

            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl max-w-sm mx-auto flex items-center justify-around text-center">
              <div>
                <span className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                  {reviewedCount}
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
      ) : activeTab === 'clinic' ? (
        <div className="space-y-3">
          <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-amber-700 dark:text-amber-300" />
              <div>
                <div className="font-bold">Mistake Clinic · chữa đúng lỗi đang lặp</div>
                <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">Lina ưu tiên lỗi chưa được xử lý. Khi bạn nắm được lỗi, đánh dấu đã nắm để Lina giảm ưu tiên; nếu vẫn sai, giữ lại để ôn sớm hơn.</div>
              </div>
            </div>
          </div>
          {clinicMistakes.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="font-bold mt-3">Hiện không có lỗi cần chữa.</div>
              <div className="text-xs text-stone-500 mt-1">Hãy tiếp tục học; Lina sẽ tự ghi nhận lỗi mới từ review, roleplay và speaking.</div>
            </div>
          ) : clinicMistakes.map(m => (
            <div key={m.id} className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 font-bold">{m.type}</span>
                    <span className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500">{m.frequency} lần</span>
                  </div>
                  <div className="mt-3 text-sm font-semibold">{m.original}</div>
                  <div className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">→ {m.corrected}</div>
                  <div className="mt-2 text-xs text-stone-500">{m.explanation}</div>
                </div>
                <div className="shrink-0 text-xs font-bold text-stone-400">{m.mastery}%</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => resolveMistake(m.id)} className="px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5"/>Đã nắm</button>
                <button type="button" onClick={() => reopenMistake(m.id)} className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-bold inline-flex items-center gap-1.5"><RefreshCcw className="w-3.5 h-3.5"/>Vẫn sai · ôn lại</button>
                {(m.relatedVocabulary?.length || m.relatedGrammar?.length) ? <button type="button" onClick={() => setCurrentTab('learn')} className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-bold">Mở bài học liên quan</button> : null}
              </div>
            </div>
          ))}
        </div>
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
            <>
              <label className="relative block">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden="true" />
                <input
                  type="search"
                  value={savedQuery}
                  onChange={event => setSavedQuery(event.target.value)}
                  placeholder="Tìm chữ Hán, pinyin, nghĩa tiếng Việt hoặc cấp HSK…"
                  aria-label="Tìm trong từ vựng đã lưu"
                  className="w-full min-h-11 pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm outline-none focus:ring-2 focus:ring-amber-500/60"
                />
              </label>
              <div className="flex items-center justify-between gap-3 text-xs text-stone-500" aria-live="polite">
                <span>
                  {savedQuery.trim() ? `Tìm thấy ${filteredSavedVocabularies.length} / ${savedVocabularies.length} từ đã lưu` : `${savedVocabularies.length} từ đã lưu`}
                </span>
                {savedQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => setSavedQuery('')}
                    className="font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400"
                  >
                    Xóa tìm kiếm
                  </button>
                )}
              </div>
              {filteredSavedVocabularies.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
                  <p className="text-sm text-stone-500">Không tìm thấy từ phù hợp. Thử chữ Hán, pinyin hoặc nghĩa tiếng Việt khác nhé.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredSavedVocabularies.map((v) => (
                    <VocabularyCard key={v.id} vocabulary={v} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
