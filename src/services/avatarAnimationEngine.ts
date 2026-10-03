import type { AvatarState, TutorEmotion } from '../types';
import type { FacialExpression } from '../types/realtimeSpeech';
import { eyeContactController } from './eyeContactController';

export interface AvatarMotionFrame { gazeX:number; gazeY:number; headTilt:number; headX:number; headY:number; smile:number; eyebrowLift:number; nod:number; breathing:number; blink:number; }
const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n));
const EMOTIONS:Record<string,FacialExpression>={
 neutral:{emotion:'neutral',smile:.12,eyeFocus:.72,eyebrowLift:.08,headTilt:0,nod:0},
 happy:{emotion:'happy',smile:.72,eyeFocus:.8,eyebrowLift:.14,headTilt:0,nod:.18},
 encouraging:{emotion:'encouraging',smile:.62,eyeFocus:.88,eyebrowLift:.12,headTilt:.02,nod:.5},
 curious:{emotion:'curious',smile:.2,eyeFocus:.95,eyebrowLift:.28,headTilt:.04,nod:.05},
 confused:{emotion:'confused',smile:.04,eyeFocus:.82,eyebrowLift:.32,headTilt:-.12,nod:0},
 correcting:{emotion:'correcting',smile:.08,eyeFocus:.92,eyebrowLift:.18,headTilt:0,nod:.08},
};
export class AvatarAnimationEngine {
 private state:AvatarState='IDLE'; private emotion:TutorEmotion='neutral'; private phase=Math.random()*Math.PI*2; private last=0;
 setState(state:AvatarState){this.state=state;}
 setEmotion(emotion:TutorEmotion|undefined){this.emotion=emotion||'neutral';}
 triggerBlink(now=Date.now()){void now;}
 reset(now=Date.now()){this.last=now;eyeContactController.reset(now);}
 frame(now=Date.now(),reducedMotion=false):AvatarMotionFrame{
  if(!this.last)this.reset(now);
  const dt=Math.min(.05,Math.max(.001,(now-this.last)/1000));this.last=now;this.phase+=dt*1.2;
  const mode=this.state as 'IDLE'|'LISTENING'|'THINKING'|'SPEAKING'|'ENCOURAGING';
  const eyes=eyeContactController.frame(now,mode,reducedMotion);
  const e=EMOTIONS[this.emotion]||EMOTIONS.neutral;const listening=this.state==='LISTENING',thinking=this.state==='THINKING',speaking=this.state==='SPEAKING';
  return{
   gazeX:eyes.gazeX,gazeY:eyes.gazeY,headTilt: e.headTilt + (listening ? 0.012 : 0) + (speaking && !reducedMotion ? 0.006 * Math.sin(this.phase) : 0),
   headX: reducedMotion ? 0 : (thinking ? 0.006 * Math.sin(this.phase * 0.55) : 0),headY: reducedMotion ? 0 : (listening ? 0.008 : 0) + (speaking ? 0.004 * Math.sin(this.phase * 0.8) : 0),
   smile: clamp(e.smile + (listening ? 0.03 : 0)),eyebrowLift: clamp(e.eyebrowLift + (thinking ? 0.04 : 0)),
   nod: clamp(e.nod * 0.12 * Math.max(0, Math.sin(this.phase * 0.9)) + (listening ? 0.12 : 0)),breathing: reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(this.phase * 0.75),blink:eyes.blink
  };
 }
}
export const avatarAnimationEngine=new AvatarAnimationEngine();
