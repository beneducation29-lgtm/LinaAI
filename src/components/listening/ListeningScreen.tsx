import React, { useEffect, useMemo, useState } from 'react';
import { AudioLines, BookOpen, CheckCircle2, CircleHelp, Headphones, Pause, Play, RotateCcw, Settings2, Volume2 } from 'lucide-react';

type ListeningItem = { id: string; hsk: number; title: string; hanzi: string; pinyin: string; meaning: string; transcript: string; question: string; options: string[]; answer: number; note: string };
const lessons: ListeningItem[] = [
  { id: 'h1-greeting', hsk: 1, title: 'Chào hỏi', hanzi: '你好！你叫什么名字？', pinyin: 'Nǐ hǎo! Nǐ jiào shénme míngzi?', meaning: 'Xin chào! Bạn tên là gì?', transcript: '你好！你叫什么名字？', question: 'Người nói đang hỏi điều gì?', options: ['Bạn đến từ đâu?', 'Bạn tên là gì?', 'Bạn bao nhiêu tuổi?'], answer: 1, note: '叫什么名字 (jiào shénme míngzi) nghĩa là “tên là gì”.' },
  { id: 'h1-time', hsk: 1, title: 'Thời gian', hanzi: '现在几点？现在三点。', pinyin: 'Xiànzài jǐ diǎn? Xiànzài sān diǎn.', meaning: 'Bây giờ là mấy giờ? Bây giờ là ba giờ.', transcript: '现在几点？现在三点。', question: 'Bây giờ là mấy giờ?', options: ['Một giờ', 'Hai giờ', 'Ba giờ'], answer: 2, note: '三点 (sān diǎn) là ba giờ.' },
  { id: 'h2-plan', hsk: 2, title: 'Kế hoạch cuối tuần', hanzi: '周末你想做什么？我想去看电影。', pinyin: 'Zhōumò nǐ xiǎng zuò shénme? Wǒ xiǎng qù kàn diànyǐng.', meaning: 'Cuối tuần bạn muốn làm gì? Tôi muốn đi xem phim.', transcript: '周末你想做什么？我想去看电影。', question: 'Người trả lời muốn làm gì cuối tuần?', options: ['Đi mua sắm', 'Đi xem phim', 'Ở nhà học bài'], answer: 1, note: '看电影 (kàn diànyǐng) nghĩa là xem phim.' },
  { id: 'h3-travel', hsk: 3, title: 'Đi lại', hanzi: '从这里到火车站，坐地铁比较方便。', pinyin: 'Cóng zhèlǐ dào huǒchēzhàn, zuò dìtiě bǐjiào fāngbiàn.', meaning: 'Từ đây đến ga tàu, đi tàu điện ngầm thuận tiện hơn.', transcript: '从这里到火车站，坐地铁比较方便。', question: 'Phương tiện nào được khuyên dùng?', options: ['Xe buýt', 'Taxi', 'Tàu điện ngầm'], answer: 2, note: '地铁 (dìtiě) là tàu điện ngầm; 比较方便 là tương đối thuận tiện.' },
  { id: 'h4-health', hsk: 4, title: 'Sức khỏe', hanzi: '如果你觉得不舒服，最好先休息一下。', pinyin: 'Rúguǒ nǐ juéde bù shūfu, zuìhǎo xiān xiūxi yíxià.', meaning: 'Nếu bạn cảm thấy không khỏe, tốt nhất hãy nghỉ ngơi trước.', transcript: '如果你觉得不舒服，最好先休息一下。', question: 'Lời khuyên là gì?', options: ['Tiếp tục làm việc', 'Nghỉ ngơi trước', 'Uống cà phê'], answer: 1, note: '如果… (rúguǒ…) là “nếu…”; 最好 (zuìhǎo) là “tốt nhất”.' },
  { id: 'h5-study', hsk: 5, title: 'Phương pháp học', hanzi: '与其一次学很长时间，不如每天坚持练习。', pinyin: 'Yǔqí yí cì xué hěn cháng shíjiān, bùrú měitiān jiānchí liànxí.', meaning: 'Thay vì học một lần thật lâu, chi bằng kiên trì luyện tập mỗi ngày.', transcript: '与其一次学很长时间，不如每天坚持练习。', question: 'Người nói khuyên cách học nào?', options: ['Học dồn một lần', 'Mỗi ngày kiên trì luyện tập', 'Chỉ học vào cuối tuần'], answer: 1, note: '与其…不如… (yǔqí… bùrú…) dùng để so sánh và đưa ra lựa chọn tốt hơn.' },
  { id: 'h6-culture', hsk: 6, title: 'Văn hóa và ngôn ngữ', hanzi: '语言不仅是交流的工具，也承载着一个民族的文化记忆。', pinyin: 'Yǔyán bùjǐn shì jiāoliú de gōngjù, yě chéngzàizhe yí ge mínzú de wénhuà jìyì.', meaning: 'Ngôn ngữ không chỉ là công cụ giao tiếp mà còn lưu giữ ký ức văn hóa của một dân tộc.', transcript: '语言不仅是交流的工具，也承载着一个民族的文化记忆。', question: 'Theo câu nghe, ngôn ngữ còn có vai trò gì?', options: ['Chỉ dùng để viết', 'Lưu giữ ký ức văn hóa', 'Thay thế mọi hình thức nghệ thuật'], answer: 1, note: '不仅…也… (bùjǐn… yě…) nghĩa là “không chỉ… mà còn…”.' },
];

