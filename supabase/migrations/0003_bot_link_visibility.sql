-- Let a device see and remove its own Telegram link.
--
-- bot_links was write-only from the bot's side (service role, which bypasses
-- RLS), so the web app had no way to tell whether reminders were already set up
-- and could only ever offer "Connect Telegram". These two policies let an owner
-- read and delete their own row, which is what the connect/disconnect toggle
-- needs. Insert and update stay closed: only the bot may create a link, and it
-- does so after the farmer proves ownership with a pairing code.

drop policy if exists "read own bot link" on public.bot_links;
create policy "read own bot link" on public.bot_links
  for select using (owner = auth.uid());

drop policy if exists "delete own bot link" on public.bot_links;
create policy "delete own bot link" on public.bot_links
  for delete using (owner = auth.uid());

-- The app looks this row up by owner on every dashboard load.
create index if not exists bot_links_owner_idx on public.bot_links (owner);
