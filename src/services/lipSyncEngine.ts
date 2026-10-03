import type { AudioMetrics, VisemeFrame } from '../types/realtimeSpeech';
export interface LipSyncMouthFrame { viseme:VisemeFrame['viseme']; intensity:number; jaw:number; }
const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n));
export class LipSyncEngine {
 private lastFrame:VisemeFrame={timestamp:0,duration:0,viseme:'sil',intensity:0,source:'audio'};
 private smoothed=0;
 fromAudio(metrics:AudioMetrics):VisemeFrame{
  if(!metrics.isSpeaking||metrics.energy<0.04){this.smoothed=0;return this.setFrame('sil',0,'audio');}
  let viseme:VisemeFrame['viseme']='aa';
  if(metrics.highFrequency>metrics.lowFrequency*1.25)viseme='ee';
  else if(metrics.lowFrequency>metrics.highFrequency*1.2)viseme='oo';
  else if(metrics.midFrequency>metrics.lowFrequency*1.15)viseme='oh';
  const target=clamp(metrics.energy*1.35);this.smoothed+=(target-this.smoothed)*.32;
  return this.setFrame(viseme,this.smoothed,'audio');
 }
 fromTiming(viseme:VisemeFrame['viseme'],timestamp:number,duration:number,intensity=1):VisemeFrame{this.lastFrame={timestamp,duration,viseme,intensity:clamp(intensity),source:'timing'};this.smoothed=this.lastFrame.intensity;return this.lastFrame;}
 mouthFrame(metrics:AudioMetrics):LipSyncMouthFrame{const frame=this.fromAudio(metrics);return{viseme:frame.viseme,intensity:frame.intensity,jaw:clamp(frame.intensity*.72)};}
 silence():VisemeFrame{this.smoothed=0;return this.setFrame('sil',0,'audio');}
 reset(){this.smoothed=0;this.silence();}
 getLastFrame(){return this.lastFrame;}
 private setFrame(viseme:VisemeFrame['viseme'],intensity:number,source:VisemeFrame['source']):VisemeFrame{this.lastFrame={timestamp:Date.now(),duration:0,viseme,intensity:clamp(intensity),source};return this.lastFrame;}
}
export const lipSyncEngine=new LipSyncEngine();
