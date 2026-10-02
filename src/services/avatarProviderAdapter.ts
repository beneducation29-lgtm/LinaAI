import type { AvatarState } from '../types';
import type { RealtimeEmotion, VisemeFrame } from '../types/realtimeSpeech';

export interface RealtimeAvatarProviderAdapter {
  readonly name:string;
  readonly isConfigured:boolean;
  initialize():Promise<boolean>;
  connect(target?:unknown):Promise<boolean>;
  setState(state:AvatarState):void;
  setEmotion(emotion:RealtimeEmotion):void;
  setViseme(frame:VisemeFrame):void;
  speak(text:string,options?:Record<string,unknown>):Promise<void>;
  interrupt():void;
  disconnect():Promise<void>;
  destroy():void;
}

/** Provider-neutral hook for a real WebRTC/avatar vendor. No vendor SDK is bundled until credentials are configured. */
export class ConfiguredRealtimeAvatarAdapter implements RealtimeAvatarProviderAdapter {
  readonly name='Configured real-time avatar adapter';
  readonly isConfigured=Boolean(typeof import.meta!=='undefined' && import.meta.env?.VITE_REALTIME_AVATAR_ENABLED==='true');
  private connected=false;
  async initialize():Promise<boolean>{return this.isConfigured;}
  async connect(_target?:unknown):Promise<boolean>{this.connected=this.isConfigured;return this.connected;}
  setState(_state:AvatarState):void{}
  setEmotion(_emotion:RealtimeEmotion):void{}
  setViseme(_frame:VisemeFrame):void{}
  async speak(_text:string,_options?:Record<string,unknown>):Promise<void>{if(!this.connected)throw new Error('Realtime avatar provider is not configured.');}
  interrupt():void{}
  async disconnect():Promise<void>{this.connected=false;}
  destroy():void{this.connected=false;}
}
export const realtimeAvatarProvider=new ConfiguredRealtimeAvatarAdapter();
