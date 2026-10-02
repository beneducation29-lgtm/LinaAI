export type SyncStatus='synced'|'syncing'|'offline'|'failed';
export type SyncRecordKey='profile'|'preferences'|'conversation'|'flashcards'|'structuredProgress'|'reviewSchedules'|'mistakes'|'structuredSavedVocabulary'|'aiMemory'|'motivation'|'learnerMemory';
export interface SyncRecord<T=unknown>{key:SyncRecordKey;data:T;updatedAt:string;version:number;deviceId:string;}
export interface SyncEnvelope{records:SyncRecord[];lastSyncedAt?:string;}
export interface SyncPullResponse{records:SyncRecord[];serverTime:string;}
export interface SyncState{status:SyncStatus;lastSyncedAt:string|null;pendingCount:number;error:string|null;userId:string|null;}
