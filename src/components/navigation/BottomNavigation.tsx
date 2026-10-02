import React from 'react';
import { useApp, TabType } from '../../context/AppContext';
import { Home, BookOpen, Mic, Brain, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { currentTab, setCurrentTab } = useApp();

  const navItems: Array<{ tab: TabType; label: string; icon: React.FC<{ className?: string }> }> = [
    { tab: 'home', label: 'Trang chủ', icon: Home },
    { tab: 'learn', label: 'Học', icon: BookOpen },
    { tab: 'speak', label: 'Nói', icon: Mic },
    { tab: 'review', label: 'Ôn tập', icon: Brain },
    { tab: 'profile', label: 'Tôi', icon: User },
  ];

  return (
    <nav 
      aria-label="Thanh điều hướng chính ứng dụng"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200/90 dark:border-stone-800 transition-colors"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          const Icon = item.icon;
          const isCenterMic = item.tab === 'speak';

          if (isCenterMic) {
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => setCurrentTab(item.tab)}
                className="group relative flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-transform active:scale-95"
                aria-label="Luyện nói cùng Lina"
              >
                <div className={`w-11 h-11 -mt-4 rounded-2xl flex items-center justify-center shadow-md transition-all ${
                  isActive 
                    ? 'bg-amber-600 text-white shadow-amber-600/30' 
                    : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 group-hover:bg-amber-600'
                }`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className={`text-[10px] font-semibold tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-stone-500 dark:text-stone-400'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => setCurrentTab(item.tab)}
              className="flex flex-col items-center justify-center min-h-[48px] py-1 text-center cursor-pointer transition-all active:scale-95"
              aria-label={item.label}
            >
              <div className={`p-1 rounded-xl transition-colors ${
                isActive ? 'text-amber-700 dark:text-amber-400' : 'text-stone-400 dark:text-stone-500'
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[10px] tracking-tight transition-colors ${
                isActive 
                  ? 'font-bold text-amber-700 dark:text-amber-400' 
                  : 'font-medium text-stone-500 dark:text-stone-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
