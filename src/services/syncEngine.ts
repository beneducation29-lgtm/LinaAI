import { storage } from './storage';
import type { SyncEnvelope, SyncPullResponse, SyncRecord, SyncRecordKey, SyncState } from '../types/sync';
import { retainUnchangedUnsentRecords } from './syncQueue';

const DEVICE_KEY='lina_sync_device_v1';
const META_KEY='lina_sync_meta_v1';
const QUEUE_KEY='lina_sync_queue_v1';
export const scopedSyncStorageKey=(base:string,userId:string|null)=>userId?`${base}:${userId}`:base;
const now=()=>new Date().toISOString();
const getDeviceId=()=>{let id=storage.getItem(DEVICE_KEY);if(!id){id=`device_${crypto.randomUUID?.()||Date.now().toString(36)}`;storage.setItem(DEVICE_KEY,id);}return id;};

interface SyncMeta{lastSyncedAt:string|null;versions:Record<string,{version:number;updatedAt:string}>;}
export class SyncEngine{
 private state:SyncState={status:'offline',lastSyncedAt:null,pendingCount:0,error:null,userId:null};
 private listeners=new Set<(s:SyncState)=>void>();
 private timer:number|undefined;
 private syncing=false;
 subscribe(fn:(s:SyncState)=>void){this.listeners.add(fn);fn(this.state);return()=>this.listeners.delete(fn);}
 private emit(){this.listeners.forEach(fn=>fn(this.state));}
 private loadMeta(userId=this.state.userId):SyncMeta{try{const raw=JSON.parse(storage.getItem(scopedSyncStorageKey(META_KEY,userId))||'{}')||{};return{lastSyncedAt:typeof raw.lastSyncedAt==='string'?raw.lastSyncedAt:null,versions:raw.versions&&typeof raw.versions==='object'?raw.versions:{}};}catch{return{lastSyncedAt:null,versions:{}};}}
 private saveMeta(meta:SyncMeta,userId=this.state.userId){storage.setItem(scopedSyncStorageKey(META_KEY,userId),JSON.stringify(meta));}
 private loadQueue(userId=this.state.userId):SyncRecord[]{try{return JSON.parse(storage.getItem(scopedSyncStorageKey(QUEUE_KEY,userId))||'[]')||[];}catch{return[];}}
 private saveQueue(q:SyncRecord[],userId=this.state.userId){storage.setItem(scopedSyncStorageKey(QUEUE_KEY,userId),JSON.stringify(q));if(this.state.userId===userId){this.state={...this.state,pendingCount:q.length};this.emit();}}
 setUser(userId:string|null){this.state={...this.state,userId,status:userId?'syncing':'offline'};this.emit();}
 enqueue(key:SyncRecordKey,data:unknown){const userId=this.state.userId;if(!userId)return;const meta=this.loadMeta(userId);const previous=meta.versions[key];const record:SyncRecord={key,data,deviceId:getDeviceId(),version:(previous?.version||0)+1,updatedAt:now()};meta.versions[key]={version:record.version,updatedAt:record.updatedAt};this.saveMeta(meta,userId);const q=this.loadQueue(userId).filter(x=>x.key!==key);q.push(record);this.saveQueue(q,userId);this.schedule();}
 private schedule(){if(this.timer)window.clearTimeout(this.timer);this.timer=window.setTimeout(()=>void this.sync(),900);}
 async sync(){const userId=this.state.userId;if(!userId||!navigator.onLine||this.syncing)return;this.syncing=true;this.state={...this.state,status:'syncing',error:null};this.emit();const queue=this.loadQueue(userId);try{
   let pull=await fetch('/api/sync/pull',{credentials:'include'}); if(pull.status===401){await fetch('/api/auth/refresh',{method:'POST',credentials:'include'});if(this.state.userId!==userId)return;pull=await fetch('/api/sync/pull',{credentials:'include'});} if(this.state.userId!==userId)return; if(pull.status===401){this.state={...this.state,status:'failed',error:'Phiên đăng nhập đã hết hạn.'};this.emit();return;} if(!pull.ok)throw new Error('Không thể tải dữ liệu đồng bộ.');
   const remote:SyncPullResponse=await pull.json(); if(this.state.userId!==userId)return; const meta=this.loadMeta(userId);
   const remoteByKey=new Map(remote.records.map(r=>[r.key,r]));
   const localQueue=new Map(queue.map(r=>[r.key,r]));
   const toPush:SyncRecord[]=[];
   for(const [key,remoteRecord] of remoteByKey){const local=localQueue.get(key);const localMeta=meta.versions[key];
     if(local && local.updatedAt>remoteRecord.updatedAt) toPush.push(local);
     else if(!local && (!localMeta||remoteRecord.updatedAt>localMeta.updatedAt)) this.applyRemote(remoteRecord,userId);
     else if(local && remoteRecord.updatedAt>=local.updatedAt){localQueue.delete(key);this.applyRemote(remoteRecord,userId);}
   }
   for(const r of localQueue.values())toPush.push(r);
   if(toPush.length){const push=await fetch('/api/sync/push',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({records:toPush} as SyncEnvelope)});if(!push.ok)throw new Error('Không thể ghi dữ liệu đồng bộ.');const pushResult=await push.json();if(Array.isArray(pushResult.conflicts)&&pushResult.conflicts.length){const pullAgain=await fetch('/api/sync/pull',{credentials:'include'});if(pullAgain.ok){const latest:SyncPullResponse=await pullAgain.json();for(const key of pushResult.conflicts){const remote=latest.records.find(x=>x.key===key);if(remote)this.applyRemote(remote,userId);}}}}
   if(this.state.userId!==userId)return;
   const remaining=retainUnchangedUnsentRecords(this.loadQueue(userId),queue);this.saveQueue(remaining,userId);const syncedAt=remote.serverTime||now();meta.lastSyncedAt=syncedAt;this.saveMeta(meta,userId);this.state={...this.state,status:'synced',lastSyncedAt:syncedAt,pendingCount:remaining.length,error:null};this.emit();if(remaining.length)this.schedule();
 }catch(e){if(this.state.userId===userId){this.state={...this.state,status:'failed',error:e instanceof Error?e.message:'Sync failed'};this.emit();}}finally{this.syncing=false;if(this.state.userId&&this.loadQueue(this.state.userId).length)this.schedule();}
 private applyRemote(record:SyncRecord,userId=this.state.userId){if(!userId||this.state.userId!==userId)return;window.dispatchEvent(new CustomEvent('lina:sync-remote',{detail:record}));const meta=this.loadMeta(userId);meta.versions[record.key]={version:record.version,updatedAt:record.updatedAt};this.saveMeta(meta,userId);}
 async initialSync(){await this.sync();}
}
export const syncEngine=new SyncEngine();
