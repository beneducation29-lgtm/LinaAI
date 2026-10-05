import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  speechService, 
  SpeechLanguage, 
  PlaybackSpeed, 
  VoiceSettings 
} from '../../services/speech';
import { 
  Volume2, 
  Mic, 
  Settings2, 
  X, 
  Check, 
  Sliders, 
  Layers, 
  Sparkles 
} from 'lucide-react';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  voiceSettings,
  onUpdateVoiceSettings
}) => {
  const { preferences, toggleDisplayOption } = useApp();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const v = speechService.getAvailableVoices();
      setVoices(v);
    };
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  if (!isOpen) return null;

  const chineseVoices = voices.filter(v => 
    v.lang.toLowerCase().includes('zh') || 
    v.lang.toLowerCase().includes('cmn') ||
    v.name.includes('Chinese')
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            <h2 className="font-bold text-stone-900 dark:text-stone-100 text-base">
              Cài đặt Giọng nói & Phát âm
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

        {/* 1. Speech Language */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
            Ngôn ngữ nhận diện giọng nói (STT Language)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'zh-CN' as SpeechLanguage, label: 'Tiếng Trung (Phổ thông - zh-CN)' },
              { id: 'zh-TW' as SpeechLanguage, label: 'Tiếng Trung (Đài Loan - zh-TW)' },
              { id: 'vi-VN' as SpeechLanguage, label: 'Tiếng Việt (vi-VN)' },
              { id: 'en-US' as SpeechLanguage, label: 'Tiếng Anh (en-US)' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => onUpdateVoiceSettings({ speechLanguage: item.id })}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all min-h-[44px] cursor-pointer ${
                  voiceSettings.speechLanguage === item.id
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-100 shadow-2xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Playback Speed (0.75x, 1.0x, 1.25x) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
              Tốc độ đọc mặc định (Playback Speed)
            </label>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 tabular-nums">
              {voiceSettings.playbackSpeed}x
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([0.75, 1.0, 1.25] as PlaybackSpeed[]).map(speed => (
              <button
                key={speed}
                type="button"
                onClick={() => {
                  onUpdateVoiceSettings({ playbackSpeed: speed });
                  speechService.speakChinese('你好，这是语速测试。', { rate: speed });
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all min-h-[42px] cursor-pointer ${
                  voiceSettings.playbackSpeed === speed
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                }`}
              >
                {speed === 0.75 ? '0.75x (Chậm)' : speed === 1.0 ? '1.0x (Chuẩn)' : '1.25x (Nhanh)'}
              </button>
            ))}
          </div>
        </div>

        {/* 3. TTS Voice Selection */}
        {chineseVoices.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
              Giọng đọc Lina (Text-to-Speech Voice)
            </label>
            <select
              value={voiceSettings.selectedVoiceURI}
              onChange={(e) => {
                const uri = e.target.value;
                onUpdateVoiceSettings({ selectedVoiceURI: uri });
                speechService.speakChinese('你好，我是林娜。', { voiceURI: uri });
              }}
              className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-hidden min-h-[44px]"
            >
              <option value="">Giọng mặc định hệ thống (Tự động chọn)</option>
              {chineseVoices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 4. Toggles: Auto-play AI response & Push-to-talk */}
        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 cursor-pointer min-h-[48px]">
            <div>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Tự động phát âm thanh khi Lina trả lời
              </span>
              <span className="text-[11px] text-stone-400">
                Phát giọng đọc tiếng Trung ngay khi nhận được câu trả lời
              </span>
            </div>
            <input
              type="checkbox"
              checked={voiceSettings.autoPlayAiResponse}
              onChange={(e) => onUpdateVoiceSettings({ autoPlayAiResponse: e.target.checked })}
              className="w-4 h-4 accent-amber-600 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 cursor-pointer min-h-[48px]">
            <div><span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">Tự gửi câu sau khi nhận diện</span><span className="text-[11px] text-stone-400">Lina phản hồi ngay sau khi STT nhận xong câu tiếng Trung</span></div>
            <input type="checkbox" checked={voiceSettings.autoSendRecognizedSpeech ?? true} onChange={(e) => onUpdateVoiceSettings({ autoSendRecognizedSpeech: e.target.checked })} className="w-4 h-4 accent-amber-600 cursor-pointer" />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 cursor-pointer min-h-[48px]">
            <div>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Chế độ Push-to-talk (Nhấn để nói)
              </span>
              <span className="text-[11px] text-stone-400">
                Chỉ ghi âm khi bạn nhấn giữ hoặc chủ động bấm mic
              </span>
            </div>
            <input
              type="checkbox"
              checked={voiceSettings.pushToTalk}
              onChange={(e) => onUpdateVoiceSettings({ pushToTalk: e.target.checked })}
              className="w-4 h-4 accent-amber-600 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 cursor-pointer min-h-[48px]">
            <div>
              <span className="text-xs font-bold text-amber-950 dark:text-amber-200 block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Giọng đọc chuẩn Studio (Gemini 3.8 TTS)
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                Phát âm tự nhiên chuẩn tiếng Phổ thông từ mô hình Gemini
              </span>
            </div>
            <input
              type="checkbox"
              checked={voiceSettings.useGeminiTTS ?? false}
              onChange={(e) => {
                const nextVal = e.target.checked;
                onUpdateVoiceSettings({ useGeminiTTS: nextVal });
                if (nextVal) {
                  speechService.speakChinese('你好，我是林娜。', { useGeminiTTS: true });
                }
              }}
              className="w-4 h-4 accent-amber-600 cursor-pointer"
            />
          </label>
        </div>

        {/* 5. Layer display toggles: Show Pinyin, Show Vietnamese */}
        <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          <span className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
            Hiển thị bản dịch ngữ âm
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => toggleDisplayOption('showPinyin')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between min-h-[44px] ${
                preferences.showPinyin
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200'
                  : 'bg-stone-50 dark:bg-stone-800 border-stone-200 text-stone-400'
              }`}
            >
              <span>Hiện Pinyin</span>
              {preferences.showPinyin && <Check className="w-3.5 h-3.5 text-amber-700" />}
            </button>

            <button
              type="button"
              onClick={() => toggleDisplayOption('showVietnamese')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between min-h-[44px] ${
                preferences.showVietnamese
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200'
                  : 'bg-stone-50 dark:bg-stone-800 border-stone-200 text-stone-400'
              }`}
            >
              <span>Hiện Tiếng Việt</span>
              {preferences.showVietnamese && <Check className="w-3.5 h-3.5 text-amber-700" />}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl transition-colors min-h-[44px] cursor-pointer"
          >
            Lưu và đóng
          </button>
        </div>
      </div>
    </div>
  );
};
