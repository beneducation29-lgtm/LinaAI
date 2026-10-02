import { streamingTTSProvider } from './streamingTTS';

export interface TTSQueueCallbacks { onStart?: (sentenceId?:string)=>void; onEnd?: (sentenceId?:string)=>void; onError?: (error:Error,sentenceId?:string)=>void; onPrefetch?: (sentenceId:string)=>void; }
interface QueueItem { sentenceId:string; text:string; rate:number; prepared?:import('./audioBufferManager').PreparedAudio; }
export class TTSQueue {
  private pending:QueueItem[]=[]; private running=false; private cancelled=false; private callbacks:TTSQueueCallbacks={}; private sequence=0;
  private prefetching=new Set<string>();
  private prefetchControllers=new Map<string,AbortController>();
  private readonly maxPending=6;
  private generation=0;

  enqueue(chunks:string[],rate=1,callbacks:TTSQueueCallbacks={}):void {
    const generation=++this.generation;
    this.callbacks=callbacks; this.cancelled=false;
    for(const text of chunks){
      if(text&&this.pending.length<this.maxPending)this.pending.push({sentenceId:`sentence_${String(++this.sequence).padStart(3,'0')}`,text,rate});
    }
    this.prefetchNext(generation);
    void this.drain(generation);
  }

  clear():void {
    this.generation+=1;
    this.pending=[]; this.cancelled=true;
    for(const controller of this.prefetchControllers.values()) controller.abort();
    this.prefetchControllers.clear(); this.prefetching.clear();
    streamingTTSProvider.stop(); this.running=false;
  }

  reset():void { this.cancelled=false; }
  size():number{return this.pending.length;}
  isBusy():boolean{return this.running||this.pending.length>0||streamingTTSProvider.isSpeaking();}

  private prefetchNext(generation=this.generation):void {
    if(this.cancelled||generation!==this.generation||!streamingTTSProvider.supportsPrefetch||!streamingTTSProvider.prepare)return;
    const next=this.pending[0];
    if(!next||next.prepared||this.prefetching.has(next.sentenceId))return;
    const controller=new AbortController();
    this.prefetching.add(next.sentenceId); this.prefetchControllers.set(next.sentenceId,controller);
    void streamingTTSProvider.prepare({text:next.text,lang:'zh-CN',rate:next.rate,signal:controller.signal})
      .then(prepared=>{
        if(this.cancelled||generation!==this.generation){return;}
        next.prepared=prepared; this.callbacks.onPrefetch?.(next.sentenceId);
      })
      .catch(()=>undefined)
      .finally(()=>{
        this.prefetching.delete(next.sentenceId); this.prefetchControllers.delete(next.sentenceId);
      });
  }

  private async drain(generation=this.generation):Promise<void>{
    if(this.running||this.cancelled||generation!==this.generation)return;
    this.running=true;
    try{
      while(this.pending.length&&!this.cancelled&&generation===this.generation){
        const item=this.pending.shift()!;
        try{
          const opts={text:item.text,lang:'zh-CN',rate:item.rate,onStart:()=>{if(generation===this.generation)this.callbacks.onStart?.(item.sentenceId);},onEnd:()=>{if(generation===this.generation)this.callbacks.onEnd?.(item.sentenceId);},onError:(e:Error)=>{if(generation===this.generation)this.callbacks.onError?.(e,item.sentenceId);}};
          if(item.prepared&&streamingTTSProvider.playPrepared) await streamingTTSProvider.playPrepared(item.prepared,opts);
          else await streamingTTSProvider.start(opts);
        }catch(error){
          this.callbacks.onError?.(error instanceof Error?error:new Error('TTS queue failed'),item.sentenceId);
        }
        this.prefetchNext(generation);
      }
    }finally{this.running=false;}
  }
}
export const ttsQueue=new TTSQueue();
