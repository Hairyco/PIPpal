-- Run in Supabase SQL editor (once). Keeps influencer BACS details for payouts.
-- Recommended: tighten RLS so only service-role / admins can SELECT these columns.

alter table public.influencer_codes
  add column if not exists payout_account_name text,
  add column if not exists payout_sort_code text,
  add column if not exists payout_account_number text;

comment on column public.influencer_codes.payout_account_name is 'Bank account holder name (as on statement)';
comment on column public.influencer_codes.payout_sort_code is 'UK sort code (digits, may include dashes)';
comment on column public.influencer_codes.payout_account_number is 'UK account number';
