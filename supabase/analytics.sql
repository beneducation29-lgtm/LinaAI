create table if not exists public.lina_analytics_events (
  event_id text primary key,
  user_id uuid null references auth.users(id) on delete set null,
  anonymous_id text not null,
  session_id text not null,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint lina_analytics_event_name_check check (event_name in (
    'app_open','lesson_start','lesson_complete','vocabulary_review','vocabulary_mastered',
    'mistake','correction','speaking_start','speaking_complete','roleplay_start','roleplay_complete',
    'pronunciation_practice','quiz_answer','quiz_complete','subscription_start','subscription_cancel'
  ))
);
create index if not exists lina_analytics_events_occurred_idx on public.lina_analytics_events(occurred_at desc);
create index if not exists lina_analytics_events_user_occurred_idx on public.lina_analytics_events(user_id, occurred_at desc);
create index if not exists lina_analytics_events_name_occurred_idx on public.lina_analytics_events(event_name, occurred_at desc);
alter table public.lina_analytics_events enable row level security;
revoke all on table public.lina_analytics_events from anon, authenticated;
grant all on table public.lina_analytics_events to service_role;
