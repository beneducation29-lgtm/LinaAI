import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../navigation/Sidebar';
import { BottomNavigation } from '../navigation/BottomNavigation';
import { HomeDashboard } from '../home/HomeDashboard';
import { TutorScreen } from '../tutor/TutorScreen';
import { LearningSystemScreen } from '../learning/LearningSystemScreen';
import { ReviewScreen } from '../review/ReviewScreen';
import { Profile } from '../profile/Profile';
import { Onboarding } from '../onboarding/Onboarding';
import { Flame, Moon, Sun, LockKeyhole, Mail, Eye, EyeOff } from 'lucide-react';
import { login as loginAccountRequest, signup as signupAccountRequest } from '../../services/authService';
import linaAvatarImg from '../../assets/images/tutor_lina_avatar_1790861417833.jpg';

const AnalyticsDashboard = React.lazy(() => import('../analytics/AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard })));

const AdminCMS = React.lazy(() =>
  import('../admin/AdminCMS').then((module) => ({ default: module.AdminCMS })),
);

export const AppShell: React.FC = () => {
  const { currentTab, setCurrentTab, user, preferences, toggleTheme, showOnboarding, authUser, loginAccount, signupAccount } = useApp();
  const [accountMode, setAccountMode] = React.useState<'login'|'signup'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [accountError, setAccountError] = React.useState('');
  const [accountBusy, setAccountBusy] = React.useState(false);

  const submitAccount = async (event: React.FormEvent) => {
    event.preventDefault(); setAccountError(''); setAccountBusy(true);
    try { if (accountMode === 'login') await loginAccount(email, password); else await signupAccount(email, password, name); setPassword(''); }
    catch (error) { setAccountError(error instanceof Error ? error.message : 'Không thể đăng nhập.'); }
    finally { setAccountBusy(false); }
  };

  if (window.location.pathname === '/analytics') {
    return <React.Suspense fallback={<div className="min-h-screen grid place-items-center">Đang tải Analytics…</div>}><AnalyticsDashboard mode="learner" /></React.Suspense>;
  }

  if (window.location.pathname === '/admin/analytics') {
    return <React.Suspense fallback={<div className="min-h-screen grid place-items-center bg-slate-950 text-white">Đang tải Admin Analytics…</div>}><AnalyticsDashboard mode="admin" /></React.Suspense>;
  }

  if (window.location.pathname.startsWith('/admin')) {
    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
            Đang tải Admin CMS…
          </div>
        }
      >
        <AdminCMS />
      </React.Suspense>
    );
  }

  if (!authUser && !window.location.pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 grid place-items-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden shadow-lg mb-4"><img src={linaAvatarImg} alt="Lina" className="w-full h-full object-cover" /></div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">Lina AI · Chinese Learning</div>
            <h1 className="text-3xl font-black mt-2">Kho học tập riêng của bạn</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 leading-6">Đăng nhập để mở dữ liệu HSK, tiến trình, từ vựng đã lưu và bộ nhớ học tập cá nhân. Lina không hiển thị dữ liệu cá nhân giả trước khi bạn đăng nhập.</p>
          </div>
          <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl p-6">
            <div className="flex items-center gap-2 text-sm font-bold mb-5"><LockKeyhole className="w-4 h-4 text-amber-600" /> {accountMode === 'login' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản riêng'}</div>
            {accountError && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/30 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">{accountError}</div>}
            <form onSubmit={submitAccount} className="space-y-3">
              {accountMode === 'signup' && <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Tên hiển thị" className="w-full px-3.5 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-amber-300" />}
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" /><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-amber-300" /></div>
              <div className="relative"><input required minLength={8} type={showPassword ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mật khẩu (tối thiểu 8 ký tự)" className="w-full pl-3.5 pr-10 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-amber-300" /><button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-stone-400" aria-label="Hiện hoặc ẩn mật khẩu">{showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button></div>
              <button disabled={accountBusy} type="submit" className="w-full py-3 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-sm font-bold disabled:opacity-50">{accountBusy ? 'Đang xử lý…' : accountMode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</button>
            </form>
            <button type="button" onClick={()=>{setAccountMode(v=>v==='login'?'signup':'login');setAccountError('');}} className="w-full mt-4 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline">{accountMode === 'login' ? 'Chưa có tài khoản? Tạo tài khoản' : 'Đã có tài khoản? Đăng nhập'}</button>
            <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400 flex items-start gap-2"><LockKeyhole className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Dữ liệu tiến trình và tài khoản được đồng bộ theo phiên đăng nhập. Khách chưa đăng nhập chỉ thấy màn hình đăng nhập.</div>
          </div>
        </div>
      </div>
    );
  }

  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'home':
        return <HomeDashboard />;
      case 'learn':
        return <LearningSystemScreen />;
      case 'speak':
        return <TutorScreen />;
      case 'review':
        return <ReviewScreen />;
      case 'profile':
        return <Profile />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col md:flex-row transition-colors">
      {/* 1. DESKTOP SIDEBAR */}
      <Sidebar />

      {/* 2. MAIN APP VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Sticky Top Header */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#FAF8F5]/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
          {/* Zone 1: Single element wordmark brand */}
          <button
            type="button"
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2 text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs">
              <img src={linaAvatarImg} alt="Lina" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-base tracking-tight text-stone-900 dark:text-stone-100">
              Lina AI
            </span>
          </button>

          {/* Zone 2 / 3: Streak info + Theme toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300">
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>{user.streakDays}d</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Chuyển chế độ sáng/tối"
            >
              {preferences.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600" />
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Screen View */}
        <main className="flex-1 overflow-x-hidden">
          {renderActiveScreen()}
        </main>

        {/* Mobile Fixed Bottom Navigation */}
        <BottomNavigation />
      </div>

      {/* Onboarding Flow Overlay Modal */}
      {showOnboarding && <Onboarding />}
    </div>
  );
};
