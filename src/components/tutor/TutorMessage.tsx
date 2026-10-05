import React, { useState } from 'react';
import { ConversationMessage } from '../../types';
import { ChineseSentence } from '../common/ChineseSentence';
import { speechService, PlaybackSpeed } from '../../services/speech';
import { useApp } from '../../context/AppContext';
import { 
  Volume2, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  BookA, 
  Star,
  Sparkles,
  ArrowRight,
  Gauge
} from 'lucide-react';

interface TutorMessageProps {
  message: ConversationMessage;
  onSelectSuggestion?: (text: string) => void;
  onTryCorrection?: (text: string) => void;
  onRetrySpeaking?: () => void;
  className?: string;
}

export const TutorMessage: React.FC<TutorMessageProps> = ({
  message,
  onSelectSuggestion,
  onTryCorrection,
  onRetrySpeaking,
  className = ''
}) => {
  const { toggleSaveVocabulary, isVocabularySaved } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState<PlaybackSpeed>(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [showVocab, setShowVocab] = useState(false);

  const isAI = message.sender === 'ai';
  const hasCorrection = message.correction && message.correction.hasMistake;

  const handlePlayAudio = async (text: string, speedOverride?: PlaybackSpeed) => {
    if (isPlaying) {
      speechService.stopSpeaking();
      setIsPlaying(false);
      return;
    }
    const speed = speedOverride || currentSpeed;
    setIsPlaying(true);
    await speechService.speakChinese(text, {
      rate: speed,
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false)
    });
  };

  const handleCycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSpeed: PlaybackSpeed = currentSpeed === 1.0 ? 0.75 : currentSpeed === 0.75 ? 1.25 : 1.0;
    setCurrentSpeed(nextSpeed);
    if (isPlaying) {
      speechService.stopSpeaking();
      setIsPlaying(false);
      handlePlayAudio(message.hanzi, nextSpeed);
    }
  };

  return (
    <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} mb-4 ${className}`}>
      {/* Sender indicator & timestamp */}
      <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-stone-400">
        <span className="font-semibold text-stone-600 dark:text-stone-300">
          {isAI ? 'Lina (林娜)' : 'Bạn'}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {isAI && message.responseType === 'correction' && (
          <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded font-medium">
            Sửa lỗi & Hướng dẫn
          </span>
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[95%] sm:max-w-[85%] rounded-3xl p-4 transition-all shadow-xs ${
          isAI
            ? 'bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-tl-sm'
            : 'bg-amber-700 dark:bg-amber-800 text-white rounded-tr-sm shadow-amber-900/10'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Chinese + Pinyin + Vietnamese 3-line layout */}
          <div className="flex-1">
            {isAI ? (
              <ChineseSentence
                hanzi={message.hanzi}
                pinyin={message.pinyin}
                vietnamese={message.vietnamese}
                size="base"
              />
            ) : (
              <div className="space-y-1">
                <div className="font-cjk text-xl font-bold tracking-wide">
                  {message.hanzi}
                </div>
                {message.pinyin && (
                  <div className="text-sm text-amber-200 font-medium">
                    {message.pinyin}
                  </div>
                )}
                {message.vietnamese && (
                  <div className="text-sm text-amber-100/90 italic">
                    {message.vietnamese}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Audio Controls (Play + 0.75x/1.0x/1.25x speed selector) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Speed Badge Button */}
            <button
              type="button"
              onClick={handleCycleSpeed}
              className={`text-[10px] font-bold px-1.5 py-1 rounded-lg border transition-colors min-h-[32px] cursor-pointer tabular-nums ${
                isAI
                  ? 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                  : 'bg-amber-800/80 border-amber-600/60 text-amber-200 hover:bg-amber-800'
              }`}
              title="Bấm để đổi tốc độ đọc: 0.75x (chậm), 1.0x (chuẩn), 1.25x (nhanh)"
            >
              {currentSpeed}x
            </button>

            {/* Play Button */}
            <button
              type="button"
              onClick={() => handlePlayAudio(message.hanzi)}
              className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                isAI
                  ? isPlaying 
                    ? 'bg-amber-600 text-white shadow-xs animate-pulse'
                    : 'bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-stone-600 dark:text-stone-300'
                  : 'bg-amber-800/80 hover:bg-amber-900 text-amber-100'
              }`}
              title="Phát âm câu này"
              aria-label="Phát âm"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. CORRECTION BOX (Warm, supportive, non-shaming) */}
        {isAI && hasCorrection && message.correction && (
          <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-stone-800 dark:text-stone-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Gợi ý hoàn thiện câu tự nhiên</span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 italic">
              "Bạn diễn đạt đúng ý rồi. Mình sửa một chút để câu tự nhiên hơn nhé:"
            </p>

            {/* Before and After comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-stone-900/60 border border-amber-200/60 dark:border-stone-800">
                <span className="text-[10px] text-stone-400 block font-semibold uppercase">Câu bạn vừa nói</span>
                <span className="font-cjk font-medium text-stone-700 dark:text-stone-300 line-through decoration-amber-500/70">
                  {message.correction.originalSentence}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold uppercase">Cách nói chuẩn hơn</span>
                <span className="font-cjk font-bold text-emerald-900 dark:text-emerald-200">
                  {message.correction.correctedSentence}
                </span>
                {message.correction.pinyin && (
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block">
                    {message.correction.pinyin}
                  </span>
                )}
              </div>
            </div>

            {/* Explanation in natural Vietnamese */}
            <div className="text-xs text-stone-700 dark:text-stone-300 pt-1 leading-relaxed">
              <strong>💡 Giải thích: </strong>{message.correction.explanationVi}
            </div>

            {/* Try again prompt */}
            {message.correction.tryAgainPromptVi && onTryCorrection && (
              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/60 flex items-center justify-between">
                <span className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                  {message.correction.tryAgainPromptVi}
                </span>
                <button
                  type="button"
                  onClick={() => onTryCorrection(message.correction!.correctedSentence)}
                  className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors min-h-[36px] cursor-pointer"
                >
                  <span>Thử lại câu này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Speaking Coach feedback for spoken learner turns */}
        {isAI && message.speakingCoach?.enabled && (
          <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50/80 p-3.5 text-stone-800 dark:border-sky-900/60 dark:bg-sky-950/20 dark:text-stone-100 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900 dark:text-sky-200">
                <Gauge className="w-4 h-4" />
                <span>Speaking Coach · Độ tự nhiên {message.speakingCoach.naturalnessScore}/100</span>
              </div>
              {message.speakingCoach.needsRetry && onRetrySpeaking && (
                <button type="button" onClick={onRetrySpeaking} className="min-h-[34px] rounded-lg bg-sky-700 px-2.5 text-[11px] font-bold text-white hover:bg-sky-800">
                  🎙 Nói lại
                </button>
              )}
            </div>
            {message.speakingCoach.focus && (
              <div className="text-[11px] font-semibold text-sky-800 dark:text-sky-300">Cần chú ý: {message.speakingCoach.focus}</div>
            )}
            {message.speakingCoach.betterSentence && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <div className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Cách nói tự nhiên hơn</div>
                <div className="mt-0.5 font-cjk text-base font-bold text-emerald-900 dark:text-emerald-200">{message.speakingCoach.betterSentence}</div>
              </div>
            )}
            {message.speakingCoach.feedbackVi && <div className="text-xs leading-relaxed">💡 {message.speakingCoach.feedbackVi}</div>}
            {message.speakingCoach.retryPromptVi && <div className="text-[11px] font-medium text-sky-800 dark:text-sky-300">{message.speakingCoach.retryPromptVi}</div>}
            <div className="text-[10px] text-stone-500 dark:text-stone-400">Điểm này đánh giá độ tự nhiên của câu transcript, không phải điểm âm thanh/acoustic.</div>
          </div>
        )}

        {/* 2. VOCABULARY EXTRACTION EXPANDER */}
        {isAI && message.vocabulary && message.vocabulary.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setShowVocab(!showVocab)}
              className="flex items-center justify-between w-full text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 py-0.5 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <BookA className="w-3.5 h-3.5 text-amber-600" />
                <span>Từ vựng mới trong câu ({message.vocabulary.length} từ)</span>
              </span>
              {showVocab ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showVocab && (
              <div className="mt-2 space-y-2">
                {message.vocabulary.map((v, i) => {
                  const vocabId = `vocab-ai-${v.hanzi}`;
                  const isSaved = isVocabularySaved(vocabId);

                  return (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-cjk font-bold text-sm text-stone-900 dark:text-stone-100">{v.hanzi}</span>
                          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">{v.pinyin}</span>
                          {v.hskLevel && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded font-medium">
                              {v.hskLevel}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-600 dark:text-stone-300 font-medium">{v.vietnamese}</div>
                        {v.exampleSentence && (
                          <div className="text-[11px] text-stone-400 italic pt-0.5">VD: {v.exampleSentence}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(v.hanzi)}
                          className="p-1.5 text-stone-500 hover:text-amber-700 dark:hover:text-amber-400 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-700 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                          aria-label="Phát âm từ vựng"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSaveVocabulary(vocabId)}
                          className={`p-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors cursor-pointer ${
                            isSaved ? 'text-amber-600' : 'text-stone-400 hover:text-amber-600'
                          }`}
                          title="Lưu từ vựng"
                        >
                          <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. GRAMMAR EXPLANATION EXPANDER */}
        {isAI && message.grammar && message.grammar.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setShowGrammar(!showGrammar)}
              className="flex items-center justify-between w-full text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 py-0.5 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Giải thích cấu trúc ngữ pháp</span>
              </span>
              {showGrammar ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showGrammar && (
              <div className="mt-2 space-y-2">
                {message.grammar.map((g, i) => (
                  <div
                    key={i}
                    className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl text-xs text-stone-700 dark:text-stone-300 border border-amber-200/60 dark:border-amber-900/40 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-900 dark:text-amber-200 text-xs">
                        {g.structure}
                      </span>
                      <span className="text-stone-500 text-[11px]">{g.meaningVi}</span>
                    </div>
                    {g.exampleSentence && (
                      <div className="pt-1 border-t border-amber-200/50 dark:border-amber-900/50 space-y-0.5">
                        <div className="font-cjk font-medium text-stone-800 dark:text-stone-100">{g.exampleSentence}</div>
                        <div className="text-[11px] text-amber-700 dark:text-amber-400">{g.examplePinyin}</div>
                        <div className="text-[11px] text-stone-500 italic">{g.exampleVietnamese}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pronunciation score if user spoke */}
        {!isAI && message.pronunciationScore !== undefined && (
          <div className="mt-2.5 pt-2 border-t border-amber-600/40 flex items-center gap-1.5 text-xs text-amber-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Độ chuẩn xác phát âm: <strong>{message.pronunciationScore}%</strong></span>
          </div>
        )}
      </div>

      {/* Suggested replies for learner rapid reflex */}
      {isAI && message.suggestedReplies && message.suggestedReplies.length > 0 && onSelectSuggestion && (
        <div className="mt-2 pl-2 space-y-1.5 w-full max-w-[95%] sm:max-w-[85%]">
          <span className="text-[11px] text-stone-400 font-medium block">
            Gợi ý câu bạn có thể đáp lại:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {message.suggestedReplies.map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectSuggestion(reply.hanzi)}
                className="text-left text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-stone-800 transition-all shadow-2xs cursor-pointer min-h-[36px]"
              >
                <div className="font-cjk font-medium">{reply.hanzi}</div>
                <div className="text-[10px] text-stone-400">{reply.vietnamese}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
