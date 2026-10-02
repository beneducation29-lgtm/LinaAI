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
import { Flame, Moon, Sun } from 'lucide-react';
import linaAvatarImg from '../../assets/images/tutor_lina_avatar_1790861417833.jpg';

export const AppShell: React.FC = () => {
  const { currentTab, setCurrentTab, user, preferences, toggleTheme, showOnboarding } = useApp();

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
