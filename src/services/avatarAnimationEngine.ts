import type { AvatarState, TutorEmotion } from '../types';
import type { FacialExpression } from '../types/realtimeSpeech';

export interface AvatarMotionFrame {
  gazeX:number; gazeY:number; headTilt:number; headX:number; headY:number;
  smile:number; eyebrowLift:number; nod:number; breathing:number; blink:number;
}

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
  private state:AvatarState='IDLE'; private emotion:TutorEmotion='neutral';
  private phase=Math.random()*Math.PI*2; private last=0;
  private nextGazeAt=0; private gazeX=0; private gazeY=0;
  private targetGazeX=0; private targetGazeY=0; private blinkUntil=0; private nextBlinkAt=0;
  setState(state:AvatarState){this.state=state;}
  setEmotion(emotion:TutorEmotion|undefined){this.emotion=emotion||'neutral';}
  triggerBlink(now=Date.now()){this.blinkUntil=now+145;this.nextBlinkAt=now+1900+Math.random()*4300;}
  reset(now=Date.now()){this.last=now;this.nextBlinkAt=now+1800+Math.random()*4200;this.nextGazeAt=now+900+Math.random()*1800;}
  frame(now=Date.now()):AvatarMotionFrame{
    if(!this.last)this.reset(now);
    const dt=Math.min(.05,Math.max(.001,(now-this.last)/1000)); this.last=now; this.phase+=dt*1.2;
    if(now>=this.nextBlinkAt)this.triggerBlink(now);
    if(now>=this.nextGazeAt){
      const spread=this.state==='THINKING'?.12:.07;
      this.targetGazeX=(Math.random()*2-1)*spread; this.targetGazeY=(Math.random()*2-1)*spread*.65;
      this.nextGazeAt=now+1200+Math.random()*2400;
    }
    const smoothing=1-Math.pow(.001,dt);
    this.gazeX+=(this.targetGazeX-this.gazeX)*smoothing; this.gazeY+=(this.targetGazeY-this.gazeY)*smoothing;
    const e=EMOTIONS[this.emotion]||EMOTIONS.neutral;
    const listening=this.state==='LISTENING',thinking=this.state==='THINKING',speaking=this.state==='SPEAKING';
    return {
      gazeX:this.gazeX*(thinking?1.35:1),gazeY:this.gazeY,
      headTilt:e.headTilt+(listening?.012:0)+(speaking?.006*Math.sin(this.phase):0),
      headX:thinking?.006*Math.sin(this.phase*.55):0,
      headY:(listening?.008:0)+(speaking?.004*Math.sin(this.phase*.8):0),
      smile:clamp(e.smile+(listening?.03:0)),
      eyebrowLift:clamp(e.eyebrowLift+(thinking?.04:0)),
      nod:clamp((e.nod*.12*Math.max(0,Math.sin(this.phase*.9)))+(listening?.12:0)),
      breathing:.5+.5*Math.sin(this.phase*.75),
      blink:now<this.blinkUntil?1:0,
    };
  }
}
export const avatarAnimationEngine=new AvatarAnimationEngine();
