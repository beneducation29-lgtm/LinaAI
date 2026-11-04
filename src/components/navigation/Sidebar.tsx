import React from 'react';
import { useApp, TabType } from '../../context/AppContext';
import { Home, BookOpen, Mic, Headphones, Brain, User, BookOpenText, Moon, Sun } from 'lucide-react';
import linaAvatarImg from '../../assets/images/lina_avatar_stylized_1790862594850.jpg';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, user, preferences, toggleTheme } = useApp();
  const navItems: Array<{ tab: TabType; label: string; icon: React.FC<{ className?: string }> }> = [
    { tab: 'home', label: 'Trang chủ', icon: Home },
    { tab: 'learn', label: 'Bài học', icon: BookOpen },
    { tab: 'speak', label: 'Luyện nói với Lina', icon: Mic },
    { tab: 'listening', label: 'Luyện nghe', icon: Headphones },
    { tab: 'reading', label: 'Đọc thông minh', icon: BookOpenText },
    { tab: 'review', label: 'Ôn tập', icon: Brain },
    { tab: 'profile', label: 'Tài khoản', icon: User },
  ];

  return (
    <aside className="zen-sidebar sticky top-0 z-30 hidden h-screen w-60 shrink-0 flex-col border-r p-4 transition-colors md:flex">
      <button type="button" onClick={() => setCurrentTab('home')} className="mb-7 flex items-center gap-3 rounded-xl px-2 py-3 text-left">
        <img src={linaAvatarImg} alt="Lina AI" className="h-10 w-10 rounded-2xl object-cover" />
        <span><span className="block text-lg font-bold leading-tight text-stone-900 dark:text-stone-100">Lina AI</span><span className="text-xs text-stone-500">Tiếng Trung giao tiếp</span></span>
      </button>
      <nav aria-label="Điều hướng chính" className="flex-1 space-y-1">
        {navItems.map(({ tab, label, icon: Icon }) => {
          const active = currentTab === tab;
          return <button key={tab} type="button" onClick={() => setCurrentTab(tab)} aria-current={active ? 'page' : undefined}
            className={'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ' + (active ? 'border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200' : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800')}>
            <Icon className="h-5 w-5 shrink-0" /><span>{label}</span>
          </button>;
        })}
      </nav>
      <div className="flex items-center justify-between border-t border-stone-200 pt-4 dark:border-stone-800">
        <button type="button" onClick={() => setCurrentTab('profile')} className="flex min-w-0 items-center gap-2 text-left">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-bold text-amber-800 dark:bg-stone-800 dark:text-amber-300">{user.name.charAt(0)}</span>
          <span className="min-w-0"><span className="block truncate text-xs font-semibold text-stone-900 dark:text-stone-100">{user.name}</span><span className="text-[11px] text-stone-500">{user.currentHsk} · {user.streakDays} ngày</span></span>
        </button>
        <button type="button" onClick={toggleTheme} aria-label="Đổi giao diện sáng tối" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800">
          {preferences.theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};
