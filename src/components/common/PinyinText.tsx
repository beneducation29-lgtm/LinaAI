import React from 'react';

interface PinyinTextProps {
  pinyin: string;
  className?: string;
  size?: 'sm' | 'base' | 'lg';
}

export const PinyinText: React.FC<PinyinTextProps> = ({ 
  pinyin, 
  className = '', 
  size = 'base' 
}) => {
  const sizeClasses = {
    sm: 'text-xs text-amber-700 dark:text-amber-400 font-medium',
    base: 'text-sm text-amber-800 dark:text-amber-300 font-medium',
    lg: 'text-base text-amber-800 dark:text-amber-300 font-semibold'
  };

  return (
    <span className={`tracking-normal leading-relaxed ${sizeClasses[size]} ${className}`}>
      {pinyin}
    </span>
  );
};
