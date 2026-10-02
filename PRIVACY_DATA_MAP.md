# Lina AI Chinese — Privacy Data Map (Prompt 23)

| Data | Classification | Where stored | Why | Access | Retention target | Delete method |
|---|---|---|---|---|---|---|
| HSK lessons/content | PUBLIC | app/CMS database | learning content | learners/content admins | product lifetime/version policy | CMS archive/delete |
| Learning progress | PERSONAL | lina_learning_sync_records | sync state | authenticated owner; server only | account lifetime | Delete Learning Data |
| Vocabulary/SRS/mistakes | PERSONAL | sync records | spaced review | authenticated owner; server | account lifetime | Delete Learning Data |
| AI memory | PRIVATE | sync payload when enabled | personalization | owner + selected AI context | while enabled/account active | disable memory/delete learning data |
| Conversation history | PRIVATE | sync payload when enabled | continuity | owner + selected AI context | account lifetime by default | Delete Learning Data/account |
| Raw microphone audio | PRIVATE | not persisted by default | speech interaction | browser/provider during request | transient | browser/provider lifecycle |
| Analytics events | PERSONAL | lina_analytics_events | product improvement | owner/admin aggregate | 12 months target | Delete Learning Data/account |
| Subscription data | PERSONAL | lina_subscriptions | entitlements/billing | owner + billing/security roles | legal/billing policy | account/provider workflow |
| Usage/cost records | SECURITY-SENSITIVE | usage tables | quota/cost control | service/admin cost roles | 12 months target | retention job |
| Session tokens | SECURITY-SENSITIVE | HttpOnly cookies/auth provider | authentication | browser + auth provider | access ~1h, refresh ~30d | logout/revoke |
| Security events | SECURITY-SENSITIVE | server/optional audit sink | abuse response | security admins | 12 months target | retention job |
| API keys/secrets | SECURITY-SENSITIVE | deployment secret manager | provider auth | server runtime only | until rotated | rotation/removal |

## Privacy defaults

AI memory, conversation history, analytics and personalization are enabled and user-controlled. Voice recording persistence is disabled by default.

## Governance rules

1. Never send a full profile/database dump to Gemini.
2. Never put raw audio, transcripts, passwords, auth tokens or provider secrets into analytics.
3. Private conversations are not public content.
4. Admin CMS access does not imply access to private learner content.
5. Retention targets need scheduled deletion jobs; user deletion controls are implemented by the privacy API.
