import React from 'react';
import { BookOpen, Bookmark, CheckCircle2, ChevronDown, ChevronUp, Eye, EyeOff, Headphones, Library, Search, Volume2 } from 'lucide-react';
import type { HSKLevel, Vocabulary } from '../../types';
import { HSK_LEVELS, GRADED_READINGS, type GradedReading } from '../../data/gradedReadings';
import { accountStorageKey } from '../../services/accountStorage';
import { listReadingDocuments, type ReadingDocument } from '../../services/readingLibrary';
import { getReadingVocabularyFit } from '../../services/readingVocabularyFit';

interface Props {
  ownerId: string;
  vocabularies: Vocabulary[];
  onSaveVocabulary: (id: string) => void;
  isVocabularySaved: (id: string) => boolean;
}
type ReadingProgress = Record<string, { completedAt: string; correct: number; total: number }>;

const PROGRESS_KEY = 'lina-graded-reading-progress-v1';
const FAVORITES_KEY = 'lina-graded-reading-favorites-v1';
type ReadingFilter = 'all' | 'unread' | 'completed' | 'favorites';

function readFavorites(ownerId: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(accountStorageKey(FAVORITES_KEY, ownerId)) || '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  } catch { return []; }
}
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


const PINYIN_SYLLABLES = new Set(`a ai an ang ao e ei en eng er o ou
ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu
pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu
ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu
fa fan fang fei fen feng fo fou fu
da dai dan dang dao de dei den deng di dia dian diao die ding diu dong dou du duan dui dun duo
ta tai tan tang tao te teng ti tian tiao tie ting tong tou tu tuan tui tun tuo
na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nuo nv nve
la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu lo long lou lu luan lun luo lv lve
 ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo
ka kai kan kang kao ke ken keng kong kou ku kua kuai kuan kuang kui kun kuo
ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo
ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun
qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun
xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun
zhi zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo
chi cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo
shi sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo
ri ran rang rao re ren reng ri rong rou ru rua ruan rui run ruo
zi za zai zan zang zao ze zei zen zeng zi zong zou zu zuan zui zun zuo
ci ca cai can cang cao ce cen ceng ci cong cou cu cuan cui cun cuo
si sa sai san sang sao se sen seng si song sou su suan sui sun suo
y ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun
w wa wai wan wang wei wen weng wo wu`.split(/\s+/));

const PINYIN_TONE_MAP: Record<string, string> = {ā:'a',á:'a',ǎ:'a',à:'a',ē:'e',é:'e',ě:'e',è:'e',ī:'i',í:'i',ǐ:'i',ì:'i',ō:'o',ó:'o',ǒ:'o',ò:'o',ū:'u',ú:'u',ǔ:'u',ù:'u',ǖ:'v',ǘ:'v',ǚ:'v',ǜ:'v',ü:'v',ń:'n',ň:'n',ḿ:'m'};

export function alignPinyinToHanzi(chinese: string, pinyin: string): Array<{ hanzi: string; pinyin: string }> | null {
  const hanzi = Array.from(chinese).filter(char => /[\u3400-\u9fff]/u.test(char));
  const normalized = Array.from(pinyin.toLocaleLowerCase()).map(char => PINYIN_TONE_MAP[char] || char).join('').replace(/u:/g, 'v');
  const compact = normalized.replace(/[^a-zv]/g, '');
  const memo = new Map<string, string[] | null>();
  const solve = (offset: number, remaining: number): string[] | null => {
    if (remaining === 0) return offset === compact.length ? [] : null;
    if (offset >= compact.length || compact.length - offset < remaining) return null;
    const key = offset + ':' + remaining;
    if (memo.has(key)) return memo.get(key)!;
    const candidates = [...PINYIN_SYLLABLES].filter(syllable => compact.startsWith(syllable, offset)).sort((a, b) => b.length - a.length);
    for (const syllable of candidates) {
      const rest = solve(offset + syllable.length, remaining - 1);
      if (rest) { const result = [syllable, ...rest]; memo.set(key, result); return result; }
    }
    memo.set(key, null);
    return null;
  };
  const syllables = solve(0, hanzi.length);
  if (!syllables || syllables.length !== hanzi.length) return null;
  return hanzi.map((char, index) => ({ hanzi: char, pinyin: syllables[index] }));
}

