-- Ops payer wallet pool for Helio/Dex contingency failover.
-- Secrets stay in Vercel env (secret_env_key); DB stores public keys + status only.

create table if not exists mw_ops_wallets (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  public_key text not null unique,
  /** Vercel/env var name holding the secret JSON byte array — never store the secret here */
  secret_env_key text not null,
  role text not null default 'helio_payer'
    check (role in ('helio_payer', 'session_note')),
  priority int not null default 100 check (priority >= 1),
  status text not null default 'active'
    check (status in ('active', 'blocked', 'cooling', 'retired')),
  block_reason text
    check (block_reason is null or block_reason in (
      'wallet_flag',
      'dex_session',
      'ip_session',
      'helio_reject',
      'unknown'
    )),
  blocked_at timestamptz,
  cooling_until timestamptz,
  last_success_at timestamptz,
  last_attempt_at timestamptz,
  last_error text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mw_ops_wallets_active_priority_idx
  on mw_ops_wallets (status, priority)
  where status = 'active';

comment on table mw_ops_wallets is
  'Contingency Helio/Dex payer wallets — keep >=3 active; failover on block; secrets in env only';

alter table mw_campaign_orders
  add column if not exists ops_wallet_id uuid references mw_ops_wallets(id) on delete set null;

comment on column mw_campaign_orders.ops_wallet_id is 'Ops payer wallet used (or attempted) for Helio settle';
