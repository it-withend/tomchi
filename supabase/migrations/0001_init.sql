-- Tomchi backend schema. Run in the Supabase SQL editor (or `supabase db push`).
-- Identity is anonymous-auth: each device signs in anonymously and owns its rows.

-- Fields owned by a device (anonymous auth user).
create table if not exists public.fields (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  client_id text not null,
  region_id text not null,
  crop_id text not null,
  area_ha numeric not null,
  method text not null,
  soil text not null,
  last_watered timestamptz,
  updated_at timestamptz not null default now(),
  unique (owner, client_id)
);

create table if not exists public.watering_events (
  id bigint generated always as identity primary key,
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  client_field_id text not null,
  type text not null check (type in ('watered', 'rain')),
  at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Short-lived codes that link a device to a Telegram chat.
create table if not exists public.pair_codes (
  code text primary key,
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- Telegram chat <-> owner link. Written only by the bot (service role).
create table if not exists public.bot_links (
  chat_id bigint primary key,
  owner uuid not null references auth.users (id) on delete cascade,
  lang text not null default 'uz',
  subscribed boolean not null default true,
  created_at timestamptz not null default now()
);

-- Row Level Security -----------------------------------------------------------
alter table public.fields enable row level security;
alter table public.watering_events enable row level security;
alter table public.pair_codes enable row level security;
alter table public.bot_links enable row level security;

-- Owners manage only their own rows. The bot uses the service role, which
-- bypasses RLS entirely (so it can read any linked owner's fields).
create policy "own fields" on public.fields
  for all using (owner = auth.uid()) with check (owner = auth.uid());

create policy "own events" on public.watering_events
  for all using (owner = auth.uid()) with check (owner = auth.uid());

create policy "own pair codes" on public.pair_codes
  for all using (owner = auth.uid()) with check (owner = auth.uid());

-- bot_links: no anon policy -> only the service role can touch it.

-- Helpful indexes
create index if not exists fields_owner_idx on public.fields (owner);
create index if not exists events_owner_field_idx on public.watering_events (owner, client_field_id);
create index if not exists pair_codes_expires_idx on public.pair_codes (expires_at);
