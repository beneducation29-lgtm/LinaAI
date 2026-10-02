import React, { useEffect, useMemo, useRef, useState } from 'react';
import { speechService, CHINESE_TONES } from '../../services/speech';
import { pronunciationEngine, PronunciationAnalysis } from '../../services/pronunciationEngine';
import { useApp } from '../../context/AppContext';
import { Volume2, Mic, MicOff, RotateCcw, CheckCircle2, X, Sparkles, Info, Play, Square, Headphones, Shuffle } from 'lucide-react';

interface ToneTrainingModalProps { isOpen: boolean; onClose: () => void; }
type PracticeMode = 'tone' | 'minimal-pair' | 'word' | 'sentence' | 'free-speaking';

const INITIALS=[
  ['b','p','m','f'],['d','t','n','l'],['g','k','h'],['j','q','x'],['zh','ch','sh','r'],['z','c','s']
];
const FINALS=[['a','o','e'],['ai','ei','ao','ou'],['an','en','ang','eng'],['ong'],['iao','ian','iang'],['uang','uai','ui','iu','in','un','ün']];
const MINIMAL_PAIRS=[
  {a:'zh',b:'z',exampleA:'知 zhī',exampleB:'资 zī',tip:'zh cong lưỡi hơn; z ngắn và phía trước hơn.'},
  {a:'ch',b:'c',exampleA:'吃 chī',exampleB:'次 cì',tip:'ch có âm bật hơi và cong lưỡi; c bật hơi phía trước.'},
  {a:'sh',b:'s',exampleA:'十 shí',exampleB:'四 sì',tip:'sh cong lưỡi; s để lưỡi gần răng hơn.'},
  {a:'j',b:'z',exampleA:'鸡 jī',exampleB:'资 zī',tip:'j mềm và đưa lưỡi lên gần vòm miệng; z ở phía trước.'}
];
const WORDS=[
  {hanzi:'你好',pinyin:'nǐ hǎo',meaning:'xin chào'},
  {hanzi:'谢谢',pinyin:'xièxie',meaning:'cảm ơn'},
  {hanzi:'老师',pinyin:'lǎoshī',meaning:'giáo viên'},
  {hanzi:'中国',pinyin:'Zhōngguó',meaning:'Trung Quốc'}
];
const SENTENCES=[
  {hanzi:'你好，我叫小林。',pinyin:'Nǐ hǎo, wǒ jiào Xiǎolín.',meaning:'Xin chào, tôi tên là Tiểu Lâm.'},
  {hanzi:'我是越南人。',pinyin:'Wǒ shì Yuènán rén.',meaning:'Tôi là người Việt Nam.'},
  {hanzi:'你叫什么名字？',pinyin:'Nǐ jiào shénme míngzi?',meaning:'Bạn tên là gì?'}
];

const friendlyFeedback=(analysis:PronunciationAnalysis)=>analysis.feedback;

