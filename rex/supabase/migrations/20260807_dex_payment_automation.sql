-- Dex / supplier payment automation fields (creatives + Helio instruction + rails).
-- Apply in Supabase SQL editor after 20260805_ctogo_marketing_wallet.sql.

alter table mw_providers
  add column if not exists payment_rail text not null default 'unknown'
    check (payment_rail in (
      'onchain_sol',
      'hosted_checkout_crypto',
      'manual_invoice',
      'unknown'
    )),
  add column if not exists automation_tier text not null default 'C'
    check (automation_tier in ('A', 'B', 'C')),
  add column if not exists playbook_path text,
  add column if not exists checkout_entry_url text,
  add column if not exists confirm_via text not null default 'manual'
    check (confirm_via in ('orders_api', 'helio', 'tx', 'manual'));

comment on column mw_providers.payment_rail is 'Discovered supplier rail; pivot when live UI changes';
comment on column mw_providers.playbook_path is 'e.g. docs/suppliers/dexscreener.md';

alter table mw_campaign_orders
  add column if not exists creatives jsonb not null default '{}'::jsonb,
  add column if not exists payment_instruction jsonb;

comment on column mw_campaign_orders.creatives is 'Founder Approve creatives (title, pitch, image, optional socials)';
comment on column mw_campaign_orders.payment_instruction is 'Helio charge deeplink / deposit fields captured at checkout';

-- Expand order status for crypto checkout contingencies (drop old check, add new).
alter table mw_campaign_orders drop constraint if exists mw_campaign_orders_status_check;
alter table mw_campaign_orders
  add constraint mw_campaign_orders_status_check check (status in (
    'queued',
    'awaiting_creatives',
    'awaiting_payment_instruction',
    'paying',
    'paid',
    'paid_unconfirmed',
    'retrying',
    'failed',
    'manual_review',
    'cancelled'
  ));

update mw_providers
set
  payment_rail = 'hosted_checkout_crypto',
  automation_tier = 'B',
  playbook_path = 'docs/suppliers/dexscreener.md',
  checkout_entry_url = 'https://marketplace.dexscreener.com/product/ad',
  confirm_via = 'orders_api',
  notes = coalesce(notes, '') || ' | Helio QR deposit; socials optional; vault SOL + JIT USDC',
  updated_at = now()
where adapter_type = 'dexscreener';
