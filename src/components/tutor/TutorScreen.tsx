import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TutorState, 
  ConversationMessage, 
  ProgressiveHints, 
  TutorMode,
  AvatarState 
} from '../../types';
import { TutorMessage } from './TutorMessage';
import { LayerToggles } from '../common/LayerToggles';
import { VoiceSettingsModal } from '../voice/VoiceSettingsModal';
import { ToneTrainingModal } from '../voice/ToneTrainingModal';
import { AvatarStage } from '../avatar/AvatarStage';
import { CharacterDesignModal } from '../avatar/CharacterDesignModal';
import { 
  aiTutor, 
  speechService, 
  MicrophoneState, 
  VoiceSettings,
  avatarService,
  createRoleplayEngine,
  ROLEPLAY_SCENARIOS,
  realtimeConversationController,
  realtimeSpeechOrchestrator
} from '../../services';
import { getQuickPinyin, getQuickVietnamese } from '../../utils/chinesePinyinMap';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Lightbulb, 
  Send, 
  Sparkles, 
  RotateCcw,
  MessageSquare,
  GraduationCap,
  FlaskConical,
  X,
  ChevronRight,
  BrainCircuit,
  Sliders,
  Music,
  Check,
  Edit2
} from 'lucide-react';
import linaAvatarImg from '../../assets/images/tutor_lina_avatar_1790861417833.jpg';
import { analytics } from '../../services/analytics';

