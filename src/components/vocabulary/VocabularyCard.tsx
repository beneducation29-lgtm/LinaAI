import React, { useState } from 'react';
import { Vocabulary } from '../../types';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speech';
import { Volume2, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { PinyinText } from '../common/PinyinText';
import { VietnameseTranslation } from '../common/VietnameseTranslation';

interface VocabularyCardProps {
  vocabulary: Vocabulary;
  className?: string;
  showExampleByDefault?: boolean;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  vocabulary,
  className = '',
  showExampleByDefault = false
}) => {
  const { preferences, isVocabularySaved, toggleSaveVocabulary } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [showExample, setShowExample] = useState(showExampleByDefault);

  const isSaved = isVocabularySaved(vocabulary.id);

  const handlePlayAudio = async (text: string) => {
    if (isPlaying || !text.trim()) return;
    setIsPlaying(true);
    setPlaybackError(null);

    try {
      // Use the shared speech engine so lesson vocabulary benefits from
      // Gemini's Chinese voice and automatically falls back to browser speech.
      await speechService.speakChinese(text, {
        lang: 'zh-CN',
        rate: 0.75,
        useGeminiTTS: true,
        onStart: () => setPlaybackError(null),
        onError: () => setPlaybackError('Chưa phát được âm thanh. Bạn kiểm tra kết nối hoặc thử lại nhé.')
      });
    } catch {
      setPlaybackError('Chưa phát được âm thanh. Bạn kiểm tra kết nối hoặc thử lại nhé.');
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-4 transition-all duration-200 hover:border-amber-400/50 hover:shadow-xs ${className}`}>
      <div className="flex items-start justify-between gap-3">
        {/* Left: Chinese character, Pinyin, Vietnamese translation */}
        <div className="flex-1 space-y-1">
          {preferences.showChinese && (
            <div className="font-cjk text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-wide">
              {vocabulary.hanzi}
            </div>
          )}

          {preferences.showPinyin && (
            <div>
              <PinyinText pinyin={vocabulary.pinyin} size="base" />
            </div>
          )}

          {preferences.showVietnamese && (
            <div>
              <VietnameseTranslation vietnamese={vocabulary.vietnamese} size="base" />
            </div>
          )}

          {vocabulary.partOfSpeech && (
            <div className="pt-1 text-[11px] text-stone-400 dark:text-stone-500 font-medium">
              <span>{vocabulary.partOfSpeech}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>{vocabulary.hskLevel}</span>
            </div>
          )}
        </div>

        {/* Right: Functional Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => void handlePlayAudio(vocabulary.hanzi)}
            disabled={isPlaying}
            aria-busy={isPlaying}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors border ${
              isPlaying
                ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-200 animate-pulse'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-stone-700'
            }`}
            title="Nghe phát âm chuẩn"
            aria-label={isPlaying ? 'Đang phát từ vựng' : 'Nghe phát âm chuẩn'}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => toggleSaveVocabulary(vocabulary.id)}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors border ${
              isSaved
                ? 'bg-amber-500 border-amber-600 text-white shadow-xs'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-700'
            }`}
            title={isSaved ? 'Đã lưu từ vựng' : 'Lưu vào sổ từ'}
            aria-label={isSaved ? 'Đã lưu từ vựng' : 'Lưu vào sổ từ'}
          >
            <Star className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {playbackError && (
        <p role="status" className="mt-2 text-xs text-red-600 dark:text-red-400">
          {playbackError}
        </p>
      )}

      {/* Example Sentence Section */}
      {vocabulary.exampleSentence && (
        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/80">
          <button
            type="button"
            onClick={() => setShowExample(!showExample)}
            className="w-full flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 py-1"
          >
            <span>Ví dụ câu ứng dụng</span>
            {showExample ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showExample && (
            <div className="mt-2 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-cjk text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {vocabulary.exampleSentence.hanzi}
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    {vocabulary.exampleSentence.pinyin}
                  </div>
                  <div className="text-xs text-stone-600 dark:text-stone-300 italic">
                    {vocabulary.exampleSentence.vietnamese}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handlePlayAudio(vocabulary.exampleSentence!.hanzi)}
                  disabled={isPlaying}
                  aria-busy={isPlaying}
                  className="p-1.5 text-stone-500 hover:text-amber-700 dark:hover:text-amber-400 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-700 min-h-[36px] min-w-[36px] flex items-center justify-center disabled:opacity-50"
                  aria-label={isPlaying ? 'Đang phát câu ví dụ' : 'Nghe câu ví dụ'}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {vocabulary.notes && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-200/60 dark:border-stone-700/60">
                  {vocabulary.notes}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
