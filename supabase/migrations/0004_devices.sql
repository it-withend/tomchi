-- Field devices and irrigation sessions.
--
-- This is the step from advising to acting: the farmer starts a watering from
-- the phone and watches it run, which matters most in the heat, when going out
-- to the field is a health risk.
--
-- A session is described by timestamps rather than by a ticking timer. Progress
-- is derived from started_at and planned_end_at on every read, so the watering
-- keeps running when the app is closed, the phone is off, or the farmer opens a
-- second device — exactly how a real controller behaves.

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  client_field_id text not null,
  -- 'virtual' today; real controller types land here without a schema change.
  kind text not null default 'virtual',
  -- Litres per minute the system delivers. Turns a volume into a duration.
  flow_lpm numeric not null check (flow_lpm > 0),
  -- Reserved for real hardware: a virtual device is always reachable.
  status text not null default 'online',
  last_seen timestamptz,
  created_at timestamptz not null default now(),
  unique (owner, client_field_id)
);

create table if not exists public.irrigation_sessions (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  device_id uuid not null references public.devices (id) on delete cascade,
  client_field_id text not null,
  started_at timestamptz not null default now(),
  planned_end_at timestamptz not null,
  planned_liters numeric not null,
  ended_at timestamptz,
  delivered_liters numeric,
  status text not null default 'running'
    check (status in ('running', 'done', 'stopped', 'failed')),
  -- 'auto' and 'bot' are not written yet; declaring them now avoids rewriting
  -- the constraint when rules and bot control arrive.
  source text not null default 'manual'
    check (source in ('manual', 'auto', 'bot')),
  notified boolean not null default false
);

-- Row Level Security -----------------------------------------------------------
alter table public.devices enable row level security;
alter table public.irrigation_sessions enable row level security;

drop policy if exists "own devices" on public.devices;
create policy "own devices" on public.devices
  for all using (owner = auth.uid()) with check (owner = auth.uid());

drop policy if exists "own irrigation sessions" on public.irrigation_sessions;
create policy "own irrigation sessions" on public.irrigation_sessions
  for all using (owner = auth.uid()) with check (owner = auth.uid());

-- Indexes ----------------------------------------------------------------------
create index if not exists devices_owner_idx on public.devices (owner);
create index if not exists sessions_owner_field_idx
  on public.irrigation_sessions (owner, client_field_id);

-- The scheduler only ever asks "which running sessions are due to finish".
create index if not exists sessions_due_idx
  on public.irrigation_sessions (planned_end_at)
  where status = 'running';
