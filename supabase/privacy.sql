create table if not exists public.lina_privacy_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ai_memory_enabled boolean not null default true,
  conversation_history_enabled boolean not null default true,
  analytics_enabled boolean not null default true,
  voice_data_enabled boolean not null default false,
  personalization_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.lina_privacy_preferences enable row level security;
revoke all on table public.lina_privacy_preferences from anon;
grant select,insert,update,delete on table public.lina_privacy_preferences to authenticated;

drop policy if exists lina_privacy_owner_select on public.lina_privacy_preferences;
drop policy if exists lina_privacy_owner_insert on public.lina_privacy_preferences;
drop policy if exists lina_privacy_owner_update on public.lina_privacy_preferences;
drop policy if exists lina_privacy_owner_delete on public.lina_privacy_preferences;

create policy lina_privacy_owner_select on public.lina_privacy_preferences for select using (auth.uid()=user_id);
create policy lina_privacy_owner_insert on public.lina_privacy_preferences for insert with check (auth.uid()=user_id);
create policy lina_privacy_owner_update on public.lina_privacy_preferences for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy lina_privacy_owner_delete on public.lina_privacy_preferences for delete using (auth.uid()=user_id);

create table if not exists public.lina_security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  event_name text not null check (event_name in ('login_success','login_failed','logout','session_revoked','account_deleted','suspicious_access')),
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists lina_security_events_user_time_idx on public.lina_security_events(user_id,created_at desc);
create index if not exists lina_security_events_name_time_idx on public.lina_security_events(event_name,created_at desc);
alter table public.lina_security_events enable row level security;
revoke all on public.lina_security_events from anon, authenticated;
grant all on public.lina_security_events to service_role;
