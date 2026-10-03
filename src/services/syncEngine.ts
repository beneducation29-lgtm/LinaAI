import { storage } from './storage';
import type { SyncEnvelope, SyncPullResponse, SyncRecord, SyncRecordKey, SyncState } from '../types/sync';

const DEVICE_KEY='lina_sync_device_v1';
const META_KEY='lina_sync_meta_v1';
const QUEUE_KEY='lina_sync_queue_v1';
const scopedKey=(base:string,userId:string|null)=>userId?base+':'+userId:base;
const now=()=>new Date().toISOString();
const getDeviceId=()=>{let id=storage.getItem(DEVICE_KEY);if(!id){id=`device_${crypto.randomUUID?.()||Date.now().toString(36)}`;storage.setItem(DEVICE_KEY,id);}return id;};

interface SyncMeta{lastSyncedAt:string|null;versions:Record<string,{version:number;updatedAt:string}>;}
export class SyncEngine{
 private state:SyncState={status:'offline',lastSyncedAt:null,pendingCount:0,error:null,userId:null};
 private listeners=new Set<(s:SyncState)=>void>();
 private timer:number|undefined;
 subscribe(fn:(s:SyncState)=>void){this.listeners.add(fn);fn(this.state);return()=>this.listeners.delete(fn);}
 private emit(){this.listeners.forEach(fn=>fn(this.state));}
 private loadMeta(userId=this.state.userId):SyncMeta{try{return JSON.parse(storage.getItem(scopedKey(META_KEY,userId))||'{}')||{lastSyncedAt:null,versions:{}};}catch{return{lastSyncedAt:null,versions:{}};}}
 private saveMeta(meta:SyncMeta,userId=this.state.userId){storage.setItem(scopedKey(META_KEY,userId),JSON.stringify(meta));}
 private loadQueue(userId=this.state.userId):SyncRecord[]{try{return JSON.parse(storage.getItem(scopedKey(QUEUE_KEY,userId))||'[]')||[];}catch{return[];}}
 private saveQueue(q:SyncRecord[],userId=this.state.userId){storage.setItem(scopedKey(QUEUE_KEY,userId),JSON.stringify(q));this.state={...this.state,pendingCount:q.length};this.emit();}
 setUser(userId:string|null){this.state={...this.state,userId,status:userId?'syncing':'offline'};this.emit();}
 enqueue(key:SyncRecordKey,data:unknown){if(!this.state.userId)return;const meta=this.loadMeta(this.state.userId);const previous=meta.versions[key];const record:SyncRecord={key,data,deviceId:getDeviceId(),version:(previous?.version||0)+1,updatedAt:now()};meta.versions[key]={version:record.version,updatedAt:record.updatedAt};this.saveMeta(meta,this.state.userId);const q=this.loadQueue(this.state.userId).filter(x=>x.key!==key);q.push(record);this.saveQueue(q,this.state.userId);this.schedule();}
 private schedule(){if(this.timer)window.clearTimeout(this.timer);this.timer=window.setTimeout(()=>void this.sync(),900);}
 async sync(){if(!this.state.userId||!navigator.onLine)return;this.state={...this.state,status:'syncing',error:null};this.emit();const userId=this.state.userId; const queue=this.loadQueue(userId);try{
   let pull=await fetch('/api/sync/pull',{credentials:'include'}); if(pull.status===401){await fetch('/api/auth/refresh',{method:'POST',credentials:'include'});pull=await fetch('/api/sync/pull',{credentials:'include'});} if(pull.status===401){this.state={...this.state,status:'failed',error:'Phiên đăng nhập đã hết hạn.'};this.emit();return;} if(!pull.ok)throw new Error('Không thể tải dữ liệu đồng bộ.');
   const remote:SyncPullResponse=await pull.json(); const meta=this.loadMeta(userId);
   const remoteByKey=new Map(remote.records.map(r=>[r.key,r]));
   const localQueue=new Map(queue.map(r=>[r.key,r]));
   const toPush:SyncRecord[]=[];
   for(const [key,remoteRecord] of remoteByKey){const local=localQueue.get(key);const localMeta=meta.versions[key];
     if(local && local.updatedAt>remoteRecord.updatedAt) toPush.push(local);
     else if(!local && (!localMeta||remoteRecord.updatedAt>localMeta.updatedAt)) this.applyRemote(remoteRecord);
     else if(local && remoteRecord.updatedAt>=local.updatedAt){localQueue.delete(key);this.applyRemote(remoteRecord);}
   }
   for(const r of localQueue.values())toPush.push(r);
   if(toPush.length){const push=await fetch('/api/sync/push',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({records:toPush} as SyncEnvelope)});if(!push.ok)throw new Error('Không thể ghi dữ liệu đồng bộ.');const pushResult=await push.json();if(Array.isArray(pushResult.conflicts)&&pushResult.conflicts.length){const pullAgain=await fetch('/api/sync/pull',{credentials:'include'});if(pullAgain.ok){const latest:SyncPullResponse=await pullAgain.json();for(const key of pushResult.conflicts){const remote=latest.records.find(x=>x.key===key);if(remote)this.applyRemote(remote);}}}}
   this.saveQueue([],userId);const syncedAt=remote.serverTime||now();meta.lastSyncedAt=syncedAt;this.saveMeta(meta,userId);this.state={...this.state,status:'synced',lastSyncedAt:syncedAt,pendingCount:0,error:null};this.emit();
 }catch(e){this.state={...this.state,status:'failed',error:e instanceof Error?e.message:'Sync failed'};this.emit();}}
 private applyRemote(record:SyncRecord){window.dispatchEvent(new CustomEvent('lina:sync-remote',{detail:record}));const meta=this.loadMeta(this.state.userId);meta.versions[record.key]={version:record.version,updatedAt:record.updatedAt};this.saveMeta(meta,this.state.userId);}
 async initialSync(){await this.sync();}
}
export const syncEngine=new SyncEngine();
