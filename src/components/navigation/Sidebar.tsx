import React from 'react';
import { useApp, TabType } from '../../context/AppContext';
import { Home, BookOpen, Mic, Brain, User, Moon, Sun, Sparkles } from 'lucide-react';
import { isDue } from '../../services/learningEngine';
import linaAvatarImg from '../../assets/images/lina_avatar_stylized_1790862594850.jpg';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, user, preferences, toggleTheme, flashcards } = useApp();

  const reviewableCount = flashcards.filter(card => (
    (card.repetitionCount || 0) === 0 || isDue(card.nextReviewDate || new Date().toISOString())
  )).length;
  const todayReviewCount = Math.min(reviewableCount, 20);

  const navItems: Array<{ tab: TabType; label: string; icon: React.FC<{ className?: string }>; badge?: string }> = [
    { tab: 'home', label: 'Trang chủ', icon: Home },
    { tab: 'learn', label: 'Học', icon: BookOpen, badge: user.currentHsk },
    { tab: 'speak', label: 'Nói', icon: Mic, badge: 'Lina AI' },
    { tab: 'review', label: 'Ôn tập', icon: Brain, badge: `${todayReviewCount} từ` },
    { tab: 'profile', label: 'Tôi', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-stone-900 border-r border-stone-200/90 dark:border-stone-800 p-5 shrink-0 z-30 transition-colors">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-xs overflow-hidden">
          <img 
            src={linaAvatarImg} 
            alt="Lina AI" 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 block leading-tight">
            Lina AI
          </span>
          <span className="text-xs text-stone-400 font-medium">Tiếng Trung giao tiếp</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav aria-label="Thanh bên điều hướng" className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          const Icon = item.icon;

          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => setCurrentTab(item.tab)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                isActive
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/60 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-amber-700 dark:text-amber-400' : 'stroke-[1.8]'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                  isActive 
                    ? 'bg-amber-200/70 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100' 
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Tutor Quick Card in Sidebar */}
      <div className="p-3.5 mb-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
        <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Gia sư phản xạ AI</span>
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-3">
          Luyện phát âm chuẩn thanh điệu tiếng Trung cùng Lina mỗi ngày.
        </p>
        <button
          type="button"
          onClick={() => setCurrentTab('speak')}
          className="w-full py-2 px-3 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[36px]"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Luyện nói ngay</span>
        </button>
      </div>

      {/* Footer controls: theme toggle & user summary */}
      <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentTab('profile')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity text-left cursor-pointer min-h-[44px]"
        >
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-stone-800 border border-amber-300 dark:border-stone-700 flex items-center justify-center text-xs font-bold text-amber-800 dark:text-amber-300">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 leading-none">
              {user.name}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              {user.currentHsk} · Chuỗi {user.streakDays} ngày
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Chuyển chế độ sáng/tối"
          title="Chuyển đổi giao diện Sáng / Tối"
        >
          {preferences.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-stone-600" />
          )}
        </button>
      </div>
    </aside>
  );
};