export const ToneTrainingModal: React.FC<ToneTrainingModalProps> = ({isOpen,onClose}) => {
  const { aiMemory, learnerProfile, addMistake, recordLearningResult } = useApp();
  const [mode,setMode]=useState<PracticeMode>('tone');
  const weakTone=useMemo(()=>aiMemory.pronunciationWeaknesses.find(x=>/[12345]/.test(x))?.match(/[12345]/)?.[0]||'3',[aiMemory.pronunciationWeaknesses]);
  const [toneIndex,setToneIndex]=useState(()=>Math.max(0,CHINESE_TONES.findIndex(t=>String(t.toneNumber)===weakTone)));
  const [pairIndex,setPairIndex]=useState(()=>Math.max(0,MINIMAL_PAIRS.findIndex(p=>aiMemory.pronunciationWeaknesses.some(x=>x.includes(p.a+' / '+p.b)||x.includes(p.a+' / '+p.b)))));
  const [wordIndex,setWordIndex]=useState(0);
  const [sentenceIndex,setSentenceIndex]=useState(0);
  const [discrimination,setDiscrimination]=useState(()=>Math.floor(Math.random()*4));
  const [choice,setChoice]=useState<number|null>(null);
  const [isPlaying,setIsPlaying]=useState(false);
  const [isRecording,setIsRecording]=useState(false);
  const [transcript,setTranscript]=useState('');
  const [analysis,setAnalysis]=useState<PronunciationAnalysis|null>(null);
  const [friendlyError,setFriendlyError]=useState<string|null>(null);
  const [recordedUrl,setRecordedUrl]=useState<string|null>(null);
  const recorderRef=useRef<MediaRecorder|null>(null);
  const chunksRef=useRef<Blob[]>([]);

  useEffect(()=>()=>{if(recordedUrl) URL.revokeObjectURL(recordedUrl);},[recordedUrl]);
  if(!isOpen) return null;

  const activeTone=CHINESE_TONES[toneIndex];
  const activeWord=WORDS[wordIndex];
  const activeSentence=SENTENCES[sentenceIndex];
  const pair=MINIMAL_PAIRS[pairIndex];
  const pinyinTarget=mode==='word'?activeWord.pinyin:activeSentence.pinyin;

  const play=(text:string,rate:0.75|1=1)=>{
    setIsPlaying(true);
    speechService.speakChinese(text,{rate,onEnd:()=>setIsPlaying(false),onError:()=>setIsPlaying(false)});
  };

  const resetAttempt=()=>{setTranscript('');setAnalysis(null);setFriendlyError(null);setChoice(null);if(recordedUrl){URL.revokeObjectURL(recordedUrl);setRecordedUrl(null);}};

  const startRecording=async()=>{
    resetAttempt();
    if(!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder==='undefined'){
      setFriendlyError('Microphone/thu âm chưa được trình duyệt hỗ trợ. Voice/Text learning vẫn hoạt động bình thường.');
      return;
    }
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const recorder=new MediaRecorder(stream);
      recorderRef.current=recorder; chunksRef.current=[];
      recorder.ondataavailable=e=>{if(e.data.size) chunksRef.current.push(e.data);};
      recorder.onstop=async()=>{
        stream.getTracks().forEach(t=>t.stop());
        const blob=new Blob(chunksRef.current,{type:recorder.mimeType||'audio/webm'});
        const url=URL.createObjectURL(blob); setRecordedUrl(url);
        try{
          const stt=await speechService.transcribeAudio(blob);
          setTranscript(stt);
          const target=mode==='tone'?activeTone.hanzi:mode==='minimal-pair'?pair.exampleA.split(' ')[0]:mode==='word'?activeWord.hanzi:mode==='sentence'?activeSentence.hanzi:'';
          const result=await pronunciationEngine.analyzeSentence({targetText:target,recognizedText:stt,audio:blob});
          setAnalysis(result);
          if(result.status!=='analyzed' && stt){
            setFriendlyError('Chưa thể đánh giá chính xác cao độ/phát âm. Hiện chỉ xác nhận được phần nhận diện lời nói.');
          }
        }catch{setFriendlyError('Cần microphone/audio analysis provider để đánh giá chính xác.');}
      };
      recorder.start(); setIsRecording(true);
      if(speechService.isSttSupported()){
        speechService.startListening({lang:'zh-CN',onResult:r=>{if(r.isFinal)setTranscript(r.transcript);},onError:msg=>setFriendlyError(msg),onEnd:()=>{}});
      }
    }catch{setFriendlyError('Bạn chưa cấp quyền microphone. Bạn có thể tiếp tục luyện nghe và đọc mẫu.');}
  };

  const stopRecording=()=>{speechService.stopListening();if(recorderRef.current?.state!=='inactive')recorderRef.current?.stop();setIsRecording(false);};

  const answerTone=(index:number)=>{
    setChoice(index);
    if(index===discrimination){recordLearningResult('tone-discrimination-'+CHINESE_TONES[index].toneNumber,true,'good');}
    else{
      addMistake({type:'tone',original:'Tone discrimination '+(index+1),corrected:'Tone '+(discrimination+1),explanation:'Hãy nghe lại cao độ và đường đi của thanh điệu.',severity:'medium',relatedPronunciation:[CHINESE_TONES[discrimination].pinyin]});
      recordLearningResult('tone-discrimination-'+CHINESE_TONES[index].toneNumber,false,'again');
    }
  };

  const next=()=>{resetAttempt();setDiscrimination(Math.floor(Math.random()*4));if(mode==='tone')setToneIndex(i=>(i+1)%CHINESE_TONES.length);if(mode==='minimal-pair')setPairIndex(i=>(i+1)%MINIMAL_PAIRS.length);if(mode==='word')setWordIndex(i=>(i+1)%WORDS.length);if(mode==='sentence')setSentenceIndex(i=>(i+1)%SENTENCES.length);};

  return <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
    <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800"><div><div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-600"/><h2 className="font-bold text-stone-900 dark:text-stone-100">Chinese Pronunciation Coach</h2></div><p className="text-xs text-stone-500 mt-1">Pinyin · initials · finals · 4 thanh · thanh nhẹ · nghe và luyện nói</p></div><button type="button" onClick={onClose} className="p-2 rounded-xl text-stone-400 hover:text-stone-700 min-h-[40px] min-w-[40px]"><X className="w-4 h-4"/></button></div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">{([['tone','Tone'],['minimal-pair','Minimal Pair'],['word','Word'],['sentence','Sentence'],['free-speaking','Free Speaking']] as const).map(([id,label])=><button key={id} type="button" onClick={()=>{setMode(id);resetAttempt();}} className={`px-2 py-2 rounded-xl text-[11px] font-bold border ${mode===id?'bg-amber-600 text-white border-amber-600':'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'}`}>{label}</button>)}</div>

      {mode==='tone' && <>
        <div className="grid grid-cols-5 gap-1.5">{CHINESE_TONES.map((t,i)=><button key={t.toneNumber} type="button" onClick={()=>{setToneIndex(i);resetAttempt();}} className={`p-2 rounded-xl border text-center min-h-[54px] ${toneIndex===i?'bg-amber-600 text-white border-amber-600':'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700'}`}><span className="font-cjk font-bold">{t.pinyin}</span><span className="block text-[10px] opacity-70">{t.toneNumber===5?'Thanh nhẹ':'Thanh '+t.toneNumber}</span></button>)}</div>
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-stone-800 border border-amber-200/70 dark:border-stone-700 text-center space-y-4"><div className="font-cjk text-6xl font-bold">{activeTone.hanzi}</div><div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{activeTone.pinyin}</div><div className="text-xs text-stone-500">{activeTone.meaningVi}</div><div className="mx-auto max-w-[220px] h-16 bg-white/80 dark:bg-stone-900 rounded-xl border flex items-center justify-center"><svg viewBox="0 0 100 70" className="w-full h-full"><line x1="10" y1="35" x2="90" y2="35" className="stroke-stone-200 stroke-1"/><path d={activeTone.pitchContour} className="stroke-amber-600 fill-none stroke-[4]"/></svg></div><div className="flex flex-wrap justify-center gap-2"><button type="button" disabled={isPlaying} onClick={()=>play(activeTone.sampleAudioText)} className="px-4 py-2.5 rounded-xl border text-xs font-bold flex gap-1.5 items-center"><Volume2 className="w-4 h-4"/>Nghe 1x</button><button type="button" disabled={isPlaying} onClick={()=>play(activeTone.sampleAudioText,.75)} className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-700 text-xs font-bold">Nghe chậm 0.75x</button><button type="button" onClick={isRecording?stopRecording:startRecording} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex gap-1.5 items-center ${isRecording?'bg-red-600 text-white':'bg-amber-700 text-white'}`}>{isRecording?<MicOff className="w-4 h-4"/>:<Mic className="w-4 h-4"/>}{isRecording?'Dừng thu':'Thu âm'}</button><button type="button" onClick={resetAttempt} className="p-2.5 rounded-xl border"><RotateCcw className="w-4 h-4"/></button></div></div>
      </>}

      {mode==='minimal-pair' && <div className="p-5 rounded-3xl bg-stone-50 dark:bg-stone-800 border space-y-4"><div className="flex items-center justify-between"><div><div className="font-bold">Minimal Pair · {pair.a} / {pair.b}</div><p className="text-xs text-stone-500 mt-1">{pair.tip}</p></div><Shuffle className="w-5 h-5 text-amber-600"/></div><div className="grid sm:grid-cols-2 gap-3">{[pair.exampleA,pair.exampleB].map((x,i)=><button key={x} type="button" onClick={()=>play(x.split(' ')[0])} className="p-4 rounded-2xl bg-white dark:bg-stone-900 border text-left"><div className="text-lg font-cjk font-bold">{x}</div><div className="text-[11px] text-stone-500 mt-1">Nhấn để nghe · sau đó thu âm để luyện</div></button>)}</div><button type="button" onClick={isRecording?stopRecording:startRecording} className={`w-full py-3 rounded-xl text-sm font-bold ${isRecording?'bg-red-600 text-white':'bg-amber-700 text-white'}`}>{isRecording?'Dừng thu âm':'Thu âm minimal pair'}</button></div>}

      {mode==='word' && <PracticeCard title="Word pronunciation" hanzi={activeWord.hanzi} pinyin={activeWord.pinyin} meaning={activeWord.meaning} isRecording={isRecording} onPlay={()=>play(activeWord.hanzi)} onRecord={isRecording?stopRecording:startRecording} />}
      {mode==='sentence' && <PracticeCard title="Sentence pronunciation" hanzi={activeSentence.hanzi} pinyin={activeSentence.pinyin} meaning={activeSentence.meaning} isRecording={isRecording} onPlay={()=>play(activeSentence.hanzi)} onRecord={isRecording?stopRecording:startRecording} />}
      {mode==='free-speaking' && <div className="p-5 rounded-3xl bg-stone-50 dark:bg-stone-800 border space-y-4"><div className="flex items-center gap-2"><Headphones className="w-5 h-5 text-amber-600"/><div><div className="font-bold">Free Speaking</div><div className="text-xs text-stone-500">Nói tự do bằng tiếng Trung. STT có thể xác nhận nội dung; điểm phát âm chỉ xuất hiện khi có acoustic provider.</div></div></div><div className="p-4 rounded-2xl bg-white dark:bg-stone-900 font-cjk text-lg">Gợi ý: 介绍一下你自己。<div className="font-sans text-xs text-stone-500 mt-1">Jièshào yíxià nǐ zìjǐ. · Hãy giới thiệu bản thân.</div></div><button type="button" onClick={isRecording?stopRecording:startRecording} className={`w-full py-3 rounded-xl text-sm font-bold ${isRecording?'bg-red-600 text-white':'bg-amber-700 text-white'}`}>{isRecording?'Dừng thu âm':'Thu âm và nói'}</button></div>}

      {transcript && <div className="p-4 rounded-2xl border bg-white dark:bg-stone-900"><div className="text-xs font-bold text-stone-500">STT nhận diện</div><div className="mt-1 font-cjk text-base">{transcript}</div></div>}
      {analysis && <div className="p-4 rounded-2xl border bg-white dark:bg-stone-900 space-y-2"><div className="flex items-center gap-2 text-xs font-bold"><CheckCircle2 className="w-4 h-4 text-emerald-600"/>Phản hồi phát âm</div><div className="text-sm">{friendlyFeedback(analysis)}</div>{analysis.status!=='analyzed'&&<div className="text-xs text-amber-700 dark:text-amber-300 flex gap-1"><Info className="w-3.5 h-3.5"/>Chưa thể đánh giá chính xác bằng điểm số.</div>}</div>}
      {friendlyError && <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs text-amber-800 dark:text-amber-200">{friendlyError}</div>}

      {mode==='tone' && <div className="p-4 rounded-2xl border bg-white dark:bg-stone-900 space-y-3"><div className="flex items-center justify-between"><div><div className="font-bold text-sm">Tone Discrimination</div><div className="text-xs text-stone-500">Nghe mẫu → chọn thanh điệu</div></div><button type="button" onClick={()=>play('妈')} className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800"><Play className="w-4 h-4"/></button></div><div className="grid grid-cols-4 gap-2">{['mā','má','mǎ','mà'].map((p,i)=><button key={p} type="button" onClick={()=>answerTone(i)} className={`p-3 rounded-xl border text-sm font-cjk ${choice===i?(i===discrimination?'bg-emerald-100 border-emerald-300':'bg-rose-100 border-rose-300'):'bg-stone-50 dark:bg-stone-800'}`}>{String.fromCharCode(65+i)}. {p}</button>)}</div>{choice!==null&&<div className="text-xs font-semibold">{choice===discrimination?'Đúng. Bạn nhận diện đúng đường cao độ.':'Chưa đúng. Hãy nghe lại và chú ý đường đi của thanh.'}</div>}</div>}

      <div className="flex items-center justify-between gap-2"><div className="text-[11px] text-stone-400 flex items-center gap-1"><Info className="w-3 h-3"/>Lina không tự tạo điểm khi chưa có dữ liệu âm học đáng tin cậy.</div><button type="button" onClick={next} className="px-4 py-2.5 rounded-xl bg-amber-700 text-white text-xs font-bold">Bài tiếp theo</button></div>
    </div>
  </div>;
};

const PracticeCard: React.FC<{title:string;hanzi:string;pinyin:string;meaning:string;isRecording:boolean;onPlay:()=>void;onRecord:()=>void}> = ({title,hanzi,pinyin,meaning,isRecording,onPlay,onRecord}) => <div className="p-5 rounded-3xl bg-amber-50 dark:bg-stone-800 border border-amber-200/70 dark:border-stone-700 text-center space-y-4"><div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">{title}</div><div className="font-cjk text-5xl font-bold">{hanzi}</div><div className="text-xl font-bold text-amber-700 dark:text-amber-400">{pinyin}</div><div className="text-xs text-stone-500">{meaning}</div><div className="flex justify-center gap-2"><button type="button" onClick={onPlay} className="px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5"><Volume2 className="w-4 h-4"/>Nghe</button><button type="button" onClick={onRecord} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${isRecording?'bg-red-600 text-white':'bg-amber-700 text-white'}`}>{isRecording?<Square className="w-4 h-4"/>:<Mic className="w-4 h-4"/>}{isRecording?'Dừng':'Thu âm'}</button></div></div>;
