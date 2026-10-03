import { LipSyncEngine } from '../src/services/lipSyncEngine';
import { FacialAnimationEngine } from '../src/services/facialAnimationEngine';
import { AudioStreamController } from '../src/services/audioStreamController';

const lip = new LipSyncEngine();
const facial = new FacialAnimationEngine();

const loud = lip.fromAudio({
  volume: 0.7, energy: 0.65, isSpeaking: true, lowFrequency: 0.2, midFrequency: 0.4, highFrequency: 0.3, timestamp: Date.now()
});
if (loud.intensity <= 0 || loud.source !== 'audio' || loud.viseme === 'sil') throw new Error('Audio-driven lip sync failed');

const silent = lip.fromAudio({
  volume: 0, energy: 0, isSpeaking: false, lowFrequency: 0, midFrequency: 0, highFrequency: 0, timestamp: Date.now()
});
if (silent.viseme !== 'sil' || silent.intensity !== 0) throw new Error('Silence handling failed');

const encouraging = facial.expressionFor('encouraging');
if (encouraging.smile <= 0.5 || encouraging.nod <= 0) throw new Error('Encouraging expression mapping failed');

const correcting = facial.expressionFor('correcting');
if (correcting.emotion !== 'correcting') throw new Error('Emotion enum validation failed');

const controller = new AudioStreamController();
controller.stop();
controller.destroy();

console.log('Prompt 14b tests passed');

import { AvatarStateMachine } from '../src/services/avatarStateMachine';
const machine = new AvatarStateMachine();
if (!machine.transition('LISTENING') || !machine.transition('THINKING') || !machine.transition('SPEAKING')) throw new Error('Avatar lifecycle transition failed');
if (machine.transition('IDLE') !== true || machine.getState() !== 'IDLE') throw new Error('Avatar completion transition failed');

import { SpeechChunker } from '../src/services/speechChunker';
const chunks = new SpeechChunker().split('你好！很高兴认识你。今天想学习什么？');
if (chunks.length !== 3 || chunks[0] !== '你好！' || chunks[1] !== '很高兴认识你。') throw new Error('Chinese sentence chunking failed');

const state = new AvatarStateMachine();
if (!state.transition('LISTENING') || !state.transition('THINKING') || !state.transition('SPEAKING')) throw new Error('Realtime lifecycle failed');
state.force('SPEAKING');
if (!state.transition('LISTENING')) throw new Error('Barge-in transition failed');

console.log('Prompt 14c streaming architecture tests passed');
