import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { buildKnowledgeProfile, generateDailyPlan } from '../../services/personalization';
import { ProgressCard } from './ProgressCard';
import { LayerToggles } from '../common/LayerToggles';
import { ToneTrainingModal } from '../voice/ToneTrainingModal';
import { motivationMessage, ACHIEVEMENTS } from '../../services/motivationEngine';
import { buildRetentionSnapshot, isDue } from '../../services/learningEngine';
import { 
  ArrowRight, 
  Mic, 
  Brain, 
  Sparkles, 
  BookOpen, 
  Flame, 
  Award,
  ChevronRight,
  Music
} from 'lucide-react';
import linaAvatarImg from '../../assets/images/lina_avatar_stylized_1790862594850.jpg';
import hskStudyImg from '../../assets/images/hsk_study_scene_1790861437105.jpg';

export const HomeDashboard: React.FC = () => {
  const { user, setCurrentTab, currentLesson, lessonSectionIndex, flashcards, aiMemory, learnerProfile, getDueReviewCount, motivation, motivationSnapshot, setDailyGoalMinutes, structuredProgress, reviewSchedules } = useApp();
  const knowledge = buildKnowledgeProfile(learnerProfile, aiMemory, reviewSchedules, structuredProgress);
  const [showToneModal, setShowToneModal] = useState(false);
  const totalLessonSections = Math.max(1, currentLesson.sections.length);
  const currentSectionNumber = Math.min(totalLessonSections, lessonSectionIndex + 1);
  const lessonProgressPercent = Math.round((currentSectionNumber / totalLessonSections) * 100);
  const dueReviewCount = getDueReviewCount();
  const dueFlashcards = flashcards.filter(card => isDue(card.nextReviewDate));
  const totalDueToday = dueReviewCount + dueFlashcards.length;
  const retention = buildRetentionSnapshot(reviewSchedules, aiMemory.mistakes);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* 1. HEADER & GREETING */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Xin chào, {user.name}
          </h1>
          <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 mt-0.5">
            Hôm nay chúng ta cùng học tiếng Trung nhé!
          </p>
        </div>

        {/* Quick status pill / streak */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300">
            <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>{user.streakDays} ngày liên tiếp</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-300">
            <Award className="w-4 h-4 text-stone-500" />
            <span>{user.currentHsk}</span>
          </div>
        </div>
      </div>

      {/* Layer Controls bar for user preferences */}
      <LayerToggles />

      <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
        <div className="flex items-center gap-2 text-sm font-bold"><Sparkles className="w-4 h-4 text-amber-600"/>Hôm nay Lina đề xuất cho bạn</div>
        <div className="mt-2 text-[11px] text-stone-500">Lina đang điều chỉnh theo tiến bộ thực tế · {knowledge.overallMastery}% mastery · {totalDueToday} mục cần củng cố</div><div className="mt-3 grid sm:grid-cols-3 gap-2">{generateDailyPlan(learnerProfile, aiMemory, totalDueToday, knowledge).items.slice(0,3).map((item,i)=><button key={i} type="button" onClick={()=>setCurrentTab(item.type==='conversation'?'speak':item.type==='review'||item.type==='quiz'?'review':'learn')} className="text-left p-3 rounded-2xl bg-white/80 dark:bg-stone-900/70 border border-amber-100 dark:border-stone-800"><div className="text-xs font-bold">{item.title}</div><div className="text-[11px] text-stone-500 mt-1 line-clamp-2">{item.target}</div><div className="text-[10px] text-amber-700 mt-2">{item.minutes} phút</div></button>)}</div>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800">
          <div className="flex items-center justify-between gap-3">
            <div><div className="text-xs font-bold uppercase tracking-wider text-stone-500">Động lực nhẹ nhàng</div><div className="text-lg font-bold mt-1">{motivationMessage(motivation)}</div></div>
            <div className="text-right"><div className="text-xl font-black">{motivationSnapshot.xp} XP</div><div className="text-[11px] text-stone-500">{motivationSnapshot.streakDays} ngày</div></div>
          </div>
          <div className="grid grid-cols-5 gap-1.5 mt-4 text-center">
            {[['Phút',motivationSnapshot.today.minutes],['Bài',motivationSnapshot.today.lessons],['Từ',motivationSnapshot.today.vocabulary],['Nói',motivationSnapshot.today.speaking],['Ôn',motivationSnapshot.today.review]].map(([label,value]) => <div key={String(label)} className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800"><div className="font-bold text-sm">{value}</div><div className="text-[9px] text-stone-500">{label}</div></div>)}
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Thành tựu</div>
          <div className="mt-3 space-y-1.5">{ACHIEVEMENTS.filter(a => motivationSnapshot.achievements.includes(a.id)).slice(-3).map(a => <div key={a.id} className="text-xs font-semibold">✓ {a.label}</div>)}</div>
          {!motivationSnapshot.achievements.length && <div className="text-xs text-stone-500 mt-2">Mỗi hoạt động nhỏ đều được ghi nhận.</div>}
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800">
        <div className="flex items-center justify-between"><div><div className="text-xs font-bold uppercase tracking-wider text-stone-500">Tiến bộ thật</div><div className="text-sm font-semibold mt-1">Dựa trên hoạt động đã ghi nhận.</div></div><div className="text-xs text-stone-500">{user.currentHsk}</div></div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-4">
          {[['Vocabulary',user.vocabularyLearnedCount],['Grammar',Object.values(structuredProgress).filter(p=>p.grammar>0).length],['Speaking',Math.round(Math.max(0,...Object.values(structuredProgress).map(p=>p.speaking)))],['Listening',Math.round(Math.max(0,...Object.values(structuredProgress).map(p=>p.listening)))],['Reading',0],['Pronunciation',user.pronunciationAccuracy]].map(([label,value]) => <div key={String(label)} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800"><div className="text-base font-bold">{value}{label === 'Pronunciation' ? '%' : ''}</div><div className="text-[10px] text-stone-500 mt-0.5">{label}</div></div>)}
        </div>
        <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800"><div className="text-xs font-bold">Tóm tắt 7 ngày</div><div className="grid sm:grid-cols-4 gap-2 mt-2 text-xs"><span>{motivationSnapshot.weekly.minutesStudied} phút học</span><span>{motivationSnapshot.weekly.lessonsCompleted} bài học</span><span>{motivationSnapshot.weekly.wordsReviewed} lượt từ</span><span>{motivationSnapshot.weekly.speakingSessions} lượt nói</span></div><div className="text-[11px] text-stone-500 mt-2">{motivationSnapshot.weekly.nextRecommendedPractice}</div></div>
      </div>

      {/* 2. MEMORY MAP */}
      <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500"><Brain className="w-4 h-4 text-amber-600"/>Bản đồ trí nhớ</div>
            <div className="text-sm font-semibold mt-1">Lina đang theo dõi mục nào mới, đang học, đã nhớ và đang phai.</div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800">{retention.totalTracked.toLocaleString('vi-VN')} mục có lịch sử</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-4">
          {[['Mới', retention.newItems], ['Đang học', Math.max(0, retention.totalTracked - retention.newItems - retention.mastered - retention.fading - retention.struggling)], ['Đã nhớ', retention.mastered], ['Đang phai', retention.fading], ['Đang yếu', retention.struggling], ['Đến hạn', retention.due]].map(([label,value]) => (
            <div key={String(label)} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800"><div className="text-base font-bold">{value}</div><div className="text-[10px] text-stone-500 mt-0.5">{label}</div></div>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-stone-500">
          {retention.totalTracked === 0 ? 'Chưa có đủ lịch sử ôn tập để dựng bản đồ. Lina sẽ bắt đầu đo từ những lượt học đầu tiên.' : retention.priority === 'urgent' ? 'Ưu tiên hôm nay: xử lý mục đến hạn, mục đang phai và lỗi chưa được chữa.' : retention.priority === 'balanced' ? 'Nhịp hiện tại khá cân bằng: ôn đúng hạn rồi luyện thêm điểm yếu.' : 'Nhịp ôn đang ổn: duy trì đều để kiến thức không bị quên.'}
        </div>
      </div>

      {/* 2. MAIN CARD: CONTINUE LEARNING */>
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-stone-900 to-stone-800 text-white p-6 shadow-md border border-stone-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 hidden sm:block pointer-events-none">
          <img
            src={hskStudyImg}
            alt="HSK Study"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-lg space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <BookOpen className="w-4 h-4" />
            <span>Tiếp tục bài học (Continue Learning)</span>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-stone-300 font-medium">
              <span>{currentLesson.hskLevel}</span>
              <span aria-hidden="true">·</span>
              <span>Bài {currentLesson.lessonNumber}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              "{currentLesson.titleVi}"
            </h2>
            <p className="font-cjk text-amber-200 text-base mt-1">
              {currentLesson.titleZh} · {currentLesson.pinyin}
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-stone-300 font-medium">
              <span>Tiến độ bài học</span>
              <span className="tabular-nums">{currentSectionNumber} / {totalLessonSections} phần</span>
            </div>
            <div className="w-full h-2.5 bg-stone-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-amber-500 to-amber-400 rounded-full"
                style={{ width: `${lessonProgressPercent}%` }}
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentTab('learn')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 active:scale-98 text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer min-h-[44px]"
            >
              <span>Tiếp tục</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowToneModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-amber-300 font-semibold text-xs rounded-xl transition-all min-h-[44px] cursor-pointer"
            >
              <Music className="w-3.5 h-3.5" />
              <span>Luyện 4 thanh điệu (mā, má, mǎ, mà)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid for Second, Third, and Fourth Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 3. SECOND CARD: AI TUTOR */}
        <div className="p-6 rounded-3xl bg-linear-to-br from-amber-50 to-orange-50/60 dark:from-stone-900 dark:to-stone-850 border border-amber-200/90 dark:border-stone-800 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Gia sư AI (AI Tutor)</span>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Trực tuyến · Giọng nói
              </span>
            </div>

            {/* Placeholder AI tutor avatar area */}
            <div className="flex items-center gap-3.5 pt-1">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-xs shrink-0">
                <img
                  src={linaAvatarImg}
                  alt="Lina Tutor"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <span className="font-bold text-base text-stone-900 dark:text-stone-100 block">
                  Cô giáo Lina
                </span>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Gia sư AI đàm thoại bằng giọng nói trực tiếp
                </p>
              </div>
            </div>

            <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 pt-1">
              "Bạn muốn luyện nói với Lina không?"
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('speak')}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-amber-700 hover:bg-amber-800 active:scale-98 text-white font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer min-h-[44px]"
          >
            <Mic className="w-4 h-4 stroke-[2.2]" />
            <span>🎙 Nói chuyện với Lina</span>
          </button>
        </div>

        {/* 4. THIRD CARD: TODAY'S REVIEW */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                <Brain className="w-4 h-4 text-blue-600" />
                <span>Ôn tập hôm nay (Today's Review)</span>
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                Lặp lại ngắt quãng
              </span>
            </div>

            <div className="pt-1">
              <p className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                {totalDueToday > 0 ? `Bạn có ${totalDueToday} mục nên củng cố hôm nay.` : 'Hôm nay chưa có mục nào đến hạn ôn.'}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Lina ưu tiên những mục thực sự đến hạn hoặc đang yếu để bạn không phải ôn lại ngẫu nhiên.
              </p>
            </div>

            {/* Quick preview pills of review words */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {dueFlashcards.slice(0, 4).map((c) => (
                <span
                  key={c.id}
                  className="font-cjk text-xs px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium"
                >
                  {c.vocabulary.hanzi} ({c.vocabulary.pinyin})
                </span>
              ))}
              {dueFlashcards.length > 4 && (
                <span className="text-xs px-2 py-1 text-stone-400">
                  +{dueFlashcards.length - 4} mục nữa
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('review')}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer min-h-[44px]"
          >
            <span>Ôn tập</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. FOURTH CARD: DAILY GOAL */}
      <ProgressCard
        currentMinutes={user.todayMinutesSpent}
        targetMinutes={user.dailyGoalMinutes}
        streakDays={user.streakDays}
        onSelectGoal={setDailyGoalMinutes}
      />

      {/* Tone Training Modal */}
      <ToneTrainingModal
        isOpen={showToneModal}
        onClose={() => setShowToneModal(false)}
      />
    </div>
  );
};
