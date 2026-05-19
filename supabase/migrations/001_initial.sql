-- Proof AI MVP schema (Supabase / Postgres)
-- Run in SQL editor or via supabase db push

create extension if not exists "pgcrypto";

create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('SDR', 'Financial Analyst', 'Customer Support', 'Product Manager')),
  generated_prompt text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.simulations (id) on delete cascade,
  candidate_name text not null,
  response text not null,
  evaluation_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists submissions_simulation_id_idx on public.submissions (simulation_id);
create index if not exists simulations_created_at_idx on public.simulations (created_at desc);

alter table public.simulations enable row level security;
alter table public.submissions enable row level security;

-- MVP: tighten policies when auth is connected (owner/recruiter vs candidate).
-- Example policy placeholders (adjust to your auth model):
-- create policy "recruiters read own simulations" on public.simulations
--   for select using (auth.uid() is not null);

comment on table public.simulations is 'AI-generated simulation prompts per role.';
comment on table public.submissions is 'Candidate responses and structured evaluation JSON.';
