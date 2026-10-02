import React from 'react';

interface ProgressCardProps {
  currentMinutes: number;
  targetMinutes: number;
  streakDays: number;
  onSelectGoal?: (minutes: 5 | 10 | 15 | 20 | 30) => void;
  className?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  currentMinutes,
  targetMinutes,
  streakDays,
  onSelectGoal,
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

      <div className="mt-3 flex flex-wrap gap-1.5">{[5,10,15,20,30].map(goal => <button key={goal} type="button" onClick={() => onSelectGoal?.(goal as 5|10|15|20|30)} className={'px-2.5 py-1.5 rounded-lg text-[10px] font-bold border ' + (goal === targetMinutes ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200' : 'bg-stone-50 border-stone-200 text-stone-500 dark:bg-stone-800 dark:border-stone-700')}>{goal} phút</button>)}</div>
      <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-2.5">{percentage >= 100 ? 'Bạn đã đủ mục tiêu hôm nay. Học thêm nếu bạn muốn, hoàn toàn không áp lực.' : `Hôm nay bạn chỉ cần ${targetMinutes - currentMinutes} phút để tiếp tục.`}</p>
    </div>
  );
};
