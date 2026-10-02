import type { AvatarState } from '../types';

const ALLOWED: Record<AvatarState, AvatarState[]> = {
  IDLE: ['LISTENING', 'THINKING', 'SPEAKING', 'HAPPY', 'ENCOURAGING', 'CONFUSED', 'CORRECTING', 'ERROR'],
  LISTENING: ['THINKING', 'ERROR', 'IDLE'],
  THINKING: ['SPEAKING', 'CORRECTING', 'HAPPY', 'ERROR', 'IDLE'],
  SPEAKING: ['IDLE', 'HAPPY', 'ENCOURAGING', 'CONFUSED', 'CORRECTING', 'ERROR', 'LISTENING'],
  HAPPY: ['IDLE', 'LISTENING', 'THINKING', 'SPEAKING'],
  ENCOURAGING: ['IDLE', 'LISTENING', 'THINKING', 'SPEAKING'],
  CONFUSED: ['IDLE', 'LISTENING', 'THINKING', 'SPEAKING', 'ERROR'],
  CORRECTING: ['SPEAKING', 'IDLE', 'LISTENING', 'ERROR'],
  ERROR: ['IDLE', 'LISTENING', 'THINKING']
};

export class AvatarStateMachine {
  constructor(private state: AvatarState = 'IDLE') {}

  getState(): AvatarState { return this.state; }

  transition(next: AvatarState): boolean {
    if (next === this.state) return true;
    if (!ALLOWED[this.state].includes(next)) return false;
    this.state = next;
    return true;
  }

  force(next: AvatarState): void { this.state = next; }
}

export const avatarStateMachineTransitions = ALLOWED;
