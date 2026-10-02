interface CacheEnvelope<T>{savedAt:number;data:T}
const PREFIX='lina_cache_v1:';
const memory=new Map<string,CacheEnvelope<unknown>>();

export function readCache<T>(key:string,maxAgeMs=86400000):T|null{
  const full=PREFIX+key;
  const item=memory.get(full) as CacheEnvelope<T>|undefined;
  if(item && Date.now()-item.savedAt<=maxAgeMs) return item.data;
  try{
    const raw=localStorage.getItem(full); if(!raw)return null;
    const parsed=JSON.parse(raw) as CacheEnvelope<T>;
    if(Date.now()-parsed.savedAt>maxAgeMs){localStorage.removeItem(full);return null;}
    memory.set(full,parsed as CacheEnvelope<unknown>); return parsed.data;
  }catch{return null;}
}
export function writeCache<T>(key:string,data:T){
  const envelope={savedAt:Date.now(),data};
  memory.set(PREFIX+key,envelope);
  try{localStorage.setItem(PREFIX+key,JSON.stringify(envelope));}catch{/* cache is optional */}
}
export function removeCache(key:string){memory.delete(PREFIX+key);try{localStorage.removeItem(PREFIX+key);}catch{}}
export function isOnline(){return typeof navigator==='undefined'||navigator.onLine;}
