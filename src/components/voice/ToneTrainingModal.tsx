import React, { useState } from 'react';
import { 
  speechService, 
  CHINESE_TONES, 
  ToneItem, 
  PronunciationScore 
} from '../../services/speech';
import { 
  Volume2, 
  Mic, 
  MicOff, 
  RotateCcw, 
  CheckCircle2, 
  X, 
  Sparkles,
  Info
} from 'lucide-react';

interface ToneTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ToneTrainingModal: React.FC<ToneTrainingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedToneIndex, setSelectedToneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedTranscript, setRecordedTranscript] = useState<string>('');
  const [scoreResult, setScoreResult] = useState<PronunciationScore | null>(null);
  const [friendlyError, setFriendlyError] = useState<string | null>(null);
  const [playSpeed, setPlaySpeed] = useState<number>(1.0);

  if (!isOpen) return null;

  const activeTone: ToneItem = CHINESE_TONES[selectedToneIndex];

  const handlePlayTone = async (slow = false) => {
    if (isPlaying) return;
    setIsPlaying(true);
    const speed = slow ? 0.75 : 1.0;
    setPlaySpeed(speed);
    await speechService.speakChinese(activeTone.sampleAudioText, {
      rate: speed as any,
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false)
    });
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      setFriendlyError(null);
      setRecordedTranscript('');
      setScoreResult(null);
      setIsRecording(true);

      if (!speechService.isSttSupported()) {
        // Fallback for simulation
        setTimeout(() => {
          setIsRecording(false);
          setRecordedTranscript(activeTone.hanzi);
          const score = speechService.analyzePronunciation(activeTone.hanzi, activeTone.hanzi);
          setScoreResult(score);
        }, 1500);
        return;
      }

      speechService.startListening({
        lang: 'zh-CN',
        onResult: (res) => {
          setRecordedTranscript(res.transcript);
          if (res.isFinal) {
            setIsRecording(false);
            const score = speechService.analyzePronunciation(activeTone.hanzi, res.transcript);
            setScoreResult(score);
          }
        },
        onError: (err) => {
          setIsRecording(false);
          setFriendlyError(err);
        },
        onEnd: () => {
          setIsRecording(false);
        }
      });
    }
  };

  const handleReset = () => {
    setRecordedTranscript('');
    setScoreResult(null);
    setFriendlyError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h2 className="font-bold text-stone-900 dark:text-stone-100 text-base">
              Luyện 4 Thanh Điệu Tiếng Trung (Tone Training)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tone Selection Tabs */}
        <div className="grid grid-cols-5 gap-1.5">
          {CHINESE_TONES.map((t, idx) => (
            <button
              key={t.toneNumber}
              type="button"
              onClick={() => {
                setSelectedToneIndex(idx);
                handleReset();
              }}
              className={`p-2 rounded-2xl border text-center transition-all cursor-pointer min-h-[56px] flex flex-col items-center justify-center ${
                selectedToneIndex === idx
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
              }`}
            >
              <span className="font-bold text-base font-cjk">{t.pinyin}</span>
              <span className={`text-[10px] ${selectedToneIndex === idx ? 'text-amber-100' : 'text-stone-400'}`}>
                {t.toneNumber === 5 ? 'Khinh' : `Thanh ${t.toneNumber}`}
              </span>
            </button>
          ))}
        </div>

        {/* Active Tone Hero Card */}
        <div className="p-6 rounded-3xl bg-linear-to-br from-amber-50 to-orange-50/60 dark:from-stone-850 dark:to-stone-800 border border-amber-200/80 dark:border-stone-700 text-center space-y-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
              {activeTone.toneNameVi}
            </span>

            {/* Giant Chinese Character + Pinyin */}
            <div className="py-2">
              <div className="font-cjk text-6xl font-bold text-stone-900 dark:text-stone-50">
                {activeTone.hanzi}
              </div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1 font-cjk">
                {activeTone.pinyin}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 italic">
                Nghĩa: {activeTone.meaningVi}
              </div>
            </div>

            {/* Pitch Contour Visualizer */}
            <div className="w-full max-w-[200px] h-14 mx-auto bg-white/70 dark:bg-stone-900/60 rounded-xl border border-amber-200/60 dark:border-stone-800 flex items-center justify-center p-2">
              <svg viewBox="0 0 100 70" className="w-full h-full stroke-amber-600 fill-none stroke-[4] stroke-linecap-round">
                {/* Horizontal reference baseline */}
                <line x1="10" y1="35" x2="90" y2="35" className="stroke-stone-200 dark:stroke-stone-700 stroke-1 stroke-dasharray-2" />
                <path d={activeTone.pitchContour} />
              </svg>
            </div>
          </div>

          {/* Action Row: Play 1.0x, Play 0.75x, Record, Try Again */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {/* Play Standard */}
            <button
              type="button"
              onClick={() => handlePlayTone(false)}
              disabled={isPlaying}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-400 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs min-h-[42px] cursor-pointer"
            >
              <Volume2 className={`w-4 h-4 ${isPlaying && playSpeed === 1.0 ? 'animate-pulse text-amber-600' : ''}`} />
              <span>Nghe (1.0x)</span>
            </button>

            {/* Play Slow 0.75x */}
            <button
              type="button"
              onClick={() => handlePlayTone(true)}
              disabled={isPlaying}
              className="px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[42px] cursor-pointer"
            >
              <span>Nghe chậm (0.75x)</span>
            </button>

            {/* Record Mic */}
            <button
              type="button"
              onClick={handleToggleRecord}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm min-h-[42px] cursor-pointer ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-amber-700 hover:bg-amber-800 text-white'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? 'Đang nghe...' : 'Thu âm'}</span>
            </button>

            {/* Try Again */}
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 text-stone-600 dark:text-stone-400 min-h-[42px] min-w-[42px] flex items-center justify-center cursor-pointer"
              title="Thử lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Feedback / Result Card */}
        {friendlyError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl text-xs text-red-700 dark:text-red-300 text-center">
            {friendlyError}
          </div>
        )}

        {scoreResult && (
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-stone-100">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Kết quả phát âm
              </span>
              <span className="tabular-nums font-mono text-sm font-bold text-amber-700 dark:text-amber-400">
                {scoreResult.overall} / 100 điểm
              </span>
            </div>

            {recordedTranscript && (
              <div className="text-xs text-stone-600 dark:text-stone-300">
                Âm thanh nhận diện: <strong className="font-cjk text-stone-900 dark:text-stone-100">"{recordedTranscript}"</strong>
              </div>
            )}

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed pt-1">
              💡 {scoreResult.feedback}
            </p>

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3" /> Đánh giá dựa trên khớp âm và nhận diện ngữ âm STT
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-amber-700 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
              >
                Luyện lại
              </button>
            </div>
          </div>
        )}

        {/* Navigation to next tone */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (selectedToneIndex > 0) {
                setSelectedToneIndex(prev => prev - 1);
                handleReset();
              }
            }}
            disabled={selectedToneIndex === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800 min-h-[38px]"
          >
            Thanh trước
          </button>

          <span className="text-xs text-stone-400">
            {selectedToneIndex + 1} / 5
          </span>

          <button
            type="button"
            onClick={() => {
              if (selectedToneIndex < CHINESE_TONES.length - 1) {
                setSelectedToneIndex(prev => prev + 1);
                handleReset();
              }
            }}
            disabled={selectedToneIndex === CHINESE_TONES.length - 1}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-700 disabled:opacity-40 hover:bg-amber-50 dark:hover:bg-amber-950/40 min-h-[38px]"
          >
            Thanh tiếp theo
          </button>
        </div>
      </div>
    </div>
  );
};
