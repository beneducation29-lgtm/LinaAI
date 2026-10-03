import React, { useMemo, useRef, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, Headphones, Mic, MessageCircle, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HSK1_LESSONS } from '../../data/hsk1Lessons';
import { HSK_CURRICULUM_LEVELS } from '../../data/hskCurriculum';
import { HSK2_TO_6_LESSONS } from '../../data/hsk2to6Lessons';
import type { HSKLevel } from '../../types';
import { InteractiveChineseSentence } from '../common/InteractiveChineseSentence';
import { LayerToggles } from '../common/LayerToggles';
import { speechService } from '../../services/speech';
import { aiTutor } from '../../services/aiTutor';
import { analytics } from '../../services/analytics';

type Section = 'learn' | 'listen' | 'speak' | 'roleplay' | 'review';

export const LearningSystemScreen: React.FC = () => {
  const { user, setCurrentTab, recordLearningResult, addMistake, getDueReviewCount, structuredProgress, learnerProfileMemory, recordMotivationActivity } = useApp();
  const [lessonId,setLessonId] = useState('hsk1-lesson-1');
  const [selectedHsk,setSelectedHsk] = useState<HSKLevel>('HSK 1');
  const [section,setSection] = useState<Section>('learn');
  const [reviewIndex,setReviewIndex] = useState(0);
  const [reviewDone,setReviewDone] = useState(false);
  const [speechText,setSpeechText] = useState('');
  const [feedback,setFeedback] = useState('');
  const [roleplayInput,setRoleplayInput] = useState('');
  const [roleplayReply,setRoleplayReply] = useState('');
  const [busy,setBusy] = useState(false);
  const [pinyinMode,setPinyinMode] = useState<'marks'|'numbers'|'hidden'>('marks');
  const lessonStartedAt = useRef<Record<string, number>>({});

  const lessonsForLevel = useMemo(() => selectedHsk === 'HSK 1' ? HSK1_LESSONS : HSK2_TO_6_LESSONS.filter(l => l.hskLevel === selectedHsk), [selectedHsk]);
  const lesson = useMemo(() => lessonsForLevel.find(l => l.id === lessonId) || lessonsForLevel[0] || HSK1_LESSONS[0], [lessonId, lessonsForLevel]);
  const selectedCurriculum = HSK_CURRICULUM_LEVELS.find(x => x.level === selectedHsk) || HSK_CURRICULUM_LEVELS[0];
  React.useEffect(() => {
    lessonStartedAt.current[lesson.id] = Date.now();
    analytics.track('lesson_start', { lessonId: lesson.id, hskLevel: lesson.hskLevel });
  }, [lesson.id]);
  const currentReview = lesson.review[reviewIndex];

  const speak = (text:string) => speechService.speakChinese(text,{useGeminiTTS:true});
  const pinyinFor = (marked:string, numbered:string) => pinyinMode === 'hidden' ? '' : pinyinMode === 'numbers' ? numbered : marked;

  const evaluateSpeech = () => {
    analytics.track('speaking_start', { lessonId: lesson.id, source: 'lesson' });
    const target = lesson.speaking[0].prompt.chinese;
    const result = speechService.analyzePronunciation(target,speechText);
    setFeedback(result.feedback + ' Điểm phản hồi: ' + result.overall + '/100.');
    recordLearningResult(lesson.speaking[0].id,result.overall >= 80);
    recordMotivationActivity({ id: `pronunciation:learning:${lesson.id}:${Date.now()}`, type: 'pronunciation', minutes: 1, lessonId: lesson.id, metadata: { score: result.overall } });
    analytics.track('pronunciation_practice', { lessonId: lesson.id, score: result.overall });
    analytics.track('speaking_complete', { lessonId: lesson.id, score: result.overall, minutes: 1 });
    if(result.overall < 80) addMistake({type:'pronunciation',original:speechText || '(chưa nhận diện)',corrected:target,explanation:result.feedback,mastery:0});
  };

  const startRoleplay = async () => {
    if(!roleplayInput.trim()) return;
    analytics.track('roleplay_start', { lessonId: lesson.id, roleplayId: lesson.roleplay.id });
    setBusy(true);
    try {
      const result = await aiTutor.sendMessage({
        conversationId: lesson.id,
        topicTitleVi: lesson.roleplay.title,
        hskLevel: lesson.hskLevel,
        userLevel: user.currentLevel,
        userName: user.name,
        history: [],
        mode: 'conversation',
        memoryFacts: learnerProfileMemory().recentMistakes
      },roleplayInput);
      setRoleplayReply(result.chinese + ' ' + result.vietnamese);
      if(result.correction && result.correction.hasMistake) {
        addMistake({type:'grammar',original:result.correction.originalSentence,corrected:result.correction.correctedSentence,explanation:result.correction.explanationVi,mastery:0});
      }
      recordLearningResult(lesson.roleplay.id, !result.correction?.hasMistake);
      analytics.track('roleplay_complete', { lessonId: lesson.id, roleplayId: lesson.roleplay.id, ai: true, minutes: 1 });
    } finally { setBusy(false); }
  };

  const finishReview = (correct:boolean) => {
    analytics.track('quiz_answer', { lessonId: lesson.id, questionType: currentReview.type, correct });
    if(correct) recordLearningResult(currentReview.vocabularyId || lesson.id,true);
    else addMistake({type:'vocabulary',original:currentReview.prompt,corrected:currentReview.answer,explanation:'Ôn lại mục này trong lượt review tiếp theo.',mastery:0});
    recordLearningResult(currentReview.vocabularyId || lesson.id,correct);
    if(reviewIndex + 1 < lesson.review.length) setReviewIndex(reviewIndex + 1); else { setReviewDone(true); const startedAt=lessonStartedAt.current[lesson.id]||Date.now(); const minutes=Math.max(1,Math.round((Date.now()-startedAt)/60000)); analytics.track('quiz_complete', { lessonId: lesson.id, score: correct ? 100 : 0, minutes: 1 }); analytics.track('lesson_complete', { lessonId: lesson.id, hskLevel: lesson.hskLevel, minutes }); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300"><Sparkles className="w-4 h-4"/>HSK Learning System</div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">Lộ trình tiếng Trung có cấu trúc</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">HSK 1–6 dùng chung Knowledge Engine. Mỗi level có bài học, từ vựng, ngữ pháp, nghe, nói, roleplay và review; nội dung seed được đánh dấu rõ để tiếp tục QA theo curriculum source.</p>
        </div>
        <div className="flex gap-2"><span className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-bold">{user.currentHsk}</span><span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-xs font-bold text-amber-800 dark:text-amber-300">{getDueReviewCount()} cần ôn</span></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {HSK_CURRICULUM_LEVELS.map(({ level, contentStatus }) => (
          <button key={level} type="button" onClick={() => { setSelectedHsk(level); const next = level === 'HSK 1' ? HSK1_LESSONS[0] : HSK2_TO_6_LESSONS.find(l => l.hskLevel === level); if (next) { setLessonId(next.id); setSection('learn'); setReviewIndex(0); setReviewDone(false); } }} className={'rounded-xl border p-3 text-left transition-all ' + (selectedHsk === level ? 'bg-stone-900 text-white border-stone-900 shadow-sm' : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-800 hover:border-amber-400')}>
            <div className="text-xs font-bold">{level}</div><div className="text-[10px] mt-1">{level === 'HSK 1' ? '45 từ · 10 bài' : contentStatus === 'CONTENT_GAP' ? 'Khung đã mở · đang bổ sung' : 'Đã có nội dung'}</div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-4">
        <aside className="space-y-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">{lessonsForLevel.length} bài {selectedHsk}</div>
            <div className="space-y-1.5">{lessonsForLevel.map(l => <button key={l.id} type="button" onClick={() => {setLessonId(l.id);setSection('learn');setReviewIndex(0);setReviewDone(false);analytics.track('lesson_start',{lessonId:l.id,hskLevel:l.hskLevel,source:'lesson_selector'});}} className={'w-full text-left p-2.5 rounded-xl text-xs ' + (lesson.id === l.id ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800')}><span className="font-bold mr-1">{l.lessonNumber}.</span>{l.titleVi}</button>)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-stone-900 text-white">
            <div className="text-xs text-amber-300 font-bold">KNOWLEDGE ENGINE · {selectedHsk}</div>
            <div className="mt-2 text-sm">{lesson.vocabulary.length} từ · {lesson.grammar.length} grammar · nghe · nói · roleplay · review</div>
            <button type="button" onClick={() => setCurrentTab('review')} className="mt-3 w-full min-h-10 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold">Ôn tập ngay</button>
          </div>
        </aside>
        <section className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><div className="text-xs text-amber-700 dark:text-amber-300 font-bold">{lesson.hskLevel} · Bài {lesson.lessonNumber}</div><h2 className="text-2xl font-bold mt-1">{lesson.titleVi}</h2><div className="font-cjk text-lg text-stone-500">{lesson.titleZh} · {lesson.pinyin}</div><p className="text-sm text-stone-600 dark:text-stone-400 mt-2">{lesson.objective}</p></div>
              <LayerToggles compact/>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">{(['learn','listen','speak','roleplay','review'] as Section[]).map(x => <button key={x} type="button" onClick={() => setSection(x)} className={'px-3 py-2 rounded-xl text-xs font-bold ' + (section === x ? 'bg-stone-900 text-white' : 'bg-stone-100 dark:bg-stone-800')}>{x === 'learn' ? 'Học' : x === 'listen' ? 'Nghe' : x === 'speak' ? 'Nói' : x === 'roleplay' ? 'Roleplay' : 'Review'}</button>)}</div>
          </div>

          {section === 'learn' && <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">{lesson.vocabulary.map(item => <div key={item.id} className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <InteractiveChineseSentence chinese={item.hanzi} pinyin={pinyinFor(item.pinyin,item.pinyinNumbered)} vietnamese={item.vietnamese} vocabulary={lesson.vocabulary}/>
              <div className="mt-3 text-[11px] text-stone-500">{item.partOfSpeech} · {item.category} · Độ khó {item.difficulty}/3</div>
              <button type="button" onClick={() => speak(item.hanzi)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300"><Volume2 className="w-4 h-4"/>Nghe</button>
            </div>)}</div>
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
              <div className="text-xs font-bold uppercase tracking-wider">Ngữ pháp</div>
              {lesson.grammar.map(g => <div key={g.id} className="mt-4"><div className="font-bold">{g.pattern} · {g.meaning}</div><p className="text-sm mt-1">{g.explanationVi}</p><InteractiveChineseSentence chinese={g.examples[0].chinese} pinyin={g.examples[0].pinyin} vietnamese={g.examples[0].vietnamese} vocabulary={lesson.vocabulary} className="mt-2"/><div className="text-xs text-stone-500 mt-2">Lỗi thường gặp: {g.commonMistakes.join(' ')}</div><div className="text-xs text-stone-500 mt-1">Bài tập: {g.practiceQuestions.join(' · ')}</div></div>)}
            </div>
            <div className="flex gap-2"><button type="button" onClick={() => setPinyinMode('marks')} className="px-3 py-2 rounded-xl text-xs bg-stone-100 dark:bg-stone-800 font-semibold">Pinyin dấu</button><button type="button" onClick={() => setPinyinMode('numbers')} className="px-3 py-2 rounded-xl text-xs bg-stone-100 dark:bg-stone-800 font-semibold">Pinyin số</button><button type="button" onClick={() => setPinyinMode('hidden')} className="px-3 py-2 rounded-xl text-xs bg-stone-100 dark:bg-stone-800 font-semibold">Ẩn Pinyin</button></div>
          </div>}

          {section === 'listen' && <div className="space-y-3">{lesson.listening.map(item => <div key={item.id} className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800"><InteractiveChineseSentence chinese={item.chinese} pinyin={item.pinyin} vietnamese={item.vietnamese} vocabulary={lesson.vocabulary}/><button type="button" onClick={() => speak(item.chinese)} className="mt-3 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold inline-flex gap-2 items-center"><Headphones className="w-4 h-4"/>Nghe lại</button></div>)}</div>}

          {section === 'speak' && <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
            <InteractiveChineseSentence chinese={lesson.speaking[0].prompt.chinese} pinyin={lesson.speaking[0].prompt.pinyin} vietnamese={lesson.speaking[0].prompt.vietnamese} vocabulary={lesson.vocabulary}/>
            <div className="flex gap-2"><button type="button" onClick={() => speak(lesson.speaking[0].prompt.chinese)} className="px-4 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-sm font-bold"><Volume2 className="w-4 h-4 inline mr-1"/>Nghe mẫu</button><button type="button" onClick={() => speechService.startListening({lang:'zh-CN',onResult:r=>r.isFinal&&setSpeechText(r.transcript),onError:setFeedback,onEnd:()=>{}})} className="px-4 py-3 rounded-xl bg-amber-700 text-white text-sm font-bold"><Mic className="w-4 h-4 inline mr-1"/>Nói</button></div>
            <textarea value={speechText} onChange={e=>setSpeechText(e.target.value)} placeholder="Bạn có thể nhập câu nếu chưa dùng mic..." className="w-full min-h-24 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent p-3 text-sm"/>
            <button type="button" onClick={evaluateSpeech} className="px-4 py-3 rounded-xl bg-stone-900 text-white text-sm font-bold">AI đánh giá & lưu tiến bộ</button>
            {feedback && <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-sm">{feedback}</div>}
          </div>}

          {section === 'roleplay' && <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
            <div><div className="text-xs font-bold text-amber-700">Roleplay · {lesson.roleplay.title}</div><p className="text-sm mt-1">{lesson.roleplay.situation}</p></div>
            <InteractiveChineseSentence chinese={lesson.roleplay.aiOpening.chinese} pinyin={lesson.roleplay.aiOpening.pinyin} vietnamese={lesson.roleplay.aiOpening.vietnamese} vocabulary={lesson.vocabulary}/>
            <textarea value={roleplayInput} onChange={e=>setRoleplayInput(e.target.value)} placeholder="Nhập câu trả lời bằng tiếng Trung hoặc dùng mic ở phần Nói." className="w-full min-h-24 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent p-3 text-sm"/>
            <button type="button" disabled={busy} onClick={startRoleplay} className="px-4 py-3 rounded-xl bg-amber-700 text-white text-sm font-bold inline-flex gap-2 items-center disabled:opacity-50"><MessageCircle className="w-4 h-4"/>{busy ? 'Lina đang phản hồi...' : 'Gửi cho Lina AI'}</button>
            {roleplayReply && <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-sm">{roleplayReply}</div>}
            <div className="text-xs text-stone-500">AI đánh giá: {lesson.roleplay.evaluationDimensions.join(' · ')}. Sai ngữ pháp sẽ được lưu vào hồ sơ lỗi.</div>
          </div>}

          {section === 'review' && <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            {!reviewDone ? <><div className="text-xs text-stone-500">Review {reviewIndex + 1}/{lesson.review.length} · {currentReview.type}</div><div className="text-2xl font-bold mt-3">{currentReview.prompt}</div>{currentReview.sentence && <InteractiveChineseSentence chinese={currentReview.sentence.chinese} pinyin={currentReview.sentence.pinyin} vietnamese={currentReview.sentence.vietnamese} vocabulary={lesson.vocabulary} className="mt-3"/>}<div className="mt-4 flex gap-2"><button type="button" onClick={() => finishReview(true)} className="px-4 py-3 rounded-xl bg-emerald-700 text-white text-sm font-bold">Đúng</button><button type="button" onClick={() => finishReview(false)} className="px-4 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-sm font-bold">Chưa nhớ</button></div></> : <div className="text-center py-8"><CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto"/><h3 className="text-xl font-bold mt-2">Đã hoàn thành review</h3><button type="button" onClick={() => {setReviewIndex(0);setReviewDone(false)}} className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold"><RotateCcw className="w-4 h-4 inline mr-1"/>Làm lại</button></div>}
          </div>}
        </section>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Phản hồi tiến bộ</div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-3">
          <Metric label="Bài học" value={user.lessonsCompletedCount}/><Metric label="Từ vựng" value={user.vocabularyLearnedCount}/><Metric label="Nói" value={structuredProgress[lesson.id]?.speaking || 0}/><Metric label="Nghe" value={structuredProgress[lesson.id]?.listening || 0}/><Metric label="Ngữ pháp" value={structuredProgress[lesson.id]?.grammar || 0}/><Metric label="Thanh điệu" value={user.pronunciationAccuracy}/>
        </div>
      </div>
    </div>
  );
};

const Metric:React.FC<{label:string;value:number}> = ({label,value}) => <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60"><div className="text-lg font-bold">{value}{label === 'Thanh điệu' ? '%' : ''}</div><div className="text-[11px] text-stone-500">{label}</div></div>;

      )}