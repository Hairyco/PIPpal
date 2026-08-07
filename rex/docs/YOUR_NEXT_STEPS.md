# What you need to do next (plain English)

This is your checklist. I already built the software in the repo. You turn on the accounts and keys that only a human can create.

---

## Already done for you (no action)

- Smart contract code for fees, marketing wallet payouts (supplier gets 100%, CTOgo adds 20% on top), pause, and 180-day sweep
- Database blueprint (Supabase SQL file)
- Background “robot” (keeper) that tries payments and retries once
- Website screens: Approve shows the $100 → $120 breakdown, demo badges, ops page
- Docs and fee copy updated

---

## Your steps (in order)

### Step 1 — Create a free Supabase project
1. Go to [https://supabase.com](https://supabase.com) and sign up / log in.
2. Click **New project**. Pick a name (e.g. `ctogo`) and a strong database password. Save the password somewhere safe.
3. Wait until the project is ready (a few minutes).

**Cost:** Free tier to start, then paid if you grow.

### Step 2 — Paste the database setup
1. In Supabase, open **SQL Editor**.
2. Open this file on your computer:  
   `rex/supabase/migrations/20260805_ctogo_marketing_wallet.sql`
3. Copy all of it → paste into SQL Editor → click **Run**.
4. You should see success (tables created).

### Step 3 — Copy your Supabase keys into CTOgo hosting
1. In Supabase: **Project Settings → API**.
2. Copy:
   - **Project URL**
   - **anon public** key
   - **service_role** key (secret — never put this in public chat)
3. In [Vercel](https://vercel.com) open the **CTOgo / rex** project → **Settings → Environment Variables**.
4. Add (for Production, and Preview if you want):

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `CRON_SECRET` | Make up a long random password (e.g. from a password manager) |
| `MW_OPS_SECRET` | Another long random password (for the ops page) |

5. Redeploy the CTOgo site on Vercel (Deployments → Redeploy) so the new keys load.

**Cost:** Vercel Hobby is free for light use; production traffic may need a paid plan later.

### Step 4 — Solana “phone line” (RPC) for the payment robot
Public free Solana links are too flaky for automatic payments.

1. Sign up at a provider such as [Helius](https://helius.dev) or [QuickNode](https://quicknode.com).
2. Create a **Devnet** endpoint first (for testing).
3. Copy the HTTPS RPC URL.
4. Add to Vercel env: `SOLANA_RPC_URL` = that URL.

**Cost:** Free tier often exists, then paid for reliable production.

### Step 5 — Make a “keeper” wallet (the robot’s purse)
1. Install [Phantom](https://phantom.app) if you do not have it.
2. Create a **new empty wallet** used only for CTOgo automation (not your main savings).
3. Export / copy its **private key** carefully (Phantom: settings → security — follow their export flow).
4. Add to Vercel: `KEEPER_SECRET_KEY` = that private key.
5. Send a little **devnet SOL** to that wallet for fees when you test on devnet.

**Never** paste this key into Slack/email/chat. If it leaks, make a new wallet.

**Cost:** Devnet SOL is free from faucets; mainnet SOL is real money.

## Step 6b — Dex payment automation SQL (after Step 2)

In Supabase SQL Editor, also run:

`rex/supabase/migrations/20260807_dex_payment_automation.sql`

This adds creatives + Helio `payment_instruction` fields and Dex playbook metadata on providers.

Dex playbook: `rex/docs/suppliers/dexscreener.md`

### Step 6c — Ops payer wallet pool SQL + 3 wallets

1. Run `rex/supabase/migrations/20260807_ops_wallet_pool.sql` in Supabase.
2. Create **3** empty Phantom (or CLI) wallets used only for Helio/Dex pays.
3. Put each secret in Vercel as JSON byte arrays: `MW_OPS_WALLET_1_SECRET`, `MW_OPS_WALLET_2_SECRET`, `MW_OPS_WALLET_3_SECRET`.
4. Register each public key via `POST /api/mw-ops-wallets` `{ "action":"register", "label":"payer-1", "publicKey":"…", "secretEnvKey":"MW_OPS_WALLET_1_SECRET", "priority":1, "opsSecret":"…" }`.
5. Keep ≥3 **active**. If one is blocked, the system fails over and alerts when the pool is low.

### Step 6 — Deploy the smart contract to Devnet (or ask a Solana-savvy friend)
This step needs the Solana developer tools on a computer.

If you are not comfortable:

- Ask a technical friend / contractor: “Deploy `rex-contracts` to Solana **devnet**, send me the new program address.”
- Then put that address into the site config (`REX_MVP_PROGRAM_ID` in env / `chainConfig`) and redeploy.

I could not finish a live **devnet deploy** from this environment (Solana installer missing here).

**Cost:** Devnet ≈ free. Mainnet later = real SOL + audit.

### Step 7 — Whitelist real supplier wallets
1. Decide who gets paid (e.g. DexScreener contact, Telegram pin provider). Get their **Solana wallet address**.
2. An admin runs the on-chain “add whitelist” action for that address (technical step after contract is live).
3. Open your site: **`/ops/providers`**
4. Paste `MW_OPS_SECRET` and click **Activate** on the matching provider once the wallet is no longer `PENDING_WHITELIST`.

Until then, providers stay off — that’s intentional safety.

### Step 8 — Test one fake payment on Devnet
1. Launch or list a test coin on CTOgo (devnet) with marketing vault attached on-chain.
2. Whitelist a test supplier wallet (ops wallet / yourself) on-chain.
3. Fill marketing vault with test SOL.
4. Founder Approves roadmap (with Dex creatives if those items selected).
5. Hit keeper: `GET/POST /api/mw-keeper-tick` with `Authorization: Bearer CRON_SECRET`.
6. Expect on-chain `disburse_marketing` (live PDA client) **or** clear error if project/whitelist PDAs missing.
7. Optional: `MW_DISBURSE_DRY_RUN=1` to derive PDAs without broadcasting.
8. Optional: set `PROTOCOL_TREASURY` if you prefer not to read it from the config account.

### Step 8b — Dex form feed + Helio QR (ops)
1. Approve a Dex roadmap item with title / pitch / 1:1 image (socials optional).
2. Open **`/ops/dex-feed`**, paste ops secret, **Load pending Dex orders**.
3. Use the fill sheet on Dex marketplace (Google signed in) → **Pay with QR**.
4. Paste charge URL + deposit address + amount → **Save capture**.
5. **Dry-run settle** on that page, then **Live settle** only when ready (≈$299 USDC Mainnet).

### Step 8c — Prove automation without buying a Dex ad (free)
1. Local autofill (recommended): `cd rex` → `npm run dex:login` (Google once) → `npm run dex:autofill -- --orderId=… --opsSecret=… --headed --post-capture`
2. Or manual: Dex form → payment → QR capture on `/ops/dex-feed`.
3. Click **Dry-run settle** only (checks deposit; sends **$0**).
4. Abort the Dex checkout — do **not** Live settle unless you want a real ~$299 ad.
5. That is enough to call the auto path “proven.” Optional later: Live settle when you want the ad.

Autofill docs: `rex/scripts/dex-autofill/README.md`  
Playbook: `rex/docs/suppliers/dexscreener.md`

### Step 9 — Before real money (Mainnet)
Do **not** skip these:

1. **Smart contract audit** (paid specialist firm) — budget for this.
2. Switch RPC + program to **mainnet**.
3. Fund keeper with a small mainnet SOL buffer.
4. Sign real supplier agreements / get DexScreener API access if you want auto-fulfilment (optional; manual fulfilment works first).
5. Only then turn on live Approve for real coins.

### Step 10 — Optional polish
- Grant your GitHub token the **workflow** permission if you want the `rex-contracts` CI file pushed.
- Add `DEXSCREENER_API_KEY` later when you have partner access (paid/partner — not free by default).

---

## Money model reminder (locked)

If a supplier charges **$100**:

- Supplier receives **$100**
- CTOgo takes **$20** (20% on top)
- Marketing wallet is debited **$120**

If a coin’s marketing wallet sits idle for **180 days**, leftover SOL can sweep to CTOgo treasury (with warnings at 30 and 7 days). Pause or a queued payment blocks that sweep.

---

## What I still cannot do for you

| Item | Why |
|------|-----|
| Create your Supabase / Vercel / Helius accounts | Needs your login |
| Hold or fund mainnet keys | Real money / security |
| Sign DexScreener or influencer contracts | Legal / business |
| Formal audit | Paid third party |
| Finish live Anchor BPF deploy from this machine | Tooling missing here |

When Step 1–3 are done, tell me and I can help check the APIs are answering correctly.

Full technical notes: [MARKETING_WALLET_PRODUCTION.md](./MARKETING_WALLET_PRODUCTION.md).
