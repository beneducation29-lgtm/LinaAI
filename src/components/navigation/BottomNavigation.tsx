import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, BookOpen, Mic, User, MoreHorizontal, Headphones, BookOpenText, Brain } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { currentTab, setCurrentTab } = useApp();
  const [showMore, setShowMore] = React.useState(false);
  const mainItems = [
    { tab: 'home' as const, label: 'Trang chủ', icon: Home },
    { tab: 'learn' as const, label: 'Học', icon: BookOpen },
    { tab: 'speak' as const, label: 'Nói', icon: Mic },
    { tab: 'more' as const, label: 'Thêm', icon: MoreHorizontal },
    { tab: 'profile' as const, label: 'Tôi', icon: User },
  ];
  const moreItems = [
    { tab: 'listening' as const, label: 'Luyện nghe', icon: Headphones },
    { tab: 'reading' as const, label: 'Đọc thông minh', icon: BookOpenText },
    { tab: 'review' as const, label: 'Ôn tập', icon: Brain },
  ];
  const choose = (tab: typeof moreItems[number]['tab']) => { setCurrentTab(tab); setShowMore(false); };
  const isMoreActive = moreItems.some(item => item.tab === currentTab);

  return (
    <nav aria-label="Điều hướng chính" className="zen-bottom-nav fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md md:hidden safe-area-bottom">
      {showMore && <div className="absolute bottom-full right-2 mb-2 w-56 overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-xl dark:border-stone-700 dark:bg-stone-900" role="menu">
        {moreItems.map(({ tab, label, icon: Icon }) => <button key={tab} type="button" role="menuitem" onClick={() => choose(tab)} className={'flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold ' + (currentTab === tab ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200' : 'text-stone-700 dark:text-stone-300')}>
          <Icon className="h-5 w-5" />{label}
        </button>)}
      </div>}
      <div className="grid min-h-16 grid-cols-5 items-center px-2">
        {mainItems.map(({ tab, label, icon: Icon }) => {
          const active = tab === 'more' ? isMoreActive || showMore : currentTab === tab;
          return <button key={tab} type="button" onClick={() => tab === 'more' ? setShowMore(value => !value) : choose(tab as typeof moreItems[number]['tab'])}
            aria-label={tab === 'more' ? 'Mở thêm hoạt động' : label} aria-expanded={tab === 'more' ? showMore : undefined}
            className="flex min-h-14 flex-col items-center justify-center gap-1 text-center">
            <span className={'grid h-8 w-10 place-items-center rounded-xl ' + (active ? 'text-amber-700 dark:text-amber-400' : 'text-stone-400 dark:text-stone-500')}>
              <Icon className={tab === 'speak' ? 'h-6 w-6' : 'h-5 w-5'} />
            </span>
            <span className={'text-[10px] ' + (active ? 'font-bold text-amber-700 dark:text-amber-400' : 'font-medium text-stone-500 dark:text-stone-400')}>{label}</span>
          </button>;
        })}
      </div>
    </nav>
  );
};
