import React from 'react';
import { BookOpen, BookmarkPlus, Check, ChevronLeft, ChevronRight, Headphones, Volume2 } from 'lucide-react';
import type { HSKLevel, Vocabulary } from '../../types';
import { accountStorageKey } from '../../services/accountStorage';
import { READING_STORY_SERIES, type ReadingStorySeries } from '../../data/readingStorySeries';

interface Props {
  ownerId: string;
  vocabularies: Vocabulary[];
  onSaveVocabulary: (id: string) => void;
  isVocabularySaved: (id: string) => boolean;
}
type Progress = Record<string, { completedAt: string; correct: number; total: number }>;
const STORAGE_KEY = 'lina-story-chapter-progress-v1';

function readProgress(ownerId: string): Progress {
  try {
    if (typeof window === 'undefined') return {};
    const parsed = JSON.parse(localStorage.getItem(accountStorageKey(STORAGE_KEY, ownerId)) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch { return {}; }
}

export const ReadingStoryLibrary: React.FC<Props> = ({ ownerId, vocabularies, onSaveVocabulary, isVocabularySaved }) => {
  const [storyId, setStoryId] = React.useState(READING_STORY_SERIES[0].id);
  const [levelFilter, setLevelFilter] = React.useState<HSKLevel | 'Tất cả'>('Tất cả');
  const [chapterIndex, setChapterIndex] = React.useState(0);
  const [showPinyin, setShowPinyin] = React.useState(true);
  const [showVietnamese, setShowVietnamese] = React.useState(true);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [progress, setProgress] = React.useState<Progress>(() => readProgress(ownerId));
  const [selectedWord, setSelectedWord] = React.useState<string | null>(null);

  React.useEffect(() => {
    setProgress(readProgress(ownerId));
    setAnswers({});
    setSubmitted(false);
    setSelectedWord(null);
  }, [ownerId]);

  const story = READING_STORY_SERIES.find(item => item.id === storyId) || READING_STORY_SERIES[0];
  const visibleStories = READING_STORY_SERIES.filter(item => levelFilter === 'Tất cả' || item.level === levelFilter);
  const chapter = story.chapters[chapterIndex] || story.chapters[0];
  const vocabularyByHanzi = React.useMemo(() => new Map(vocabularies.map(item => [item.hanzi, item])), [vocabularies]);
  const completed = story.chapters.filter(item => progress[item.id]).length;
  const score = chapter.questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);

  const chooseStory = (next: ReadingStorySeries) => { setStoryId(next.id); setChapterIndex(0); setAnswers({}); setSubmitted(false); setSelectedWord(null); };
  const chooseChapter = (index: number) => { setChapterIndex(index); setAnswers({}); setSubmitted(false); setSelectedWord(null); };
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  };
  const saveProgress = () => {
    const next = { ...progress, [chapter.id]: { completedAt: new Date().toISOString(), correct: score, total: chapter.questions.length } };
    setProgress(next);
    try { localStorage.setItem(accountStorageKey(STORAGE_KEY, ownerId), JSON.stringify(next)); } catch { /* session state remains available */ }
    setSubmitted(true);
  };
  const nextChapter = () => {
    if (chapterIndex < story.chapters.length - 1) chooseChapter(chapterIndex + 1);
    else {
      const nextStory = READING_STORY_SERIES[(READING_STORY_SERIES.findIndex(item => item.id === story.id) + 1) % READING_STORY_SERIES.length];
      chooseStory(nextStory);
    }
  };

  return <section className="space-y-4 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 p-4 shadow-sm dark:border-amber-950 dark:from-stone-900 dark:via-stone-900 dark:to-amber-950/10 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"><BookOpen className="h-5 w-5"/></div><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-amber-800 dark:text-amber-300">Lina chapter stories</p><h2 className="mt-1 text-lg font-black text-stone-900 dark:text-stone-100">Truyện đọc theo chương</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">Truyện nguyên bản của LinaAI, chia chương ngắn. Mỗi câu có chữ Hán, Pinyin và nghĩa tiếng Việt; hoàn thành câu hỏi để lưu tiến độ theo tài khoản.</p></div></div>
      <span className="rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-[10px] font-extrabold text-amber-900 dark:border-amber-900 dark:bg-stone-900 dark:text-amber-200">{READING_STORY_SERIES.length} truyện · HSK 1–6</span>
    </div>
    <div className="flex flex-wrap gap-2">{(['Tất cả', 'HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'] as Array<HSKLevel | 'Tất cả'>).map(level=><button key={level} type="button" onClick={()=>setLevelFilter(level)} aria-pressed={levelFilter===level} className={'min-h-9 rounded-full border px-3 text-xs font-bold '+(levelFilter===level?'border-amber-700 bg-amber-700 text-white':'border-stone-200 bg-white text-stone-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300')}>{level}</button>)}</div>
    <div className="grid gap-3 sm:grid-cols-2">
      {visibleStories.map(item=><button key={item.id} type="button" onClick={()=>chooseStory(item)} aria-pressed={story.id===item.id} className={'rounded-2xl border p-3 text-left transition '+(story.id===item.id?'border-amber-500 bg-amber-100/70 dark:bg-amber-950/30':'border-stone-200 bg-white hover:border-amber-300 dark:border-stone-700 dark:bg-stone-950')}><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">{item.level}</span><span className="text-[10px] font-bold text-stone-500">{item.chapters.filter(ch=>progress[ch.id]).length}/{item.chapters.length} chương</span></div><p className="mt-2 text-sm font-extrabold text-stone-900 dark:text-stone-100">{item.title}</p><p className="mt-0.5 font-cjk text-base text-amber-900 dark:text-amber-200">{item.titleZh}</p><p className="mt-1 text-xs leading-5 text-stone-500">{item.description}</p><p className="mt-2 text-[10px] font-semibold text-stone-400">{item.topic}</p></button>)}
    </div>
    <div className="rounded-2xl border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-950 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">{story.level} · {story.topic}</p><h3 className="mt-1 text-lg font-black text-stone-900 dark:text-stone-100">{story.title}</h3><p className="font-cjk text-base text-amber-800 dark:text-amber-200">{story.titleZh}</p></div><span className="text-xs font-bold tabular-nums text-stone-500">{completed}/{story.chapters.length} chương đã học</span></div>
      <div className="mt-3 flex flex-wrap gap-2">{story.chapters.map((item,index)=><button key={item.id} type="button" onClick={()=>chooseChapter(index)} aria-current={chapterIndex===index?'step':undefined} className={'min-h-10 rounded-xl border px-3 text-xs font-bold '+(chapterIndex===index?'border-amber-600 bg-amber-700 text-white':'border-stone-200 text-stone-600 hover:border-amber-400 dark:border-stone-700 dark:text-stone-300')}>{index+1}. {item.title}{progress[item.id]?' ✓':''}</button>)}</div>
    </div>
    <article className="rounded-2xl border border-stone-200 bg-[#fffefa] p-4 dark:border-stone-700 dark:bg-stone-950 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Chương {chapterIndex+1}/{story.chapters.length}</p><h4 className="mt-1 text-lg font-black text-stone-900 dark:text-stone-100">{chapter.title}</h4><p className="font-cjk text-xl text-amber-900 dark:text-amber-200">{chapter.titleZh}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={()=>speak(chapter.sentences.map(item=>item.chinese).join(''))} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-amber-700 px-3 text-xs font-bold text-white"><Headphones className="h-4 w-4"/> Nghe chương</button><button type="button" onClick={()=>{setShowPinyin(value=>!value);}} className="min-h-10 rounded-xl border border-stone-200 px-3 text-xs font-bold dark:border-stone-700">{showPinyin?'Ẩn Pinyin':'Hiện Pinyin'}</button><button type="button" onClick={()=>setShowVietnamese(value=>!value)} className="min-h-10 rounded-xl border border-stone-200 px-3 text-xs font-bold dark:border-stone-700">{showVietnamese?'Ẩn tiếng Việt':'Hiện tiếng Việt'}</button></div></div>
      <div className="mt-4 space-y-4">{chapter.sentences.map((sentence,index)=><div key={index} className="border-b border-stone-100 pb-3 last:border-0 dark:border-stone-800"><p className="font-cjk text-xl leading-[2] text-stone-900 dark:text-stone-100">{sentence.chinese}</p>{showPinyin&&<p className="mt-1 text-sm font-semibold text-sky-800 dark:text-sky-300">{sentence.pinyin}</p>}{showVietnamese&&<p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">{sentence.vietnamese}</p>}<button type="button" onClick={()=>speak(sentence.chinese)} className="mt-1 inline-flex min-h-8 items-center gap-1 text-[10px] font-bold text-sky-700 dark:text-sky-300"><Volume2 className="h-3.5 w-3.5"/> Nghe câu {index+1}</button></div>)}</div>
    </article>
    <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-950">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">Từ vựng trong chương</h4><p className="mt-1 text-xs text-stone-500">Chạm vào từ để xem nghĩa; chỉ lưu vào kho khi đã có mục từ chính xác.</p></div><span className="text-[10px] text-stone-400">{chapter.vocabulary.length} từ/cụm từ</span></div>
      <div className="mt-3 flex flex-wrap gap-2">{chapter.vocabulary.map(word=>{const saved=vocabularyByHanzi.get(word.hanzi);return <button key={word.hanzi} type="button" onClick={()=>setSelectedWord(current=>current===word.hanzi?null:word.hanzi)} className={'rounded-xl border px-3 py-2 text-left '+(selectedWord===word.hanzi?'border-amber-400 bg-amber-50 dark:bg-amber-950/30':'border-stone-200 dark:border-stone-700')}><span className="font-cjk font-bold text-stone-900 dark:text-stone-100">{word.hanzi}</span><span className="ml-2 text-[10px] text-stone-500">{word.pinyin}</span></button>})}</div>
      {selectedWord&&(()=>{const word=chapter.vocabulary.find(item=>item.hanzi===selectedWord);const saved=word?vocabularyByHanzi.get(word.hanzi):undefined;return word?<div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/20"><div><p className="font-cjk text-xl font-black">{word.hanzi}</p><p className="text-sm font-semibold text-amber-800 dark:text-amber-200">{word.pinyin} · {word.vietnamese}</p>{saved&&<p className="mt-1 text-[10px] text-stone-500">{saved.hskLevel} · Đã khớp kho từ vựng LinaAI</p>}</div><div className="flex items-center gap-2"><button type="button" onClick={()=>speak(word.hanzi)} className="grid h-9 w-9 place-items-center rounded-lg bg-white text-amber-800 dark:bg-stone-900"><Volume2 className="h-4 w-4"/></button>{saved&&!isVocabularySaved(saved.id)&&<button type="button" onClick={()=>onSaveVocabulary(saved.id)} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-amber-700 px-3 text-xs font-bold text-white"><BookmarkPlus className="h-3.5 w-3.5"/> Lưu từ</button>}{saved&&isVocabularySaved(saved.id)&&<span className="text-xs font-bold text-emerald-700 dark:text-emerald-300"><Check className="inline h-4 w-4"/> Đã lưu</span>}{!saved&&<span className="text-[10px] text-stone-500">Chưa có mục từ khớp trong kho</span>}</div></div>:null})()}
    </section>
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-950 dark:bg-amber-950/10"><h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">Đọc hiểu chương này</h4><div className="mt-3 space-y-3">{chapter.questions.map((question,index)=><fieldset key={index}><legend className="text-sm font-bold">{index+1}. {question.question}</legend><div className="mt-2 grid gap-2 sm:grid-cols-3">{question.options.map((option,optionIndex)=><label key={optionIndex} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-xs dark:border-stone-700 dark:bg-stone-950"><input type="radio" name={chapter.id+'-'+index} checked={answers[index]===optionIndex} disabled={submitted} onChange={()=>setAnswers(current=>({...current,[index]:optionIndex}))}/>{option}</label>)}</div>{submitted&&<p className="mt-1 text-xs text-stone-500">{answers[index]===question.answer?'Chính xác. ':'Đáp án: '+question.options[question.answer]+'. '}{question.explanation}</p>}</fieldset>)}</div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-bold text-stone-600 dark:text-stone-300">{submitted?'Kết quả: '+score+'/'+chapter.questions.length+' câu đúng':'Hoàn thành câu hỏi để lưu chương đã học.'}</p>{!submitted?<button type="button" disabled={Object.keys(answers).length!==chapter.questions.length} onClick={saveProgress} className="min-h-10 rounded-xl bg-amber-700 px-4 text-xs font-extrabold text-white disabled:opacity-40">Nộp bài & lưu tiến độ</button>:<button type="button" onClick={nextChapter} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-amber-700 px-4 text-xs font-extrabold text-white">{chapterIndex===story.chapters.length-1?'Truyện tiếp theo':'Chương tiếp theo'} <ChevronRight className="h-4 w-4"/></button>}</div>
    </section>
    <div className="flex items-center justify-between"><button type="button" disabled={chapterIndex===0} onClick={()=>chooseChapter(chapterIndex-1)} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-stone-200 px-3 text-xs font-bold disabled:opacity-40 dark:border-stone-700"><ChevronLeft className="h-4 w-4"/> Chương trước</button><span className="text-[10px] text-stone-400">Tiến độ được tách riêng theo tài khoản LinaAI</span><button type="button" disabled={chapterIndex===story.chapters.length-1} onClick={()=>chooseChapter(chapterIndex+1)} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-stone-200 px-3 text-xs font-bold disabled:opacity-40 dark:border-stone-700">Chương sau <ChevronRight className="h-4 w-4"/></button></div>
  </section>;
};
