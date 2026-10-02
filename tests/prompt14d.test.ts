import { SpeechChunker } from '../src/services/speechChunker';
import { AudioBufferManager } from '../src/services/audioBufferManager';
import { FacialAnimationEngine } from '../src/services/facialAnimationEngine';

const chunks=new SpeechChunker().split('你好！很高兴认识你。今天我们学习中文。');
if(chunks.length!==3||chunks[0]!=='你好！'||chunks[1]!=='很高兴认识你。'||chunks[2]!=='今天我们学习中文。') throw new Error('Sentence chunking regression');
const buffered=new AudioBufferManager(2,1000);
const blob=new Blob([new Uint8Array(400)],{type:'audio/mpeg'});
buffered.put({id:'a',blob,mimeType:'audio/mpeg',createdAt:1,sizeBytes:400});
buffered.put({id:'b',blob,mimeType:'audio/mpeg',createdAt:2,sizeBytes:400});
buffered.put({id:'c',blob,mimeType:'audio/mpeg',createdAt:3,sizeBytes:400});
if(buffered.size()>2||buffered.bytes()>1000) throw new Error('Audio buffer limits failed');
const expression=new FacialAnimationEngine().expressionFor('encouraging');
if(expression.emotion!=='encouraging') throw new Error('Emotion validation failed');
console.log('Prompt 14d queue, buffer and fallback architecture tests passed');
