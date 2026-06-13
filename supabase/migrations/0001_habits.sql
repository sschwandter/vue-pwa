-- Habits table for cloud sync. Run this in the Supabase SQL editor (or via the
-- Supabase CLI) once, against your project. The app stays fully functional
-- without it — sync simply stays off until the env vars + this table exist.
--
-- `id` is text (not uuid) because the client generates ids and falls back to a
-- non-uuid string on browsers without crypto.randomUUID().

create table if not exists public.habits (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists habits_user_id_idx on public.habits (user_id);

-- Row Level Security: every row is scoped to its owner. Without these policies
-- (and with RLS enabled) the table is inaccessible to clients, which is the
-- safe default. auth.uid() is the signed-in user's id from their JWT.
alter table public.habits enable row level security;

create policy "Read own habits"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "Insert own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "Update own habits"
  on public.habits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Delete own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

-- Stream row changes to subscribed clients so other devices update live.
alter publication supabase_realtime add table public.habits;
