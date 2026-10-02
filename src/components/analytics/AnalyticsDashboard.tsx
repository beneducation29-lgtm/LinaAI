import React from 'react';
import { BarChart3, BookOpen, Brain, Clock3, Mic, ShieldCheck, Users, Volume2 } from 'lucide-react';
import { analytics } from '../../services/analytics';
import { fetchAdminAnalytics } from '../../services/analyticsApi';
import type { AdminAnalyticsSummary } from '../../types/analytics';

type Mode='learner'|'admin';

const Stat=({label,value,icon:Icon}:{label:string;value:string|number;icon:React.ComponentType<{className?:string}>}) => (
  <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
    <div className="flex items-center gap-2 text-xs text-stone-500"><Icon className="w-4 h-4"/><span>{label}</span></div>
    <div className="mt-2 text-2xl font-bold tabular-nums">{value}</div>
  </div>
);

export const AnalyticsDashboard: React.FC<{mode:Mode}> = ({mode}) => {
  const [learner,setLearner]=React.useState(analytics.getLearnerSummary());
  const [admin,setAdmin]=React.useState<AdminAnalyticsSummary|null>(null);
  const [days,setDays]=React.useState(30);
  const [error,setError]=React.useState('');

  React.useEffect(()=>{ if(mode==='learner') setLearner(analytics.getLearnerSummary()); else void fetchAdminAnalytics(days).then(setAdmin).catch(e=>setError(e instanceof Error?e.message:'Không thể tải analytics.')); },[mode,days]);

  if(mode==='learner') return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-stone-950 p-5 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-5">
        <div><div className="text-xs font-bold uppercase tracking-wider text-amber-700">Lina Analytics</div><h1 className="text-3xl font-bold mt-1">Bạn đang học như thế nào?</h1><p className="text-sm text-stone-500 mt-1">Chỉ dùng dữ liệu analytics đã lưu trên thiết bị này.</p></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Phút học" value={learner.studyMinutes} icon={Clock3}/><Stat label="Sessions" value={learner.sessions} icon={BarChart3}/><Stat label="Hoàn thành bài" value={learner.lessonCompletion+'%'} icon={BookOpen}/><Stat label="Mastery từ vựng" value={learner.vocabularyMastery+'%'} icon={Brain}/><Stat label="Luyện nói" value={learner.speakingFrequency} icon={Mic}/><Stat label="Luyện phát âm" value={learner.pronunciationPractice} icon={Volume2}/><Stat label="Ngày review" value={learner.reviewConsistency} icon={BookOpen}/><Stat label="Lỗi ngữ pháp" value={learner.grammarWeaknesses} icon={Brain}/>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div className="text-sm font-bold">Privacy</div><p className="text-xs text-stone-500 mt-1">Analytics không được dùng để lưu nội dung hội thoại, transcript hay raw audio.</p>
          <button type="button" onClick={()=>{analytics.setEnabled(false);setLearner(analytics.getLearnerSummary());}} className="mt-3 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-semibold">Tắt analytics</button>
        </div>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-5 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-wider text-amber-400">Admin Analytics</div><h1 className="text-3xl font-bold mt-1">Analytics thật</h1><p className="text-sm text-slate-400 mt-1">Hành vi học tập, retention, AI/voice và subscription.</p></div><div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400"/><select value={days} onChange={e=>setDays(Number(e.target.value))} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"><option value={7}>7 ngày</option><option value={30}>30 ngày</option><option value={90}>90 ngày</option></select></div></div>
        {error && <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 text-sm">{error}</div>}
        {admin && <><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Stat label="DAU" value={admin.dau} icon={Users}/><Stat label="WAU" value={admin.wau} icon={Users}/><Stat label="MAU" value={admin.mau} icon={Users}/><Stat label="New users" value={admin.newUsers} icon={Users}/><Stat label="Retention D1" value={admin.retentionD1+'%'} icon={BarChart3}/><Stat label="Retention D7" value={admin.retentionD7+'%'} icon={BarChart3}/>
        </div>
        <div className="grid md:grid-cols-3 gap-3"><Stat label="Lesson completion" value={admin.lessonCompletion+'%'} icon={BookOpen}/><Stat label="AI usage" value={admin.aiUsage} icon={Brain}/><Stat label="Voice usage" value={admin.voiceUsage} icon={Mic}/><Stat label="Cost / active user" value={'$'+admin.costPerActiveUser.toFixed(4)} icon={Clock3}/><Stat label="Subscription conversion" value={admin.subscriptionConversion+'%'} icon={Users}/><Stat label="Churn" value={admin.churn+'%'} icon={Users}/></div>
        <div className="grid lg:grid-cols-2 gap-3">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800"><h2 className="font-bold">Popular lessons</h2><div className="mt-3 space-y-2">{admin.popularLessons.map(x=><div key={x.id} className="flex justify-between text-sm"><span>{x.label}</span><span className="text-slate-400">{x.count}</span></div>)}</div></div>
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800"><h2 className="font-bold">Drop-off points</h2><div className="mt-3 space-y-2">{admin.dropOffPoints.map(x=><div key={x.point} className="flex justify-between text-sm"><span>{x.point}</span><span className="text-slate-400">{x.count}</span></div>)}</div></div>
        </div></>}
      </div>
    </main>
  );
};
