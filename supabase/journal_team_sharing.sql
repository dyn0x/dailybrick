-- ============================================================
-- DailyBrick — Journal team-sharing migration
-- Run this in your Supabase SQL editor if you already have
-- an existing database from a previous schema.sql run.
-- ============================================================

-- 1. Add team_id column to journal_notes
-- (safe to run multiple times — uses IF NOT EXISTS)
alter table public.journal_notes
  add column if not exists team_id uuid
  references public.teams(id)
  on delete set null;

-- 2. Drop the old individual-only journal RLS policies
drop policy if exists "journal_notes_select_own" on public.journal_notes;
drop policy if exists "journal_notes_insert_own" on public.journal_notes;
drop policy if exists "journal_notes_update_own" on public.journal_notes;
drop policy if exists "journal_notes_delete_own" on public.journal_notes;

-- Also drop the new-name policies in case this script is re-run
drop policy if exists "journal_notes_select" on public.journal_notes;
drop policy if exists "journal_notes_insert" on public.journal_notes;
drop policy if exists "journal_notes_update" on public.journal_notes;
drop policy if exists "journal_notes_delete" on public.journal_notes;

-- 3. SELECT — own personal notes OR any note belonging to your team
create policy "journal_notes_select"
on public.journal_notes
for select
using (
  user_id = auth.uid()
  or (team_id is not null and public.is_team_member(team_id))
);

-- 4. INSERT — you must be the author, and team_id (if set) must be your team
create policy "journal_notes_insert"
on public.journal_notes
for insert
with check (
  user_id = auth.uid()
  and (team_id is null or public.is_team_member(team_id))
);

-- 5. UPDATE — your own note, or any note inside your team
create policy "journal_notes_update"
on public.journal_notes
for update
using (
  user_id = auth.uid()
  or (team_id is not null and public.is_team_member(team_id))
)
with check (
  user_id = auth.uid()
  or (team_id is not null and public.is_team_member(team_id))
);

-- 6. DELETE — your own note, or any note inside your team
create policy "journal_notes_delete"
on public.journal_notes
for delete
using (
  user_id = auth.uid()
  or (team_id is not null and public.is_team_member(team_id))
);
