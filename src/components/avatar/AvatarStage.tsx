import React from 'react';
import { Sparkles } from 'lucide-react';
import { LinaAvatar } from './LinaAvatar';
import type { AvatarState, HSKLevel } from '../../types';

interface AvatarStageProps {
  hskLevel: HSKLevel;
  topicTitle: string;
  avatarState?: AvatarState;
  className?: string;
  onOpenCharacterDesign?: () => void;
}

/**
 * Presentation layer for Lina's existing AvatarProvider-backed avatar.
 * This component owns only layout/context; avatar state, voice and providers stay centralized.
 */
export const AvatarStage: React.FC<AvatarStageProps> = ({
  hskLevel,
  topicTitle,
  className = '',
  onOpenCharacterDesign,
}) => (
  <section
    className={`relative flex min-h-0 flex-col gap-2 ${className}`}
    aria-label="Lina AI Chinese Tutor"
  >
    <div className="relative z-20 shrink-0 rounded-2xl border border-amber-200/70 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-md dark:border-amber-900/50 dark:bg-stone-900/85">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="font-cjk text-base font-bold leading-tight text-stone-900 dark:text-stone-100">
            你好，我是 Lina!
          </p>
          <p className="mt-0.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            Nǐ hǎo, wǒ shì Lina! · Xin chào, mình là Lina!
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
            <span className="rounded-full bg-stone-100 px-2 py-1 text-stone-600 dark:bg-stone-800 dark:text-stone-300">{hskLevel}</span>
            <span className="truncate rounded-full bg-amber-50 px-2 py-1 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              {topicTitle || 'Luyện giao tiếp tiếng Trung'}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="min-h-0 flex-1">
      <LinaAvatar
        mode="studio"
        className="h-full min-h-0"
        onOpenCharacterDesign={onOpenCharacterDesign}
      />
    </div>
  </section>
);
