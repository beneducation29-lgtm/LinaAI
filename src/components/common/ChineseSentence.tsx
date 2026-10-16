import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PinyinText } from './PinyinText';
import { VietnameseTranslation } from './VietnameseTranslation';

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
  const wordMatches = useMemo(() => vocabulary.filter((v) => v.hanzi && v.pinyin && v.vietnamese).sort((a, b) => b.hanzi.length - a.hanzi.length), [vocabulary]);
  const renderChinese = () => {
    if (!wordMatches.length) return hanzi;
    const parts: Array<{ text: string; word?: typeof wordMatches[number] }> = [];
    let index = 0;
    while (index < hanzi.length) {
      const match = wordMatches.find((v) => hanzi.startsWith(v.hanzi, index));
      if (match) { parts.push({ text: match.hanzi, word: match }); index += match.hanzi.length; }
      else { parts.push({ text: hanzi[index] }); index += 1; }
    }
    return parts.map((part, i) => part.word ? <button key={i} type="button" onClick={() => setSelectedWord(selectedWord === part.word!.hanzi ? null : part.word!.hanzi)} className={`rounded-sm transition-colors cursor-pointer ${selectedWord === part.word.hanzi ? 'bg-amber-200 text-amber-950 dark:bg-amber-700 dark:text-white underline decoration-2 underline-offset-4' : 'hover:bg-amber-100/80 dark:hover:bg-amber-900/40'}`} aria-pressed={selectedWord === part.word.hanzi} title="Bấm để xem từ vựng tương ứng">{part.text}</button> : <React.Fragment key={i}>{part.text}</React.Fragment>);
  };
  const selected = wordMatches.find((v) => v.hanzi === selectedWord);
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

  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {/* 1. Chinese Characters */}
      {showHanzi && (
        <div className={`font-cjk text-slate-900 dark:text-slate-50 ${hanziSizeClasses[size]}`}>
          {renderChinese()}
        </div>
      )}

      {/* 2. Pinyin */}
      {showPinyin && (
        <PinyinText pinyin={pinyin} size={pinyinSizeMap[size]} />
      )}

      {selected && (
        <div className="mt-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100" role="status" aria-live="polite">
          <div className="font-semibold">{selected.hanzi}</div>
          <div>{selected.pinyin}</div>
          <div>{selected.vietnamese}</div>
        </div>
      )}

      {/* 3. Vietnamese Translation */}
      {showVietnamese && (
        <VietnameseTranslation vietnamese={vietnamese} size={pinyinSizeMap[size]} />
      )}
    </div>
  );
};
