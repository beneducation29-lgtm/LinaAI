# Prompt 34 — Lina Avatar Visual Consistency + Real Audio Lip Sync

## Existing architecture audited
- AvatarStage → LinaAvatar → avatarService / AvatarProvider levels
- AvatarAnimationEngine + FacialAnimationEngine
- AudioStreamController → AudioAnalyzer → LipSyncEngine
- StreamingTTSProvider + TTSQueue
- RealtimeSpeechOrchestrator + AvatarTurnController
- Level 1 static fallback, Level 2 interactive fallback, Level 3 provider adapter

## Implemented
- centralized original Lina visual configuration and default outfit contract
- dusty-rose ribbed knit long-sleeve scoop-neck default outfit
- stable dark short bob, upper-body framing, eye-level camera and warm tutor environment specification
- natural randomized blink and bounded gaze deviation through EyeContactController
- reduced-motion aware facial/head movement
- smoothed audio-driven mouth intensity and jaw model
- speaking state now follows actual audio playback `playing` rather than TTS request/text generation
- streamed audio `ended` is emitted only after the actual media element ends
- TTS queue sentence IDs are scoped to conversation turn IDs
- stale TTS callbacks are rejected when the active turn no longer matches
- deterministic avatar reset for interruption/error cleanup
- development-only Avatar Debug Panel

## Provider status
- Real external realtime avatar vendor is NOT configured in this repository.
- Level 3 remains an adapter contract only; no fake realtime provider is claimed.
- Current runtime fallback remains local animated/static Lina.
- Audio lip sync uses actual playback analysis when an HTMLAudioElement is available.
- No phoneme/viseme precision is claimed when provider timing data is unavailable.

## Visual asset limitation
The repository still renders the existing Lina image asset. The new visual configuration is centralized, but the actual image asset has not been regenerated from a reference photograph because the reference image was not added as a production dependency and no identity/likeness is copied. Therefore exact outfit-image matching remains a content/asset step rather than a fabricated code claim.

## Acceptance status
- Visual configuration: PARTIAL — specification centralized; existing image asset still needs an original Lina asset matching the new outfit direction.
- Eye contact/blink: READY for procedural local animation.
- Audio-driven lip sync: READY for actual HTMLAudio playback analysis; provider-level viseme timing remains unavailable.
- TTS synchronization: READY for playback-state gating.
- Interruption/race protection: READY at turn/queue level.
- Realtime avatar: PARTIAL — adapter exists, real vendor not configured.
- Fallback: READY.
- Debug diagnostics: READY in development only.