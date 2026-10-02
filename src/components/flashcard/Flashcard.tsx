import React, { useState } from 'react';
import { Flashcard as FlashcardType, ReviewRating } from '../../types';
import { textToSpeechService } from '../../services';
import { Volume2, RotateCcw, Sparkles } from 'lucide-react';
import { PinyinText } from '../common/PinyinText';
import { VietnameseTranslation } from '../common/VietnameseTranslation';

interface FlashcardProps {
  card: FlashcardType;
  onRate: (rating: ReviewRating) => void;
  className?: string;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  card,
  onRate,
  className = ''
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { vocabulary } = card;

  const handlePlay = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (isPlaying) return;
    setIsPlaying(true);
    await textToSpeechService.speak(text, 'zh-CN', () => {
      setIsPlaying(false);
    });
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRatingClick = (e: React.MouseEvent, rating: ReviewRating) => {
    e.stopPropagation();
    setIsFlipped(false);
    onRate(rating);
  };

  return (
    <div className={`w-full max-w-md mx-auto flex flex-col items-center ${className}`}>
      {/* 3D Flip Card Container */}
      <div 
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleFlip();
          }
        }}
        aria-label="Thẻ ghi nhớ từ vựng tiếng Trung, nhấn để lật mặt sau"
        className="w-full h-80 cursor-pointer [perspective:1000px] select-none focus:outline-hidden"
      >
        <div 
          className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] rounded-3xl ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* FRONT SIDE */}
          <div 
            className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white dark:bg-stone-900 rounded-3xl border-2 border-stone-200/90 dark:border-stone-800 shadow-md p-6 flex flex-col justify-between items-center text-center"
          >
            <div className="w-full flex justify-between items-center text-xs text-stone-400 font-medium">
              <span>{vocabulary.hskLevel}</span>
              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                Mặt trước · Nhớ nghĩa
              </span>
            </div>

            <div className="my-auto space-y-3">
              <div className="font-cjk text-6xl font-bold text-stone-900 dark:text-stone-50 tracking-wider">
                {vocabulary.hanzi}
              </div>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                Chạm vào thẻ để xem Pinyin và nghĩa
              </p>
            </div>

            <div className="w-full flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={(e) => handlePlay(e, vocabulary.hanzi)}
                className="min-h-[44px] min-w-[44px] px-3 py-2 flex items-center gap-1.5 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-stone-700 dark:text-stone-200 transition-colors"
                aria-label="Phát âm từ vựng"
              >
                <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-amber-600' : ''}`} />
                <span>Nghe</span>
              </button>

              <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5" /> Lật thẻ
              </span>
            </div>
          </div>

          {/* BACK SIDE */}
          <div 
            className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white dark:bg-stone-900 rounded-3xl border-2 border-amber-300 dark:border-amber-800/80 shadow-md p-6 flex flex-col justify-between items-center text-center"
          >
            <div className="w-full flex justify-between items-center text-xs text-amber-700 dark:text-amber-400 font-medium">
              <span>{vocabulary.partOfSpeech || 'Từ vựng'}</span>
              <span>Mặt sau · Đáp án</span>
            </div>

            <div className="my-auto space-y-2 w-full">
              <div className="font-cjk text-4xl font-bold text-stone-900 dark:text-stone-50">
                {vocabulary.hanzi}
              </div>
              
              <div className="py-1">
                <PinyinText pinyin={vocabulary.pinyin} size="lg" />
              </div>

              <div className="text-lg font-semibold text-stone-800 dark:text-stone-200">
                {vocabulary.vietnamese}
              </div>

              {vocabulary.exampleSentence && (
                <div className="mt-3 p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl text-left text-xs">
                  <div className="font-cjk font-medium text-stone-800 dark:text-stone-200">
                    {vocabulary.exampleSentence.hanzi}
                  </div>
                  <div className="text-amber-700 dark:text-amber-400 font-medium">
                    {vocabulary.exampleSentence.pinyin}
                  </div>
                  <div className="text-stone-500 dark:text-stone-400 italic">
                    {vocabulary.exampleSentence.vietnamese}
                  </div>
                </div>
              )}
            </div>

            <div className="w-full flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={(e) => handlePlay(e, `${vocabulary.hanzi}. ${vocabulary.exampleSentence?.hanzi || ''}`)}
                className="min-h-[44px] min-w-[44px] px-3 py-2 flex items-center gap-1.5 text-xs font-semibold rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors"
                aria-label="Phát âm câu và từ"
              >
                <Volume2 className="w-4 h-4" />
                <span>Nghe lại</span>
              </button>

              <span className="text-xs font-medium text-stone-400">
                Đánh giá mức độ nhớ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Response Controls */}
      <div className="w-full mt-6">
        <p className="text-center text-xs text-stone-500 dark:text-stone-400 mb-2 font-medium">
          {isFlipped ? 'Bạn thấy từ này thế nào?' : 'Lật thẻ trước khi chấm điểm'}
        </p>

        <div className="grid grid-cols-4 gap-2">
          {/* Rating 1: Again / Lại */}
          <button
            type="button"
            onClick={(e) => handleRatingClick(e, 'again')}
            className="flex flex-col items-center justify-center min-h-[50px] p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40 transition-colors font-medium text-xs"
          >
            <span className="font-semibold text-sm">Lại</span>
            <span className="text-[10px] opacity-75">&lt; 1 ngày</span>
          </button>

          {/* Rating 2: Khó */}
          <button
            type="button"
            onClick={(e) => handleRatingClick(e, 'hard')}
            className="flex flex-col items-center justify-center min-h-[50px] p-2 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40 transition-colors font-medium text-xs"
          >
            <span className="font-semibold text-sm">Khó</span>
            <span className="text-[10px] opacity-75">1 ngày</span>
          </button>

          {/* Rating 3: Tốt */}
          <button
            type="button"
            onClick={(e) => handleRatingClick(e, 'good')}
            className="flex flex-col items-center justify-center min-h-[50px] p-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 transition-colors font-medium text-xs"
          >
            <span className="font-semibold text-sm">Tốt</span>
            <span className="text-[10px] opacity-75">3 ngày</span>
          </button>

          {/* Rating 4: Dễ */}
          <button
            type="button"
            onClick={(e) => handleRatingClick(e, 'easy')}
            className="flex flex-col items-center justify-center min-h-[50px] p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 transition-colors font-medium text-xs"
          >
            <span className="font-semibold text-sm">Dễ</span>
            <span className="text-[10px] opacity-75">5 ngày</span>
          </button>
        </div>
      </div>
    </div>
  );
};
