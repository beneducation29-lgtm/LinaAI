import type { FacialExpression, RealtimeEmotion } from '../types/realtimeSpeech';

const EXPRESSIONS: Record<RealtimeEmotion, FacialExpression> = {
  neutral: { emotion: 'neutral', smile: 0.12, eyeFocus: 0.72, eyebrowLift: 0.08, headTilt: 0, nod: 0 },
  happy: { emotion: 'happy', smile: 0.72, eyeFocus: 0.78, eyebrowLift: 0.14, headTilt: 0, nod: 0.08 },
  encouraging: { emotion: 'encouraging', smile: 0.62, eyeFocus: 0.86, eyebrowLift: 0.12, headTilt: 0.02, nod: 0.5 },
  curious: { emotion: 'curious', smile: 0.2, eyeFocus: 0.95, eyebrowLift: 0.28, headTilt: 0.04, nod: 0.05 },
  confused: { emotion: 'confused', smile: 0.04, eyeFocus: 0.82, eyebrowLift: 0.32, headTilt: -0.12, nod: 0 },
  correcting: { emotion: 'correcting', smile: 0.08, eyeFocus: 0.92, eyebrowLift: 0.18, headTilt: 0, nod: 0 }
};

export class FacialAnimationEngine {
  expressionFor(emotion: RealtimeEmotion | undefined): FacialExpression {
    return EXPRESSIONS[emotion || 'neutral'] || EXPRESSIONS.neutral;
  }

  forAvatarState(state: string, emotion?: RealtimeEmotion): FacialExpression {
    if (state === 'LISTENING') return EXPRESSIONS.encouraging;
    if (state === 'THINKING') return EXPRESSIONS.curious;
    if (state === 'ERROR') return EXPRESSIONS.confused;
    return this.expressionFor(emotion);
  }
}

export const facialAnimationEngine = new FacialAnimationEngine();
