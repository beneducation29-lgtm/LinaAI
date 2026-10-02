create table if not exists public.lina_learning_sync_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  record_key text not null,
  payload jsonb not null,
  version bigint not null default 1,
  updated_at timestamptz not null,
  device_id text not null,
  primary key (user_id, record_key)
);
create index if not exists lina_learning_sync_records_user_updated_idx on public.lina_learning_sync_records(user_id,updated_at);
alter table public.lina_learning_sync_records enable row level security;
-- The server uses the Supabase service role only after validating the user's access token.
