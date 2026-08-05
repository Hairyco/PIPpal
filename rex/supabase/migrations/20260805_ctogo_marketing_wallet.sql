-- CTOgo marketing wallet orchestration (Supabase)
-- Apply in Supabase SQL editor or via CLI. Secrets stay in env, never in rows.

create extension if not exists pgcrypto;

create table if not exists mw_providers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  wallet_address text not null,
  adapter_type text not null default 'manual'
    check (adapter_type in ('manual', 'dexscreener', 'influencer', 'telegram')),
  active boolean not null default false,
  whitelist_tx text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mw_provider_offers (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references mw_providers(id) on delete cascade,
  offer_key text not null,
  label text not null,
  price_usd numeric(12,2) not null check (price_usd > 0),
  currency text not null default 'USD',
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider_id, offer_key)
);

create table if not exists mw_projects (
  id uuid primary key default gen_random_uuid(),
  mint text not null unique,
  ticker text not null,
  engine text not null check (engine in ('launch', 'list')),
  founder_wallet text not null,
  marketing_vault text,
  marketing_attached boolean not null default false,
  spend_paused boolean not null default true,
  spend_unlocked boolean not null default false,
  last_marketing_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mw_spend_plans (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references mw_projects(id) on delete cascade,
  mode text not null default 'polessia' check (mode in ('polessia', 'manual')),
  status text not null default 'draft'
    check (status in ('draft', 'pending_signature', 'approved', 'paused', 'cancelled')),
  selected_offer_ids uuid[] not null default '{}',
  approved_by_wallet text,
  approval_message text,
  approval_signature text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mw_campaign_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references mw_projects(id) on delete cascade,
  plan_id uuid references mw_spend_plans(id) on delete set null,
  provider_id uuid not null references mw_providers(id),
  offer_id uuid not null references mw_provider_offers(id),
  invoice_id text not null,
  invoice_lamports bigint not null check (invoice_lamports > 0),
  service_fee_lamports bigint not null check (service_fee_lamports >= 0),
  total_debit_lamports bigint not null check (total_debit_lamports > invoice_lamports),
  status text not null default 'queued'
    check (status in ('queued', 'paying', 'paid', 'retrying', 'failed', 'manual_review', 'cancelled')),
  attempt_count int not null default 0,
  max_auto_attempts int not null default 2,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, invoice_id)
);

create table if not exists mw_payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references mw_campaign_orders(id) on delete cascade,
  attempt_no int not null,
  idempotency_key text not null unique,
  status text not null default 'started'
    check (status in ('started', 'submitted', 'confirmed', 'failed')),
  tx_signature text,
  error text,
  created_at timestamptz not null default now(),
  unique (order_id, attempt_no)
);

create table if not exists mw_payment_receipts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references mw_campaign_orders(id) on delete cascade,
  invoice_id text not null,
  tx_signature text not null,
  supplier_wallet text not null,
  invoice_lamports bigint not null,
  service_fee_lamports bigint not null,
  total_debit_lamports bigint not null,
  actor_wallet text,
  confirmed_at timestamptz not null default now()
);

create table if not exists mw_provider_fulfilments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references mw_campaign_orders(id) on delete cascade,
  adapter_type text not null,
  status text not null default 'pending'
    check (status in ('pending', 'submitted', 'fulfilled', 'failed', 'manual')),
  external_ref text,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists mw_sweep_warnings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references mw_projects(id) on delete cascade,
  warn_days int not null check (warn_days in (30, 7)),
  sent_at timestamptz not null default now(),
  unique (project_id, warn_days)
);

create table if not exists mw_audit_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references mw_projects(id) on delete set null,
  actor_wallet text,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists mw_auth_challenges (
  id uuid primary key default gen_random_uuid(),
  wallet text not null,
  nonce text not null unique,
  purpose text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists mw_orders_status_idx on mw_campaign_orders(status, created_at);
create index if not exists mw_projects_founder_idx on mw_projects(founder_wallet);
create index if not exists mw_audit_created_idx on mw_audit_events(created_at desc);

alter table mw_providers enable row level security;
alter table mw_provider_offers enable row level security;
alter table mw_projects enable row level security;
alter table mw_spend_plans enable row level security;
alter table mw_campaign_orders enable row level security;
alter table mw_payment_attempts enable row level security;
alter table mw_payment_receipts enable row level security;
alter table mw_provider_fulfilments enable row level security;
alter table mw_sweep_warnings enable row level security;
alter table mw_audit_events enable row level security;
alter table mw_auth_challenges enable row level security;

-- Public read of active catalog only (anon). Mutations via service role / Vercel API.
create policy mw_providers_public_read on mw_providers
  for select using (active = true);
create policy mw_offers_public_read on mw_provider_offers
  for select using (active = true);
create policy mw_receipts_public_read on mw_payment_receipts
  for select using (true);

-- Seed manual adapter offers matching Polessia wizard prices (inactive until ops whitelists).
insert into mw_providers (slug, display_name, wallet_address, adapter_type, active, notes)
values
  ('ctogo-telegram-pin', 'CTOgo Telegram pin', 'PENDING_WHITELIST', 'telegram', false, 'Replace wallet + whitelist on-chain before activating'),
  ('dexscreener-socials', 'DexScreener socials', 'PENDING_WHITELIST', 'dexscreener', false, 'Sandbox until DexScreener API credentials'),
  ('dexscreener-trending', 'DexScreener trending', 'PENDING_WHITELIST', 'dexscreener', false, 'Sandbox until DexScreener API credentials')
on conflict (slug) do nothing;

insert into mw_provider_offers (provider_id, offer_key, label, price_usd, active)
select p.id, v.offer_key, v.label, v.price_usd, false
from mw_providers p
join (values
  ('ctogo-telegram-pin', 'tg-pinned', 'Pinned message · CTOgo Telegram', 150::numeric),
  ('dexscreener-socials', 'dex-socials', 'DexScreener socials update', 350::numeric),
  ('dexscreener-trending', 'dex-trending', 'DexScreener trending bar', 2000::numeric)
) as v(slug, offer_key, label, price_usd) on p.slug = v.slug
on conflict (provider_id, offer_key) do nothing;
