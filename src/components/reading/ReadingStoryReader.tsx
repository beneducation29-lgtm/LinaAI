import React from 'react';
import { BookmarkPlus, Check, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import type { Vocabulary } from '../../types';

type Sentence = { chinese: string; pinyin: string; vietnamese: string };
interface Props {
  sentences: Sentence[];
  vocabularies: Vocabulary[];
  focusWords: string[];
  onSaveVocabulary: (id: string) => void;
  isVocabularySaved: (id: string) => boolean;
}

export const ReadingStoryReader: React.FC<Props> = ({ sentences, vocabularies, focusWords, onSaveVocabulary, isVocabularySaved }) => {
  const [selected, setSelected] = React.useState<{ word: string; sentence: number } | null>(null);
  const [translationVisible, setTranslationVisible] = React.useState(true);
  const [fontScale, setFontScale] = React.useState(1);
  const [completed, setCompleted] = React.useState<number[]>([]);
  const words = React.useMemo(() => [...vocabularies].filter(item => item.hanzi).sort((a,b) => b.hanzi.length-a.hanzi.length), [vocabularies]);
  const focus = React.useMemo(() => new Set(focusWords), [focusWords]);

  const tokenize = (text: string) => {
    const parts: Array<{ text: string; item?: Vocabulary }> = [];
    let cursor = 0;
    while (cursor < text.length) {
      const match = words.find(item => text.startsWith(item.hanzi, cursor));
      if (match) {
        parts.push({ text: match.hanzi, item: match });
        cursor += match.hanzi.length;
      } else {
        const next = words.find(item => text.indexOf(item.hanzi, cursor + 1) >= 0);
        const end = next ? text.indexOf(next.hanzi, cursor + 1) : text.length;
        parts.push({ text: text.slice(cursor, Math.max(cursor + 1, end)) });
        cursor = Math.max(cursor + 1, end);
      }
    }
    return parts;
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  };

  const progress = sentences.length ? Math.round(completed.length / sentences.length * 100) : 0;
  return <div className="overflow-hidden rounded-2xl border border-stone-200 bg-[#fffefa] dark:border-stone-700 dark:bg-stone-900">
    <div className="border-b border-stone-100 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 dark:border-stone-800 dark:from-stone-900 dark:to-stone-800 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-amber-800 dark:text-amber-300">Lina · Story Reader</p><p className="mt-1 text-xs text-stone-600 dark:text-stone-300">Chạm vào từ/cụm từ để xem nghĩa · Đọc từng đoạn theo nhịp của bạn</p></div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={()=>setFontScale(value=>Math.max(.85,Number((value-.1).toFixed(2))))} aria-label="Giảm cỡ chữ" className="grid h-9 w-9 place-items-center rounded-lg border border-stone-200 text-sm font-bold dark:border-stone-700">A−</button>
          <button type="button" onClick={()=>setFontScale(value=>Math.min(1.35,Number((value+.1).toFixed(2))))} aria-label="Tăng cỡ chữ" className="grid h-9 w-9 place-items-center rounded-lg border border-stone-200 text-sm font-bold dark:border-stone-700">A+</button>
          <button type="button" onClick={()=>setTranslationVisible(value=>!value)} className="ml-1 inline-flex h-9 items-center gap-1 rounded-lg border border-stone-200 px-2 text-xs font-bold dark:border-stone-700">{translationVisible?'Ẩn dịch':'Hiện dịch'} {translationVisible?<ChevronUp className="h-3.5 w-3.5"/>:<ChevronDown className="h-3.5 w-3.5"/>}</button>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-amber-100 dark:bg-stone-700"><div className="h-full rounded-full bg-amber-600 transition-all" style={{width:progress+'%'}}/></div><span className="text-[10px] font-bold tabular-nums text-stone-600 dark:text-stone-300">{completed.length}/{sentences.length} đoạn</span></div>
    </div>
    <div className="divide-y divide-stone-100 dark:divide-stone-800">
      {sentences.map((sentence,index)=><article key={index} className={'px-4 py-4 transition-colors sm:px-5 '+(completed.includes(index)?'bg-emerald-50/50 dark:bg-emerald-950/10':'')}>
        <div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Đoạn {index+1}</span><div className="flex items-center gap-1"><button type="button" onClick={()=>speak(sentence.chinese)} aria-label={'Nghe đoạn '+(index+1)} className="grid h-8 w-8 place-items-center rounded-lg text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950/40"><Volume2 className="h-4 w-4"/></button><button type="button" onClick={()=>setCompleted(current=>current.includes(index)?current.filter(value=>value!==index):[...current,index])} aria-label={completed.includes(index)?'Bỏ đánh dấu đã đọc':'Đánh dấu đã đọc'} className={'grid h-8 w-8 place-items-center rounded-lg '+(completed.includes(index)?'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300':'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800')}>{completed.includes(index)?<Check className="h-4 w-4"/>:<span className="text-xs">✓</span>}</button></div></div>
        <p className="font-cjk leading-[2.05] text-stone-900 dark:text-stone-100" style={{fontSize:(1.2*fontScale)+'rem'}}>{tokenize(sentence.chinese).map((part,partIndex)=>part.item?<button key={partIndex} type="button" onClick={()=>setSelected(current=>current?.word===part.text&&current.sentence===index?null:{word:part.text,sentence:index})} className={'rounded px-0.5 underline decoration-dotted underline-offset-4 '+(focus.has(part.text)?'decoration-amber-500':'decoration-sky-400')+' '+(selected?.word===part.text&&selected.sentence===index?'bg-amber-100 text-amber-950 dark:bg-amber-900/50 dark:text-amber-100':'hover:bg-sky-50 dark:hover:bg-sky-950/40')}>{part.text}</button>:<React.Fragment key={partIndex}>{part.text}</React.Fragment>)}</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-sky-800 dark:text-sky-300">{sentence.pinyin}</p>
        {translationVisible&&<p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">{sentence.vietnamese}</p>}
        {selected&&selected.sentence===index&&(()=>{const item=vocabularies.find(value=>value.hanzi===selected.word);return item?<div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900/60 dark:bg-amber-950/25"><div><p className="font-cjk text-lg font-extrabold text-amber-950 dark:text-amber-100">{item.hanzi}</p><p className="text-xs font-semibold text-amber-800 dark:text-amber-200">{item.pinyin} · {item.vietnamese}</p><p className="mt-0.5 text-[10px] text-amber-700 dark:text-amber-300">{item.hskLevel}</p></div><div className="flex items-center gap-2"><button type="button" onClick={()=>speak(item.hanzi)} className="grid h-9 w-9 place-items-center rounded-lg bg-white text-amber-800 dark:bg-stone-900 dark:text-amber-200" aria-label="Nghe từ"><Volume2 className="h-4 w-4"/></button>{!isVocabularySaved(item.id)&&<button type="button" onClick={()=>onSaveVocabulary(item.id)} className="inline-flex h-9 items-center gap-1 rounded-lg bg-amber-700 px-3 text-xs font-bold text-white"><BookmarkPlus className="h-3.5 w-3.5"/> Lưu từ</button>}{isVocabularySaved(item.id)&&<span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300"><Check className="h-4 w-4"/> Đã lưu</span>}</div></div>:null})()}
      </article>)}
    </div>
    <div className="border-t border-stone-100 bg-stone-50 px-4 py-2.5 text-[11px] leading-5 text-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400">Từ được gạch chân chấm là từ có trong kho từ vựng LinaAI. Tiến độ đánh dấu đoạn hiện lưu trong phiên đọc này.</div>
  </div>;
};
