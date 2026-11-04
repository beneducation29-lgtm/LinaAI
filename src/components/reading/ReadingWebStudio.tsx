import React from 'react';
import { ExternalLink, Globe2, Loader2, Search, BookmarkPlus, BookOpenText } from 'lucide-react';
import type { HSKLevel, Vocabulary } from '../../types';
import { HSK_LEVELS } from '../../data/gradedReadings';

interface Props {
  vocabularies: Vocabulary[];
  onSaveVocabulary: (id: string) => void;
  isVocabularySaved: (id: string) => boolean;
}
interface GeneratedReading {
  title: string;
  titleZh: string;
  summary: string;
  level: HSKLevel;
  sentences: Array<{ chinese: string; pinyin: string; vietnamese: string }>;
  focusWords: string[];
  questions: Array<{ question: string; options: string[]; answer: number; explanation: string }>;
  sources: Array<{ title: string; url: string }>;
  sourceNote: string;
}

export const ReadingWebStudio: React.FC<Props> = ({ vocabularies, onSaveVocabulary, isVocabularySaved }) => {
  const [query, setQuery] = React.useState('');
  const [level, setLevel] = React.useState<HSKLevel>('HSK 1');
  const [reading, setReading] = React.useState<GeneratedReading | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const vocabularyByHanzi = React.useMemo(() => new Map<string, Vocabulary>(vocabularies.map(item => [item.hanzi, item] as const)), [vocabularies]);
  const availableCount = vocabularies.filter(item => item.hskLevel === level).length;

  const searchAndCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim() || busy) return;
    setBusy(true);
    setError('');
    setReading(null);
    setAnswers({});
    setSubmitted(false);
    try {
      const response = await fetch('/api/lesson/generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'reading_search',
          query: query.trim(),
          level,
          vocabulary: vocabularies.slice(0, 100).map(item => ({
            hanzi: item.hanzi,
            pinyin: item.pinyin,
            vietnamese: item.vietnamese,
            hskLevel: item.hskLevel
          }))
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Không thể tạo bài đọc từ nguồn web.');
      setReading(payload as GeneratedReading);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Có lỗi khi tìm kiếm bài đọc.');
    } finally {
      setBusy(false);
    }
  };

  return <section className="space-y-4 rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm dark:border-sky-950 dark:from-sky-950/30 dark:to-stone-900 sm:p-6">
    <div className="flex flex-wrap items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200"><Globe2 className="h-5 w-5"/></div>
      <div className="min-w-0 flex-1"><p className="text-xs font-extrabold uppercase tracking-[.14em] text-sky-700 dark:text-sky-300">Lina Web Reading</p><h2 className="mt-1 text-lg font-black text-stone-900 dark:text-stone-100">Tìm nguồn web, tạo bài đọc theo vốn từ của bạn</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-stone-600 dark:text-stone-300">Lina tìm các trang web liên quan, tham khảo nội dung rồi biên soạn bài mới theo HSK. Mỗi câu có chữ Hán giản thể, Pinyin và tiếng Việt; nguồn tham khảo được đính kèm để bạn kiểm tra.</p></div>
    </div>
    <form onSubmit={searchAndCreate} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_auto]">
      <label className="block"><span className="mb-1 block text-xs font-bold text-stone-600 dark:text-stone-300">Chủ đề muốn đọc</span><input value={query} onChange={event=>setQuery(event.target.value)} maxLength={180} placeholder="Ví dụ: thói quen buổi sáng, công nghệ xanh, văn hóa Trung Quốc…" className="min-h-12 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-sky-500 dark:border-stone-700 dark:bg-stone-950"/></label>
      <label className="block"><span className="mb-1 block text-xs font-bold text-stone-600 dark:text-stone-300">Cấp độ</span><select value={level} onChange={event=>setLevel(event.target.value as HSKLevel)} className="min-h-12 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm dark:border-stone-700 dark:bg-stone-950">{HSK_LEVELS.map(item=><option key={item} value={item}>{item}</option>)}</select></label>
      <div className="flex flex-col justify-end"><button type="submit" disabled={busy||!query.trim()||availableCount===0} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 text-sm font-extrabold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50">{busy?<Loader2 className="h-4 w-4 animate-spin"/>:<Search className="h-4 w-4"/>}{busy?'Đang tìm nguồn…':'Tìm & tạo bài đọc'}</button></div>
    </form>
    <p className="text-xs text-stone-500 dark:text-stone-400">Kho từ hiện có ở {level}: {availableCount.toLocaleString('vi-VN')} mục. Bài đọc ưu tiên sử dụng từ trong kho này; từ không khớp sẽ không được đánh dấu là từ trọng tâm.</p>
    {error&&<div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{error}</div>}
    {reading&&<div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-950 sm:p-6">
      <header className="border-b border-stone-100 pb-4 dark:border-stone-800"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-extrabold text-sky-800 dark:bg-sky-900 dark:text-sky-200">{reading.level}</span><span className="text-xs text-stone-500">Bài đọc tham khảo web · Nội dung biên soạn mới</span></div><h3 className="mt-2 text-xl font-black text-stone-900 dark:text-stone-100">{reading.title}</h3><p className="mt-1 text-lg font-semibold text-sky-800 dark:text-sky-300">{reading.titleZh}</p><p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{reading.summary}</p></header>
      <div className="space-y-4">{reading.sentences.map((sentence,index)=><article key={index} className="border-b border-stone-100 pb-4 last:border-0 dark:border-stone-800"><p className="font-cjk text-xl leading-relaxed text-stone-900 dark:text-stone-100">{sentence.chinese}</p><p className="mt-1 text-sm font-medium leading-6 text-sky-800 dark:text-sky-300">{sentence.pinyin}</p><p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">{sentence.vietnamese}</p></article>)}</div>
      <section><h4 className="mb-2 text-sm font-extrabold text-stone-800 dark:text-stone-100">Từ vựng trong kho LinaAI</h4><div className="flex flex-wrap gap-2">{reading.focusWords.map(word=>{const item=vocabularyByHanzi.get(word);return <div key={word} className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-700 dark:bg-stone-900"><span><span className="font-cjk font-bold text-stone-900 dark:text-stone-100">{word}</span>{item&&<span className="ml-2 text-xs text-stone-500">{item.pinyin} · {item.vietnamese}</span>}</span>{item&&!isVocabularySaved(item.id)&&<button type="button" onClick={()=>onSaveVocabulary(item.id)} aria-label={'Lưu từ '+word} title="Lưu vào ôn tập" className="rounded-lg p-1 text-sky-700 hover:bg-sky-100 dark:text-sky-300 dark:hover:bg-sky-900"><BookmarkPlus className="h-4 w-4"/></button>}{item&&isVocabularySaved(item.id)&&<span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Đã lưu</span>}</div>;})}</div></section>
      <section className="space-y-3"><h4 className="text-sm font-extrabold text-stone-800 dark:text-stone-100">Kiểm tra đọc hiểu</h4>{reading.questions.map((question,index)=><div key={index} className="rounded-xl bg-stone-50 p-3 dark:bg-stone-900"><p className="text-sm font-bold text-stone-800 dark:text-stone-100">{index+1}. {question.question}</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{question.options.map((option,optionIndex)=><label key={optionIndex} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm dark:border-stone-700 dark:bg-stone-950"><input type="radio" name={'web-reading-'+index} checked={answers[index]===optionIndex} disabled={submitted} onChange={()=>setAnswers(current=>({...current,[index]:optionIndex}))}/>{option}</label>)}</div>{submitted&&<p className={'mt-2 text-xs leading-5 '+(answers[index]===question.answer?'text-emerald-700 dark:text-emerald-300':'text-amber-700 dark:text-amber-300')}>{answers[index]===question.answer?'Chính xác. ':'Đáp án đúng: '+question.options[question.answer]+'. '}{question.explanation}</p>}</div>)}
      <button type="button" disabled={submitted||Object.keys(answers).length!==reading.questions.length} onClick={()=>setSubmitted(true)} className="min-h-11 rounded-xl bg-stone-900 px-4 text-sm font-bold text-white disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900">{submitted?'Đã hoàn thành kiểm tra':'Nộp bài kiểm tra'}</button></section>
      <section className="rounded-xl border border-sky-100 bg-sky-50/70 p-3 dark:border-sky-950 dark:bg-sky-950/20"><h4 className="flex items-center gap-2 text-sm font-extrabold text-sky-900 dark:text-sky-100"><BookOpenText className="h-4 w-4"/> Nguồn tham khảo</h4><ul className="mt-2 space-y-2">{reading.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-sm font-medium text-sky-800 underline decoration-sky-300 underline-offset-2 hover:text-sky-950 dark:text-sky-300"><ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0"/><span className="break-all">{source.title}</span></a></li>)}</ul><p className="mt-3 text-xs leading-5 text-stone-500 dark:text-stone-400">{reading.sourceNote}</p></section>
    </div>}
  </section>;
};
