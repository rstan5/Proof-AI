-- 002_expand_simulations.sql
-- Adds custom form fields, recruiter ownership, and full RLS for Proof AI

-- Allow role to accept any text (remove the fixed-enum constraint)
alter table public.simulations
  alter column role drop not null;

alter table public.simulations
  drop constraint if exists simulations_role_check;

-- Add new form fields (default '' so existing rows are valid)
alter table public.simulations
  add column if not exists company_name    text not null default '',
  add column if not exists role_title      text not null default '',
  add column if not exists job_description text not null default '',
  add column if not exists looking_for     text not null default '',
  add column if not exists recruiter_id    uuid references auth.users (id);

-- Drop the temporary defaults (new rows must supply values)
alter table public.simulations
  alter column company_name    drop default,
  alter column role_title      drop default,
  alter column job_description drop default,
  alter column looking_for     drop default;

-- Track proctoring violations on submissions
alter table public.submissions
  add column if not exists violation_count integer not null default 0;

-- ── RLS policies ──────────────────────────────────────────────────────────────

-- Anon (candidates) can read any simulation by ID (UUID is the unguessable key)
drop policy if exists "anon can read any simulation" on public.simulations;
create policy "anon can read any simulation"
  on public.simulations for select
  to anon
  using (true);

-- Authenticated recruiters can only read their own simulations
drop policy if exists "recruiters can read own simulations" on public.simulations;
create policy "recruiters can read own simulations"
  on public.simulations for select
  to authenticated
  using (recruiter_id = auth.uid());

-- Authenticated recruiters can create simulations they own
drop policy if exists "authenticated can insert simulations" on public.simulations;
create policy "authenticated can insert simulations"
  on public.simulations for insert
  to authenticated
  with check (recruiter_id = auth.uid());

-- Anyone can submit a response (candidates have no account)
drop policy if exists "anyone can insert submissions" on public.submissions;
create policy "anyone can insert submissions"
  on public.submissions for insert
  with check (true);

-- Recruiters can read submissions for simulations they created
drop policy if exists "recruiters can read own submissions" on public.submissions;
create policy "recruiters can read own submissions"
  on public.submissions for select
  to authenticated
  using (
    simulation_id in (
      select id from public.simulations where recruiter_id = auth.uid()
    )
  );
