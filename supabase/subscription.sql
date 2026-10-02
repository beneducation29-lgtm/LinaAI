create table if not exists public.lina_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'FREE' check (plan in ('FREE','PREMIUM','PRO')),
  status text not null default 'trial' check (status in ('trial','active','past_due','cancelled','expired')),
  provider text,
  provider_customer_id text,
  provider_subscription_id text unique,
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists lina_subscriptions_status_idx on public.lina_subscriptions(status);

create table if not exists public.lina_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  model text not null,
  purpose text not null,
  estimated_cost numeric(18,8) not null default 0,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  voice_minutes numeric(12,3) not null default 0,
  tts_usage integer not null default 0,
  stt_usage integer not null default 0,
  avatar_usage integer not null default 0,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists lina_usage_events_user_time_idx on public.lina_usage_events(user_id, occurred_at desc);
create index if not exists lina_usage_events_purpose_time_idx on public.lina_usage_events(purpose, occurred_at desc);

create table if not exists public.lina_usage_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_day date not null,
  period_month date not null,
  daily_requests integer not null default 0,
  monthly_minutes numeric(12,3) not null default 0,
  updated_at timestamptz not null default now(),
  primary key(user_id, period_day)
);
create index if not exists lina_usage_counters_month_idx on public.lina_usage_counters(user_id, period_month);

create table if not exists public.lina_billing_webhook_events (
  event_id text primary key,
  provider text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  status text not null default 'received'
);

alter table public.lina_subscriptions enable row level security;
alter table public.lina_usage_events enable row level security;
alter table public.lina_usage_counters enable row level security;
alter table public.lina_billing_webhook_events enable row level security;
revoke all on public.lina_subscriptions from anon, authenticated;
revoke all on public.lina_usage_events from anon, authenticated;
revoke all on public.lina_usage_counters from anon, authenticated;
revoke all on public.lina_billing_webhook_events from anon, authenticated;
grant all on public.lina_subscriptions to service_role;
grant all on public.lina_usage_events to service_role;
grant all on public.lina_usage_counters to service_role;
grant all on public.lina_billing_webhook_events to service_role;

create or replace function public.lina_reserve_ai_quota(
  p_user_id uuid,
  p_daily_limit integer,
  p_monthly_minutes numeric,
  p_requested_minutes numeric default 0
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := current_date;
  v_month date := date_trunc('month', current_date)::date;
  v_daily integer;
  v_monthly numeric;
begin
  insert into public.lina_usage_counters(user_id, period_day, period_month)
  values(p_user_id, v_day, v_month)
  on conflict(user_id, period_day) do nothing;

  select daily_requests, monthly_minutes
    into v_daily, v_monthly
    from public.lina_usage_counters
   where user_id=p_user_id and period_day=v_day
   for update;

  if p_daily_limit is not null and v_daily >= p_daily_limit then
    return jsonb_build_object('allowed', false, 'code', 'LIMIT_REACHED', 'reason', 'DAILY_REQUESTS');
  end if;
  if p_monthly_minutes is not null and v_monthly + greatest(0,p_requested_minutes) > p_monthly_minutes then
    return jsonb_build_object('allowed', false, 'code', 'LIMIT_REACHED', 'reason', 'MONTHLY_MINUTES');
  end if;

  update public.lina_usage_counters
     set daily_requests=daily_requests+1,
         monthly_minutes=monthly_minutes+greatest(0,p_requested_minutes),
         updated_at=now()
   where user_id=p_user_id and period_day=v_day;

  return jsonb_build_object('allowed', true, 'dailyRequests', v_daily+1, 'monthlyMinutes', v_monthly+greatest(0,p_requested_minutes));
end;
$$;
revoke all on function public.lina_reserve_ai_quota(uuid,integer,numeric,numeric) from public, anon, authenticated;
grant execute on function public.lina_reserve_ai_quota(uuid,integer,numeric,numeric) to service_role;
