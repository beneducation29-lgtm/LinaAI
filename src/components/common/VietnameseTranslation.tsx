import React from 'react';

interface VietnameseTranslationProps {
  vietnamese: string;
  className?: string;
  size?: 'sm' | 'base' | 'lg';
}

export const VietnameseTranslation: React.FC<VietnameseTranslationProps> = ({
  vietnamese,
  className = '',
  size = 'base'
}) => {
  const sizeClasses = {
    sm: 'text-xs text-slate-500 dark:text-slate-400',
    base: 'text-sm text-slate-600 dark:text-slate-300',
    lg: 'text-base text-slate-700 dark:text-slate-200'
  };

  return (
    <p className={`italic leading-normal font-normal ${sizeClasses[size]} ${className}`}>
      {vietnamese}
    </p>
  );
};