interface ReadingToken { text: string; focus: boolean; }

export function tokenizeReadingSentence(sentence: string, focusWords: string[]): ReadingToken[] {
  const characters = Array.from(sentence);
  const candidates = [...focusWords].filter(Boolean).sort((a, b) => Array.from(b).length - Array.from(a).length);
  const tokens: ReadingToken[] = [];
  let plain = '';
  const flushPlain = () => {
    if (plain) tokens.push({ text: plain, focus: false });
    plain = '';
  };
  for (let index = 0; index < characters.length;) {
    const match = candidates.find(word => characters.slice(index, index + Array.from(word).length).join('') === word);
    if (match) {
      flushPlain();
      tokens.push({ text: match, focus: true });
      index += Array.from(match).length;
    } else {
      plain += characters[index];
      index += 1;
    }
  }
  flushPlain();
  return tokens;
}

let readingSpeechTimer: number | undefined;

export function getReadingProsody(sentence: string, index = 0) {
  const ending = sentence.trim().slice(-1);
  const expressive = /但是|然而|不过|其实|重要|特别|真正|一定/.test(sentence);
  const pitch = /[？?]$/.test(ending) ? 1.12 : /[！!]$/.test(ending) ? 1.1 : expressive ? 1.06 : index % 2 === 0 ? 0.98 : 1.03;
  const pause = /[！!]$/.test(ending) ? 440 : /[？?]$/.test(ending) ? 400 : /[。；]$/.test(ending) ? 340 : 220;
  return { rate: 0.78, pitch, pause };
}

function speakChinese(value: string | string[]) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  if (readingSpeechTimer) window.clearTimeout(readingSpeechTimer);
  const sentences = (Array.isArray(value) ? value : [value]).map(item => item.trim()).filter(Boolean);
  const voices = window.speechSynthesis.getVoices();
  const chineseVoice = voices.find(voice => /^zh-CN/i.test(voice.lang)) || voices.find(voice => /^zh/i.test(voice.lang));
  let index = 0;
  const speakNext = () => {
    if (index >= sentences.length) return;
    const current = sentences[index];
    const prosody = getReadingProsody(current, index);
    const utterance = new SpeechSynthesisUtterance(current);
    utterance.lang = 'zh-CN';
    utterance.rate = prosody.rate;
    utterance.pitch = prosody.pitch;
    if (chineseVoice) utterance.voice = chineseVoice;
    utterance.onend = () => {
      index += 1;
      if (index < sentences.length) readingSpeechTimer = window.setTimeout(speakNext, prosody.pause);
    };
    utterance.onerror = () => {
      index += 1;
      if (index < sentences.length) readingSpeechTimer = window.setTimeout(speakNext, prosody.pause);
    };
    window.speechSynthesis.speak(utterance);
  };
  speakNext();
}

