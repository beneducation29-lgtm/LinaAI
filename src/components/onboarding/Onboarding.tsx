import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LearningGoalOption, UserLevel, DailyTimeGoal } from '../../types';
import { Check, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import linaAvatarImg from '../../assets/images/tutor_lina_avatar_1790861417833.jpg';

export const Onboarding: React.FC = () => {
  const { completeOnboarding, setShowOnboarding } = useApp();
  const [step, setStep] = useState<number>(1);

  const [selectedGoal, setSelectedGoal] = useState<LearningGoalOption>('🗣 Giao tiếp');
  const [selectedLevel, setSelectedLevel] = useState<UserLevel>('Chưa biết gì');
  const [selectedMinutes, setSelectedMinutes] = useState<DailyTimeGoal>(10);

  const goalOptions: LearningGoalOption[] = [
    '✈️ Du lịch',
    '💼 Công việc',
    '🗣 Giao tiếp',
    '📚 HSK',
    '🎓 Học tập',
    '🎬 Văn hóa'
  ];

  const levelOptions: Array<{ level: UserLevel; desc: string }> = [
    { level: 'Chưa biết gì', desc: 'Bắt đầu từ bảng phiên âm Pinyin và các nét chữ Hán cơ bản.' },
    { level: 'Cơ bản', desc: 'Đã biết chào hỏi và khoảng 100 từ vựng căn bản.' },
    { level: 'Trung cấp', desc: 'Có thể giao tiếp các câu quen thuộc, muốn tăng phản xạ tự nhiên.' },
    { level: 'Nâng cao', desc: 'Muốn luyện phát âm chuẩn người bản xứ và từ vựng chuyên ngành.' },
  ];

  const timeOptions: Array<{ minutes: DailyTimeGoal; label: string; desc: string }> = [
    { minutes: 5, label: '5 phút / ngày', desc: 'Nhẹ nhàng và duy trì thói quen.' },
    { minutes: 10, label: '10 phút / ngày', desc: 'Lý tưởng nhất cho người bận rộn.' },
    { minutes: 15, label: '15 phút / ngày', desc: 'Tiến bộ nhanh chóng và vững chắc.' },
    { minutes: 20, label: '20 phút / ngày', desc: 'Tập trung chuyên sâu bứt phá phản xạ.' },
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeOnboarding(selectedGoal, selectedLevel, selectedMinutes);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setShowOnboarding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
        {/* Top Progress and Tutor Avatar Lockup */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 min-h-[36px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{step === 1 ? 'Đóng' : 'Quay lại'}</span>
            </button>

            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
              Bước {step} / 3
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-amber-300 shrink-0">
              <img
                src={linaAvatarImg}
                alt="Lina"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                Cô giáo Lina
              </span>
              <span className="text-[11px] text-stone-400">
                Hãy cho Lina biết kế hoạch học tập của bạn nhé!
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="my-6 space-y-4">
          {/* STEP 1: MỤC TIÊU */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">
                  Bạn học tiếng Trung để làm gì?
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Lina sẽ cá nhân hóa các tình huống đàm thoại và từ vựng phù hợp nhất với bạn.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {goalOptions.map((goal) => {
                  const isSelected = selectedGoal === goal;
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setSelectedGoal(goal)}
                      className={`p-3.5 rounded-2xl border text-left font-semibold text-sm transition-all cursor-pointer min-h-[52px] ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-100 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{goal}</span>
                        {isSelected && <Check className="w-4 h-4 text-amber-700 dark:text-amber-400 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: TRÌNH ĐỘ */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">
                  Bạn đang ở trình độ nào?
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Đừng lo lắng, chúng ta có thể điều chỉnh tốc độ nói và pinyin bất cứ lúc nào!
                </p>
              </div>

              <div className="space-y-2.5">
                {levelOptions.map((item) => {
                  const isSelected = selectedLevel === item.level;
                  return (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setSelectedLevel(item.level)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer min-h-[56px] ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {item.level}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-amber-700 dark:text-amber-400 stroke-[3]" />}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: THỜI GIAN HỌC */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">
                  Bạn muốn học bao lâu mỗi ngày?
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Học đều đặn mỗi ngày quan trọng hơn học dồn dập vào cuối tuần.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {timeOptions.map((item) => {
                  const isSelected = selectedMinutes === item.minutes;
                  return (
                    <button
                      key={item.minutes}
                      type="button"
                      onClick={() => setSelectedMinutes(item.minutes)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer min-h-[56px] ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {item.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-amber-700 dark:text-amber-400 stroke-[3]" />}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3.5 px-6 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-98"
          >
            <span>{step === 3 ? 'Bắt đầu học ngay cùng Lina' : 'Tiếp tục'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
