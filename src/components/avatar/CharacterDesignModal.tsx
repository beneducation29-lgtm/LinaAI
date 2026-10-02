import React from 'react';
import { DEFAULT_LINA_CHARACTER_CONFIG, avatarService } from '../../services/avatarService';
import linaStylizedAvatarImg from '../../assets/images/lina_avatar_stylized_1790862594850.jpg';
import { 
  X, 
  Sparkles, 
  User, 
  Palette, 
  Camera, 
  Sun, 
  Smile, 
  Shirt, 
  Volume2, 
  CheckCircle2,
  ShieldCheck 
} from 'lucide-react';

interface CharacterDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CharacterDesignModal: React.FC<CharacterDesignModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const cfg = DEFAULT_LINA_CHARACTER_CONFIG;

  const handleHearSelfIntro = () => {
    avatarService.speak('你好！我是林娜。我是你的专属中文AI导师。让我们一起轻松快乐地学中文吧！', { rate: 1.0 });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                Hồ sơ Thiết kế Nhân vật: {cfg.name} ({cfg.chineseName})
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Hệ thống thông số nhân vật AI hư cấu gốc (Original Fictional AI Tutor)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Hero: Persona & Audio Introduction */}
        <div className="p-4 rounded-2xl bg-linear-to-r from-amber-50 to-orange-50/60 dark:from-stone-800 dark:to-stone-850 border border-amber-200/80 dark:border-stone-700 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-500 shrink-0 shadow-md">
            <img
              src={linaStylizedAvatarImg}
              alt="Lina Portrait"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="font-cjk font-bold text-xl text-stone-900 dark:text-stone-100">
                林娜 (Lina)
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Fictional AI Human
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              {cfg.taglineVi}
            </p>
            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={handleHearSelfIntro}
                className="py-1.5 px-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer min-h-[36px]"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe Lina tự giới thiệu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Character Design Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* 1. Face */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200">
              <User className="w-4 h-4 text-amber-600" />
              <span>1. Khuôn mặt & Đường nét (Face)</span>
            </div>
            <div className="text-stone-600 dark:text-stone-300 space-y-0.5">
              <div>Mắt: <strong>{cfg.face.eyeColor}</strong></div>
              <div>Làn da: <strong>{cfg.face.skinTone}</strong></div>
              <div>Phong cách: <strong>{cfg.face.style}</strong></div>
            </div>
          </div>

          {/* 2. Hair */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200">
              <Palette className="w-4 h-4 text-amber-600" />
              <span>2. Mái tóc (Hair)</span>
            </div>
            <div className="text-stone-600 dark:text-stone-300 space-y-0.5">
              <div>Màu sắc: <strong>{cfg.hair.color}</strong></div>
              <div>Kiểu tóc: <strong>{cfg.hair.style}</strong></div>
            </div>
          </div>

          {/* 3. Outfit */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200">
              <Shirt className="w-4 h-4 text-amber-600" />
              <span>3. Trang phục (Outfit)</span>
            </div>
            <div className="text-stone-600 dark:text-stone-300 space-y-0.5">
              <div>Trang phục: <strong>{cfg.outfit.top}</strong></div>
              <div>Phụ kiện: <strong>{cfg.outfit.accessory}</strong></div>
            </div>
          </div>

          {/* 4. Background & Studio */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>4. Không gian & Ánh sáng (Environment)</span>
            </div>
            <div className="text-stone-600 dark:text-stone-300 space-y-0.5">
              <div>Bối cảnh: <strong>{cfg.background.environment}</strong></div>
              <div>Tone màu: <strong>{cfg.background.ambientColor}</strong></div>
              <div>Chiếu sáng: <strong>{cfg.lighting}</strong></div>
            </div>
          </div>

          {/* 5. Expression & Camera */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 space-y-1 sm:col-span-2">
            <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200">
              <Smile className="w-4 h-4 text-amber-600" />
              <span>5. Biểu cảm & Góc máy (Expression & Camera Angle)</span>
            </div>
            <div className="text-stone-600 dark:text-stone-300 space-y-0.5">
              <div>Biểu cảm chủ đạo: <strong>{cfg.expression}</strong></div>
              <div>Góc máy: <strong>{cfg.cameraAngle}</strong></div>
              <div className="pt-1 text-[11px] text-stone-500 italic">
                Lina được thiết kế với triết lý không phán xét, không làm người học xấu hổ khi mắc lỗi, luôn đồng hành ấm áp và khích lệ người Việt tự tin nói tiếng Trung.
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-bold rounded-xl transition-colors min-h-[42px] cursor-pointer"
          >
            Đóng bảng hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};
