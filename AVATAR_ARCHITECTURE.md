# Lina AI Chinese — Avatar Architecture (Prompt 30)

## Capability boundary

Lina currently uses an original local portrait asset with procedural motion layers. The project does not bundle a third-party photorealistic realtime avatar SDK.

- Provider levels remain: static fallback → local interactive → configured realtime adapter.
- Eye movement and blinking are procedural; this is not real eye tracking.
- Lip sync is audio-driven from Web Audio metrics when a playable media element is available.
- Timing/viseme data can be represented by the existing lip-sync contracts, but no phoneme/viseme provider is claimed unless the provider supplies trusted timing data.
- Emotion is structured metadata mapped to predefined expressions; this is not emotion recognition.

## Pipeline

Gemini response → sentence chunker → TTS queue → audio playback → Web Audio analyzer → lip-sync engine → avatar presentation.

Each realtime conversation turn has a turn identity. Sentence work has a sentence identity. Stale callbacks must not update the current turn.

## Motion layers

1. Base Lina portrait.
2. Procedural gaze shift.
3. Randomized blink lifecycle.
4. State-aware head movement and micro-nods.
5. Emotion-aware facial parameters.
6. Audio-driven mouth/viseme layer.
7. Breathing/micro-expression layer.

Motion is deliberately subtle and respects reduced-motion preferences in the UI.

## TTS and interruption

The TTS queue keeps sentence ordering, prefetches when the provider supports it, and uses a generation token so callbacks/work from a cancelled queue cannot resume a later turn.

The existing streaming provider remains server/API based. API keys are not exposed to the browser.

## Fallback

Realtime adapter → local interactive provider → static portrait/audio/text. A failure in avatar rendering must not block learning.

## Security and privacy

Frontend code never receives Gemini/TTS/provider secrets. Raw microphone audio is not persisted by the avatar layer. Only current-turn text/audio required for speech rendering is sent to the relevant backend provider.

## Development acceptance

Production does not claim photorealistic realtime rendering, phoneme-accurate lip sync, emotion recognition, or eye tracking unless the corresponding provider is actually connected and verified.
