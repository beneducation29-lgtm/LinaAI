import React from 'react';
import { useApp } from '../../context/AppContext';
import { Check } from 'lucide-react';

interface LayerTogglesProps {
  compact?: boolean;
  className?: string;
}

export const LayerToggles: React.FC<LayerTogglesProps> = ({ 
  compact = false, 
  className = '' 
}) => {
  const { preferences, toggleDisplayOption } = useApp();

  const options = [
    { key: 'showChinese' as const, label: 'Chữ Hán', sub: '汉字' },
    { key: 'showPinyin' as const, label: 'Pinyin', sub: 'Bính âm' },
    { key: 'showVietnamese' as const, label: 'Tiếng Việt', sub: 'Dịch nghĩa' },
  ];

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 ${className}`}>
        {options.map((opt) => {
          const active = preferences[opt.key];
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => toggleDisplayOption(opt.key)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all min-h-[36px] ${
                active 
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/80 dark:border-stone-700' 
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] transition-colors ${
                active ? 'bg-amber-700 text-white' : 'border border-stone-300 dark:border-stone-600'
              }`}>
                {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Hiển thị ngữ âm & dịch nghĩa
        </span>
        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
          Tùy chỉnh 3 tầng
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const active = preferences[opt.key];
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => toggleDisplayOption(opt.key)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all min-h-[56px] ${
                active
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-amber-100 font-medium shadow-2xs'
                  : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] transition-colors ${
                  active ? 'bg-amber-700 text-white' : 'border border-stone-300 dark:border-stone-600'
                }`}>
                  {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </span>
                <span className="text-xs font-semibold">{opt.label}</span>
              </div>
              <span className="text-[10px] text-stone-400 dark:text-stone-500">{opt.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
