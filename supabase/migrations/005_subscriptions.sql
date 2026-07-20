-- Subscription fields for Proof AI paid plans (Stripe)

alter table public.company_profiles
  add column if not exists plan_id text not null default 'free',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text,
  add column if not exists plan_simulations_per_month integer;

comment on column public.company_profiles.plan_id is
  'free | small_business | enterprise';
comment on column public.company_profiles.subscription_status is
  'Stripe subscription status: active, trialing, canceled, past_due, etc.';
