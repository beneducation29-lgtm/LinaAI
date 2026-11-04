import React from 'react';
import { BookOpen, Bookmark, CheckCircle2, ChevronDown, ChevronUp, Headphones, Library, Search, Volume2 } from 'lucide-react';
import type { HSKLevel, Vocabulary } from '../../types';
import { HSK_LEVELS, GRADED_READINGS, type GradedReading } from '../../data/gradedReadings';
import { accountStorageKey } from '../../services/accountStorage';
import { listReadingDocuments, type ReadingDocument } from '../../services/readingLibrary';

interface Props {
  ownerId: string;
  vocabularies: Vocabulary[];
  onSaveVocabulary: (id: string) => void;
  isVocabularySaved: (id: string) => boolean;
}
type ReadingProgress = Record<string, { completedAt: string; correct: number; total: number }>;

const PROGRESS_KEY = 'lina-graded-reading-progress-v1';
const levelColor: Record<HSKLevel, string> = {
  'HSK 1': 'bg-emerald-100 text-emerald-800',
  'HSK 2': 'bg-teal-100 text-teal-800',
  'HSK 3': 'bg-sky-100 text-sky-800',
  'HSK 4': 'bg-indigo-100 text-indigo-800',
  'HSK 5': 'bg-violet-100 text-violet-800',
  'HSK 6': 'bg-amber-100 text-amber-900'
};

