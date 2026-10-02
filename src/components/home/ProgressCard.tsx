import React from 'react';

interface ProgressCardProps {
  currentMinutes: number;
  targetMinutes: number;
  streakDays: number;
  className?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  currentMinutes,
  targetMinutes,
  streakDays,
  className = ''
}) => {
  const percentage = Math.min(100, Math.round((currentMinutes / targetMinutes) * 100));

  return (
    <div className={`p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Mục tiêu hằng ngày
        </span>
        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
          🔥 Chuỗi {streakDays} ngày
        </span>
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <span className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            {currentMinutes} / {targetMinutes}
          </span>
          <span className="text-sm font-medium text-stone-500 dark:text-stone-400 ml-1.5">
            phút hôm nay
          </span>
        </div>
        <span className="text-xs font-bold text-stone-600 dark:text-stone-300 tabular-nums">
          {percentage}%
        </span>
      </div>

      {/* Progress track */}
      <div className="w-full h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden p-0.5">
        <div
          className="h-full bg-linear-to-r from-amber-600 to-amber-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-2.5">
        {percentage >= 100 
          ? '🎉 Bạn đã hoàn thành xuất sắc mục tiêu ngày hôm nay!'
          : `Chỉ còn ${targetMinutes - currentMinutes} phút nữa để đạt mốc hôm nay. Cố lên nhé!`}
      </p>
    </div>
  );
};
