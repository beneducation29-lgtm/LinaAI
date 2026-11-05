import React from 'react';
import { BookOpenText, Headphones, Loader2, Sparkles, Volume2 } from 'lucide-react';
import type { Vocabulary } from '../../types';

type Token = { text: string; pinyin: string; meaning: string; isNew: boolean };
type Sentence = { chinese: string; pinyin: string; vietnamese: string; tokens: Token[] };
type Analysis = { sentences: Sentence[]; grammar: Array<{ pattern: string; explanation: string; exampleChinese: string }>; vocabulary: Token[] };
type Props = { vocabularies: Vocabulary[] };

export const ReadingTextAnalyzer: React.FC<Props> = ({ vocabularies }) => {
  const [text, setText] = React.useState('');
  const [analysis, setAnalysis] = React.useState<Analysis | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [selectedWord, setSelectedWord] = React.useState<Token | null>(null);
  const [showPinyin, setShowPinyin] = React.useState(true);
  const [showVietnamese, setShowVietnamese] = React.useState(true);

  const analyze = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true); setError(''); setAnalysis(null); setSelectedWord(null);
    try {
      const response = await fetch('/api/lesson/generate', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'reading_text_analyze',
          text: text.trim(),
          knownVocabulary: vocabularies.slice(0, 150).map(item => ({ hanzi: item.hanzi, pinyin: item.pinyin, vietnamese: item.vietnamese }))
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Lina chưa thể phân tích câu chuyện.');
      setAnalysis(payload as Analysis);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Có lỗi khi phân tích văn bản.');
    } finally { setBusy(false); }
  };

  const speak = (value: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setError('Trình duyệt này chưa hỗ trợ giọng đọc tiếng Trung.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  };

  return <section className="space-y-4 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm dark:border-violet-950 dark:from-violet-950/20 dark:to-stone-900 sm:p-6">
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200"><BookOpenText className="h-5 w-5"/></div>
      <div><p className="text-xs font-extrabold uppercase tracking-[.14em] text-violet-700 dark:text-violet-300">Lina AI · Personal text reader</p><h2 className="mt-1 text-lg font-black text-stone-900 dark:text-stone-100">Dán câu chuyện tiếng Trung của bạn</h2><p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">Giữ nguyên chữ Hán gốc, thêm Pinyin nhỏ phía trên từng cụm từ, dịch từng câu và gạch chân từ mới so với kho từ vựng LinaAI.</p></div>
    </div>
    <form onSubmit={analyze} className="space-y-3">
      <label className="block"><span className="mb-1 block text-xs font-bold text-stone-600 dark:text-stone-300">Nội dung tiếng Trung (tối đa 12.000 ký tự)</span><textarea value={text} onChange={event=>setText(event.target.value)} maxLength={12000} rows={7} placeholder="在一个安静的小村庄里，住着一个喜欢读书的孩子……" className="w-full resize-y rounded-2xl border border-stone-200 bg-white p-3 font-cjk text-base leading-8 text-stone-900 outline-none focus:border-violet-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"/></label>
      <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-stone-500">{text.length.toLocaleString('vi-VN')}/12.000 ký tự · Đã có {vocabularies.length.toLocaleString('vi-VN')} từ trong kho để đối chiếu</span><button type="submit" disabled={busy||!/[\u3400-\u9fff]/u.test(text)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 text-sm font-extrabold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50">{busy?<Loader2 className="h-4 w-4 animate-spin"/>:<Sparkles className="h-4 w-4"/>}{busy?'Lina đang phân tích…':'Phân tích câu chuyện'}</button></div>
    </form>
    {error&&<div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{error}</div>}
    {analysis&&<div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-950 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-extrabold text-stone-900 dark:text-stone-100">Câu chuyện đã được Lina phân tích</h3><p className="mt-1 text-xs text-stone-500">{analysis.sentences.length} câu · {analysis.vocabulary.length} từ mới được nhận diện</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={()=>setShowPinyin(value=>!value)} className="min-h-9 rounded-lg border border-stone-200 px-3 text-xs font-bold dark:border-stone-700">{showPinyin?'Ẩn Pinyin':'Hiện Pinyin'}</button><button type="button" onClick={()=>setShowVietnamese(value=>!value)} className="min-h-9 rounded-lg border border-stone-200 px-3 text-xs font-bold dark:border-stone-700">{showVietnamese?'Ẩn tiếng Việt':'Hiện tiếng Việt'}</button><button type="button" onClick={()=>speak(analysis.sentences.map(sentence=>sentence.chinese).join(''))} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-violet-700 px-3 text-xs font-bold text-white"><Headphones className="h-3.5 w-3.5"/> Nghe cả bài</button></div></div>
      <div className="space-y-4">{analysis.sentences.map((sentence,index)=><article key={index} className="rounded-xl border border-stone-100 p-3 dark:border-stone-800 sm:p-4"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Câu {index+1}</span><button type="button" onClick={()=>speak(sentence.chinese)} aria-label={'Nghe câu '+(index+1)} className="rounded-lg p-2 text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-950/40"><Volume2 className="h-4 w-4"/></button></div><p className="font-cjk text-xl leading-[3.2] text-stone-900 dark:text-stone-100 sm:text-2xl sm:leading-[3.4]">{sentence.tokens.map((token,tokenIndex)=>token.isNew?<button key={tokenIndex} type="button" onClick={()=>setSelectedWord(token)} className="mx-0.5 rounded-sm underline decoration-2 decoration-violet-500 underline-offset-4 hover:bg-violet-50 dark:hover:bg-violet-950/40"><ruby>{token.text}{showPinyin&&token.pinyin&&<rt className="font-sans text-[10px] font-medium text-violet-700 dark:text-violet-300">{token.pinyin}</rt>}</ruby></button>:<span key={tokenIndex} className="mx-0.5"><ruby>{token.text}{showPinyin&&token.pinyin&&<rt className="font-sans text-[10px] font-medium text-stone-500">{token.pinyin}</rt>}</ruby></span>)}</p>{showVietnamese&&<p className="mt-3 border-t border-stone-100 pt-3 text-sm leading-7 text-stone-600 dark:border-stone-800 dark:text-stone-300">{sentence.vietnamese}</p>}{selectedWord&&sentence.tokens.some(token=>token.text===selectedWord.text)&&<div className="mt-3 rounded-xl bg-violet-50 p-3 dark:bg-violet-950/30"><p className="font-cjk text-lg font-extrabold text-violet-900 dark:text-violet-100">{selectedWord.text}</p><p className="mt-1 text-xs font-semibold text-violet-800 dark:text-violet-200">{selectedWord.pinyin}</p><p className="mt-1 text-sm text-stone-700 dark:text-stone-200">{selectedWord.meaning}</p></div>}</article>)}</div>
      {selectedWord&&<div className="rounded-xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-900 dark:bg-violet-950/30"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700 dark:text-violet-300">Từ mới được chọn</p><p className="mt-1 font-cjk text-xl font-black">{selectedWord.text}</p><p className="text-sm font-semibold text-violet-800 dark:text-violet-200">{selectedWord.pinyin}</p><p className="mt-1 text-sm">{selectedWord.meaning}</p></div><button type="button" onClick={()=>setSelectedWord(null)} className="rounded-lg px-2 py-1 text-stone-500" aria-label="Đóng">×</button></div></div>}
      {analysis.grammar.length>0&&<section className="space-y-2"><h4 className="text-sm font-extrabold text-stone-800 dark:text-stone-100">Ngữ pháp đáng chú ý</h4>{analysis.grammar.map((item,index)=><div key={index} className="rounded-xl bg-stone-50 p-3 dark:bg-stone-900"><p className="font-bold text-violet-800 dark:text-violet-300">{item.pattern}</p><p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">{item.explanation}</p><p className="mt-1 font-cjk text-sm">{item.exampleChinese}</p></div>)}</section>}
      <p className="text-[11px] leading-5 text-stone-400">Giọng đọc dùng bộ đọc tiếng Trung zh-CN của trình duyệt; âm thanh được phát trực tiếp trên thiết bị, không gửi nội dung sang dịch vụ âm thanh bên ngoài.</p>
    </div>}
  </section>;
};
