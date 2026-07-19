-- Company recruiter profiles linked to Supabase auth users

create table if not exists public.company_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  company_name text not null,
  role_at_company text not null,
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.company_profiles enable row level security;

drop policy if exists "users read own profile" on public.company_profiles;
create policy "users read own profile"
  on public.company_profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "users insert own profile" on public.company_profiles;
create policy "users insert own profile"
  on public.company_profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "users update own profile" on public.company_profiles;
create policy "users update own profile"
  on public.company_profiles for update
  to authenticated
  using (id = auth.uid());

-- Recruiters can update evaluation on submissions for their simulations
drop policy if exists "recruiters can update own submission evaluations" on public.submissions;
create policy "recruiters can update own submission evaluations"
  on public.submissions for update
  to authenticated
  using (
    simulation_id in (
      select id from public.simulations where recruiter_id = auth.uid()
    )
  );

comment on table public.company_profiles is 'Recruiter / company account metadata for Proof AI.';
