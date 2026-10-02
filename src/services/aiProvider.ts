import { GoogleGenAI } from '@google/genai';
export interface AIModelConfig { model:string; temperature:number; maxOutputTokens:number; timeoutMs:number; }
export interface AIProviderResponse { text:string; raw:any; usageMetadata?:any; }
export interface AIProvider { generate(input:{contents:any;config:any}):Promise<AIProviderResponse>; }
export class GeminiProvider implements AIProvider { constructor(private readonly client:GoogleGenAI){} async generate(input:{contents:any;config:any}){ const response=await this.client.models.generateContent(input); return {text:response.text||'',raw:response,usageMetadata:(response as any).usageMetadata}; } }