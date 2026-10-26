import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PinyinText } from './PinyinText';
import { VietnameseTranslation } from './VietnameseTranslation';
import { speechService } from '../../services/speech';
import { Volume2, X } from 'lucide-react';

interface ChineseSentenceProps {
  hanzi: string;
  pinyin: string;
  vietnamese: string;
  className?: string;
  size?: 'sm' | 'base' | 'lg' | 'xl';
  forceShowAll?: boolean;
  vocabulary?: Array<{ hanzi: string; pinyin: string; vietnamese: string }>;
}

export const ChineseSentence: React.FC<ChineseSentenceProps> = ({
  hanzi,
  pinyin,
  vietnamese,
  className = '',
  size = 'base',
  forceShowAll = false,
  vocabulary = []
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  useEffect(() => {
    setSelectedWord(null);
    setIsPlayingWord(false);
    speechService.stopSpeaking();
  }, [hanzi, pinyin, vietnamese]);

  useEffect(() => () => {
    speechService.stopSpeaking();
  }, []);

  const wordMatches = useMemo(
    () => vocabulary
      .filter((v) => v.hanzi?.trim() && v.pinyin?.trim() && v.vietnamese?.trim())
      .sort((a, b) => b.hanzi.length - a.hanzi.length),
    [vocabulary]
  );

  // Clear selection when the selected vocabulary is no longer present in a new message.
  const selected = wordMatches.find((v) => v.hanzi === selectedWord);
  const renderChinese = () => {
    if (!wordMatches.length) return hanzi;
    const parts: Array<{ text: string; word?: typeof wordMatches[number] }> = [];
    let index = 0;
    while (index < hanzi.length) {
      const match = wordMatches.find((v) => hanzi.startsWith(v.hanzi, index));
      if (match) {
        parts.push({ text: match.hanzi, word: match });
        index += match.hanzi.length;
      } else {
        parts.push({ text: hanzi[index] });
        index += 1;
      }
    }
    return parts.map((part, i) => part.word ? (
      <button
        key={`${part.word.hanzi}-${i}`}
        type="button"
        onClick={() => handleSelectWord(part.word!.hanzi)}
        className={`rounded-sm transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600 focus-visible:outline-offset-2 ${selectedWord === part.word.hanzi ? 'bg-amber-200 text-amber-950 dark:bg-amber-700 dark:text-white underline decoration-2 underline-offset-4' : 'hover:bg-amber-100/80 dark:hover:bg-amber-900/40'}`}
        aria-pressed={selectedWord === part.word.hanzi}
        aria-label={`Học từ ${part.word.hanzi}: ${part.word.pinyin}, ${part.word.vietnamese}`}
        title="Bấm để xem pinyin và nghĩa tiếng Việt"
      >
        {part.text}
      </button>
    ) : <React.Fragment key={`char-${i}`}>{part.text}</React.Fragment>);
  };

  const { preferences } = useApp();
  const showHanzi = forceShowAll || preferences.showChinese;
  const showPinyin = forceShowAll || preferences.showPinyin;
  const showVietnamese = forceShowAll || preferences.showVietnamese;

  const hanziSizeClasses = {
    sm: 'text-base font-medium tracking-wide',
    base: 'text-xl font-medium tracking-wide',
    lg: 'text-2xl font-semibold tracking-wide',
    xl: 'text-3xl font-bold tracking-wide'
  };
  const pinyinSizeMap: Record<'sm' | 'base' | 'lg' | 'xl', 'sm' | 'base' | 'lg'> = {
    sm: 'sm',
    base: 'base',
    lg: 'lg',
    xl: 'lg'
  };

  const handleSelectWord = (word: string) => {
    // A new selection must not leave audio from the previously selected word playing.
    speechService.stopSpeaking();
    setIsPlayingWord(false);
    setSelectedWord((current) => current === word ? null : word);
  };

  const playSelectedWord = async () => {
    if (!selected) return;
    if (isPlayingWord) {
      speechService.stopSpeaking();
      setIsPlayingWord(false);
      return;
    }
    setIsPlayingWord(true);
    await speechService.speakChinese(selected.hanzi, {
      onEnd: () => setIsPlayingWord(false),
      onError: () => setIsPlayingWord(false)
    });
  };

  return (
    <div
      className={`flex flex-col space-y-1 ${className}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && selectedWord) {
          speechService.stopSpeaking();
          setIsPlayingWord(false);
          setSelectedWord(null);
        }
      }}
    >
      {showHanzi && (
        <div className={`font-cjk text-slate-900 dark:text-slate-50 ${hanziSizeClasses[size]}`}>
          {renderChinese()}
        </div>
      )}

      {showPinyin && <PinyinText pinyin={pinyin} size={pinyinSizeMap[size]} />}

      {selected && (
        <div className="mt-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100" role="status" aria-live="polite">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Từ đang chọn</div>
              <div className="inline-flex rounded-md bg-amber-200/70 px-2 py-0.5 font-cjk text-lg font-semibold dark:bg-amber-800/60">{selected.hanzi}</div>
              <div className="mt-1 rounded-md bg-white/80 px-2 py-1 font-semibold text-amber-900 dark:bg-stone-900/70 dark:text-amber-200">
                <span className="mr-1 text-[10px] font-bold uppercase tracking-wide opacity-70">Pinyin</span>{selected.pinyin}
              </div>
              <div className="mt-1 rounded-md bg-white/80 px-2 py-1 text-stone-800 dark:bg-stone-900/70 dark:text-stone-100">
                <span className="mr-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Nghĩa</span>{selected.vietnamese}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={playSelectedWord} className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900" aria-label={isPlayingWord ? 'Dừng phát âm từ' : 'Nghe phát âm từ'}>
                <Volume2 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => { speechService.stopSpeaking(); setIsPlayingWord(false); setSelectedWord(null); }} className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900" aria-label="Đóng thẻ từ vựng">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showVietnamese && <VietnameseTranslation vietnamese={vietnamese} size={pinyinSizeMap[size]} />}
    </div>
  );
};
