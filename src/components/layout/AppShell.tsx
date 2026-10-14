import React from 'react';
import { useApp } from '../../context/AppContext';
import { completeOAuthSession, requestPasswordReset, resetPassword, startGoogleLogin } from '../../services/authService';
import { Sidebar } from '../navigation/Sidebar';
import { BottomNavigation } from '../navigation/BottomNavigation';
import { HomeDashboard } from '../home/HomeDashboard';
import { TutorScreen } from '../tutor/TutorScreen';
import { LearningSystemScreen } from '../learning/LearningSystemScreen';
import { ReviewScreen } from '../review/ReviewScreen';
import { Profile } from '../profile/Profile';
import { Onboarding } from '../onboarding/Onboarding';
import { Flame, Moon, Sun, LockKeyhole, Mail, Eye, EyeOff } from 'lucide-react';
import { PwaInstallBanner } from '../common/PwaInstallBanner';
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
  const [forgotMode, setForgotMode] = React.useState(false);
  const [forgotSent, setForgotSent] = React.useState(false);
  const [resetPasswordValue, setResetPasswordValue] = React.useState('');
  const [resetConfirm, setResetConfirm] = React.useState('');
  const [resetBusy, setResetBusy] = React.useState(false);
  const currentPath = window.location.pathname;
  React.useEffect(() => {
    if (currentPath !== '/auth/callback') return;
    void oauthCallback().catch(error => setAccountError(error instanceof Error ? error.message : 'Đăng nhập Google thất bại.'));
  }, [currentPath]);

  const submitAccount = async (event: React.FormEvent) => {
    event.preventDefault(); setAccountError(''); setAccountBusy(true);
    try { if (accountMode === 'login') await loginAccount(email, password); else await signupAccount(email, password, name); setPassword(''); }
    catch (error) { setAccountError(error instanceof Error ? error.message : 'Không thể xử lý tài khoản.'); }
    finally { setAccountBusy(false); }
  };
  const submitForgot = async (event: React.FormEvent) => {
    event.preventDefault(); setAccountError(''); setAccountBusy(true);
    try { await requestPasswordReset(email); setForgotSent(true); }
    catch (error) { setAccountError(error instanceof Error ? error.message : 'Không thể gửi email đặt lại mật khẩu.'); }
    finally { setAccountBusy(false); }
  };
  const oauthCallback = async () => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = hash.get('access_token');
    const refreshToken = hash.get('refresh_token') || undefined;
    if (!accessToken) throw new Error('Google không trả về phiên đăng nhập hợp lệ.');
    await completeOAuthSession(accessToken, refreshToken);
    window.history.replaceState({}, '', '/');
    window.location.replace('/');
  };
  const resetFromLink = async (event: React.FormEvent) => {
    event.preventDefault(); setAccountError('');
    if (resetPasswordValue !== resetConfirm) { setAccountError('Mật khẩu xác nhận không khớp.'); return; }
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = hash.get('access_token');
    if (!accessToken) { setAccountError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'); return; }
    setResetBusy(true);
    try { await resetPassword(accessToken, resetPasswordValue); window.history.replaceState({}, '', '/'); window.location.replace('/'); }
    catch (error) { setAccountError(error instanceof Error ? error.message : 'Không thể đặt lại mật khẩu.'); }
    finally { setResetBusy(false); }
  };

  if (currentPath === '/auth/callback') {
    return <div className="min-h-screen grid place-items-center bg-[#FAF8F5] dark:bg-stone-950 px-4"><div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 text-center shadow-xl max-w-sm"><img src={linaAvatarImg} alt="Lina" className="w-16 h-16 rounded-2xl mx-auto mb-4 object-cover"/><h1 className="font-black text-xl">Đang hoàn tất đăng nhập Google…</h1><p className="text-sm text-stone-500 mt-2">{accountError || 'Vui lòng chờ một chút.'}</p></div></div>;
  }

  if (window.location.pathname === '/auth/reset-password') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 grid place-items-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl p-6">
          <img src={linaAvatarImg} alt="Lina" className="w-14 h-14 rounded-2xl mx-auto mb-4 object-cover"/>
          <h1 className="text-2xl font-black text-center">Đặt lại mật khẩu</h1>
          <p className="text-sm text-stone-500 text-center mt-2">Nhập mật khẩu mới cho tài khoản Lina AI.</p>
          {accountError && <div className="my-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{accountError}</div>}
          <form onSubmit={resetFromLink} className="space-y-3 mt-5">
            <input required minLength={8} type="password" value={resetPasswordValue} onChange={e=>setResetPasswordValue(e.target.value)} placeholder="Mật khẩu mới (tối thiểu 8 ký tự)" className="w-full px-3.5 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm outline-none"/>
            <input required minLength={8} type="password" value={resetConfirm} onChange={e=>setResetConfirm(e.target.value)} placeholder="Nhập lại mật khẩu" className="w-full px-3.5 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-sm outline-none"/>
            <button disabled={resetBusy} className="w-full py-3 rounded-xl bg-stone-900 text-white text-sm font-bold disabled:opacity-50">{resetBusy ? 'Đang cập nhật…' : 'Lưu mật khẩu mới'}</button>
          </form>
        </div>
      </div>
    );
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
      <main className="zen-auth min-h-screen overflow-hidden bg-[#FAF8F5] text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <div className="zen-auth-shell mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-10">
          <section className="zen-auth-intro relative hidden min-h-[540px] flex-col justify-between overflow-hidden rounded-[2rem] border border-[#dce6dc] bg-[#edf2e9] p-8 dark:border-stone-800 dark:bg-stone-900/80 lg:flex xl:p-10">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-[#cbd8c8] dark:border-stone-700" />
            <div className="absolute -right-3 top-14 h-44 w-44 rounded-full border border-[#cbd8c8] dark:border-stone-700" />
            <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-[#d9e5d4]/70 blur-2xl dark:bg-emerald-950/40" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-2xl shadow-sm ring-1 ring-white/70"><img src={linaAvatarImg} alt="Lina AI" className="h-full w-full object-cover" /></div>
              <div><div className="text-lg font-extrabold tracking-tight">Lina AI</div><div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-900/60 dark:text-emerald-200/70">Chinese learning companion</div></div>
            </div>
            <div className="relative z-10 py-12">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#cddacb] bg-white/65 px-3 py-1.5 text-xs font-semibold text-emerald-900 dark:border-stone-700 dark:bg-stone-800/70 dark:text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> 文 · 静心学习 · 每日进步</div>
              <h1 className="max-w-lg text-4xl font-semibold leading-[1.16] tracking-tight xl:text-5xl">Mỗi ngày một chút,<br /><span className="font-cjk font-medium text-emerald-800 dark:text-emerald-300">中文</span> gần bạn hơn.</h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-stone-600 dark:text-stone-300">Không gian học tiếng Trung nhẹ nhàng, được cá nhân hóa theo nhịp độ và mục tiêu của bạn.</p>
            </div>
            <div className="relative z-10 flex items-end justify-between gap-4">
              <div className="max-w-xs text-xs leading-5 text-stone-500 dark:text-stone-400">Lộ trình HSK · Từ vựng · Luyện nói cùng AI</div>
              <div aria-hidden="true" className="font-cjk select-none text-6xl leading-none text-emerald-800/70 dark:text-emerald-300/70">静</div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <div className="h-12 w-12 overflow-hidden rounded-2xl shadow-sm ring-1 ring-stone-200 dark:ring-stone-700"><img src={linaAvatarImg} alt="Lina AI" className="h-full w-full object-cover" /></div>
              <div><div className="text-lg font-extrabold tracking-tight">Lina AI</div><div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Chinese learning</div></div>
            </div>
            <div className="mb-6 text-center lg:text-left">
              <div className="mb-3 hidden text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800/70 dark:text-emerald-300/80 lg:block">Chào mừng bạn trở lại</div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.1rem]">{forgotMode ? 'Khôi phục tài khoản' : 'Kho học tập riêng của bạn'}</h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-500 dark:text-stone-400 lg:mx-0">{forgotMode ? 'Nhập email để Lina gửi liên kết đặt lại mật khẩu.' : 'Đăng nhập để tiếp tục hành trình học tiếng Trung và đồng bộ tiến trình của bạn.'}</p>
            </div>
            <div className="zen-auth-card rounded-[1.75rem] border border-stone-200/90 bg-white/95 p-5 shadow-[0_18px_60px_-30px_rgba(40,70,48,0.28)] dark:border-stone-800 dark:bg-stone-900/95 sm:p-7">
              <div className="mb-5 flex items-center gap-2.5 text-sm font-semibold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf2e9] text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"><LockKeyhole className="h-4 w-4" /></span><span>{forgotMode ? 'Quên mật khẩu' : accountMode === 'login' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản riêng'}</span></div>
              {accountError && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs leading-5 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">{accountError}</div>}
              {forgotSent ? <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">Nếu email tồn tại, Lina đã gửi hướng dẫn đặt lại mật khẩu. Hãy kiểm tra cả thư mục Spam.</div> : (
                <form onSubmit={forgotMode ? submitForgot : submitAccount} className="space-y-3.5">
                  {!forgotMode && accountMode === 'signup' && <input required autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Tên hiển thị" className="zen-auth-input w-full rounded-xl border border-stone-200 bg-[#fcfbf8] px-4 py-3.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-stone-700 dark:bg-stone-950" />}
                  <div className="relative"><Mail aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input required autoComplete="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="zen-auth-input min-h-12 w-full rounded-xl border border-stone-200 bg-[#fcfbf8] py-3.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-stone-700 dark:bg-stone-950" /></div>
                  {!forgotMode && <div className="relative"><input required minLength={8} autoComplete={accountMode === 'login' ? 'current-password' : 'new-password'} type={showPassword ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mật khẩu (tối thiểu 8 ký tự)" className="zen-auth-input min-h-12 w-full rounded-xl border border-stone-200 bg-[#fcfbf8] py-3.5 pl-4 pr-12 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-stone-700 dark:bg-stone-950" /><button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-1.5 top-1/2 min-h-10 min-w-10 -translate-y-1/2 rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-100" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>{showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</button></div>}
                  <button disabled={accountBusy} type="submit" className="zen-auth-primary min-h-12 w-full rounded-xl bg-[#254d3b] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4030] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/20 disabled:cursor-wait disabled:opacity-60 dark:bg-emerald-700 dark:hover:bg-emerald-600">{accountBusy ? 'Đang xử lý…' : forgotMode ? 'Gửi email đặt lại mật khẩu' : accountMode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</button>
                </form>
              )}
              {!forgotMode && <button type="button" onClick={()=>{setAccountMode(v=>v==='login'?'signup':'login');setAccountError('');}} className="mt-5 w-full rounded-lg py-2 text-xs font-semibold text-emerald-800 transition hover:text-emerald-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 dark:text-emerald-300 dark:hover:text-emerald-200">{accountMode === 'login' ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}</button>}
              {accountMode === 'login' && !forgotMode && <><button type="button" onClick={()=>{setForgotMode(true);setForgotSent(false);setAccountError('');}} className="mt-2 min-h-10 w-full rounded-lg text-xs text-stone-500 transition hover:text-emerald-800 hover:underline dark:hover:text-emerald-300">Quên mật khẩu?</button><div className="my-4 flex items-center gap-3"><div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" /><span className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-400">hoặc</span><div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" /></div><button type="button" onClick={()=>{setAccountError(''); void startGoogleLogin();}} className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold transition hover:border-stone-300 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/10 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800"><span aria-hidden="true" className="font-black text-base">G</span> Tiếp tục với Google</button></>}
              {forgotMode && <button type="button" onClick={()=>{setForgotMode(false);setForgotSent(false);setAccountError('');}} className="mt-4 min-h-10 w-full rounded-lg text-xs font-semibold text-emerald-800 hover:underline dark:text-emerald-300">← Quay lại đăng nhập</button>}
              <div className="mt-6 flex items-start gap-2.5 border-t border-stone-100 pt-4 text-[11px] leading-5 text-stone-400 dark:border-stone-800"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Dữ liệu cá nhân chỉ mở sau khi xác thực tài khoản.</div>
            </div>
            <p className="mt-5 text-center text-[11px] text-stone-400">Học chậm mà chắc · 学而时习之</p>
          </section>
        </div>
      </main>
    );
  }

  if (window.location.pathname === '/analytics') {
    return <React.Suspense fallback={<div className="min-h-screen grid place-items-center">Đang tải Analytics…</div>}><AnalyticsDashboard mode="learner" /></React.Suspense>;
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
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col md:flex-row transition-colors safe-area-top">
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
        <main className="flex-1 overflow-x-hidden mobile-content-safe">
          {renderActiveScreen()}
        </main>

        {/* Mobile Fixed Bottom Navigation */}
        <BottomNavigation />
      </div>

      {/* Onboarding Flow Overlay Modal */}
      {showOnboarding && <Onboarding />}
      <PwaInstallBanner />
    </div>
  );
};
