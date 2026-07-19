-- 004_sim_read_authenticated.sql
-- Authenticated users must be able to open candidate /sim/[id] links.
-- UUID remains the unguessable invite; recruiter dashboard still filters by recruiter_id.

drop policy if exists "recruiters can read own simulations" on public.simulations;
drop policy if exists "authenticated can read any simulation" on public.simulations;

create policy "authenticated can read any simulation"
  on public.simulations for select
  to authenticated
  using (true);