function readProgress(ownerId: string): ReadingProgress {
  try {
    const value = JSON.parse(localStorage.getItem(accountStorageKey(PROGRESS_KEY, ownerId)) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

function speakChinese(value: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(value);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.86;
  window.speechSynthesis.speak(utterance);
}

export const ReadingScreen: React.FC<Props> = ({ ownerId, vocabularies, onSaveVocabulary, isVocabularySaved }) => {
  const [level, setLevel] = React.useState<HSKLevel | '全部'>('HSK 1');
  const [topic, setTopic] = React.useState('Tất cả chủ đề');
  const [search, setSearch] = React.useState('');
  const [activeId, setActiveId] = React.useState(GRADED_READINGS[0].id);
  const [showPinyin, setShowPinyin] = React.useState(true);
  const [showVietnamese, setShowVietnamese] = React.useState(true);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [progress, setProgress] = React.useState<ReadingProgress>(() => readProgress(ownerId));
  const [legacyDocs, setLegacyDocs] = React.useState<ReadingDocument[]>(() => listReadingDocuments(ownerId));
  const [legacyOpen, setLegacyOpen] = React.useState(false);
  const [legacyActive, setLegacyActive] = React.useState<ReadingDocument | null>(null);

  React.useEffect(() => {
    setProgress(readProgress(ownerId));
    setLegacyDocs(listReadingDocuments(ownerId));
    setLegacyActive(null);
  }, [ownerId]);

  const topics = React.useMemo(() => ['Tất cả chủ đề', ...Array.from(new Set(GRADED_READINGS.map(item => item.topic)))], []);
  const filtered = React.useMemo(() => GRADED_READINGS.filter(item => {
    const matchesLevel = level === '全部' || level === '全部' || item.level === level;
    const matchesTopic = topic === 'Tất cả chủ đề' || item.topic === topic;
    const needle = search.trim().toLocaleLowerCase();
    const matchesSearch = !needle || [item.title, item.titleZh, item.summary, item.topic, ...item.focusWords].join(' ').toLocaleLowerCase().includes(needle);
    return matchesLevel && matchesTopic && matchesSearch;
  }), [level, topic, search]);

  const active = GRADED_READINGS.find(item => item.id === activeId) || filtered[0] || GRADED_READINGS[0];
  const vocabByHanzi = React.useMemo(() => {
    const map = new Map<string, Vocabulary>();
    for (const item of vocabularies) map.set(item.hanzi, item);
    return map;
  }, [vocabularies]);
  const matchedWords = active.focusWords.map(word => vocabByHanzi.get(word)).filter((item): item is Vocabulary => Boolean(item));
  const missingWords = active.focusWords.filter(word => !vocabByHanzi.has(word));
  const score = active.questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);
  const completedCount = Object.keys(progress).length;

  const selectReading = (item: GradedReading) => {
    setActiveId(item.id);
    setAnswers({});
    setSubmitted(false);
    setLegacyActive(null);
  };
  const submitAnswers = () => {
    setSubmitted(true);
    const next = { ...progress, [active.id]: { completedAt: new Date().toISOString(), correct: score, total: active.questions.length } };
    setProgress(next);
    try { localStorage.setItem(accountStorageKey(PROGRESS_KEY, ownerId), JSON.stringify(next)); } catch { /* progress remains available for this session */ }
  };
  const startNext = () => {
    const currentIndex = filtered.findIndex(item => item.id === active.id);
    const next = filtered[(currentIndex + 1 + filtered.length) % filtered.length];
    if (next) selectReading(next);
  };

  return <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
    <section className="overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-gradient-to-br from-[#203d31] via-[#2e5140] to-[#52624a] p-5 text-white shadow-lg sm:p-8">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-100"><BookOpen className="h-4 w-4"/> Lina graded reading</div>
      <div className="mt-4 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
        <div><h1 className="text-2xl font-black sm:text-3xl">Thư viện đọc tiếng Trung HSK</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/90">Bài đọc do Lina biên soạn theo cấp độ HSK và đối chiếu với kho từ vựng đang có trong ứng dụng. Mỗi câu có chữ Hán, Pinyin và bản dịch tiếng Việt tương ứng.</p></div>
        <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3"><div className="text-2xl font-black tabular-nums">{completedCount}/{GRADED_READINGS.length}</div><div className="text-xs text-emerald-100">bài đã luyện</div></div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold text-emerald-50/90"><span className="rounded-full border border-white/20 px-3 py-1.5">HSK 1–6</span><span className="rounded-full border border-white/20 px-3 py-1.5">Song ngữ theo câu</span><span className="rounded-full border border-white/20 px-3 py-1.5">Lưu tiến độ theo tài khoản</span><span className="rounded-full border border-white/20 px-3 py-1.5">Từ vựng liên kết ôn tập</span></div>
    </section>

    <section className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 sm:grid-cols-[1fr_190px_190px]">
      <label className="relative block"><span className="sr-only">Tìm bài đọc hoặc từ vựng</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm chủ đề, tiêu đề hoặc từ vựng…" className="min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-950"/></label>
      <label className="text-xs font-bold text-stone-500">Cấp độ HSK<select value={level} onChange={e=>setLevel(e.target.value as HSKLevel | '全部')} className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"><option value="全部">Tất cả cấp độ</option>{HSK_LEVELS.map(item=><option key={item}>{item}</option>)}</select></label>
      <label className="text-xs font-bold text-stone-500">Chủ đề<select value={topic} onChange={e=>setTopic(e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100">{topics.map(item=><option key={item}>{item}</option>)}</select></label>
    </section>

    <div className="grid min-w-0 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-extrabold">Bài đọc ({filtered.length})</h2><span className="text-xs text-stone-500">{completedCount} đã hoàn thành</span></div>
        {filtered.length ? filtered.map(item => <button key={item.id} type="button" onClick={()=>selectReading(item)} className={`w-full rounded-2xl border p-3 text-left transition ${active.id===item.id?'border-emerald-500 bg-emerald-50/80 shadow-sm dark:bg-emerald-950/20':'border-stone-200 bg-white hover:border-emerald-300 dark:border-stone-800 dark:bg-stone-900'}`}>
          <div className="flex items-center justify-between gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${levelColor[item.level]}`}>{item.level}</span>{progress[item.id]&&<CheckCircle2 className="h-4 w-4 text-emerald-600"/>}</div>
          <p className="mt-2 text-sm font-extrabold text-stone-900 dark:text-stone-100">{item.title}</p><p className="mt-0.5 font-cjk text-sm text-stone-500">{item.titleZh}</p><p className="mt-2 text-xs leading-5 text-stone-500">{item.summary}</p>
          <div className="mt-2 flex items-center justify-between text-[10px] text-stone-400"><span>{item.topic}</span><span>{item.estimatedMinutes} phút</span></div>
        </button>) : <div className="rounded-2xl border border-dashed border-stone-300 p-5 text-center text-sm text-stone-500">Không tìm thấy bài phù hợp. Hãy thử bộ lọc khác.</div>}
      </aside>

      <main className="min-w-0 space-y-4">
        <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6">
          {legacyActive ? <div className="space-y-3"><button onClick={()=>setLegacyActive(null)} className="text-xs font-bold text-emerald-700">← Quay lại bài đọc HSK</button><h2 className="text-xl font-black">{legacyActive.title}</h2><p className="whitespace-pre-wrap font-cjk text-base leading-8">{legacyActive.text}</p><p className="text-xs text-stone-500">Tài liệu OCR cũ · {legacyActive.sourceName || 'Văn bản đã lưu'}</p></div> : <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${levelColor[active.level]}`}>{active.level}</span><span className="text-xs text-stone-500">{active.topic} · {active.estimatedMinutes} phút</span></div><h2 className="mt-2 text-xl font-black text-stone-900 dark:text-stone-100 sm:text-2xl">{active.title}</h2><p className="mt-1 font-cjk text-lg text-emerald-800 dark:text-emerald-300">{active.titleZh}</p><p className="mt-2 text-sm text-stone-500">{active.summary}</p></div>
              <button onClick={()=>speakChinese(active.sentences.map(sentence=>sentence.chinese).join(''))} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald-200 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300"><Headphones className="h-4 w-4"/> Nghe toàn bài</button>
            </div>
            <div className="mt-5 flex flex-wrap gap-4 border-y border-stone-100 py-3 text-xs dark:border-stone-800">
              <label className="flex items-center gap-2"><input type="checkbox" checked={showPinyin} onChange={e=>setShowPinyin(e.target.checked)}/> Hiện Pinyin</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={showVietnamese} onChange={e=>setShowVietnamese(e.target.checked)}/> Hiện tiếng Việt</label>
            </div>
            <div className="mt-4 space-y-3">
              {active.sentences.map((sentence,index)=><article key={index} className="rounded-2xl border border-stone-200 bg-[#fffefb] p-4 dark:border-stone-800 dark:bg-stone-950/60">
                <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Câu {index+1}</span><button onClick={()=>speakChinese(sentence.chinese)} aria-label={`Nghe câu ${index+1}`} className="rounded-lg p-2 text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300"><Volume2 className="h-4 w-4"/></button></div>
                <p className="mt-1 font-cjk text-lg leading-9 text-stone-900 dark:text-stone-100">{sentence.chinese}</p>
                {showPinyin&&<p className="mt-1 text-sm leading-6 text-emerald-800 dark:text-emerald-300">{sentence.pinyin}</p>}
                {showVietnamese&&<p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">{sentence.vietnamese}</p>}
              </article>)}
            </div>
            <p className="mt-4 text-[11px] leading-5 text-stone-400">{active.sourceNote}</p>
          </>}
        </section>

        {!legacyActive&&<section className="rounded-3xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-extrabold">Từ vựng trọng tâm</h3><p className="mt-1 text-xs text-stone-500">Đối chiếu trực tiếp với kho từ vựng LinaAI hiện có.</p></div><span className="text-xs text-stone-500">{matchedWords.length}/{active.focusWords.length} từ đã có trong kho</span></div>
          {matchedWords.length>0&&<div className="mt-3 flex flex-wrap gap-2">{matchedWords.map(word=><div key={word.id} className="flex items-center gap-1.5 rounded-xl border border-stone-200 px-2.5 py-2 dark:border-stone-700"><div><div className="font-cjk text-sm font-bold">{word.hanzi}</div><div className="text-[10px] text-emerald-700">{word.pinyin}</div><div className="max-w-36 text-[10px] text-stone-500">{word.vietnamese}</div></div><button onClick={()=>onSaveVocabulary(word.id)} title={isVocabularySaved(word.id)?'Bỏ lưu từ':'Lưu vào ôn tập'} aria-label={`${isVocabularySaved(word.id)?'Bỏ lưu':'Lưu'} ${word.hanzi}`} className={`rounded-lg p-1.5 ${isVocabularySaved(word.id)?'text-emerald-700':'text-stone-400 hover:text-emerald-700'}`}><Bookmark className="h-4 w-4" fill={isVocabularySaved(word.id)?'currentColor':'none'}/></button></div>)}</div>}
          {missingWords.length>0&&<details className="mt-3 text-xs text-stone-500"><summary className="cursor-pointer font-semibold">Xem {missingWords.length} từ chưa có mục từ khớp trong kho</summary><p className="mt-2 leading-6">{missingWords.join('、')}</p><p className="mt-1">Các từ này vẫn xuất hiện trong bài đọc, nhưng chưa được tính là từ đã có trong kho.</p></details>}
        </section>}

        {!legacyActive&&<section className="rounded-3xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-extrabold">Kiểm tra đọc hiểu</h3><p className="mt-1 text-xs text-stone-500">Trả lời câu hỏi để lưu tiến độ bài đọc.</p></div>{progress[active.id]&&<span className="text-xs font-bold text-emerald-700">Lần gần nhất: {progress[active.id].correct}/{progress[active.id].total}</span>}</div>
          <div className="mt-4 space-y-4">{active.questions.map((question,index)=><fieldset key={index} className="space-y-2"><legend className="text-sm font-bold">{index+1}. {question.question}</legend>{question.options.map((option,optionIndex)=><label key={optionIndex} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${submitted&&optionIndex===question.answer?'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20':answers[index]===optionIndex?'border-emerald-400':'border-stone-200 dark:border-stone-700'}`}><input type="radio" name={`question-${active.id}-${index}`} checked={answers[index]===optionIndex} disabled={submitted} onChange={()=>setAnswers(previous=>({...previous,[index]:optionIndex}))}/>{option}{submitted&&optionIndex===question.answer&&<CheckCircle2 className="ml-auto h-4 w-4 text-emerald-600"/>}</label>)}{submitted&&<p className="text-xs leading-5 text-stone-500">{question.explanation}</p>}</fieldset>)}</div>
          {submitted?<div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">Kết quả: {score}/{active.questions.length} câu đúng</p><button onClick={startNext} className="min-h-10 rounded-xl bg-emerald-800 px-4 text-xs font-bold text-white">Bài tiếp theo →</button></div>:<button onClick={submitAnswers} disabled={Object.keys(answers).length!==active.questions.length} className="mt-4 min-h-11 rounded-xl bg-emerald-800 px-5 text-xs font-extrabold text-white disabled:opacity-40">Nộp câu trả lời & lưu tiến độ</button>}
        </section>}
      </main>
    </div>

    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <button type="button" onClick={()=>setLegacyOpen(value=>!value)} className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left"><span className="flex items-center gap-2 text-sm font-extrabold"><Library className="h-4 w-4 text-emerald-700"/> Tài liệu OCR đã lưu trước đây <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] dark:bg-stone-800">{legacyDocs.length}</span></span>{legacyOpen?<ChevronUp className="h-4 w-4"/>:<ChevronDown className="h-4 w-4"/>}</button>
      {legacyOpen&&<div className="border-t border-stone-100 p-4 dark:border-stone-800">{legacyDocs.length?<div className="grid gap-2 sm:grid-cols-2">{legacyDocs.map(doc=><button key={doc.id} onClick={()=>{setLegacyActive(doc);setAnswers({});setSubmitted(false);}} className="rounded-xl border border-stone-200 p-3 text-left hover:border-emerald-300 dark:border-stone-700"><p className="text-sm font-bold">{doc.title}</p><p className="mt-1 line-clamp-2 text-xs text-stone-500">{doc.text}</p></button>)}</div>:<p className="text-xs text-stone-500">Không có tài liệu OCR cũ. Các bài đọc mới được lưu tiến độ riêng và không ghi đè tài liệu này.</p>}</div>}
    </section>

    <section className="rounded-2xl bg-stone-100/80 p-4 dark:bg-stone-900/70"><h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-600 dark:text-stone-300">Nguồn tham khảo để đọc thêm</h3><div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300"><a href="https://www.haohsk.com/" target="_blank" rel="noreferrer">HaoHsk ↗</a><a href="https://hskstory.com/" target="_blank" rel="noreferrer">HSKStory ↗</a><a href="https://literatechinese.com/" target="_blank" rel="noreferrer">Literate Chinese ↗</a><a href="https://nihaolearn.com/" target="_blank" rel="noreferrer">NihaoLearn ↗</a></div><p className="mt-2 text-[11px] leading-5 text-stone-500">Các liên kết trên là nguồn tham khảo bên ngoài. Bài trong thư viện LinaAI được biên soạn mới, không sao chép nguyên văn nội dung có bản quyền. Cấp độ dùng hệ HSK cổ điển 1–6 hiện có trong ứng dụng; đây không phải hệ HSK 3.0 cấp 1–9.</p></section>
  </div>;
};