export const ReadingScreen: React.FC<Props> = ({ ownerId, vocabularies, onSaveVocabulary, isVocabularySaved }) => {
  const [level, setLevel] = React.useState<HSKLevel | '全部'>('HSK 1');
  const [topic, setTopic] = React.useState('Tất cả chủ đề');
  const [search, setSearch] = React.useState('');
  const [activeId, setActiveId] = React.useState(GRADED_READINGS[0].id);
  const [showPinyin, setShowPinyin] = React.useState(true);
  const [showVietnamese, setShowVietnamese] = React.useState(true);
  const [showChinese, setShowChinese] = React.useState(true);
  const [readingFilter, setReadingFilter] = React.useState<ReadingFilter>('all');
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>(() => readFavorites(ownerId));
  const [selectedTerm, setSelectedTerm] = React.useState<string | null>(null);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [progress, setProgress] = React.useState<ReadingProgress>(() => readProgress(ownerId));
  const [legacyDocs, setLegacyDocs] = React.useState<ReadingDocument[]>(() => listReadingDocuments(ownerId));
  const [legacyOpen, setLegacyOpen] = React.useState(false);
  const [legacyActive, setLegacyActive] = React.useState<ReadingDocument | null>(null);

  React.useEffect(() => {
    setProgress(readProgress(ownerId));
    setFavoriteIds(readFavorites(ownerId));
    setLegacyDocs(listReadingDocuments(ownerId));
    setLegacyActive(null);
  }, [ownerId]);

  const topics = React.useMemo(() => ['Tất cả chủ đề', ...Array.from(new Set(GRADED_READINGS.map(item => item.topic)))], []);
  const filtered = React.useMemo(() => GRADED_READINGS.filter(item => {
    const matchesLevel = level === '全部' || item.level === level;
    const matchesTopic = topic === 'Tất cả chủ đề' || item.topic === topic;
    const matchesStatus = readingFilter === 'all' || (readingFilter === 'unread' && !progress[item.id]) || (readingFilter === 'completed' && Boolean(progress[item.id])) || (readingFilter === 'favorites' && favoriteIds.includes(item.id));
    const needle = search.trim().toLocaleLowerCase();
    const matchesSearch = !needle || [item.title, item.titleZh, item.summary, item.topic, ...item.focusWords].join(' ').toLocaleLowerCase().includes(needle);
    return matchesLevel && matchesTopic && matchesSearch && matchesStatus;
  }), [level, topic, search, readingFilter, progress, favoriteIds]);

  const active = GRADED_READINGS.find(item => item.id === activeId) || filtered[0] || GRADED_READINGS[0];
  React.useEffect(() => {
    if (filtered.length > 0 && !filtered.some(item => item.id === activeId)) {
      setActiveId(filtered[0].id);
      setAnswers({});
      setSubmitted(false);
      setSelectedTerm(null);
    }
  }, [filtered, activeId]);
  const vocabByHanzi = React.useMemo(() => {
    const map = new Map<string, Vocabulary>();
    for (const item of vocabularies) map.set(item.hanzi, item);
    return map;
  }, [vocabularies]);
  const matchedWords = active.focusWords.map(word => vocabByHanzi.get(word)).filter((item): item is Vocabulary => Boolean(item));
  const missingWords = active.focusWords.filter(word => !vocabByHanzi.has(word));
  const activeVocabularyFit = getReadingVocabularyFit(active.focusWords, vocabularies.map(item => item.hanzi));
  const bestFitReading = React.useMemo(() => {
    if (vocabularies.length === 0) return null;
    return GRADED_READINGS
      .map(reading => ({ reading, fit: getReadingVocabularyFit(reading.focusWords, vocabularies.map(item => item.hanzi)) }))
      .filter(item => item.fit.matchedCount > 0)
      .sort((a, b) => b.fit.coveragePercent - a.fit.coveragePercent || a.fit.missingCount - b.fit.missingCount)[0] || null;
  }, [vocabularies]);
  const selectedVocabulary = selectedTerm ? vocabByHanzi.get(selectedTerm) : undefined;
  const score = active.questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);
  const completedCount = Object.keys(progress).length;
  const favoriteCount = favoriteIds.length;
  const toggleFavorite = (readingId: string) => {
    const next = favoriteIds.includes(readingId) ? favoriteIds.filter(id => id !== readingId) : [...favoriteIds, readingId];
    setFavoriteIds(next);
    try { localStorage.setItem(accountStorageKey(FAVORITES_KEY, ownerId), JSON.stringify(next)); } catch { /* favorites remain available for this session */ }
  };

  const selectReading = (item: GradedReading) => {
    setActiveId(item.id);
    setAnswers({});
    setSubmitted(false);
    setSelectedTerm(null);
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

    {bestFitReading && <section className="flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/20 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">Gợi ý theo vốn từ của bạn</p>
        <h2 className="mt-1 font-bold text-stone-900 dark:text-stone-100">{bestFitReading.reading.title} <span className="ml-1 text-xs font-semibold text-sky-700 dark:text-sky-300">{bestFitReading.reading.level}</span></h2>
        <p className="mt-1 text-xs leading-5 text-stone-600 dark:text-stone-300">Bạn đã có {bestFitReading.fit.matchedCount}/{bestFitReading.fit.totalCount} từ trọng tâm ({bestFitReading.fit.coveragePercent}%). Bài này giúp tận dụng từ đã học và bổ sung {bestFitReading.fit.missingCount} từ mới.</p>
      </div>
      <button type="button" onClick={() => selectReading(bestFitReading.reading)} className="min-h-10 shrink-0 rounded-xl bg-sky-800 px-4 text-xs font-bold text-white hover:bg-sky-700">Đọc bài phù hợp →</button>
    </section>}
    <section className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_170px_190px_190px]">
      <label className="relative block"><span className="sr-only">Tìm bài đọc hoặc từ vựng</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm chủ đề, tiêu đề hoặc từ vựng…" className="min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-950"/></label>
      <label className="text-xs font-bold text-stone-500">Cấp độ HSK<select value={level} onChange={e=>setLevel(e.target.value as HSKLevel | '全部')} className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"><option value="全部">Tất cả cấp độ</option>{HSK_LEVELS.map(item=><option key={item}>{item}</option>)}</select></label>
      <label className="text-xs font-bold text-stone-500">Chủ đề<select value={topic} onChange={e=>setTopic(e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100">{topics.map(item=><option key={item}>{item}</option>)}</select></label>
      <label className="text-xs font-bold text-stone-500">Trạng thái luyện đọc<select value={readingFilter} onChange={e=>setReadingFilter(e.target.value as ReadingFilter)} className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"><option value="all">Tất cả bài đọc</option><option value="unread">Chưa luyện ({GRADED_READINGS.length-completedCount})</option><option value="completed">Đã hoàn thành ({completedCount})</option><option value="favorites">Yêu thích ({favoriteCount})</option></select></label>
    </section>

    <div className="grid min-w-0 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-extrabold">Bài đọc ({filtered.length})</h2><span className="text-xs text-stone-500">{completedCount} đã hoàn thành</span></div>
        {filtered.length ? filtered.map(item => <button key={item.id} type="button" onClick={()=>selectReading(item)} className={`w-full rounded-2xl border p-3 text-left transition ${active.id===item.id?'border-emerald-500 bg-emerald-50/80 shadow-sm dark:bg-emerald-950/20':'border-stone-200 bg-white hover:border-emerald-300 dark:border-stone-800 dark:bg-stone-900'}`}>
          <div className="flex items-center justify-between gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${levelColor[item.level]}`}>{item.level}</span><span className="flex items-center gap-2">{favoriteIds.includes(item.id)&&<Bookmark className="h-3.5 w-3.5 fill-amber-500 text-amber-600"/>}{progress[item.id]&&<CheckCircle2 className="h-4 w-4 text-emerald-600"/>}</span></div>
          <p className="mt-2 text-sm font-extrabold text-stone-900 dark:text-stone-100">{item.title}</p><p className="mt-0.5 font-cjk text-sm text-stone-500">{item.titleZh}</p><p className="mt-2 text-xs leading-5 text-stone-500">{item.summary}</p>
          <div className="mt-2 flex items-center justify-between text-[10px] text-stone-400"><span>{item.topic}</span><span>{item.estimatedMinutes} phút</span></div>
        </button>) : <div className="rounded-2xl border border-dashed border-stone-300 p-5 text-center text-sm text-stone-500">Không tìm thấy bài phù hợp. Hãy thử bộ lọc khác hoặc lưu một bài vào mục yêu thích.</div>}
      </aside>

      <main className="min-w-0 space-y-4">
        <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6">
          {legacyActive ? <div className="space-y-3"><button onClick={()=>setLegacyActive(null)} className="text-xs font-bold text-emerald-700">← Quay lại bài đọc HSK</button><h2 className="text-xl font-black">{legacyActive.title}</h2><p className="whitespace-pre-wrap font-cjk text-base leading-8">{legacyActive.text}</p><p className="text-xs text-stone-500">Tài liệu OCR cũ · {legacyActive.sourceName || 'Văn bản đã lưu'}</p></div> : <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${levelColor[active.level]}`}>{active.level}</span><span className="text-xs text-stone-500">{active.topic} · {active.estimatedMinutes} phút</span></div><h2 className="mt-2 text-xl font-black text-stone-900 dark:text-stone-100 sm:text-2xl">{active.title}</h2><p className="mt-1 font-cjk text-lg text-emerald-800 dark:text-emerald-300">{active.titleZh}</p><p className="mt-2 text-sm text-stone-500">{active.summary}</p></div>
              <button type="button" onClick={()=>toggleFavorite(active.id)} aria-pressed={favoriteIds.includes(active.id)} className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition ${favoriteIds.includes(active.id)?'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200':'border-stone-200 text-stone-600 hover:border-amber-300 dark:border-stone-700 dark:text-stone-300'}`}><Bookmark className="h-4 w-4" fill={favoriteIds.includes(active.id)?'currentColor':'none'}/>{favoriteIds.includes(active.id)?'Đã yêu thích':'Lưu bài đọc'}</button>
              <button onClick={()=>speakChinese(active.sentences.map(sentence=>sentence.chinese))} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald-200 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300"><Headphones className="h-4 w-4"/> Nghe chậm & có ngữ điệu</button>
            </div>
            <div className="mt-5 flex flex-wrap gap-4 border-y border-stone-100 py-3 text-xs dark:border-stone-800">
              <button type="button" onClick={()=>setShowPinyin(value=>!value)} aria-pressed={showPinyin} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald-200 px-3 font-bold text-emerald-800 transition hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40">{showPinyin?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}{showPinyin?'Ẩn Pinyin · tự kiểm tra':'Hiện lại Pinyin'}</button>
              <button type="button" onClick={()=>setShowChinese(value=>!value)} aria-pressed={showChinese} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-sky-200 px-3 font-bold text-sky-800 transition hover:bg-sky-50 dark:border-sky-900 dark:text-sky-300 dark:hover:bg-sky-950/40">{showChinese?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}{showChinese?'Ẩn chữ Hán · luyện nghe':'Hiện lại chữ Hán'}</button>
              <label className="flex min-h-10 items-center gap-2"><input type="checkbox" checked={showVietnamese} onChange={e=>setShowVietnamese(e.target.checked)}/> Hiện tiếng Việt</label>
            </div>
            <article className="mt-4 rounded-2xl border border-stone-200 bg-[#fffefb] p-4 sm:p-6 dark:border-stone-800 dark:bg-stone-950/60">
              <div className="mb-4 flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[.16em] text-stone-400">Bài đọc · đọc liền mạch</span><span className="text-[10px] text-stone-400">Chạm từ gạch chân để tra nghĩa</span></div>
              {showChinese ? <p className="font-cjk text-xl leading-[3.4] text-stone-900 dark:text-stone-100 sm:text-2xl sm:leading-[3.6]">
                {active.sentences.map((sentence, sentenceIndex) => {
                  const aligned = alignPinyinToHanzi(sentence.chinese, sentence.pinyin);
                  let hanziIndex = 0;
                  const renderToken = (token: ReadingToken, tokenIndex: number) => {
                    const chars = Array.from(token.text);
                    const rendered = chars.map((char, charIndex) => {
                      const hasReading = /[\u3400-\u9fff]/u.test(char);
                      const reading = hasReading ? aligned?.[hanziIndex++] : undefined;
                      const glyph = <span key={charIndex} className="reading-ruby-unit">{showPinyin && reading ? <ruby>{char}<rt>{reading.pinyin}</rt></ruby> : char}</span>;
                      return glyph;
                    });
                    return token.focus ? <button key={tokenIndex} type="button" onClick={() => setSelectedTerm(token.text)} aria-pressed={selectedTerm === token.text} className={"reading-focus-word rounded px-0.5 underline decoration-dotted decoration-emerald-500 underline-offset-4 transition hover:bg-emerald-100 dark:hover:bg-emerald-950/60 " + (selectedTerm === token.text ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-100" : "")}>{rendered}</button> : <React.Fragment key={tokenIndex}>{rendered}</React.Fragment>;
                  };
                  return <React.Fragment key={sentenceIndex}>{tokenizeReadingSentence(sentence.chinese, active.focusWords).map(renderToken)}</React.Fragment>;
                })}
              </p> : <div className="rounded-xl border border-dashed border-sky-300 bg-sky-50/70 px-4 py-8 text-center dark:border-sky-900 dark:bg-sky-950/20"><Headphones className="mx-auto h-6 w-6 text-sky-700 dark:text-sky-300"/><p className="mt-2 text-sm font-bold text-sky-900 dark:text-sky-100">Chế độ nghe không nhìn chữ</p><p className="mt-1 text-xs leading-6 text-sky-800 dark:text-sky-200">Bật giọng đọc, nghe và thử ghi nhớ nội dung. Khi sẵn sàng, chọn “Hiện lại chữ Hán” để tự đối chiếu. Pinyin cũng được ẩn trong chế độ này.</p></div>}
              {showChinese && showPinyin && active.sentences.some(sentence => !alignPinyinToHanzi(sentence.chinese, sentence.pinyin)) && <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">Một số câu chưa thể căn chỉnh Pinyin chính xác theo từng chữ; Lina vẫn hiển thị Pinyin nguyên câu bên dưới để tránh gắn sai âm.</p>}
              {showChinese && showPinyin && active.sentences.some(sentence => !alignPinyinToHanzi(sentence.chinese, sentence.pinyin)) && <div className="mt-2 space-y-1 text-xs leading-6 text-emerald-800 dark:text-emerald-300">{active.sentences.filter(sentence => !alignPinyinToHanzi(sentence.chinese, sentence.pinyin)).map((sentence, index) => <p key={index}>{sentence.pinyin}</p>)}</div>}
              {showVietnamese && <div className="mt-5 space-y-3 border-t border-stone-200 pt-4 dark:border-stone-800">{active.sentences.map((sentence, index) => <div key={index} className="flex items-start gap-3"><span className="mt-0.5 shrink-0 text-[10px] font-bold text-stone-400">{index + 1}.</span><p className="text-sm leading-7 text-stone-600 dark:text-stone-300">{sentence.vietnamese}</p><button onClick={() => speakChinese(sentence.chinese)} aria-label={`Nghe câu ${index + 1}`} className="ml-auto shrink-0 rounded-lg p-2 text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300"><Volume2 className="h-4 w-4"/></button></div>)}</div>}
            </article>
            {selectedTerm && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/20" aria-live="polite">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Từ được chọn</div>
                  <div className="mt-1 font-cjk text-2xl font-black text-stone-900 dark:text-stone-100">{selectedTerm}</div>
                  {selectedVocabulary ? <>
                    <p className="mt-1 text-sm font-semibold text-emerald-800 dark:text-emerald-300">{showPinyin ? selectedVocabulary.pinyin : 'Ẩn trong chế độ tự kiểm tra'}</p>
                    <p className="mt-1 text-sm text-stone-700 dark:text-stone-200">{selectedVocabulary.vietnamese}</p>
                    <p className="mt-1 text-[11px] text-stone-500">{selectedVocabulary.hskLevel} · {selectedVocabulary.partOfSpeech || 'Từ vựng'}</p>
                  </> : <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Từ này chưa có mục từ khớp chính xác trong kho từ vựng LinaAI. Mình không tự tạo Pinyin hoặc nghĩa để tránh hiển thị sai.</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {selectedVocabulary && <button type="button" onClick={() => onSaveVocabulary(selectedVocabulary.id)} className="rounded-xl border border-emerald-300 p-2 text-emerald-800 hover:bg-white dark:border-emerald-800 dark:text-emerald-300" aria-label={isVocabularySaved(selectedVocabulary.id) ? 'Bỏ lưu từ' : 'Lưu từ vào ôn tập'}><Bookmark className="h-4 w-4" fill={isVocabularySaved(selectedVocabulary.id) ? 'currentColor' : 'none'}/></button>}
                  <button type="button" onClick={() => setSelectedTerm(null)} className="rounded-xl p-2 text-stone-500 hover:bg-white dark:hover:bg-stone-900" aria-label="Đóng giải thích từ">×</button>
                </div>
              </div>
            </div>}
            <p className="mt-4 text-[11px] leading-5 text-stone-400">{active.sourceNote}</p>
          </>}
        </section>

        {!legacyActive&&<section className="rounded-3xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-extrabold">Từ vựng trọng tâm</h3><p className="mt-1 text-xs text-stone-500">Đối chiếu trực tiếp với kho từ vựng LinaAI hiện có.</p></div><span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{activeVocabularyFit.matchedCount}/{activeVocabularyFit.totalCount} từ · {activeVocabularyFit.coveragePercent}% phù hợp</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800" role="progressbar" aria-label="Mức độ phù hợp của bài đọc với vốn từ" aria-valuemin={0} aria-valuemax={100} aria-valuenow={activeVocabularyFit.coveragePercent}><div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: activeVocabularyFit.coveragePercent + '%' }}/></div>
          <p className="mt-1 text-[11px] text-stone-500">{activeVocabularyFit.coveragePercent >= 80 ? 'Phù hợp tốt: phần lớn từ trọng tâm bạn đã học.' : activeVocabularyFit.coveragePercent >= 40 ? 'Phù hợp vừa phải: có cả từ quen thuộc và từ mới để mở rộng vốn từ.' : 'Thử đọc chậm và lưu các từ mới vào ôn tập để xây nền tảng.'}</p>
          {matchedWords.length>0&&<div className="mt-3 flex flex-wrap gap-2">{matchedWords.map(word=><div key={word.id} className="flex items-center gap-1.5 rounded-xl border border-stone-200 px-2.5 py-2 dark:border-stone-700"><div><div className="font-cjk text-sm font-bold">{word.hanzi}</div>{showPinyin&&<div className="text-[10px] text-emerald-700">{word.pinyin}</div>}<div className="max-w-36 text-[10px] text-stone-500">{word.vietnamese}</div></div><button onClick={()=>onSaveVocabulary(word.id)} title={isVocabularySaved(word.id)?'Bỏ lưu từ':'Lưu vào ôn tập'} aria-label={`${isVocabularySaved(word.id)?'Bỏ lưu':'Lưu'} ${word.hanzi}`} className={`rounded-lg p-1.5 ${isVocabularySaved(word.id)?'text-emerald-700':'text-stone-400 hover:text-emerald-700'}`}><Bookmark className="h-4 w-4" fill={isVocabularySaved(word.id)?'currentColor':'none'}/></button></div>)}</div>}
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

    <section className="rounded-2xl bg-stone-100/80 p-4 dark:bg-stone-900/70"><h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-600 dark:text-stone-300">Nguồn tham khảo để đọc thêm</h3><div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300"><a href="https://haohsk.com/learn/reading" target="_blank" rel="noreferrer">HaoHsk ↗</a><a href="https://hskstory.com/" target="_blank" rel="noreferrer">HSKStory ↗</a><a href="https://literatelanguages.com/chinese/reading-practice/" target="_blank" rel="noreferrer">Literate Chinese ↗</a><a href="https://nihaolearn.com/" target="_blank" rel="noreferrer">NihaoLearn ↗</a></div><p className="mt-2 text-[11px] leading-5 text-stone-500">Các liên kết trên là nguồn tham khảo bên ngoài. Bài trong thư viện LinaAI được biên soạn mới, không sao chép nguyên văn nội dung có bản quyền. Cấp độ dùng hệ HSK cổ điển 1–6 hiện có trong ứng dụng; đây không phải hệ HSK 3.0 cấp 1–9.</p></section>
  </div>;
};
