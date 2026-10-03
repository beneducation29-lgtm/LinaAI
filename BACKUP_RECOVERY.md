# LinaAI Backup & Recovery

## Required production controls
- Daily logical database backup.
- 30-day daily retention and 12 weekly snapshots.
- Monthly restore drill in an isolated environment.
- Backup credentials remain in the deployment secret manager.
- Recovery owner: platform/database administrator.

## Restore procedure
1. Freeze writes and record the incident window.
2. Select the last known-good backup.
3. Restore into an isolated database.
4. Validate authentication, RLS, learning progress, CMS versions, sync and subscription state.
5. Compare integrity checks and row counts.
6. Promote only after validation.
7. Re-enable writes and monitor sync conflicts.

Provider-native backups alone are not considered a complete recovery runbook; the actual schedules must be configured and verified before release.
