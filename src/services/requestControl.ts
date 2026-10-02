export interface RequestControlOptions{timeoutMs?:number;retries?:number;baseDelayMs?:number;signal?:AbortSignal;}
const sleep=(ms:number)=>new Promise<void>(resolve=>globalThis.setTimeout(resolve,ms));
export async function fetchWithControl(input:RequestInfo|URL,init:RequestInit={},options:RequestControlOptions={}):Promise<Response>{
 const timeoutMs=Math.max(1000,options.timeoutMs??12000),retries=Math.max(0,Math.min(2,options.retries??1)),baseDelayMs=Math.max(100,options.baseDelayMs??500);
 for(let attempt=0;attempt<=retries;attempt++){
  if(options.signal?.aborted)throw new DOMException('Request cancelled','AbortError');
  const controller=new AbortController();const timer=globalThis.setTimeout(()=>controller.abort(),timeoutMs);const abort=()=>controller.abort();options.signal?.addEventListener('abort',abort,{once:true});
  try{const response=await fetch(input,{...init,signal:controller.signal});if(response.ok||response.status<500||attempt===retries)return response;}
  catch(error){if((error as Error)?.name==='AbortError'&&options.signal?.aborted)throw error;if(attempt===retries)throw error;}
  finally{globalThis.clearTimeout(timer);options.signal?.removeEventListener('abort',abort);}
  await sleep(baseDelayMs*Math.pow(2,attempt)+Math.round(Math.random()*100));
 }
 throw new Error('Network request failed');
}
export function isOfflineError(error:unknown){return(typeof navigator!=='undefined'&&!navigator.onLine)||(error instanceof Error&&/network|failed to fetch|offline/i.test(error.message));}
