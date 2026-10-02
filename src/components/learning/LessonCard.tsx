import React from 'react';
import { LessonSectionType } from '../../types';
import { BookOpen, BookA, Headphones, Mic, Users, CheckCircle2 } from 'lucide-react';

interface LessonCardProps {
  type: LessonSectionType;
  title: string;
  descriptionVi: string;
  isActive: boolean;
  isCompleted?: boolean;
  onClick: () => void;
  className?: string;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  type,
  title,
  descriptionVi,
  isActive,
  isCompleted = false,
  onClick,
  className = ''
}) => {
  const iconMap: Record<LessonSectionType, React.FC<{ className?: string }>> = {
    vocabulary: BookA,
    grammar: BookOpen,
    listening: Headphones,
    speaking: Mic,
    roleplay: Users,
    review: CheckCircle2,
  };

  const Icon = iconMap[type];

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`p-4 rounded-2xl border transition-all text-left cursor-pointer min-h-[56px] ${
        isActive
          ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 shadow-xs'
          : 'bg-white dark:bg-stone-900 border-stone-200/90 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl shrink-0 transition-colors ${
          isActive 
            ? 'bg-amber-600 text-white' 
            : isCompleted 
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
            : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
        }`}>
          <Icon className="w-4 h-4 stroke-[2.2]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className={`text-sm font-bold truncate ${
              isActive ? 'text-amber-950 dark:text-amber-100' : 'text-stone-900 dark:text-stone-100'
            }`}>
              {title}
            </span>
            {isCompleted && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Xong
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
            {descriptionVi}
          </p>
        </div>
      </div>
    </div>
  );
};
