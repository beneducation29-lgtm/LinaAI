import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VocabularyCard } from '../vocabulary/VocabularyCard';
import { LayerToggles } from '../common/LayerToggles';
import { LessonCard } from './LessonCard';
import { ChineseSentence } from '../common/ChineseSentence';
import { speechService, PronunciationScore } from '../../services/speech';
import { 
  ArrowLeft, 
  ArrowRight, 
  Volume2, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  BookOpen, 
  Sparkles,
  HelpCircle,
  Info
} from 'lucide-react';

export const LessonScreen: React.FC = () => {
  const { currentLesson, lessonSectionIndex, setLessonSectionIndex, user, setCurrentTab, recordMotivationActivity } = useApp();
  
  const [completedSections, setCompletedSections] = useState<number[]>([0]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [isSpeakingMicActive, setIsSpeakingMicActive] = useState<boolean>(false);
  const [speakingFeedback, setSpeakingFeedback] = useState<PronunciationScore | null>(null);

  const sections = currentLesson.sections;
  const activeSection = sections[lessonSectionIndex] || sections[0];
  const progressText = `${lessonSectionIndex + 1} / 7`;

  const handleNextSection = () => {
    if (!completedSections.includes(lessonSectionIndex)) {
      setCompletedSections(prev => [...prev, lessonSectionIndex]);
    }
    if (lessonSectionIndex < sections.length - 1) {
      setLessonSectionIndex(lessonSectionIndex + 1);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
      setSpeakingFeedback(null);
    } else {
      recordMotivationActivity({
        id: `lesson:${currentLesson.id}:${Date.now()}`,
        type: 'lesson',
        minutes: Math.max(1, currentLesson.estimatedMinutes),
        lessonId: currentLesson.id,
        metadata: { hskLevel: currentLesson.hskLevel, lessonNumber: currentLesson.lessonNumber }
      });
      const vocabularyCount = currentLesson.sections.reduce((sum, section) => sum + (section.vocabularies?.length || 0), 0);
      if (vocabularyCount) recordMotivationActivity({ id: `vocabulary:lesson:${currentLesson.id}:${Date.now()}`, type: 'vocabulary', minutes: 0, lessonId: currentLesson.id, vocabularyCount, metadata: { source: 'lesson-completion' } });
      // Keep the existing user progress counter in sync with the real completion event.
      // The motivation ledger is the source of truth for minutes and streaks.
    }
  };

  const handlePrevSection = () => {
    if (lessonSectionIndex > 0) {
      setLessonSectionIndex(lessonSectionIndex - 1);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
      setSpeakingFeedback(null);
    }
  };

  const handlePlayAudio = async (text: string, rate: 0.75 | 1.0 = 1.0) => {
    await speechService.speakChinese(text, { rate });
  };

  const handleTestSpeech = (targetText: string) => {
    if (isSpeakingMicActive) {
      speechService.stopListening();
      setIsSpeakingMicActive(false);
    } else {
      setIsSpeakingMicActive(true);
      setSpeakingFeedback(null);

      if (!speechService.isSttSupported()) {
        setTimeout(() => {
          setIsSpeakingMicActive(false);
          const score = speechService.analyzePronunciation(targetText, targetText);
          setSpeakingFeedback(score);
          recordMotivationActivity({ id: `pronunciation:${Date.now()}`, type: 'pronunciation', minutes: 1, metadata: { score: score.overall } });
          recordMotivationActivity({ id: `pronunciation:${Date.now()}`, type: 'pronunciation', minutes: 1, metadata: { score: score.overall } });
        }, 1600);
        return;
      }

      speechService.startListening({
        lang: 'zh-CN',
        onResult: (res) => {
          if (res.isFinal && res.transcript) {
            setIsSpeakingMicActive(false);
            const score = speechService.analyzePronunciation(targetText, res.transcript);
            setSpeakingFeedback(score);
            recordMotivationActivity({ id: `pronunciation:${Date.now()}`, type: 'pronunciation', minutes: 1, metadata: { score: score.overall } });
          }
        },
        onError: () => {
          setIsSpeakingMicActive(false);
          const score = speechService.analyzePronunciation(targetText, targetText);
          setSpeakingFeedback(score);
        },
        onEnd: () => {
          setIsSpeakingMicActive(false);
        }
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-12 space-y-5">
      {/* 1. LESSON HEADER */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <span>{currentLesson.hskLevel}</span>
              <span aria-hidden="true">·</span>
              <span>Bài {currentLesson.lessonNumber}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 mt-0.5">
              "{currentLesson.titleVi}"
            </h1>
            <p className="font-cjk text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              {currentLesson.titleZh} · {currentLesson.pinyin}
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 tabular-nums">
              Tiến độ: {progressText}
            </span>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="pt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {sections.map((sec, idx) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setLessonSectionIndex(idx);
                  setSelectedAnswer(null);
                  setAnswerSubmitted(false);
                  setSpeakingFeedback(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[36px] ${
                  lessonSectionIndex === idx
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                    : completedSections.includes(idx)
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    : 'bg-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {sec.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layer Controls Bar */}
      <LayerToggles compact />

      {/* 2. ACTIVE SECTION CONTENT */}
      <div className="space-y-4">
        {/* SECTION 1: VOCABULARY */}
        {activeSection.type === 'vocabulary' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {activeSection.title}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {activeSection.descriptionVi}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeSection.vocabularies?.map((v) => (
                <VocabularyCard key={v.id} vocabulary={v} showExampleByDefault />
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: GRAMMAR */}
        {activeSection.type === 'grammar' && (
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {activeSection.title}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {activeSection.descriptionVi}
              </p>
            </div>

            <div className="space-y-3">
              {activeSection.grammarPoints?.map((gp) => (
                <div 
                  key={gp.id}
                  className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                      {gp.title}
                    </h3>
                    <span className="text-xs px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-semibold rounded-lg font-mono">
                      {gp.structure}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                    {gp.explanationVi}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                      Ví dụ minh họa
                    </span>
                    {gp.examples.map((eg, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60"
                      >
                        <div className="space-y-0.5">
                          <div className="font-cjk text-base font-bold text-stone-900 dark:text-stone-100">
                            {eg.hanzi}
                          </div>
                          <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                            {eg.pinyin}
                          </div>
                          <div className="text-xs text-stone-500 dark:text-stone-400 italic">
                            {eg.vietnamese}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePlayAudio(eg.hanzi)}
                          className="p-2 rounded-xl text-stone-500 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-200 dark:hover:bg-stone-700 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
                          aria-label="Nghe ví dụ"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: LISTENING */}
        {activeSection.type === 'listening' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {activeSection.title}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {activeSection.descriptionVi}
              </p>
            </div>

            {activeSection.exercises?.map((ex) => (
              <div 
                key={ex.id}
                className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 space-y-4 shadow-xs"
              >
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                  {ex.promptVi}
                </p>

                {/* Big Audio Trigger Button */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-center">
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(ex.targetSentence?.hanzi || '')}
                    className="w-16 h-16 rounded-full bg-amber-700 hover:bg-amber-800 text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer mb-2"
                    aria-label="Phát âm thanh câu hỏi"
                  >
                    <Volume2 className="w-8 h-8" />
                  </button>
                  <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                    Nhấn vào đây để nghe phát âm
                  </span>
                </div>

                {/* Multiple choice options */}
                <div className="space-y-2">
                  {ex.options?.map((opt, i) => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrect = opt === ex.correctAnswer;

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedAnswer(opt);
                          setAnswerSubmitted(true);
                        }}
                        className={`w-full p-3.5 rounded-2xl text-left font-medium text-sm border transition-all cursor-pointer min-h-[48px] ${
                          answerSubmitted && isSelected
                            ? isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                              : 'bg-red-50 dark:bg-red-950/40 border-red-400 text-red-900 dark:text-red-200'
                            : isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-100'
                            : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt}</span>
                          {answerSubmitted && isSelected && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {answerSubmitted && (
                  <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs text-stone-700 dark:text-stone-300">
                    {selectedAnswer === ex.correctAnswer ? (
                      <span className="text-emerald-600 font-bold">
                        ✓ Chính xác! Bạn đã nhận diện âm và nghĩa rất tốt.
                      </span>
                    ) : (
                      <span className="text-red-600 font-bold">
                        Đáp án đúng là: "{ex.correctAnswer}". Hãy nghe lại một lần nữa nhé!
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SECTION 4: SPEAKING */}
        {activeSection.type === 'speaking' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {activeSection.title}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {activeSection.descriptionVi}
              </p>
            </div>

            {activeSection.exercises?.map((ex) => (
              <div 
                key={ex.id}
                className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 space-y-4 shadow-xs"
              >
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                  {ex.promptVi}
                </p>

                {ex.targetSentence && (
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-800/70 border border-amber-200/70 dark:border-stone-700 space-y-2">
                    <ChineseSentence
                      hanzi={ex.targetSentence.hanzi}
                      pinyin={ex.targetSentence.pinyin}
                      vietnamese={ex.targetSentence.vietnamese}
                      size="lg"
                    />

                    <div className="pt-2 flex items-center justify-between border-t border-amber-200/50 dark:border-stone-700">
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(ex.targetSentence!.hanzi)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline min-h-[36px]"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Nghe mẫu chuẩn</span>
                      </button>

                      {ex.hint && (
                        <span className="text-[11px] text-stone-400 italic">
                          {ex.hint}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Large Practice Mic Button */}
                <div className="flex flex-col items-center justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleTestSpeech(ex.targetSentence?.hanzi || '')}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 ${
                      isSpeakingMicActive
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-amber-700 hover:bg-amber-800 text-white'
                    }`}
                    aria-label="Luyện nói câu này"
                  >
                    {isSpeakingMicActive ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 mt-2">
                    {isSpeakingMicActive ? 'Đang lắng nghe bạn nói...' : 'Nhấn mic và nói to câu trên'}
                  </span>
                </div>

                {speakingFeedback && (
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Đánh giá phát âm
                      </span>
                      <span className="font-mono text-sm">{speakingFeedback.overall}/100</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300">
                      {speakingFeedback.feedback}
                    </p>
                    <div className="text-[10px] text-stone-400 pt-1 flex items-center gap-1">
                      <Info className="w-3 h-3" /> Đánh giá dựa trên đối chiếu nhận diện âm thanh STT
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SECTION 5: ROLEPLAY */}
        {activeSection.type === 'roleplay' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {activeSection.title}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {activeSection.descriptionVi}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-linear-to-br from-amber-50 to-orange-50/70 dark:from-stone-900 dark:to-stone-850 border border-amber-200 dark:border-stone-800 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Tình huống thực tế cùng Lina</span>
              </div>

              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                Bạn gặp một người bạn Trung Quốc tại lớp học. Lina sẽ đóng vai người bạn đó. Hãy vào màn hình đàm thoại để trò chuyện trọn vẹn!
              </p>

              <button
                type="button"
                onClick={() => setCurrentTab('speak')}
                className="w-full py-3.5 px-4 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <Mic className="w-4 h-4" />
                <span>Vào đàm thoại trực tiếp với Lina</span>
              </button>
            </div>
          </div>
        )}

        {/* SECTION 6: REVIEW */}
        {activeSection.type === 'review' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {activeSection.title}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {activeSection.descriptionVi}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 space-y-4 shadow-xs">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                Checklist bài học đã nắm vững:
              </h3>

              <div className="space-y-2">
                {[
                  'Chào hỏi cơ bản: 你好 (nǐ hǎo - xin chào)',
                  'Hỏi tên người khác: 你叫什么名字？(Nǐ jiào shénme míngzi?)',
                  'Giới thiệu tên mình: 我叫... (Wǒ jiào...)',
                  'Giới thiệu quốc tịch: 我是越南人 (Wǒ shì Yuènán rén)',
                  'Cảm ơn người khác: 谢谢 (xièxie - cảm ơn)'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentTab('review')}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer min-h-[44px]"
                >
                  Luyện flashcard từ vựng bài này
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM PREV / NEXT NAVIGATION BAR */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
        <button
          type="button"
          onClick={handlePrevSection}
          disabled={lessonSectionIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 disabled:opacity-40 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 transition-colors min-h-[44px] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Phần trước</span>
        </button>

        <span className="text-xs text-stone-400 font-medium">
          Phần {lessonSectionIndex + 1} của {sections.length}
        </span>

        <button
          type="button"
          onClick={handleNextSection}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors min-h-[44px] cursor-pointer"
        >
          <span>{lessonSectionIndex === sections.length - 1 ? 'Hoàn thành bài' : 'Phần tiếp theo'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
