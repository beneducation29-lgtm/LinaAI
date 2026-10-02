import { streamingTTSProvider } from './streamingTTS';
import type { PreparedAudio } from './audioBufferManager';

export interface TTSQueueCallbacks { onStart?: (sentenceId?:string)=>void; onEnd?: (sentenceId?:string)=>void; onError?: (error:Error,sentenceId?:string)=>void; onPrefetch?: (sentenceId:string)=>void; }
interface QueueItem { sentenceId:string; text:string; rate:number; prepared?:PreparedAudio; }
export class TTSQueue {
  private pending:QueueItem[]=[]; private running=false; private cancelled=false; private callbacks:TTSQueueCallbacks={}; private sequence=0; private prefetchController:AbortController|null=null;
  private readonly maxPending=6;
  enqueue(chunks:string[],rate=1,callbacks:TTSQueueCallbacks={}):void { this.callbacks=callbacks; this.cancelled=false; for(const text of chunks){if(text&&this.pending.length<this.maxPending)this.pending.push({sentenceId:`sentence_${String(++this.sequence).padStart(3,'0')}`,text,rate});} void this.drain(); }
  clear():void { this.pending=[]; this.cancelled=true; this.prefetchController?.abort(); this.prefetchController=null; streamingTTSProvider.stop(); this.running=false; }
  reset():void { this.cancelled=false; }
  size():number{return this.pending.length;}
  isBusy():boolean{return this.running||this.pending.length>0||streamingTTSProvider.isSpeaking();}
  private async drain():Promise<void>{
    if(this.running||this.cancelled)return; this.running=true;
    try{
      while(this.pending.length&&!this.cancelled){
        const item=this.pending.shift()!;
        const next=this.pending[0];
        if(next&&streamingTTSProvider.supportsPrefetch&&streamingTTSProvider.prepare){
          this.prefetchController?.abort(); this.prefetchController=new AbortController();
          void streamingTTSProvider.prepare({text:next.text,lang:'zh-CN',rate:next.rate,signal:this.prefetchController.signal}).then(prepared=>{next.prepared=prepared;this.callbacks.onPrefetch?.(next.sentenceId);}).catch(()=>undefined);
        }
        try{
          const opts={text:item.text,lang:'zh-CN',rate:item.rate,onStart:()=>this.callbacks.onStart?.(item.sentenceId),onEnd:()=>this.callbacks.onEnd?.(item.sentenceId),onError:(e:Error)=>this.callbacks.onError?.(e,item.sentenceId)};
          if(item.prepared&&streamingTTSProvider.playPrepared) await streamingTTSProvider.playPrepared(item.prepared,opts);
          else await streamingTTSProvider.start(opts);
        }catch(error){this.callbacks.onError?.(error instanceof Error?error:new Error('TTS queue failed'),item.sentenceId);}
      }
    }finally{this.running=false;}
  }
}
export const ttsQueue=new TTSQueue();
