export interface StorageAdapter{getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void;clear():void;}
class BrowserStorageAdapter implements StorageAdapter{
 getItem(key:string){try{return typeof localStorage==='undefined'?null:localStorage.getItem(key);}catch{return null;}}
 setItem(key:string,value:string){try{if(typeof localStorage!=='undefined')localStorage.setItem(key,value);}catch{}}
 removeItem(key:string){try{if(typeof localStorage!=='undefined')localStorage.removeItem(key);}catch{}}
 clear(){try{if(typeof localStorage!=='undefined')localStorage.clear();}catch{}}
}
class MemoryStorageAdapter implements StorageAdapter{private values=new Map<string,string>();getItem(key:string){return this.values.get(key)??null;}setItem(key:string,value:string){this.values.set(key,value);}removeItem(key:string){this.values.delete(key);}clear(){this.values.clear();}}
export const storage:StorageAdapter=new BrowserStorageAdapter();export const createMemoryStorageAdapter=():StorageAdapter=>new MemoryStorageAdapter();
