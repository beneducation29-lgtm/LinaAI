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
