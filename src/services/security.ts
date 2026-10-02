export type DataClassification='PUBLIC'|'LEARNING'|'PERSONAL'|'PRIVATE'|'SECURITY-SENSITIVE';

export interface RateLimitResult { allowed:boolean; retryAfterSeconds:number; remaining:number; }

const buckets=new Map<string,{count:number;resetAt:number}>();
const WINDOW_MS=60_000;

export function rateLimit(key:string,limit:number,now=Date.now()):RateLimitResult{
  const current=buckets.get(key);
  if(!current||current.resetAt<=now){
    buckets.set(key,{count:1,resetAt:now+WINDOW_MS});
    return {allowed:true,retryAfterSeconds:60,remaining:Math.max(0,limit-1)};
  }
  if(current.count>=limit)return {allowed:false,retryAfterSeconds:Math.max(1,Math.ceil((current.resetAt-now)/1000)),remaining:0};
  current.count+=1;
  return {allowed:true,retryAfterSeconds:Math.max(1,Math.ceil((current.resetAt-now)/1000)),remaining:Math.max(0,limit-current.count)};
}

export function pruneRateLimits(now=Date.now()){for(const [key,bucket] of buckets){if(bucket.resetAt<=now)buckets.delete(key);}}

export const SECURITY_LIMITS={auth:8,passwordReset:5,ai:30,tts:30,avatar:20,generation:10,admin:30,upload:10} as const;

export function safeUserId(value:unknown){return typeof value==='string'&&/^[0-9a-f-]{20,80}$/i.test(value)?value:'';}
