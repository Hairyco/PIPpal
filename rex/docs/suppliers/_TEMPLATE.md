# Supplier playbook template

Copy to `<slug>.md` and fill before activating the provider.

## Identity

- **Slug / provider id:**
- **Products covered:**
- **Adapter type:**
- **Last probed:** YYYY-MM-DD
- **Probe notes URL / order id:**

## Payment rail

- **payment_rail:** `onchain_sol` | `hosted_checkout_crypto` | `manual_invoice` | `unknown`
- **automation_tier:** A | B | C
- **Assets accepted:** (e.g. USDC, SOL)
- **Network:** (e.g. Solana mainnet)
- **Processor:** (e.g. Helio charge QR)
- **Card:** out of scope

## Creatives / order form (dynamic)

| Field | Required? | Spec / limits | Notes |
|-------|-----------|---------------|-------|
| | required / optional / recommended | | |

**Pivot rule:** If live UI changes requiredness, update this table and CTOgo Approve validation in the same change.

## Primary auto path

1. …
2. …
3. …

## Contingency

| Failure | Action |
|---------|--------|
| | |

## Confirmation signal

How we know the spend is live (API, tx, manual proof).

## Test evidence

- Devnet / sandbox:
- Live supplier proof (date, order id, result):
