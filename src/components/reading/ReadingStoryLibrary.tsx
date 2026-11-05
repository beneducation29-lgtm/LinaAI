import React from 'react';
import { BookOpen, BookmarkPlus, Check, ChevronLeft, ChevronRight, Headphones, Volume2 } from 'lucide-react';
import type { HSKLevel, Vocabulary } from '../../types';
import { accountStorageKey } from '../../services/accountStorage';
import { READING_STORY_SERIES, type ReadingChapter, type ReadingStorySeries } from '../../data/readingStorySeries';
import { summarizeReadingProgress, type ReadingProgressMap } from '../../services/readingProgress';

interface Props {
  ownerId: string;
  vocabularies: Vocabulary[];
  onSaveVocabulary: (id: string) => void;
  isVocabularySaved: (id: string) => boolean;
}
type Progress = ReadingProgressMap;
const STORAGE_KEY = 'lina-story-chapter-progress-v1';

function readProgress(ownerId: string): Progress {
  try {
    if (typeof window === 'undefined') return {};
    const parsed = JSON.parse(localStorage.getItem(accountStorageKey(STORAGE_KEY, ownerId)) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch { return {}; }
}


interface ReadingToken {
  hanzi: string;
  pinyin: string;
  vietnamese: string;
  start: number;
  end: number;
  known: boolean;
}
function isHanCharacter(value: string): boolean {
  return /[\u3400-\u9fff]/.test(value);
}
function getPinyinSyllables(value: string): string[] {
  return value.match(/[A-Za-züÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňḿ]+/g) || [];
}
function hanIndexAt(chars: string[], targetIndex: number): number {
  let count = 0;
  for (let index = 0; index < targetIndex; index += 1) if (isHanCharacter(chars[index])) count += 1;
  return count;
}
function buildReadingTokens(chapter: ReadingChapter, appVocabulary: Vocabulary[]): ReadingToken[] {
  const tokens: ReadingToken[] = [];
  const uniqueVocabulary = new Map<string, { hanzi: string; pinyin: string; vietnamese: string }>();
  for (const item of chapter.vocabulary) uniqueVocabulary.set(item.hanzi, item);
  for (const item of appVocabulary) {
    if (!uniqueVocabulary.has(item.hanzi)) uniqueVocabulary.set(item.hanzi, { hanzi: item.hanzi, pinyin: item.pinyin, vietnamese: item.vietnamese });
  }
  const vocabulary = [...uniqueVocabulary.values()].sort((a, b) => Array.from(b.hanzi).length - Array.from(a.hanzi).length);
  let globalOffset = 0;
  for (const sentence of chapter.sentences) {
    const chars = Array.from(sentence.chinese);
    const syllables = getPinyinSyllables(sentence.pinyin);
    let localOffset = 0;
    let charIndex = 0;
    while (charIndex < chars.length) {
      const char = chars[charIndex];
      if (!isHanCharacter(char)) {
        localOffset += char.length;
        charIndex += 1;
        continue;
      }
      const match = vocabulary.find(item => chars.slice(charIndex, charIndex + Array.from(item.hanzi).length).join('') === item.hanzi);
      const length = match ? Array.from(match.hanzi).length : 1;
      const hanzi = chars.slice(charIndex, charIndex + length).join('');
      const fallbackParts = Array.from({ length }, (_, index) => syllables[hanIndexAt(chars, charIndex + index)] || '');
      const fallbackPinyin = fallbackParts.length === length && fallbackParts.every(Boolean) ? fallbackParts.join(' ') : '';
      tokens.push({
        hanzi,
        pinyin: match?.pinyin || fallbackPinyin,
        vietnamese: match?.vietnamese || 'Chưa có nghĩa trong danh sách từ vựng của chương này.',
        start: globalOffset + localOffset,
        end: globalOffset + localOffset + hanzi.length,
        known: Boolean(match),
      });
      localOffset += hanzi.length;
      charIndex += length;
    }
    globalOffset += sentence.chinese.length;
  }
  return tokens;
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
  const [selectedReadingToken, setSelectedReadingToken] = React.useState<ReadingToken | null>(null);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [activeAudioRange, setActiveAudioRange] = React.useState<{ start: number; end: number } | null>(null);

  React.useEffect(() => {
    setProgress(readProgress(ownerId));
    setAnswers({});
    setSubmitted(false);
    setSelectedWord(null);
    setSelectedReadingToken(null);
    setActiveAudioRange(null);
    setIsSpeaking(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, [ownerId]);

  const story = READING_STORY_SERIES.find(item => item.id === storyId) || READING_STORY_SERIES[0];
  const visibleStories = READING_STORY_SERIES.filter(item => levelFilter === 'Tất cả' || item.level === levelFilter);
  const chapter = story.chapters[chapterIndex] || story.chapters[0];
  const vocabularyByHanzi = React.useMemo(() => new Map(vocabularies.map(item => [item.hanzi, item])), [vocabularies]);
  const completed = story.chapters.filter(item => progress[item.id]).length;
  const progressSummary = React.useMemo(() => summarizeReadingProgress(READING_STORY_SERIES, progress), [progress]);
  const readingTokens = React.useMemo(() => buildReadingTokens(chapter, vocabularies), [chapter, vocabularies]);
  const readingText = chapter.sentences.map(item => item.chinese).join('');
  const score = chapter.questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setActiveAudioRange(null);
  };
  const chooseStory = (next: ReadingStorySeries) => { stopSpeaking(); setStoryId(next.id); setChapterIndex(0); setAnswers({}); setSubmitted(false); setSelectedWord(null); setSelectedReadingToken(null); };
  const chooseChapter = (index: number) => { stopSpeaking(); setChapterIndex(index); setAnswers({}); setSubmitted(false); setSelectedWord(null); setSelectedReadingToken(null); };
  const speak = (text: string, offset = 0) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.82;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onboundary = event => {
      const start = offset + event.charIndex;
      const length = event.charLength > 0 ? event.charLength : 1;
      setActiveAudioRange({ start, end: start + length });
    };
    utterance.onend = () => { setIsSpeaking(false); setActiveAudioRange(null); };
    utterance.onerror = () => { setIsSpeaking(false); setActiveAudioRange(null); };
    window.speechSynthesis.speak(utterance);
  };
  React.useEffect(() => () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);
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
    <section aria-label="Tổng quan tiến độ đọc" className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-amber-200 bg-white/90 p-3 dark:border-amber-950 dark:bg-stone-950"><p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Chương đã hoàn thành</p><p className="mt-1 text-2xl font-black tabular-nums text-stone-900 dark:text-stone-100">{progressSummary.completedChapters}<span className="ml-1 text-sm font-semibold text-stone-400">/ {progressSummary.totalChapters}</span></p><div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800"><div className="h-full rounded-full bg-amber-600" style={{ width: progressSummary.totalChapters ? (progressSummary.completedChapters / progressSummary.totalChapters * 100) + '%' : '0%' }} /></div></div>
      <div className="rounded-2xl border border-amber-200 bg-white/90 p-3 dark:border-amber-950 dark:bg-stone-950"><p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Độ chính xác đọc hiểu</p><p className="mt-1 text-2xl font-black tabular-nums text-stone-900 dark:text-stone-100">{progressSummary.accuracy}<span className="ml-1 text-sm font-semibold text-stone-400">%</span></p><p className="mt-2 text-[11px] text-stone-500">{progressSummary.completedQuestions}/{progressSummary.totalQuestions} câu đúng trong các chương đã nộp</p></div>
      <div className="rounded-2xl border border-amber-200 bg-white/90 p-3 dark:border-amber-950 dark:bg-stone-950"><p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Lộ trình HSK</p><div className="mt-2 flex flex-wrap gap-1.5">{progressSummary.byLevel.map(item=><button key={item.level} type="button" onClick={()=>{setLevelFilter(item.level);const first=READING_STORY_SERIES.find(storyItem=>storyItem.level===item.level);if(first)chooseStory(first);}} aria-label={item.level+' '+item.completedChapters+' trên '+item.totalChapters+' chương'} className="rounded-lg border border-stone-200 px-2 py-1 text-[10px] font-bold text-stone-600 hover:border-amber-400 dark:border-stone-700 dark:text-stone-300">{item.level.replace('HSK ', '')}: {item.completedChapters}/{item.totalChapters}</button>)}</div></div>
    </section>
    <div className="flex flex-wrap gap-2">{(['Tất cả', 'HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'] as Array<HSKLevel | 'Tất cả'>).map(level=><button key={level} type="button" onClick={()=>{setLevelFilter(level);if(level!=="Tất cả"){const first=READING_STORY_SERIES.find(item=>item.level===level);if(first)chooseStory(first);}}} aria-pressed={levelFilter===level} className={'min-h-9 rounded-full border px-3 text-xs font-bold '+(levelFilter===level?'border-amber-700 bg-amber-700 text-white':'border-stone-200 bg-white text-stone-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300')}>{level}</button>)}</div>
    <div className="grid gap-3 sm:grid-cols-2">
      {visibleStories.map(item=><button key={item.id} type="button" onClick={()=>chooseStory(item)} aria-pressed={story.id===item.id} className={'rounded-2xl border p-3 text-left transition '+(story.id===item.id?'border-amber-500 bg-amber-100/70 dark:bg-amber-950/30':'border-stone-200 bg-white hover:border-amber-300 dark:border-stone-700 dark:bg-stone-950')}><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">{item.level}</span><span className="text-[10px] font-bold text-stone-500">{item.chapters.filter(ch=>progress[ch.id]).length}/{item.chapters.length} chương</span></div><p className="mt-2 text-sm font-extrabold text-stone-900 dark:text-stone-100">{item.title}</p><p className="mt-0.5 font-cjk text-base text-amber-900 dark:text-amber-200">{item.titleZh}</p><p className="mt-1 text-xs leading-5 text-stone-500">{item.description}</p><p className="mt-2 text-[10px] font-semibold text-stone-400">{item.topic}</p></button>)}
    </div>
    <div className="rounded-2xl border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-950 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">{story.level} · {story.topic}</p><h3 className="mt-1 text-lg font-black text-stone-900 dark:text-stone-100">{story.title}</h3><p className="font-cjk text-base text-amber-800 dark:text-amber-200">{story.titleZh}</p></div><span className="text-xs font-bold tabular-nums text-stone-500">{completed}/{story.chapters.length} chương đã học</span></div>
      <div className="mt-3 flex flex-wrap gap-2">{story.chapters.map((item,index)=><button key={item.id} type="button" onClick={()=>chooseChapter(index)} aria-current={chapterIndex===index?'step':undefined} className={'min-h-10 rounded-xl border px-3 text-xs font-bold '+(chapterIndex===index?'border-amber-600 bg-amber-700 text-white':'border-stone-200 text-stone-600 hover:border-amber-400 dark:border-stone-700 dark:text-stone-300')}>{index+1}. {item.title}{progress[item.id]?' ✓':''}</button>)}</div>
    </div>
    <article className="rounded-2xl border border-stone-200 bg-[#fffefa] p-4 dark:border-stone-700 dark:bg-stone-950 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Chương {chapterIndex+1}/{story.chapters.length}</p><h4 className="mt-1 text-lg font-black text-stone-900 dark:text-stone-100">{chapter.title}</h4><p className="font-cjk text-xl text-amber-900 dark:text-amber-200">{chapter.titleZh}</p></div><div className="flex flex-wrap gap-2">
        <button type="button" onClick={()=>isSpeaking?stopSpeaking():speak(readingText)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-amber-700 px-3 text-xs font-bold text-white"><Headphones className="h-4 w-4"/>{isSpeaking?'Dừng đọc':'Nghe toàn đoạn'}</button>
        <button type="button" onClick={()=>setShowPinyin(value=>!value)} className="min-h-10 rounded-xl border border-stone-200 px-3 text-xs font-bold dark:border-stone-700">{showPinyin?'Ẩn Pinyin':'Hiện Pinyin'}</button>
        <button type="button" onClick={()=>setShowVietnamese(value=>!value)} className="min-h-10 rounded-xl border border-stone-200 px-3 text-xs font-bold dark:border-stone-700">{showVietnamese?'Ẩn tiếng Việt':'Hiện tiếng Việt'}</button>
      </div></div>
      <p className="mt-4 text-xs text-stone-500">Chạm vào từ hoặc chữ Hán để xem Pinyin và nghĩa. Khi nghe, phần văn bản đang được đọc sẽ tự động sáng lên.</p>
      <p className="mt-3 font-cjk text-2xl leading-[2.1] tracking-wide text-stone-900 dark:text-stone-100">
        {(() => {
          const parts: React.ReactNode[] = [];
          let cursor = 0;
          readingTokens.forEach((token,index) => {
            if (token.start > cursor) parts.push(<span key={'plain-'+cursor}>{readingText.slice(cursor,token.start)}</span>);
            const active = Boolean(activeAudioRange && token.start < activeAudioRange.end && token.end > activeAudioRange.start);
            parts.push(<button key={token.start+'-'+index} type="button" onClick={()=>setSelectedReadingToken(token)} aria-pressed={selectedReadingToken?.start===token.start} className={'rounded-md px-[1px] transition-colors '+(active?'bg-amber-300 text-amber-950 ring-2 ring-amber-400 dark:bg-amber-400 dark:text-stone-950':selectedReadingToken?.start===token.start?'bg-sky-100 text-sky-900 dark:bg-sky-900/60 dark:text-sky-100':'hover:bg-amber-100 dark:hover:bg-amber-950/50')}>{token.hanzi}</button>);
            cursor = token.end;
          });
          if (cursor < readingText.length) parts.push(<span key="plain-tail">{readingText.slice(cursor)}</span>);
          return parts;
        })()}
      </p>
      {showPinyin&&<p className="mt-2 text-sm font-semibold leading-7 text-sky-800 dark:text-sky-300">{chapter.sentences.map(item=>item.pinyin).join(' ')}</p>}
      {showVietnamese&&<p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-300">{chapter.sentences.map(item=>item.vietnamese).join(' ')}</p>}
      {selectedReadingToken&&<div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-900 dark:bg-sky-950/30">
        <div><p className="font-cjk text-2xl font-black text-stone-900 dark:text-stone-100">{selectedReadingToken.hanzi}</p><p className="mt-1 text-sm font-bold text-sky-800 dark:text-sky-300">{selectedReadingToken.pinyin||'Chưa có dữ liệu Pinyin'}</p><p className="mt-1 text-sm text-stone-700 dark:text-stone-300">{selectedReadingToken.vietnamese}</p></div>
        <div className="flex items-center gap-2"><button type="button" onClick={()=>speak(selectedReadingToken.hanzi)} className="grid h-9 w-9 place-items-center rounded-lg bg-white text-sky-800 dark:bg-stone-900"><Volume2 className="h-4 w-4"/></button>{(()=>{const saved=vocabularyByHanzi.get(selectedReadingToken.hanzi);return saved&&!isVocabularySaved(saved.id)?<button type="button" onClick={()=>onSaveVocabulary(saved.id)} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-amber-700 px-3 text-xs font-bold text-white"><BookmarkPlus className="h-3.5 w-3.5"/>Lưu từ</button>:saved&&isVocabularySaved(saved.id)?<span className="text-xs font-bold text-emerald-700">Đã lưu</span>:null;})()}</div>
      </div>}
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