export const TutorScreen: React.FC = () => {
  const { 
    user, 
    conversation, 
    addMessage, 
    updateUser, 
    tutorMode, 
    setTutorMode,
    learnerMemory,
    addLearnerMemory,
    clearConversation,
    aiMemory,
    learnerProfile,
    recordMotivationActivity
  } = useApp();

  // Microphone and Conversation States
  const [micState, setMicState] = useState<MicrophoneState>('IDLE');
  const [inputText, setInputText] = useState('');
  
  // Voice Settings State (persisted locally)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem('lina_voice_settings_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      speechLanguage: 'zh-CN',
      selectedVoiceURI: '',
      playbackSpeed: 1.0,
      autoPlayAiResponse: true,
      pushToTalk: true
    };
  });

  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showToneTraining, setShowToneTraining] = useState(false);
  const [showCharacterDesign, setShowCharacterDesign] = useState(false);

  // Progressive Hints State
  const [showHintsModal, setShowHintsModal] = useState(false);
  const [currentHintStep, setCurrentHintStep] = useState<number>(1);
  const [activeHints, setActiveHints] = useState<ProgressiveHints | null>(null);
  const [isLoadingHints, setIsLoadingHints] = useState<boolean>(false);

  // Test Scenarios Modal
  const [showScenariosModal, setShowScenariosModal] = useState(false);
  const [roleplayActive, setRoleplayActive] = useState(false);
  const [roleplayScenarioId, setRoleplayScenarioId] = useState('rp-new-person');
  const [roleplayImmersion, setRoleplayImmersion] = useState<'beginner'|'intermediate'|'advanced'>('beginner');
  const [showRoleplaySummary, setShowRoleplaySummary] = useState(false);

  // Live Speech Recognition & Preview State
  const [liveTranscript, setLiveTranscript] = useState('');
  const [recognizedReview, setRecognizedReview] = useState<{
    hanzi: string;
    pinyin: string;
    vietnamese: string;
  } | null>(null);
  const [isEditingRecognized, setIsEditingRecognized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentenceExplanation, setSentenceExplanation] = useState<Awaited<ReturnType<typeof aiTutor.explainSentence>> | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const holdTimeoutRef = useRef<any>(null);
  const roleplayEngine = useMemo(() => createRoleplayEngine(), []);

  // Save voice settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lina_voice_settings_v1', JSON.stringify(voiceSettings));
    } catch {
      // ignore
    }
  }, [voiceSettings]);

  // Scroll to bottom on conversation update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, micState]);

  useEffect(() => () => {
    realtimeConversationController.interrupt();
  }, []);

  // Handle progressive hints loading
  const handleOpenHints = async () => {
    setShowHintsModal(true);
    setCurrentHintStep(1);

    const lastAiMsg = [...conversation.messages].reverse().find(m => m.sender === 'ai');
    const contextSentence = lastAiMsg ? lastAiMsg.hanzi : '你好！很高兴认识你。';

    if (lastAiMsg?.progressiveHints) {
      setActiveHints(lastAiMsg.progressiveHints);
      return;
    }

    setIsLoadingHints(true);
    try {
      const hints = await aiTutor.getProgressiveHints(
        contextSentence,
        conversation.topicTitleVi,
        conversation.hskLevel
      );
      setActiveHints(hints);
    } finally {
      setIsLoadingHints(false);
    }
  };

  /**
   * Primary voice / text conversation sender
   */
  const handleSendMessage = async (textToSend: string, forceRoleplay = false) => {
    if (!textToSend.trim()) return;

    setErrorMessage(null);
    realtimeConversationController.interrupt();
    setInputText('');
    setLiveTranscript('');
    setRecognizedReview(null);
    setIsEditingRecognized(false);
    const useRoleplay = roleplayActive || forceRoleplay;
    analytics.track(useRoleplay ? 'roleplay_start' : 'speaking_start', { mode: tutorMode, ai: true });

    // 1. Add user message
    const userMsg: ConversationMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      hanzi: textToSend,
      pinyin: getQuickPinyin(textToSend),
      vietnamese: getQuickVietnamese(textToSend),
      timestamp: new Date().toISOString(),
      pronunciationScore: undefined
    };

    addMessage(userMsg);
    setMicState('PROCESSING');
    avatarService.setState('THINKING');

    // Study time is recorded by the motivation activity ledger.

    try {
      // 2. Query Centralized Gemini AI Tutor Service
      const relevantMemory = aiMemory.mistakes.filter(m => !m.resolved).sort((a,b) => b.frequency-a.frequency).slice(0,6).map(m => `${m.type}: ${m.original} → ${m.corrected}`);
      const memoryContext = [
        ...learnerMemory,
        `HSK: ${learnerProfile.hskLevel}`,
        `Điểm yếu: ${learnerProfile.weakAreas.slice(0,5).join(', ') || 'chưa xác định'}`,
        `Lỗi cần ưu tiên: ${relevantMemory.join(' | ') || 'chưa có'}`
      ];
      let structuredRes;
      if (useRoleplay) {
        structuredRes = await roleplayEngine.sendTurn(
          { conversationId: conversation.id, hskLevel: conversation.hskLevel, userLevel: user.currentLevel, userName: user.name, history: [...conversation.messages, userMsg] },
          textToSend
        );
      } else {
        structuredRes = await realtimeSpeechOrchestrator.startConversationTurn(
          { conversationId: conversation.id, topicTitleVi: conversation.topicTitleVi, hskLevel: conversation.hskLevel, userLevel: user.currentLevel, userName: user.name, history: [...conversation.messages, userMsg], mode: tutorMode, memoryFacts: memoryContext },
          textToSend,
          {
            onState: state => {
              if (state === 'THINKING') { setMicState('PROCESSING'); avatarService.setState('THINKING'); }
              else if (state === 'SPEAKING') { setMicState('AI_SPEAKING'); avatarService.setState('SPEAKING'); }
              else if (state === 'IDLE') { setMicState('IDLE'); avatarService.setState('IDLE'); }
              else { setMicState('ERROR'); avatarService.setState('ERROR'); }
            },
            onResponse: response => { avatarService.setEmotion(response.emotion); },
            onError: () => {}
          },
          voiceSettings.playbackSpeed,
          voiceSettings.autoPlayAiResponse
        );
      }

      if (structuredRes.correction?.hasMistake) {
        const c = structuredRes.correction;
        analytics.track('correction', { category: 'grammar', mode: tutorMode });
        // Persisted by AppContext through addLearnerMemory-compatible learning memory.
        addLearnerMemory(`Lỗi cần chú ý: ${c.originalSentence} → ${c.correctedSentence}`);
      }

      // Record memory update if returned
      if (structuredRes.memoryUpdate?.learnedFact) {
        addLearnerMemory(structuredRes.memoryUpdate.learnedFact);
      }

      // 3. Assemble AI Message
      const aiMsg: ConversationMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'ai',
        hanzi: structuredRes.chinese,
        pinyin: useRoleplay && roleplayImmersion === 'advanced' ? '' : structuredRes.pinyin,
        vietnamese: useRoleplay && roleplayImmersion !== 'beginner' ? '' : structuredRes.vietnamese,
        timestamp: new Date().toISOString(),
        emotion: structuredRes.emotion,
        correction: structuredRes.correction,
        vocabulary: structuredRes.vocabulary,
        grammar: structuredRes.grammar,
        progressiveHints: structuredRes.progressiveHints,
        suggestedReplies: structuredRes.suggestedReplies,
        responseType: structuredRes.responseType
      };

      addMessage(aiMsg);
      recordMotivationActivity({ id: `conversation:${aiMsg.id}`, type: useRoleplay ? 'speaking' : 'conversation', minutes: 1, metadata: { roleplay: useRoleplay } });
      analytics.track(useRoleplay ? 'roleplay_complete' : 'speaking_complete', { ai: true, minutes: 1, corrected: Boolean(structuredRes.correction?.hasMistake) });
      // Normal conversation audio is owned by RealtimeSpeechOrchestrator.
      // The orchestrator owns the speaking lifecycle and returns the avatar to IDLE after audio ends.

      // Roleplay keeps the established centralized speech lifecycle.
      if (useRoleplay && voiceSettings.autoPlayAiResponse) {
        setMicState('AI_SPEAKING');
        await realtimeConversationController.speakResponse(structuredRes, {
          onState: state => {
            if (state.audioState === 'playing' || state.audioState === 'buffering') {
              setMicState('AI_SPEAKING');
              avatarService.setState('SPEAKING');
            } else if (state.audioState === 'ended') {
              setMicState('IDLE');
              avatarService.setState('IDLE');
            }
          },
          onError: () => { setMicState('IDLE'); avatarService.setState('IDLE'); }
        }, voiceSettings.playbackSpeed);
      } else if (useRoleplay) {
        setMicState('IDLE');
        avatarService.setState('IDLE');
      }
    } catch {
      setMicState('ERROR');
      avatarService.setState('ERROR');
      setErrorMessage('Đang gặp sự cố kết nối. Bạn thử lại nhé.');
    }
  };

  /**
   * Start microphone listening
   */
  const startRecording = () => {
    if (micState === 'LISTENING') return;

    setErrorMessage(null);
    realtimeConversationController.interrupt();
    setLiveTranscript('');
    setRecognizedReview(null);
    setMicState('LISTENING');
    avatarService.setState('LISTENING');

    if (!speechService.isSttSupported()) {
      // Environment fallback for simulation
      setTimeout(() => {
        const sampleSpoken = '我喜欢喝咖啡';
        setLiveTranscript(sampleSpoken);
        setMicState('IDLE');
        avatarService.setState('THINKING');
        setRecognizedReview({
          hanzi: sampleSpoken,
          pinyin: getQuickPinyin(sampleSpoken),
          vietnamese: getQuickVietnamese(sampleSpoken)
        });
      }, 1600);
      return;
    }

    speechService.startListening({
      lang: voiceSettings.speechLanguage,
      onResult: (res) => {
        setLiveTranscript(res.transcript);
        if (res.isFinal && res.transcript) {
          setMicState('IDLE');
          avatarService.setState('THINKING');
          setRecognizedReview({
            hanzi: res.transcript,
            pinyin: getQuickPinyin(res.transcript),
            vietnamese: getQuickVietnamese(res.transcript)
          });
        }
      },
      onError: (friendlyMsg) => {
        setMicState('ERROR');
        avatarService.setState('ERROR');
        setErrorMessage(friendlyMsg);
      },
      onEnd: () => {
        setMicState((prev) => (prev === 'LISTENING' ? 'IDLE' : prev));
      }
    });
  };

  /**
   * Stop microphone listening
   */
  const stopRecording = () => {
    if (micState === 'LISTENING') {
      speechService.stopListening();
      setMicState('IDLE');
      avatarService.setState('THINKING');
      if (liveTranscript) {
        setRecognizedReview({
          hanzi: liveTranscript,
          pinyin: getQuickPinyin(liveTranscript),
          vietnamese: getQuickVietnamese(liveTranscript)
        });
      }
    }
  };

  const handleToggleMic = () => {
    if (micState === 'LISTENING') {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSpeakLastMessage = async (rate = voiceSettings.playbackSpeed) => {
    const lastAiMsg = [...conversation.messages].reverse().find(m => m.sender === 'ai');
    if (!lastAiMsg) return;

    setMicState('AI_SPEAKING');
    avatarService.setState('SPEAKING');
    await avatarService.speak(lastAiMsg.hanzi, {
      rate,
      useGeminiTTS: voiceSettings.useGeminiTTS,
      onEnd: () => {
        setMicState('IDLE');
        avatarService.setState('IDLE');
      },
      onError: () => {
        setMicState('IDLE');
        avatarService.setState('IDLE');
      }
    });
  };

  const handleRepeatLastMessage = () => handleSpeakLastMessage(voiceSettings.playbackSpeed);

  const handleExplainLastMessage = async () => {
    const lastAiMsg = [...conversation.messages].reverse().find(m => m.sender === 'ai');
    if (!lastAiMsg) return;
    setIsExplaining(true);
    try {
      const explanation = await aiTutor.explainSentence(lastAiMsg.hanzi, conversation.hskLevel);
      setSentenceExplanation(explanation);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleStartRoleplay = (scenarioId: string) => {
    const scenario = ROLEPLAY_SCENARIOS.find(s => s.id === scenarioId) || ROLEPLAY_SCENARIOS[0];
    roleplayEngine.start(scenario, roleplayImmersion);
    setRoleplayScenarioId(scenario.id);
    setRoleplayActive(true);
    setShowScenariosModal(false);
    clearConversation();
    handleSendMessage('我们开始吧。', true);
  };

  const handleChangeImmersion = (level: 'beginner'|'intermediate'|'advanced') => { setRoleplayImmersion(level); roleplayEngine.setImmersion(level); };
  const handleEndRoleplay = () => setShowRoleplaySummary(true);

  // State Visual Indicators
  const stateLabels: Record<MicrophoneState, { text: string; badgeColor: string }> = {
    IDLE: { text: 'Sẵn sàng luyện nói', badgeColor: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300' },
    LISTENING: { text: 'Đang nghe...', badgeColor: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 animate-pulse' },
    PROCESSING: { text: 'Đang hiểu...', badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-bounce' },
    AI_SPEAKING: { text: 'Lina đang nói...', badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
    ERROR: { text: 'Cần thử lại', badgeColor: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' },
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] md:h-screen max-w-6xl mx-auto w-full px-2 sm:px-4 py-2 gap-3 md:gap-4 overflow-hidden">
      {/* 1. DESKTOP DEDICATED AVATAR STUDIO (38-40% width, hidden on mobile) */}
      <div className="md:hidden h-[38vh] min-h-[270px] max-h-[410px] shrink-0 pb-1">
        <AvatarStage
          hskLevel={conversation.hskLevel}
          topicTitle={conversation.topicTitleVi}
          className="h-full w-full"
          onOpenCharacterDesign={() => setShowCharacterDesign(true)}
        />
      </div>

      <div className="hidden md:flex md:w-[42%] lg:w-[44%] h-full shrink-0">
        <AvatarStage
          hskLevel={conversation.hskLevel}
          topicTitle={conversation.topicTitleVi}
          className="h-full w-full"
          onOpenCharacterDesign={() => setShowCharacterDesign(true)}
        />
      </div>

      {/* 2. CHAT CONVERSATION & CONTROLS COLUMN (100% on mobile, 60-62% on desktop) */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* TOP BAR: Mode, Voice Settings, Tone Training, Layer Toggles */}
        <div className="flex flex-col gap-2 pb-2 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Mode Switch: Conversation vs Teacher */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
              <button
                type="button"
                onClick={() => setTutorMode('conversation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[36px] cursor-pointer ${
                  tutorMode === 'conversation'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Đàm thoại</span>
              </button>

              <button
                type="button"
                onClick={() => setTutorMode('teacher')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[36px] cursor-pointer ${
                  tutorMode === 'teacher'
                    ? 'bg-amber-600 text-white shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Giáo viên</span>
              </button>
            </div>

            {/* Quick Voice Tools */}
            <div className="flex items-center gap-1.5">
              {/* Tone Training */}
              <button
                type="button"
                onClick={() => setShowToneTraining(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/60 min-h-[36px] cursor-pointer hover:bg-amber-100"
                title="Luyện 4 thanh điệu tiếng Trung"
              >
                <Music className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Thanh điệu</span>
              </button>

              {/* Voice Settings */}
              <button
                type="button"
                onClick={() => setShowVoiceSettings(true)}
                className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                title="Cài đặt giọng đọc & tốc độ"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Test Scenarios */}
              <button
                type="button"
                onClick={() => setShowScenariosModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 min-h-[36px] cursor-pointer"
                title="Mở các kịch bản kiểm tra"
              >
                <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Kịch bản</span>
              </button>

              <LayerToggles compact />
            </div>
          </div>

          {/* Sub-header status message */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
            <span className="flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5 text-amber-600" />
              Tốc độ: <strong>{voiceSettings.playbackSpeed}x</strong> · Ngôn ngữ mic: <strong>{voiceSettings.speechLanguage}</strong>
            </span>

            <button
              type="button"
              onClick={clearConversation}
              className="hover:text-stone-800 dark:hover:text-stone-200 underline cursor-pointer"
            >
              Làm mới hội thoại
            </button>
          </div>
        </div>

        {roleplayActive && (
          <div className="px-2 py-2 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2"><div><div className="text-xs font-bold text-amber-900 dark:text-amber-200">🎭 Roleplay · {ROLEPLAY_SCENARIOS.find(s=>s.id===roleplayScenarioId)?.scenario}</div><div className="text-[10px] text-stone-500">Lina nhớ thông tin bạn vừa nói trong tình huống này.</div></div><button type="button" onClick={handleEndRoleplay} className="text-[10px] font-bold px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800">Tổng kết</button></div>
            <div className="flex flex-wrap gap-1.5">{([['beginner','Beginner · 中+拼音+Vi'],['intermediate','Intermediate · 中+拼音'],['advanced','Advanced · 中文']] as const).map(([id,label])=><button key={id} type="button" onClick={()=>handleChangeImmersion(id)} className={'px-2 py-1 rounded-lg text-[10px] font-bold border '+(roleplayImmersion===id?'bg-amber-600 text-white border-amber-600':'bg-white/70 dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300')}>{label}</button>)}</div>
          </div>
        )}

      {/* 3. CONVERSATION MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto px-1 py-2 space-y-3 min-h-0">
        {conversation.messages.length === 0 && (
          <div className="rounded-3xl border border-amber-200/70 bg-linear-to-br from-white via-amber-50/70 to-stone-50 p-5 shadow-sm dark:border-amber-900/50 dark:from-stone-900 dark:via-amber-950/20 dark:to-stone-900">
            <p className="font-cjk text-xl font-bold text-stone-900 dark:text-stone-100">你好，我是 Lina。</p>
            <p className="mt-1 text-sm font-semibold text-amber-800 dark:text-amber-300">Nǐ hǎo, wǒ shì Lina.</p>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Xin chào! Mình sẽ cùng bạn luyện tiếng Trung, từng câu một và không áp lực.</p>
            <button type="button" onClick={() => handleSendMessage('你好，我想练习中文。')} className="mt-4 inline-flex min-h-[42px] items-center justify-center rounded-xl bg-amber-700 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-amber-800 active:scale-95">
              Bắt đầu nói chuyện
            </button>
          </div>
        )}

        {conversation.messages.map((msg) => (
          <TutorMessage
            key={msg.id}
            message={msg}
            onSelectSuggestion={(sugText) => handleSendMessage(sugText)}
            onTryCorrection={(correctedText) => handleSendMessage(correctedText)}
          />
        ))}

        {micState === 'PROCESSING' && (
          <div className="flex items-center gap-2 p-3 max-w-xs rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
            <span className="text-xs text-stone-500 font-medium">Lina đang phân tích phản xạ...</span>
          </div>
        )}

        {/* Live speech feedback while speaking */}
        {micState === 'LISTENING' && (
          <div className="p-3.5 rounded-2xl bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-center animate-pulse space-y-1">
            <p className="text-xs font-semibold text-red-700 dark:text-red-300">
              🎙 Đang nghe bạn nói... (Nói to câu tiếng Trung của bạn)
            </p>
            {liveTranscript && (
              <p className="font-cjk text-base font-bold text-stone-900 dark:text-stone-100">
                "{liveTranscript}"
              </p>
            )}
          </div>
        )}

        {/* 5. RECOGNIZED SPEECH 3-LINE PREVIEW & EDIT CARD (Requirement 5) */}
        {recognizedReview && (
          <div className="p-4 rounded-3xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Vừa nhận diện giọng nói của bạn
              </span>
              <button
                type="button"
                onClick={() => setIsEditingRecognized(!isEditingRecognized)}
                className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEditingRecognized ? 'Xong sửa' : 'Chỉnh sửa'}</span>
              </button>
            </div>

            {/* Editable or 3-line format */}
            {isEditingRecognized ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={recognizedReview.hanzi}
                  onChange={(e) => {
                    const text = e.target.value;
                    setRecognizedReview({
                      hanzi: text,
                      pinyin: getQuickPinyin(text),
                      vietnamese: getQuickVietnamese(text)
                    });
                  }}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-700 font-cjk text-base font-bold"
                />
                <span className="text-[11px] text-stone-400">Bạn có thể sửa lại ký tự trước khi gửi</span>
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="font-cjk text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {recognizedReview.hanzi}
                </div>
                <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  {recognizedReview.pinyin}
                </div>
                <div className="text-xs text-stone-600 dark:text-stone-300 italic">
                  {recognizedReview.vietnamese}
                </div>
              </div>
            )}

            {/* Confirm / Cancel buttons */}
            <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/60 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSendMessage(recognizedReview.hanzi)}
                className="flex-1 py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
              >
                <Send className="w-4 h-4" />
                <span>Gửi câu này cho Lina</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRecognizedReview(null);
                  startRecording();
                }}
                className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 min-h-[42px] cursor-pointer"
              >
                Nói lại
              </button>
            </div>
          </div>
        )}

        {sentenceExplanation && (
          <div className="mb-2 rounded-2xl border border-blue-200 bg-blue-50/80 p-3 dark:border-blue-900/50 dark:bg-blue-950/20">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-blue-900 dark:text-blue-200">📖 Giải thích câu của Lina</div>
              <button type="button" onClick={() => setSentenceExplanation(null)} className="min-h-[32px] min-w-[32px] rounded-lg text-xs text-stone-500 hover:bg-white/60 dark:hover:bg-stone-900/50" aria-label="Đóng giải thích">✕</button>
            </div>
            <div className="mt-2 font-cjk text-base font-bold text-stone-900 dark:text-stone-100">{sentenceExplanation.sentence}</div>
            {sentenceExplanation.meaningVi && <div className="mt-1 text-xs text-stone-600 dark:text-stone-300">{sentenceExplanation.meaningVi}</div>}
            {sentenceExplanation.grammarBreakdown?.length > 0 && (
              <div className="mt-2 space-y-1">
                {sentenceExplanation.grammarBreakdown.slice(0, 4).map((item, index) => (
                  <div key={`${item.part}-${index}`} className="rounded-lg bg-white/70 px-2.5 py-2 text-[11px] dark:bg-stone-900/50">
                    <span className="font-cjk font-bold">{item.part}</span> · {item.role}
                  </div>
                ))}
              </div>
            )}
            {sentenceExplanation.culturalTipVi && <div className="mt-2 text-[11px] italic text-blue-800 dark:text-blue-300">{sentenceExplanation.culturalTipVi}</div>}
          </div>
        )}

        {errorMessage && (
          <div className="p-3 text-xs text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-center">
            {errorMessage}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. BOTTOM INTERACTION CONTROLS (Push-to-talk primary loop) */}
      <div className="shrink-0 pt-2 pb-1 border-t border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage(inputText);
              }
            }}
            placeholder="Gõ tiếng Trung (hoặc nhấn nút Mic bên dưới để nói)..."
            className="flex-1 min-h-[42px] px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-amber-600 dark:focus:border-amber-500 font-cjk placeholder:font-sans placeholder:text-stone-400"
          />

          <button
            type="button"
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim()}
            className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white transition-colors cursor-pointer"
            aria-label="Gửi câu"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Primary voice loop + real quick actions */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={handleToggleMic} className={`flex min-w-[104px] flex-1 flex-col items-center justify-center rounded-2xl py-2 px-2 min-h-[58px] text-center shadow-md transition-all cursor-pointer select-none active:scale-95 ${micState === 'LISTENING' ? 'bg-red-600 text-white animate-pulse shadow-red-500/30' : 'bg-amber-700 hover:bg-amber-800 text-white shadow-amber-700/25'}`} aria-label={micState === 'LISTENING' ? 'Dừng thu âm' : 'Bấm mic để nói tiếng Trung'}>
            {micState === 'LISTENING' ? <MicOff className="w-5 h-5 mb-0.5" /> : <Mic className="w-5 h-5 mb-0.5 stroke-[2.4]" />}
            <span className="text-xs font-bold">{micState === 'LISTENING' ? 'Đang nghe...' : '🎙 Nói'}</span>
          </button>
          <button type="button" onClick={handleOpenHints} className="flex min-w-[88px] flex-1 flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white py-2 px-2 min-h-[58px] text-center text-stone-700 shadow-2xs transition-all hover:border-amber-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200" aria-label="Mở gợi ý">
            <Lightbulb className="w-4 h-4 text-amber-600 mb-0.5" /><span className="text-xs font-semibold">💡 Gợi ý</span>
          </button>
          <button type="button" onClick={handleRepeatLastMessage} className="flex min-w-[88px] flex-1 flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white py-2 px-2 min-h-[58px] text-center text-stone-700 shadow-2xs transition-all hover:border-amber-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200" aria-label="Nghe lại câu vừa rồi">
            <Volume2 className="w-4 h-4 text-stone-600 dark:text-stone-300 mb-0.5" /><span className="text-xs font-semibold">🔊 Nghe lại</span>
          </button>
          <button type="button" onClick={() => handleSpeakLastMessage(0.75)} className="flex min-w-[88px] flex-1 flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white py-2 px-2 min-h-[58px] text-center text-stone-700 shadow-2xs transition-all hover:border-amber-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200" aria-label="Nghe chậm câu vừa rồi">
            <span className="text-base leading-none mb-0.5">🐢</span><span className="text-xs font-semibold">Nói chậm</span>
          </button>
          <button type="button" onClick={handleExplainLastMessage} disabled={isExplaining} className="flex min-w-[88px] flex-1 flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white py-2 px-2 min-h-[58px] text-center text-stone-700 shadow-2xs transition-all hover:border-amber-400 disabled:opacity-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200" aria-label="Giải thích câu vừa rồi">
            <GraduationCap className="w-4 h-4 text-amber-600 mb-0.5" /><span className="text-xs font-semibold">{isExplaining ? 'Đang giải thích…' : '📖 Giải thích'}</span>
          </button>
        </div>
      </div>
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        voiceSettings={voiceSettings}
        onUpdateVoiceSettings={(updated) => setVoiceSettings(prev => ({ ...prev, ...updated }))}
      />

      {/* Tone Training Modal */}
      <ToneTrainingModal
        isOpen={showToneTraining}
        onClose={() => setShowToneTraining(false)}
      />

      {/* Progressive Hints Modal */}
      {showHintsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  Gợi ý tiến bộ (Progressive Hints)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHintsModal(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
              Hệ thống gợi ý từng bước giúp bạn tự hình thành câu trả lời:
            </p>

            <div className="grid grid-cols-4 gap-1 mb-4">
              {[
                { step: 1, label: '1. Ý nghĩa' },
                { step: 2, label: '2. Từ khóa' },
                { step: 3, label: '3. Cấu trúc' },
                { step: 4, label: '4. Câu mẫu' }
              ].map(item => (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => setCurrentHintStep(item.step)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all min-h-[40px] cursor-pointer ${
                    currentHintStep === item.step
                      ? 'bg-amber-600 text-white shadow-xs'
                      : currentHintStep > item.step
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {isLoadingHints ? (
              <div className="p-8 text-center text-xs text-stone-400">
                Đang tạo gợi ý cá nhân hóa...
              </div>
            ) : activeHints ? (
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
                {currentHintStep === 1 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1">
                      Tầng 1: Gợi ý ý tứ / ngữ nghĩa (Semantic Hint)
                    </span>
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                      {activeHints.hint1_semantic}
                    </p>
                  </div>
                )}

                {currentHintStep === 2 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1">
                      Tầng 2: Từ khóa chính tiếng Trung (Keywords)
                    </span>
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {activeHints.hint2_keywords}
                    </p>
                  </div>
                )}

                {currentHintStep === 3 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1">
                      Tầng 3: Cấu trúc ngữ pháp áp dụng (Sentence Structure)
                    </span>
                    <p className="text-sm font-mono font-semibold text-amber-950 dark:text-amber-100">
                      {activeHints.hint3_structure}
                    </p>
                  </div>
                )}

                {currentHintStep === 4 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                      Tầng 4: Câu nói mẫu hoàn chỉnh (Complete Answer)
                    </span>
                    <p className="text-sm font-bold font-cjk text-stone-900 dark:text-stone-100">
                      {activeHints.hint4_fullAnswer}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowHintsModal(false);
                        const cleanHanzi = activeHints.hint4_fullAnswer.split('(')[0].trim();
                        handleSendMessage(cleanHanzi || activeHints.hint4_fullAnswer);
                      }}
                      className="mt-2 w-full py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold transition-colors min-h-[38px] cursor-pointer"
                    >
                      Dùng câu mẫu này để gửi
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              {currentHintStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentHintStep(prev => prev + 1)}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 min-h-[44px] cursor-pointer"
                >
                  <span>Chưa nghĩ ra? Xem gợi ý tầng tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowHintsModal(false)}
                  className="w-full py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold rounded-xl min-h-[44px] cursor-pointer"
                >
                  Đã hiểu, quay lại trò chuyện
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test Scenarios Modal */}
      {showScenariosModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  15 Kịch bản roleplay tương tác
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScenariosModal(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
              Chọn một kịch bản dưới đây để kiểm tra:
            </p>

            <div className="space-y-2">
              {ROLEPLAY_SCENARIOS.map((rp) => (
                <button key={rp.id} type="button" onClick={() => handleStartRoleplay(rp.id)} className="w-full text-left p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 hover:border-amber-400 space-y-1"><div className="flex items-center justify-between"><span className="text-xs font-bold">{rp.scenario}</span><span className="text-[10px] px-2 py-0.5 rounded-md bg-white/70 dark:bg-stone-800">{rp.difficulty}</span></div><div className="text-[11px] text-stone-500">{rp.context} · Vai Lina: {rp.aiRole}</div></button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showRoleplaySummary && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"><div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">{(() => { const s=roleplayEngine.summarize(conversation.messages); return <><div className="flex items-center justify-between"><div><h3 className="font-bold">Tổng kết roleplay</h3><p className="text-xs text-stone-500 mt-1">{s.summary}</p></div><button type="button" onClick={()=>setShowRoleplaySummary(false)} className="p-2 rounded-xl"><X className="w-4 h-4"/></button></div><SummaryList title="Từ vựng đã dùng/học" items={s.vocabularyLearned}/><SummaryList title="Ngữ pháp" items={s.grammarLearned}/><SummaryList title="Lỗi cần xem lại" items={s.mistakes}/><SummaryList title="Cụm câu hữu ích" items={s.usefulExpressions}/><SummaryList title="Phát âm" items={s.pronunciationIssues}/><SummaryList title="Gợi ý ôn tập" items={s.suggestedReview}/><div className="flex justify-end"><button type="button" onClick={()=>{setShowRoleplaySummary(false);setRoleplayActive(false);}} className="px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-bold">Kết thúc roleplay</button></div></>; })()}</div></div>
      )}

      {/* Character Design System Modal */}
      <CharacterDesignModal
        isOpen={showCharacterDesign}
        onClose={() => setShowCharacterDesign(false)}
      />
    </div>
  );
};
const SummaryList: React.FC<{title:string;items:string[]}> = ({title,items}) => <div className="space-y-1.5"><div className="text-xs font-bold">{title}</div>{items.length ? <ul className="space-y-1">{items.map((x,i)=><li key={i} className="text-[11px] text-stone-600 dark:text-stone-300 p-2 rounded-xl bg-stone-50 dark:bg-stone-800">{x}</li>)}</ul> : <div className="text-[11px] text-stone-400">Chưa có dữ liệu.</div>}</div>;

