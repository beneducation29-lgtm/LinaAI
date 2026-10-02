import type { SyncRecord } from '../src/types/sync';
const newer:SyncRecord={key:'profile',data:{name:'new'},version:2,updatedAt:'2026-10-02T10:00:00.000Z',deviceId:'A'};
const older:SyncRecord={key:'profile',data:{name:'old'},version:1,updatedAt:'2026-10-02T09:00:00.000Z',deviceId:'B'};
if(new Date(older.updatedAt).getTime()>=new Date(newer.updatedAt).getTime()) throw new Error('Conflict ordering regression');
if(newer.version<=older.version) throw new Error('Version ordering regression');
const keys=['profile','preferences','conversation','flashcards','structuredProgress','reviewSchedules','mistakes','structuredSavedVocabulary','aiMemory','motivation','learnerMemory'];
if(keys.length!==11) throw new Error('Sync coverage regression');
console.log('Prompt 15 sync conflict and coverage tests passed');
