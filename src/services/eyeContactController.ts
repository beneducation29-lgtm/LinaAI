export type EyeContactMode='IDLE'|'LISTENING'|'THINKING'|'SPEAKING'|'ENCOURAGING';
export interface EyeContactFrame { gazeX:number; gazeY:number; blink:number; focus:number; }
const clamp=(n:number,min=-1,max=1)=>Math.max(min,Math.min(max,n));
export class EyeContactController {
 private nextBlinkAt=0; private blinkUntil=0; private nextGazeAt=0; private gazeX=0; private gazeY=0; private targetX=0; private targetY=0;
 reset(now=Date.now()){this.nextBlinkAt=now+1800+Math.random()*4200;this.nextGazeAt=now+900+Math.random()*1800;this.blinkUntil=0;this.gazeX=0;this.gazeY=0;this.targetX=0;this.targetY=0;}
 frame(now=Date.now(),mode:EyeContactMode='IDLE',reducedMotion=false):EyeContactFrame{
  if(!this.nextBlinkAt)this.reset(now);
  if(!reducedMotion&&now>=this.nextBlinkAt){this.blinkUntil=now+105;this.nextBlinkAt=now+2200+Math.random()*4300;}
  if(!reducedMotion&&now>=this.nextGazeAt){const spread = mode === 'THINKING' ? 0.11 : mode === 'LISTENING' ? 0.045 : 0.055;this.targetX=(Math.random()*2-1)*spread;this.targetY=(Math.random()*2-1)*spread*0.55;this.nextGazeAt=now+1300+Math.random()*2600;}
  if(mode!=='THINKING'){this.targetX*=.97;this.targetY*=.97;}
  const smoothing=reducedMotion ? 0.18 : 0.08;this.gazeX+=(this.targetX-this.gazeX)*smoothing;this.gazeY+=(this.targetY-this.gazeY)*smoothing;
  return{gazeX:clamp(this.gazeX),gazeY:clamp(this.gazeY),blink:now<this.blinkUntil?1:0,focus:mode==='LISTENING'||mode==='SPEAKING'?1:.86};
 }
}
export const eyeContactController=new EyeContactController();
