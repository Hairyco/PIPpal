# Supplier payment playbooks

Each active marketing supplier needs a playbook in this folder before CTOgo automates spend.

| File | Supplier |
|------|----------|
| [_TEMPLATE.md](_TEMPLATE.md) | Copy for new suppliers |
| [dexscreener.md](dexscreener.md) | DexScreener (case #1) |

**Rules**

- Map the real payment process (live UI), do not invent wallets.
- Mark fields **required / optional / recommended** from the live form — pivot when the supplier changes.
- Crypto only for now (no card).
- Vault accumulates **SOL**; convert just-in-time (e.g. Jupiter SOL→USDC) when the supplier needs another asset.
- Every playbook includes a **contingency** table.
- Confirm automation against the real supplier (or their payment processor) before calling the path “done”.
