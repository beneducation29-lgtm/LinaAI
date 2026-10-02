# LinaAI Architecture

## Runtime
React + Vite frontend, Express server, Gemini integration and Supabase-backed persistence/sync.

## Learning
Activity Engine → retrieval practice → SRS → interleaving → personalization.
Speaking, shadowing, listening ladder, reading support and writing feedback are capability-gated; pronunciation scores are not claimed without reliable evidence.

## CMS
Admin-only draft → review → published → archived workflow with validation, versioning/rollback and publication gates. AI review is advisory; it cannot publish content.

## Security boundary
Private endpoints must authenticate and authorize on the server. Database RLS is an independent enforcement layer. Provider secrets never belong in browser code.

## Production gate
Release status is determined by tests, authentication, data isolation, content health, dependency health, backups and operational monitoring—not by a successful frontend build alone.
