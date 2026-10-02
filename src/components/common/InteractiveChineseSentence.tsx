import React, { useState } from 'react';
import { Volume2, Star, BookOpen, Mic, X } from 'lucide-react';
import { speechService } from '../../services/speech';
import { StructuredVocabulary } from '../../types/learning';
import { useApp } from '../../context/AppContext';

interface Props {
  chinese: string;
  pinyin: string;
  vietnamese: string;
  vocabulary: StructuredVocabulary[];
  className?: string;
}

export const InteractiveChineseSentence: React.FC<Props> = ({ chinese, pinyin, vietnamese, vocabulary, className = '' }) => {
  const { preferences, toggleSaveStructuredVocabulary, isStructuredVocabularySaved, setCurrentTab } = useApp();
  const [selected, setSelected] = useState<StructuredVocabulary | null>(null);
  const terms = vocabulary.slice().sort((a,b) => b.hanzi.length - a.hanzi.length);
  const chunks: Array<{text:string; vocab?:StructuredVocabulary}> = [];
  let remaining = chinese;
  while (remaining.length) {
    const match = terms.find(item => remaining.startsWith(item.hanzi));
    if (match) {
      chunks.push({text:match.hanzi, vocab:match});
      remaining = remaining.slice(match.hanzi.length);
    } else {
      chunks.push({text:remaining.charAt(0)});
      remaining = remaining.slice(1);
    }
  }

  return (
    <>
      <div className={'space-y-1 ' + className}>
        {preferences.showChinese && (
          <div className="font-cjk text-lg sm:text-xl leading-relaxed">
            {chunks.map((chunk,i) => chunk.vocab ? (
              <button key={i} type="button" onClick={() => setSelected(chunk.vocab)} className="hover:text-amber-700 dark:hover:text-amber-300 hover:underline decoration-dotted underline-offset-4 cursor-pointer">{chunk.text}</button>
            ) : <span key={i}>{chunk.text}</span>)}
          </div>
        )}
        {preferences.showPinyin && <div className="text-sm text-amber-700 dark:text-amber-300">{pinyin}</div>}
        {preferences.showVietnamese && <div className="text-sm text-stone-600 dark:text-stone-400">{vietnamese}</div>}
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-xl border border-stone-200 dark:border-stone-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div><div className="font-cjk text-3xl font-bold">{selected.hanzi}</div><div className="text-amber-700 dark:text-amber-300 font-medium">{selected.pinyin}</div><div className="text-stone-600 dark:text-stone-400">{selected.vietnamese}</div></div>
              <button type="button" onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"><X className="w-4 h-4"/></button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-5">
              <button type="button" onClick={() => speechService.speakChinese(selected.hanzi,{useGeminiTTS:true})} className="min-h-11 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center gap-2 text-sm font-semibold"><Volume2 className="w-4 h-4"/>Nghe</button>
              <button type="button" onClick={() => toggleSaveStructuredVocabulary(selected.id)} className="min-h-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300"><Star className="w-4 h-4"/>{isStructuredVocabularySaved(selected.id) ? 'Đã lưu' : 'Lưu'}</button>
              <button type="button" onClick={() => speechService.speakChinese(selected.exampleChinese,{useGeminiTTS:true})} className="min-h-11 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-2 text-sm font-semibold"><BookOpen className="w-4 h-4"/>Xem ví dụ</button>
              <button type="button" onClick={() => { setSelected(null); setCurrentTab('speak'); }} className="min-h-11 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-2 text-sm font-semibold"><Mic className="w-4 h-4"/>Luyện nói</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