export const ListeningScreen: React.FC = () => {
  const [level, setLevel] = useState('all');
  const [speed, setSpeed] = useState(0.85);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState('');
  const [completed, setCompleted] = useState<string[]>([]);
  const visibleLessons = useMemo(() => lessons.filter(item => level === 'all' || item.hsk === Number(level)), [level]);
  const score = visibleLessons.filter(item => revealed[item.id] && selected[item.id] === item.answer).length;
  const answered = visibleLessons.filter(item => revealed[item.id]).length;

  useEffect(() => () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);

  const speak = (item: ListeningItem) => {
    if (typeof window.speechSynthesis === 'undefined') {
      setPlayingId(null);
      setPlaybackError('Trình duyệt này chưa hỗ trợ phát giọng nói. Bạn hãy thử Chrome hoặc Edge bản mới.');
      return;
    }
    setPlaybackError('');
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(item.transcript);
    utterance.lang = 'zh-CN';
    utterance.rate = speed;
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find(voice => voice.lang.toLowerCase().startsWith('zh'));
    if (chineseVoice) utterance.voice = chineseVoice;
    utterance.onstart = () => setPlayingId(item.id);
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);
    window.speechSynthesis.speak(utterance);
  };

  const markAnswered = (item: ListeningItem) => {
    setRevealed(previous => ({ ...previous, [item.id]: true }));
    setCompleted(previous => previous.includes(item.id) ? previous : [...previous, item.id]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-28 md:pb-12 space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"><Headphones className="h-3.5 w-3.5" /> Listening Lab · 听力练习</div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">Luyện nghe tiếng Trung</h1>
          <p className="mt-1 max-w-2xl text-sm sm:text-base text-stone-500 dark:text-stone-400">Nghe trước, chọn đáp án, rồi mở pinyin và nghĩa để kiểm tra mức độ hiểu bài.</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
          <div className="text-xs text-stone-500">Tiến độ phiên này</div><div className="mt-1 text-xl font-black">{answered}/{visibleLessons.length} <span className="text-sm font-semibold text-stone-400">· đúng {score}</span></div>
        </div>
      </div>

      <section className="rounded-3xl border border-stone-200 bg-white p-4 sm:p-5 dark:border-stone-800 dark:bg-stone-900">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold"><Settings2 className="h-4 w-4 text-amber-600" /> Tùy chỉnh bài nghe</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">Cấp độ HSK<select value={level} onChange={e=>setLevel(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm dark:border-stone-700 dark:bg-stone-800"><option value="all">Tất cả HSK 1–6</option>{[1,2,3,4,5,6].map(n=><option key={n} value={String(n)}>HSK {n}</option>)}</select></label>
          <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">Tốc độ giọng đọc <span className="ml-1 text-amber-700 dark:text-amber-300">{speed.toFixed(2)}×</span><input aria-label="Tốc độ giọng đọc" type="range" min="0.65" max="1.15" step="0.05" value={speed} onChange={e=>setSpeed(Number(e.target.value))} className="mt-4 block w-full accent-amber-600" /></label>
          <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={()=>setShowPinyin(v=>!v)} aria-pressed={showPinyin} className={`min-h-10 rounded-xl border px-3 text-xs font-semibold ${showPinyin?'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300':'border-stone-200 text-stone-500 dark:border-stone-700'}`}>Pinyin {showPinyin?'đang bật':'đang tắt'}</button><button type="button" onClick={()=>setShowMeaning(v=>!v)} aria-pressed={showMeaning} className={`min-h-10 rounded-xl border px-3 text-xs font-semibold ${showMeaning?'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300':'border-stone-200 text-stone-500 dark:border-stone-700'}`}>Nghĩa Việt {showMeaning?'đang bật':'đang tắt'}</button></div>
        </div>
      </section>

      <div className="space-y-4">
        {visibleLessons.map((item,index) => {
          const isRevealed = Boolean(revealed[item.id]);
          const choice = selected[item.id];
          const isCorrect = choice === item.answer;
          return <article key={item.id} className="overflow-hidden rounded-3xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 p-4 sm:p-5 dark:border-stone-800"><div><div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">HSK {item.hsk} · Bài {index+1}</div><h2 className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-100">{item.title}</h2></div><span className="rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-500 dark:bg-stone-800">约 1 分钟</span></div>
            <div className="p-4 sm:p-5">
              <div className="rounded-2xl bg-[#faf8f5] p-4 dark:bg-stone-950/70">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-600 text-white"><AudioLines className="h-5 w-5"/></div><div><div className="text-sm font-bold">Nghe đoạn hội thoại</div><div className="text-xs text-stone-500">Giọng tiếng Trung nếu thiết bị có hỗ trợ</div></div></div><button type="button" onClick={()=>speak(item)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-amber-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-amber-400"><Play className="h-4 w-4"/>{playingId===item.id?'Phát lại':'Phát audio'}</button></div>{playbackError && <p role="status" className="mt-3 text-xs leading-5 text-rose-700 dark:text-rose-300">{playbackError}</p>}
                {isRevealed && <div className="mt-4 space-y-2 border-t border-stone-200 pt-4 dark:border-stone-800"><p className="text-xl font-semibold leading-relaxed text-stone-900 dark:text-stone-100">{item.hanzi}</p>{showPinyin && <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-300">{item.pinyin}</p>}{showMeaning && <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">{item.meaning}</p>}</div>}
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-bold"><CircleHelp className="h-4 w-4 text-amber-600"/>{item.question}</div>
              <div className="mt-3 grid gap-2">{item.options.map((option,i)=><button key={option} type="button" disabled={isRevealed} onClick={()=>setSelected(previous=>({...previous,[item.id]:i}))} className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${choice===i?'border-amber-400 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100':'border-stone-200 hover:border-stone-300 dark:border-stone-700 dark:hover:border-stone-600'} ${isRevealed&&i===item.answer?'!border-emerald-400 !bg-emerald-50 dark:!bg-emerald-950/30':''}`}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-xs font-bold dark:bg-stone-800">{String.fromCharCode(65+i)}</span><span className="flex-1">{option}</span>{isRevealed&&i===item.answer&&<CheckCircle2 className="h-4 w-4 text-emerald-600"/>}</button>)}</div>
              {isRevealed ? <div className={`mt-3 rounded-xl p-3 text-sm ${isCorrect?'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200':'bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200'}`}><div className="font-bold">{isCorrect?'Chính xác!':'Cùng nghe lại và ghi nhớ nhé.'}</div><p className="mt-1 text-xs leading-5">{item.note}</p></div> : <button type="button" disabled={choice===undefined} onClick={()=>markAnswered(item)} className="mt-3 min-h-11 w-full rounded-xl bg-amber-700 px-4 text-sm font-bold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-40">Kiểm tra đáp án</button>}
            </div>
          </article>;
        })}
      </div>
      <div className="flex flex-col gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/50 dark:bg-amber-950/20"><div><div className="font-bold text-stone-900 dark:text-stone-100">Luyện nghe đều đặn, mỗi ngày một chút</div><p className="mt-1 text-xs leading-5 text-stone-600 dark:text-stone-400">Bộ bài mẫu hiện có nội dung từ HSK 1 đến HSK 6. Giọng đọc phụ thuộc vào giọng tiếng Trung được cài trên thiết bị.</p></div><button type="button" onClick={()=>{setSelected({});setRevealed({});setCompleted([]);setPlayingId(null);if('speechSynthesis' in window)window.speechSynthesis.cancel();}} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-stone-900 dark:text-amber-200"><RotateCcw className="h-4 w-4"/>Làm lại phiên</button></div>
    </div>
  );
};
