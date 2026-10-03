# Lina AI Chinese — Privacy Data Map (Prompt 32)

| Data | Classification | Where stored | Why | Access | Retention target | User control |
|---|---|---|---|---|---|---|
| HSK lessons/content | PUBLIC | app/CMS database | learning content | learners/content admins | product lifetime/version policy | not personal data |
| Learning progress | LEARNING | lina_learning_sync_records | sync state | authenticated owner; server only | account lifetime | view/export/delete |
| Vocabulary/SRS/mistakes | LEARNING | sync records | spaced review | authenticated owner; server | account lifetime | view/export/delete |
| Profile/goals/preferences | PERSONAL | sync payload/account metadata | account + learning setup | authenticated owner; limited account services | account lifetime | view/export/delete |
| AI memory | PRIVATE | sync payload when enabled | learning personalization | owner + selected AI context | while enabled/account active | toggle/reset/delete |
| Conversation history | PRIVATE | sync payload when enabled | continuity | owner + selected AI context | account lifetime by default | toggle/delete/export |
| Raw microphone audio | PRIVATE | not persisted by application | transient STT/voice processing | provider during request only | transient/provider lifecycle | not stored by default |
| Analytics events | PERSONAL | lina_analytics_events | product improvement | owner/admin aggregate | 12 months target | toggle/delete/export |
| Subscription data | PERSONAL | lina_subscriptions | entitlements/billing | owner + billing/security roles | legal/billing policy | view/export/account deletion |
| Usage/cost records | SECURITY-SENSITIVE | usage tables | quota/cost control | service/admin cost roles | 12 months target | account deletion; retention policy |
| Security events | SECURITY-SENSITIVE | lina_security_events | abuse/security response | service/security roles | 12 months target | account deletion unless retention obligation applies |
| Session tokens | SECURITY-SENSITIVE | HttpOnly cookies/auth provider | authentication | browser + auth provider | access ~1h, refresh ~30d | local logout / revoke others |
| API keys/secrets | SECURITY-SENSITIVE | deployment secret manager | provider auth | server runtime only | until rotated | operator-controlled |

## Privacy-by-design rules

1. The server derives user identity from the authenticated session; client-supplied target user IDs are not trusted.
2. AI context is minimized: current request + relevant learning context only.
3. If personalization or AI Memory is disabled, learner memory is not supplied to Tutor orchestration.
4. If conversation history is disabled, prior conversation messages are not supplied to Tutor orchestration.
5. Analytics rejects/strips email, name, transcript, raw audio and sentence-content fields.
6. Raw microphone audio is not persisted by Lina by default and is never sent to analytics.
7. Admin CMS authorization does not grant raw learner-conversation access.
8. Security logs store metadata and HMAC-hashed IP values, not tokens/passwords/full conversations.

## Privacy controls

The account Privacy & Security panel provides working controls for:
- AI Memory
- Conversation History
- Personalization
- Analytics
- Export
- Delete learning data
- Delete account
- Current-session information and logout of other sessions

Voice is displayed as a data-handling status rather than a fake "store audio" switch because the current product does not persist raw microphone audio.

## Retention note

The durations above are policy targets. They are not claims that an automated retention job already enforces them in every environment. Production operations must add/verify scheduled retention jobs where required.
