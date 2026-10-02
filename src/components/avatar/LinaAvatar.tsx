import React, { useState, useEffect, useRef } from 'react';
import { 
  avatarService, 
  VisemeEvent, 
  DEFAULT_LINA_CHARACTER_CONFIG, 
  AVATAR_STATE_DESCRIPTIONS 
} from '../../services/avatarService';
import { AvatarState, AvatarProviderLevel } from '../../types';
import { avatarAnimationEngine, type AvatarMotionFrame } from '../../services/avatarAnimationEngine';
import linaStylizedAvatarImg from '../../assets/images/lina_avatar_stylized_1790862594850.jpg';
import { 
  Sparkles, 
  Mic, 
  BrainCircuit, 
  Volume2, 
  Heart, 
  ThumbsUp, 
  HelpCircle, 
  AlertCircle, 
  Layers, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

interface LinaAvatarProps {
  mode?: 'studio' | 'compact' | 'mini';
  className?: string;
  onOpenCharacterDesign?: () => void;
}

export const LinaAvatar: React.FC<LinaAvatarProps> = ({
  mode = 'studio',
  className = '',
  onOpenCharacterDesign
}) => {
  const [avatarState, setAvatarState] = useState<AvatarState>(avatarService.getState());
  const [providerLevel, setProviderLevel] = useState<AvatarProviderLevel>(avatarService.getLevel());
  const [viseme, setViseme] = useState<VisemeEvent>({ viseme: 'sil', amplitude: 0 });
  const [imageError, setImageError] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showTestControls, setShowTestControls] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [motion, setMotion] = useState<AvatarMotionFrame>(() => avatarAnimationEngine.frame());
  const hasRealtimeProvider = avatarService.hasRealtimeProvider();

  // Subscribe to central Avatar Manager updates
  useEffect(() => {
    const unsubscribe = avatarService.subscribe((state, level, _label, v) => {
      setAvatarState(state);
      setProviderLevel(level);
      setViseme(v);
    });
    return unsubscribe;
  }, []);

  // Procedural motion lifecycle: randomized gaze/blink + subtle head/breathing.\n  // This is intentionally not claimed as real eye tracking.\n  useEffect(() => {\n    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;\n    setPrefersReducedMotion(Boolean(reduced));\n    if (reduced || typeof window === 'undefined') return;\n    let frameId = 0;\n    const tick = (now:number) => {\n      const next = avatarAnimationEngine.frame(now);\n      setMotion(next);\n      setIsBlinking(next.blink > 0);\n      frameId = window.requestAnimationFrame(tick);\n    };\n    frameId = window.requestAnimationFrame(tick);\n    return () => window.cancelAnimationFrame(frameId);\n  }, []);

  const stateInfo = AVATAR_STATE_DESCRIPTIONS[avatarState] || AVATAR_STATE_DESCRIPTIONS.IDLE;\n  useEffect(() => { avatarAnimationEngine.setState(avatarState); }, [avatarState]);

  // State-specific visual styling
  const stateAuraStyles: Record<AvatarState, string> = {
    IDLE: 'from-amber-500/10 via-orange-500/5 to-emerald-500/5',
    LISTENING: 'from-red-500/25 via-rose-500/15 to-amber-500/10 motion-safe:animate-pulse',
    THINKING: 'from-amber-500/25 via-indigo-500/20 to-purple-500/15',
    SPEAKING: 'from-emerald-500/25 via-teal-500/15 to-amber-500/10',
    HAPPY: 'from-amber-400/30 via-yellow-400/20 to-orange-400/15',
    ENCOURAGING: 'from-amber-500/30 via-emerald-400/20 to-teal-500/15',
    CONFUSED: 'from-purple-500/25 via-indigo-500/15 to-stone-500/10',
    CORRECTING: 'from-blue-500/25 via-indigo-500/15 to-amber-500/10',
    ERROR: 'from-rose-500/25 via-red-500/15 to-transparent',
  };

  const stateBorderColors: Record<AvatarState, string> = {
    IDLE: 'border-amber-600/40 ring-amber-400/20',
    LISTENING: 'border-red-500 ring-red-400/40 animate-pulse',
    THINKING: 'border-amber-500 ring-amber-400/40 animate-pulse',
    SPEAKING: 'border-emerald-500 ring-emerald-400/40',
    HAPPY: 'border-amber-400 ring-amber-300/40',
    ENCOURAGING: 'border-amber-600 ring-amber-500/30',
    CONFUSED: 'border-purple-500 ring-purple-400/30',
    CORRECTING: 'border-blue-500 ring-blue-400/30',
    ERROR: 'border-rose-500 ring-rose-400/30',
  };

  const stateIcons: Record<AvatarState, React.ReactNode> = {
    IDLE: <Sparkles className="w-3.5 h-3.5 text-amber-600" />,
    LISTENING: <Mic className="w-3.5 h-3.5 text-red-600 animate-pulse" />,
    THINKING: <BrainCircuit className="w-3.5 h-3.5 text-amber-600 motion-safe:animate-pulse" />,
    SPEAKING: <Volume2 className="w-3.5 h-3.5 text-emerald-600 motion-safe:animate-pulse" />,
    HAPPY: <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />,
    ENCOURAGING: <ThumbsUp className="w-3.5 h-3.5 text-amber-600" />,
    CONFUSED: <HelpCircle className="w-3.5 h-3.5 text-purple-600" />,
    CORRECTING: <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />,
    ERROR: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />,
  };

  // Test state helper
  const handleTestState = (state: AvatarState) => {
    avatarService.setState(state);
    if (state === 'SPEAKING') {
      avatarService.speak('你好！很高兴和你练习中文。我是林娜。', { rate: 1.0 });
    }
  };

  // =========================================================================
  // 1. MINI MODE (Floating or top bar icon)
  // =========================================================================
  if (mode === 'mini') {
    return (
      <div className={`relative inline-flex items-center gap-2 ${className}`}>
        <div className={`relative w-10 h-10 rounded-full overflow-hidden border-2 shadow-xs transition-all ${stateBorderColors[avatarState]}`}>
          {!imageError ? (
            <img
              src={linaStylizedAvatarImg}
              alt="Lina"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-bold font-cjk text-sm">
              林娜
            </div>
          )}
        </div>
        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
          林娜 (Lina)
        </span>
      </div>
    );
  }

  // =========================================================================
  // 2. COMPACT MODE (Mobile friendly top header card)
  // =========================================================================
  if (mode === 'compact') {
    return (
      <div className={`w-full p-2.5 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 shadow-xs transition-all ${className}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar Circle with breathing & active aura */}
            <div className="relative shrink-0">
              {(avatarState === 'LISTENING' || avatarState === 'SPEAKING' || avatarState === 'THINKING') && (
                <div className={`absolute -inset-1.5 rounded-full animate-ping opacity-30 ${
                  avatarState === 'LISTENING' ? 'bg-red-500' : avatarState === 'SPEAKING' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
              )}

              <div className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 shadow-sm transition-all duration-300 ${stateBorderColors[avatarState]}`}>
                {!imageError ? (
                  <img
                    src={linaStylizedAvatarImg}
                    alt="Lina AI Chinese Tutor"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-amber-600 to-orange-700 flex flex-col items-center justify-center text-white">
                    <span className="font-cjk font-bold text-base">林娜</span>
                    <span className="text-[10px]">Lina</span>
                  </div>
                )}

                {/* Audio playback indicator: mouth motion itself is driven by real audio metrics when available. */}
                {avatarState === 'SPEAKING' && viseme.amplitude > 0.05 && (
                  <div className="absolute inset-x-0 bottom-0 py-0.5 bg-emerald-950/80 backdrop-blur-xs flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" aria-label="Đang phát âm thanh" />
                  </div>
                )}
              </div>

              {/* State Micro Badge */}
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xs">
                {stateIcons[avatarState]}
              </div>
            </div>

            {/* Persona text & state message */}
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-cjk font-bold text-sm text-stone-900 dark:text-stone-100">
                  林娜 (Lina)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  AI Tutor
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 font-medium truncate">
                {stateInfo.titleVi}
              </p>
            </div>
          </div>

          {/* Quick Character Design info button */}
          {onOpenCharacterDesign && (
            <button
              type="button"
              onClick={onOpenCharacterDesign}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs flex items-center gap-1 shrink-0 cursor-pointer min-h-[38px]"
              title="Xem thông tin thiết kế nhân vật Lina"
            >
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline font-semibold">Nhân vật</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. STUDIO MODE (Desktop 35-45% width dedicated stage or expanded view)
  // =========================================================================
  return (
    <div className={`relative flex flex-col rounded-3xl bg-linear-to-b from-white to-stone-50/70 dark:from-stone-900 dark:to-stone-900/90 border border-stone-200/90 dark:border-stone-800 shadow-sm p-4 sm:p-5 overflow-hidden transition-all duration-300 ${className}`}>
      {/* Background ambient lighting aura */}
      <div className={`absolute inset-0 bg-linear-to-br pointer-events-none transition-all duration-700 ${stateAuraStyles[avatarState]}`} />

      {/* Top Bar inside Studio Stage: Name & Provider Level indicator */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-stone-200/60 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="font-cjk font-bold text-stone-900 dark:text-stone-100 text-base leading-none">
              林娜 <span className="font-sans text-xs font-normal text-stone-500">Lina</span>
            </h3>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              Gia sư tiếng Trung AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Character Design Specs button */}
          {onOpenCharacterDesign && (
            <button
              type="button"
              onClick={onOpenCharacterDesign}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs flex items-center gap-1 cursor-pointer min-h-[34px]"
              title="Xem thông số thiết kế nhân vật hư cấu Lina"
            >
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px] font-semibold hidden md:inline">Hồ sơ</span>
            </button>
          )}

          {/* Test Controls Toggle */}
          <button
            type="button"
            onClick={() => setShowTestControls(!showTestControls)}
            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs flex items-center gap-1 cursor-pointer min-h-[34px]"
            title="Thử nghiệm các trạng thái & cấp độ Avatar"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-semibold hidden md:inline">Thử nghiệm</span>
            {showTestControls ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Hero Avatar Presentation Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-4 my-auto">
        {/* Avatar Portrait Vessel */}
        <div className="relative group">
          {/* Attentive Listening & Thinking Glow Ring */}
          {(avatarState === 'LISTENING' || avatarState === 'THINKING' || avatarState === 'SPEAKING') && (
            <div className={`absolute -inset-4 rounded-3xl blur-md opacity-40 transition-all duration-500 ${
              avatarState === 'LISTENING' ? 'bg-red-500 animate-pulse' :
              avatarState === 'THINKING' ? 'bg-amber-500 animate-pulse' :
              'bg-emerald-500'
            }`} />
          )}

          {/* Portrait Container */}
          <div className={`relative w-full max-w-[430px] aspect-[3/4] rounded-[2rem] overflow-hidden border-3 shadow-lg transition-all duration-300 ${stateBorderColors[avatarState]} ${prefersReducedMotion ? '' : 'animate-[avatarBreath_4s_ease-in-out_infinite]'}`} style={prefersReducedMotion ? undefined : { transform: 'translate3d(' + (motion.headX * 100) + 'px,' + (motion.headY * 100) + 'px,0) rotate(' + motion.headTilt + 'deg) scale(' + (1 + motion.breathing * 0.004) + ')' }}>
            {!imageError ? (
              <img
                src={linaStylizedAvatarImg}
                alt="Lina 林娜 — gia sư tiếng Trung AI hư cấu"
                className={`w-full h-full object-cover object-[50%_35%] transition-transform duration-700 ${
                  avatarState === 'THINKING' ? 'scale-105 rotate-1' :
                  avatarState === 'CONFUSED' ? '-rotate-2' :
                  avatarState === 'HAPPY' ? 'scale-102' :
                  'scale-100'
                }`}
                onError={() => setImageError(true)}\n                style={prefersReducedMotion ? undefined : { transform: 'translate3d(' + (motion.gazeX * 8) + 'px,' + (motion.gazeY * 6) + 'px,0)' }}
              />
            ) : (
              /* Fallback Clean Stylized Vector Avatar (Level 1 Fallback Guarantee) */
              <div className="w-full h-full bg-linear-to-b from-stone-100 to-amber-50 dark:from-stone-800 dark:to-stone-900 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 rounded-full bg-linear-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md mb-2">
                  <span className="font-cjk font-bold text-2xl">林娜</span>
                </div>
                <span className="font-bold text-sm text-stone-800 dark:text-stone-200">Lina (林娜)</span>
                <span className="text-[11px] text-stone-500">Gia sư tiếng Trung</span>
              </div>
            )}

            {/* Level 2 & 3 Interactive Features: Eye-Blinking Overlay */}
            {isBlinking && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-24 h-1 bg-stone-900/60 dark:bg-stone-100/40 rounded-full blur-[0.5px] mt-[-10px]" />
              </div>
            )}

            {/* Level 2 & 3 Interactive Features: Synchronized Viseme Mouth Overlay */}
            {avatarState === 'SPEAKING' && viseme.amplitude > 0.05 && (
              <div className="absolute inset-x-0 bottom-[26%] flex items-center justify-center pointer-events-none">
                <div 
                  className="rounded-full bg-rose-950/70 border border-rose-300/40 shadow-xs transition-all duration-75"
                  style={{
                    width: `${Math.max(16, Math.min(32, viseme.amplitude * 28 + 14))}px`,
                    height: `${Math.max(8, Math.min(22, viseme.amplitude * 20 + 6))}px`,
                  }}
                />
              </div>
            )}

            {/* Speaking indicator is event-driven; no fake waveform is rendered. */}
            {avatarState === 'SPEAKING' && viseme.amplitude <= 0.05 && (
              <div className="absolute inset-x-0 bottom-0 py-1.5 bg-linear-to-t from-stone-950/60 to-transparent flex items-center justify-center">
                <span className="text-[10px] text-white/80">Đang nói · audio stream chưa có dữ liệu phân tích</span>
              </div>
            )}

            {/* Thinking Constellation Overlay */}
            {avatarState === 'THINKING' && (
              <div className="absolute inset-0 bg-stone-950/20 backdrop-blur-[0.5px] flex items-center justify-center">
                <div className="p-2.5 rounded-full bg-white/80 dark:bg-stone-900/80 shadow-md border border-amber-300">
                  <BrainCircuit className="w-6 h-6 text-amber-600 animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Floating State Badge */}
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-md flex items-center gap-1">
            {stateIcons[avatarState]}
          </div>
        </div>

        {/* Live State Description Banner */}
        <div className="mt-4 text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs transition-all duration-300 border border-stone-200/60 dark:border-stone-700"
               style={{ backgroundColor: 'var(--state-bg)' }}>
            {stateIcons[avatarState]}
            <span>{stateInfo.titleVi}</span>
          </div>

          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            {avatarState === 'IDLE' && 'Hãy bấm micro hoặc gõ câu để luyện tập cùng Lina.'}
            {avatarState === 'LISTENING' && 'Đang lắng nghe câu tiếng Trung của bạn...'}
            {avatarState === 'THINKING' && 'Lina đang chuẩn bị phân tích & câu trả lời...'}
            {avatarState === 'SPEAKING' && (viseme.amplitude > 0.05 ? 'Khẩu hình đang phản hồi theo năng lượng audio thực.' : 'Đang phát giọng đọc; lip sync audio chưa có dữ liệu.')}
            {avatarState === 'HAPPY' && 'Phát âm rất hay! Cùng tiếp tục phát huy nhé.'}
            {avatarState === 'ENCOURAGING' && 'Bạn diễn đạt đúng ý rồi. Cố lên nhé!'}
            {avatarState === 'CONFUSED' && 'Bạn thử nói lại chậm hơn một chút nhé.'}
            {avatarState === 'CORRECTING' && 'Lina đang tập trung chỉnh một điểm quan trọng trong câu.'}
            {avatarState === 'ERROR' && 'Đang thử kết nối lại âm thanh...'}
          </p>
        </div>
      </div>

      {/* Provider Level Footnote */}
      <div className="relative z-10 pt-2 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500" role="status" aria-live="polite">
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>Avatar: <strong>{providerLevel === 'level3_realtime' ? (hasRealtimeProvider ? 'Live provider' : 'Animated fallback') : providerLevel === 'level2_interactive' ? 'Animated interactive' : 'Accessible fallback'}</strong></span>
        </span>
        <button
          type="button"
          onClick={() => {
            const nextLevel: AvatarProviderLevel = providerLevel === 'level2_interactive' ? 'level1_fallback' : 'level2_interactive';
            avatarService.setLevel(nextLevel);
          }}
          className="text-amber-700 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
        >
          Đổi cấp
        </button>
      </div>

      {/* Expanded Avatar Test Lab (Requirement 14: Final Test Suite) */}
      {showTestControls && (
        <div className="relative z-20 mt-3 p-3 rounded-2xl bg-stone-100/90 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 space-y-2.5 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between font-bold text-stone-800 dark:text-stone-200">
            <span>🧪 Bảng kiểm tra Avatar (Avatar Test Lab)</span>
            <span className="text-[10px] text-stone-400">8 trạng thái & 3 cấp độ</span>
          </div>

          {/* Test 8 States */}
          <div className="space-y-1">
            <span className="text-[10px] text-stone-500 font-semibold uppercase block">Kiểm tra 8 trạng thái:</span>
            <div className="grid grid-cols-4 gap-1">
              {(['IDLE', 'LISTENING', 'THINKING', 'SPEAKING', 'HAPPY', 'ENCOURAGING', 'CONFUSED', 'ERROR'] as AvatarState[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleTestState(st)}
                  className={`py-1.5 px-1 text-center rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    avatarState === st
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Test 3 Provider Levels */}
          <div className="space-y-1 pt-1 border-t border-stone-200 dark:border-stone-700">
            <span className="text-[10px] text-stone-500 font-semibold uppercase block">Cấp độ bộ điều khiển (Provider Strategy):</span>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'level1_fallback' as AvatarProviderLevel, label: 'Cấp 1: Ảnh tĩnh' },
                { id: 'level2_interactive' as AvatarProviderLevel, label: 'Cấp 2: Canvas 60fps' },
                { id: 'level3_realtime' as AvatarProviderLevel, label: 'Cấp 3: Stream Live' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => avatarService.setLevel(lvl.id)}
                  className={`py-1.5 px-1 text-center rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    providerLevel === lvl.id
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* One-click speech + TTS sync demonstration */}
          <button
            type="button"
            onClick={() => {
              avatarService.speak('很高兴认识你！今天我们一起练习中文吧。', { rate: 1.0 });
            }}
            className="w-full py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer min-h-[36px]"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Thử đồng bộ khẩu hình phát âm TTS</span>
          </button>
        </div>
      )}
    </div>
  );
};
