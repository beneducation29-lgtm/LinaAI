export interface AvatarDebugSnapshot { provider:string; state:string; turnId:string|null; sentenceId:string|null; ttsStatus:string; audioStatus:string; lipSyncStatus:string; audioEnergy:number; speechDetected:boolean; visemeAvailable:boolean; eyeContact:string; fps:number; queueLength:number; }
const enabled=typeof import.meta!=='undefined'&&Boolean(import.meta.env?.DEV);
let snapshot:AvatarDebugSnapshot={provider:'unknown',state:'IDLE',turnId:null,sentenceId:null,ttsStatus:'idle',audioStatus:'idle',lipSyncStatus:'inactive',audioEnergy:0,speechDetected:false,visemeAvailable:false,eyeContact:'direct',fps:0,queueLength:0};
export const avatarDebug={ enabled, update(p:Partial<AvatarDebugSnapshot>){if(enabled)snapshot={...snapshot,...p};}, get(){return snapshot;} };
