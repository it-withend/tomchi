-- In-bot setup state (for users who configure a field directly in Telegram,
-- without the web app). Serverless webhook functions have no local disk, so this
-- replaces the old JSON file. The bot uses the service role, which bypasses RLS;
-- RLS is enabled with no policies so nobody else can read/write it.
create table if not exists public.bot_subscribers (
  chat_id      bigint primary key,
  lang         text not null default 'uz',
  step         text,
  region_id    text,
  crop_id      text,
  area_ha      numeric not null default 1,
  method       text,
  soil         text,
  last_watered timestamptz,
  subscribed   boolean not null default true,
  updated_at   timestamptz not null default now()
);

alter table public.bot_subscribers enable row level security;
