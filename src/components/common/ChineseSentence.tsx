import React from 'react';
import { useApp } from '../../context/AppContext';
import { PinyinText } from './PinyinText';
import { VietnameseTranslation } from './VietnameseTranslation';

interface ChineseSentenceProps {
  hanzi: string;
  pinyin: string;
  vietnamese: string;
  className?: string;
  size?: 'sm' | 'base' | 'lg' | 'xl';
  forceShowAll?: boolean;
}

export const ChineseSentence: React.FC<ChineseSentenceProps> = ({
  hanzi,
  pinyin,
  vietnamese,
  className = '',
  size = 'base',
  forceShowAll = false
}) => {
  const { preferences } = useApp();

  const showHanzi = forceShowAll || preferences.showChinese;
  const showPinyin = forceShowAll || preferences.showPinyin;
  const showVietnamese = forceShowAll || preferences.showVietnamese;

  const hanziSizeClasses = {
    sm: 'text-base font-medium tracking-wide',
    base: 'text-xl font-medium tracking-wide',
    lg: 'text-2xl font-semibold tracking-wide',
    xl: 'text-3xl font-bold tracking-wide'
  };

  const pinyinSizeMap: Record<'sm' | 'base' | 'lg' | 'xl', 'sm' | 'base' | 'lg'> = {
    sm: 'sm',
    base: 'base',
    lg: 'lg',
    xl: 'lg'
  };

  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {/* 1. Chinese Characters */}
      {showHanzi && (
        <div className={`font-cjk text-slate-900 dark:text-slate-50 ${hanziSizeClasses[size]}`}>
          {hanzi}
        </div>
      )}

      {/* 2. Pinyin */}
      {showPinyin && (
        <PinyinText pinyin={pinyin} size={pinyinSizeMap[size]} />
      )}

      {/* 3. Vietnamese Translation */}
      {showVietnamese && (
        <VietnameseTranslation vietnamese={vietnamese} size={pinyinSizeMap[size]} />
      )}
    </div>
  );
};
