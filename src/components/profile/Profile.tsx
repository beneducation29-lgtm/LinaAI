import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Flame, 
  Award, 
  Target, 
  Clock, 
  BookOpen, 
  BookA, 
  Mic, 
  Moon, 
  Sun, 
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import linaAvatarImg from '../../assets/images/tutor_lina_avatar_1790861417833.jpg';
import { AccountSyncCard } from './AccountSyncCard';
import { analytics } from '../../services/analytics';
import { PrivacySecurityPanel } from './PrivacySecurityPanel';

export const Profile: React.FC = () => {
  const { 
    user, 
    updateUser, 
    preferences, 
    toggleTheme, 
    toggleDisplayOption,
    setShowOnboarding,
    learnerProfile,
    aiMemory,
    clearLearningMemory,
    resetProgress,
    authUser,
    syncState,
    loginAccount,
    signupAccount,
    logoutAccount,
    syncNow
  } = useApp();

  const [accountOpen, setAccountOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<'login'|'signup'>('login');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountError, setAccountError] = useState('');
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => analytics.getPreferences().enabled);

  const handleAccountSubmit = async (event: React.FormEvent) => { event.preventDefault(); setAccountError(''); try { if(accountMode==='login') await loginAccount(accountEmail,accountPassword); else await signupAccount(accountEmail,accountPassword,accountName); setAccountOpen(false); setAccountPassword(''); } catch(e) { setAccountError(e instanceof Error ? e.message : 'Không thể kết nối tài khoản.'); } };

  const handleLevelChange = (newLevel: any) => {
    updateUser({ currentLevel: newLevel });
  };

  const handleHskChange = (newHsk: any) => {
    updateUser({ currentHsk: newHsk });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      <AccountSyncCard user={authUser} sync={syncState} onLogin={() => { setAccountMode('login'); setAccountOpen(true); }} onLogout={() => void logoutAccount()} onSync={() => void syncNow()} />
      {accountOpen && <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between mb-3"><div className="text-sm font-bold">{accountMode==='login'?'Đăng nhập':'Tạo tài khoản'}</div><button onClick={()=>setAccountOpen(false)} className="text-xs text-stone-400">Đóng</button></div>
        <form onSubmit={handleAccountSubmit} className="space-y-2">
          {accountMode==='signup'&&<input value={accountName} onChange={e=>setAccountName(e.target.value)} placeholder="Tên hiển thị" className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm" />}
          <input type="email" required value={accountEmail} onChange={e=>setAccountEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm" />
          <input type="password" required minLength={8} value={accountPassword} onChange={e=>setAccountPassword(e.target.value)} placeholder="Mật khẩu (tối thiểu 8 ký tự)" className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm" />
          {accountError&&<div className="text-xs text-rose-600">{accountError}</div>}
          <button type="submit" className="w-full py-2.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-sm font-semibold">{accountMode==='login'?'Đăng nhập':'Tạo tài khoản'}</button>
        </form>
        <button onClick={()=>setAccountMode(accountMode==='login'?'signup':'login')} className="mt-2 text-xs text-amber-700 dark:text-amber-400 hover:underline">{accountMode==='login'?'Chưa có tài khoản? Tạo tài khoản':'Đã có tài khoản? Đăng nhập'}</button>
      </div>}

      {/* 1. PROFILE HEADER CARD */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <div className="relative w-20 h-20 rounded-full bg-amber-100 dark:bg-stone-800 border-2 border-amber-400 dark:border-amber-600/80 flex items-center justify-center text-2xl font-bold text-amber-800 dark:text-amber-200 shrink-0 shadow-xs">
          {user.name.charAt(0)}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {user.name}
            </h1>

            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center justify-center sm:justify-start gap-1 min-h-[36px]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Thiết lập lại mục tiêu</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-stone-500 dark:text-stone-400">
            <span>Trình độ: <strong className="text-stone-800 dark:text-stone-200">{user.currentLevel}</strong></span>
            <span aria-hidden="true">·</span>
            <span>HSK hiện tại: <strong className="text-amber-700 dark:text-amber-400">{user.currentHsk}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Mục tiêu: <strong className="text-stone-800 dark:text-stone-200">{user.learningGoal.category}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. STATS & PROGRESS GRID */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 px-1">
          Chỉ số học tập của bạn
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Stat 1: Learning Streak */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-1">
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>Chuỗi học (Streak)</span>
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {user.streakDays}
              <span className="text-xs font-normal text-stone-400 ml-1">ngày</span>
            </div>
          </div>

          {/* Stat 2: Daily Goal */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Mục tiêu ngày</span>
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {user.dailyGoalMinutes}
              <span className="text-xs font-normal text-stone-400 ml-1">phút/ngày</span>
            </div>
          </div>

          {/* Stat 3: Vocabulary learned */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-1">
              <BookA className="w-4 h-4 text-emerald-600" />
              <span>Từ vựng đã học</span>
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {user.vocabularyLearnedCount}
              <span className="text-xs font-normal text-stone-400 ml-1">từ</span>
            </div>
          </div>

          {/* Stat 4: Lessons completed */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-1">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>Bài hoàn thành</span>
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {user.lessonsCompletedCount}
              <span className="text-xs font-normal text-stone-400 ml-1">bài</span>
            </div>
          </div>
        </div>

        {/* Pronunciation Progress Bar Card */}
        <div className="mt-3 p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Tiến độ phát âm chuẩn xác (Pronunciation progress)
              </span>
            </div>
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400 tabular-nums">
              {user.pronunciationAccuracy}%
            </span>
          </div>

          <div className="w-full h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-linear-to-r from-amber-600 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${user.pronunciationAccuracy}%` }}
            />
          </div>
          <p className="text-xs text-stone-400 mt-2">
            Được đánh giá liên tục qua các buổi đàm thoại thực tế với Lina.
          </p>
        </div>

        {/* Learner Context Memory */}
        <div className="mt-3 p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Ký ức ngữ cảnh học tập (Lina Memory)
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Các thông tin cá nhân và ngữ cảnh Lina đã ghi nhớ để cá nhân hóa đàm thoại:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Tên học viên sẽ được cập nhật sau khi bạn đăng nhập', 'Quốc tịch: chưa thiết lập', 'Mục tiêu: sẽ được xác định trong quá trình học', 'Sở thích: sẽ được Lina ghi nhớ khi bạn cho phép'].map((mem, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 font-medium">
                ✓ {mem}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. AI LEARNING MEMORY */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div className="text-sm font-bold">Điểm mạnh</div><p className="text-xs text-stone-500 mt-1">Những gì Lina đang thấy bạn làm ổn.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{(learnerProfile.strongAreas.length ? learnerProfile.strongAreas : ['Đang thu thập dữ liệu']).map(x=><span key={x} className="text-xs px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">{x}</span>)}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div className="text-sm font-bold">Cần cải thiện</div><p className="text-xs text-stone-500 mt-1">Ưu tiên cá nhân hóa hiện tại.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{(learnerProfile.weakAreas.length ? learnerProfile.weakAreas : ['Chưa có lỗi lặp lại']).map(x=><span key={x} className="text-xs px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300">{x}</span>)}</div>
        </div>
      </div>
      <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
        <div className="flex items-center justify-between"><div><div className="text-sm font-bold">Lỗi thường gặp</div><div className="text-xs text-stone-500">Theo dõi để Lina ưu tiên luyện lại.</div></div><span className="text-xs font-bold">{aiMemory.mistakes.length}</span></div>
        <div className="space-y-1.5">{aiMemory.mistakes.slice().sort((a,b)=>b.frequency-a.frequency).slice(0,5).map(m=><div key={m.id} className="text-xs flex justify-between gap-3"><span>{m.original} → {m.corrected}</span><span className="text-stone-400">{m.frequency} lần</span></div>)}</div>
        <div className="flex flex-wrap gap-2 pt-2"><button type="button" onClick={clearLearningMemory} className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-semibold">Xóa AI Memory</button><button type="button" onClick={() => { if (window.confirm('Reset toàn bộ tiến trình học tập trên thiết bị này? Hành động này không thể hoàn tác. Dữ liệu cloud chỉ được thay đổi khi bạn xác nhận đồng bộ lại.')) resetProgress(); }} className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-semibold">Reset tiến trình</button></div>
      </div>

      <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 space-y-3">
        <div>
          <div className="text-sm font-bold">Quyền riêng tư & Analytics</div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Lina chỉ ghi nhận hành vi học tập dạng sự kiện. Không gửi email, tên, transcript hoặc raw audio tới analytics.</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-semibold">Cho phép analytics</div>
          <button type="button" onClick={() => { const next=!analyticsEnabled; setAnalyticsEnabled(next); analytics.setEnabled(next); }} className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-semibold">{analyticsEnabled ? 'Đang bật' : 'Đang tắt'}</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { analytics.clearLocalData(); }} className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold">Xóa analytics trên thiết bị</button>
          <button type="button" onClick={() => { window.location.href='/analytics'; }} className="px-3 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold">Xem Analytics của tôi</button>
        </div>
      </div>

      <PrivacySecurityPanel signedIn={Boolean(authUser)} />

      {/* 3. DISPLAY PREFERENCES & SYSTEM SETTINGS */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 px-1">
          Cài đặt & Tùy chọn hiển thị
        </h2>

        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800 shadow-xs overflow-hidden">
          {/* Light / Dark Mode Toggle */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                {preferences.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </div>
              <div>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 block">
                  Chế độ giao diện (Dark Mode)
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {preferences.theme === 'dark' ? 'Đang dùng Giao diện Tối' : 'Đang dùng Giao diện Sáng'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors min-h-[40px] cursor-pointer"
            >
              Chuyển đổi
            </button>
          </div>

          {/* Toggle layers default */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Hiển thị mặc định 3 tầng
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => toggleDisplayOption('showChinese')}
                className={`p-3 rounded-xl border text-center transition-all min-h-[48px] ${
                  preferences.showChinese 
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-950 dark:text-amber-200 font-bold'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400'
                }`}
              >
                <span className="text-xs block">Chữ Hán</span>
                <span className="text-[10px] opacity-75">{preferences.showChinese ? 'Bật' : 'Tắt'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleDisplayOption('showPinyin')}
                className={`p-3 rounded-xl border text-center transition-all min-h-[48px] ${
                  preferences.showPinyin 
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-950 dark:text-amber-200 font-bold'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400'
                }`}
              >
                <span className="text-xs block">Pinyin</span>
                <span className="text-[10px] opacity-75">{preferences.showPinyin ? 'Bật' : 'Tắt'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleDisplayOption('showVietnamese')}
                className={`p-3 rounded-xl border text-center transition-all min-h-[48px] ${
                  preferences.showVietnamese 
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-950 dark:text-amber-200 font-bold'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400'
                }`}
              >
                <span className="text-xs block">Tiếng Việt</span>
                <span className="text-[10px] opacity-75">{preferences.showVietnamese ? 'Bật' : 'Tắt'}</span>
              </button>
            </div>
          </div>

          {/* Level Switcher */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100 block">
                Thay đổi cấp độ HSK
              </span>
              <span className="text-xs text-stone-500">
                Lựa chọn giáo trình phù hợp năng lực
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleHskChange(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                    user.currentHsk === lvl
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
