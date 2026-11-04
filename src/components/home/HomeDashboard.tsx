import React from 'react';
import { useApp } from '../../context/AppContext';
import { buildKnowledgeProfile, generateDailyPlan } from '../../services/personalization';
import { ProgressCard } from './ProgressCard';
import { Home, BookOpen, BookOpenText, Headphones, Brain, Mic, Sparkles, ArrowRight } from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const { user, setCurrentTab, currentLesson, lessonSectionIndex, aiMemory, learnerProfile, getDueReviewCount, setDailyGoalMinutes, structuredProgress, reviewSchedules } = useApp();
  const knowledge = buildKnowledgeProfile(learnerProfile, aiMemory, reviewSchedules, structuredProgress);
  const dailyPlan = generateDailyPlan(learnerProfile, aiMemory, getDueReviewCount(), knowledge);
  const totalSections = Math.max(1, currentLesson.sections.length);
  const currentSection = Math.min(totalSections, lessonSectionIndex + 1);
  const progress = Math.round((currentSection / totalSections) * 100);

  const shortcuts = [
    { tab: 'listening' as const, label: 'Luyện nghe', description: 'Nghe hiểu theo cấp độ', icon: Headphones },
    { tab: 'reading' as const, label: 'Đọc thông minh', description: 'Bài đọc HSK có Pinyin', icon: BookOpenText },
    { tab: 'review' as const, label: 'Ôn tập', description: 'Củng cố từ đến hạn', icon: Brain },
  ];

  return (
    <div className="zen-dashboard mx-auto max-w-5xl space-y-5 px-4 py-5 pb-24 sm:px-6 sm:py-7 md:pb-12">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-stone-500 dark:text-stone-400">LINA AI · HỌC TIẾNG TRUNG MỖI NGÀY</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">Xin chào, {user.name}</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Mỗi ngày một chút, tiến bộ từng bước.</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
          {user.currentHsk} <span className="mx-1 text-amber-500">·</span> 🔥 {user.streakDays} ngày
        </div>
      </header>

      <section className="rounded-3xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100">
          <Sparkles className="h-4 w-4 text-amber-600" /> Kế hoạch học hôm nay
        </div>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Được điều chỉnh theo tiến độ học và nội dung bạn cần ôn.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {dailyPlan.items.slice(0, 3).map((item, index) => (
            <button key={index} type="button"
              onClick={() => setCurrentTab(item.type === 'speaking' ? 'speak' : item.type === 'review' || item.type === 'quiz' ? 'review' : 'learn')}
              className="min-h-[88px] rounded-2xl border border-amber-100 bg-white/90 p-3 text-left transition hover:border-amber-300 hover:shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{item.title}</span>
              <span className="mt-1 block text-[11px] leading-5 text-stone-500 dark:text-stone-400">{item.target}</span>
              <span className="mt-2 block text-[10px] font-semibold text-amber-700 dark:text-amber-400">{item.minutes} phút</span>
            </button>
          ))}
        </div>
      </section>

      <section className="zen-hero relative overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 p-5 text-white shadow-md sm:p-7">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-300"><BookOpen className="h-4 w-4" /> Bài học đang tiếp tục</div>
          <p className="mt-3 text-xs text-stone-300">{currentLesson.hskLevel} · Bài {currentLesson.lessonNumber}</p>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{currentLesson.titleVi}</h2>
          <p className="font-cjk mt-1 text-base text-amber-200">{currentLesson.titleZh} · {currentLesson.pinyin}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-stone-300"><span>Phần {currentSection}/{totalSections}</span><span>{progress}%</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: progress + '%' }} /></div>
          <button type="button" onClick={() => setCurrentTab('learn')} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-500">
            Tiếp tục học <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div><h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Luyện tập</h2><p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">Chọn hoạt động bạn muốn thực hiện.</p></div>
          <button type="button" onClick={() => setCurrentTab('speak')} className="text-xs font-semibold text-amber-700 dark:text-amber-400">Nói với Lina</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {shortcuts.map(({ tab, label, description, icon: Icon }) => (
            <button key={tab} type="button" onClick={() => setCurrentTab(tab)} className="flex min-h-20 items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-left transition hover:border-amber-300 hover:shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"><Icon className="h-5 w-5" /></span>
              <span><span className="block text-sm font-bold text-stone-900 dark:text-stone-100">{label}</span><span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">{description}</span></span>
            </button>
          ))}
        </div>
      </section>

      <ProgressCard currentMinutes={user.todayMinutesSpent} targetMinutes={user.dailyGoalMinutes} streakDays={user.streakDays} onSelectGoal={setDailyGoalMinutes} />
    </div>
  );
};
