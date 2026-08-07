import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Upload, X } from 'lucide-react';
import { AppShell } from '../components/AppSidebar';
import {
  DEX_FAMILIES,
  formatDexPackPrice,
  getDexFamily,
  getDexPack,
  removeSelectedDexPack,
  upsertSelectedDexPack,
  type DexFamilyId,
  type SelectedDexPack,
} from '../data/dexProductCatalog';
import {
  DEX_HEADER_IMAGE_SPEC,
  DEX_ICON_IMAGE_SPEC,
  DEX_SQUARE_IMAGE_SPEC,
  EMPTY_DEX_AD_PACK,
  normalizeDexAdPack,
  socialsUpdatePackReady,
  tokenAdPackReady,
  tokenInfoPackReady,
  trendingBarPackReady,
  type DexAdPackAssets,
} from '../data/dexscreenerAdPack';
import { hasFounderProject, loadFounderProject, saveFounderProject } from '../utils/founderProject';
import { readImageFile } from '../utils/projectImageGenerate';

type Step = 'family' | 'pack' | 'creatives';

const inputClass =
  'mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white placeholder:text-white/30 focus:border-[#c8ff3d]/40 focus:outline-none';

function loadSelectedPacks(): SelectedDexPack[] {
  const project = loadFounderProject();
  const raw = project?.selectedDexPacks;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p) => {
      const pack = getDexPack(p.offerKey);
      if (!pack) return null;
      return { offerKey: pack.offerKey, family: pack.family } as SelectedDexPack;
    })
    .filter(Boolean) as SelectedDexPack[];
}

function persistPacks(packs: SelectedDexPack[], dexAdPack?: DexAdPackAssets) {
  const project = loadFounderProject();
  if (!project) {
    // Allow browsing without a project — stash in a lightweight key
    try {
      localStorage.setItem('ctogo-selected-dex-packs', JSON.stringify(packs));
      if (dexAdPack) {
        localStorage.setItem('ctogo-dex-ad-pack', JSON.stringify(dexAdPack));
      }
    } catch {
      /* ignore */
    }
    return;
  }
  saveFounderProject({
    ...project,
    selectedDexPacks: packs,
    ...(dexAdPack ? { dexAdPack } : {}),
  });
}

function loadDexPackAssets(): DexAdPackAssets {
  const project = loadFounderProject();
  if (project?.dexAdPack) return normalizeDexAdPack(project.dexAdPack);
  try {
    const raw = localStorage.getItem('ctogo-dex-ad-pack');
    if (raw) return normalizeDexAdPack(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return { ...EMPTY_DEX_AD_PACK };
}

export function DexAdsPage() {
  const [step, setStep] = useState<Step>('family');
  const [familyId, setFamilyId] = useState<DexFamilyId | null>(null);
  const [packKey, setPackKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedDexPack[]>(() => {
    const fromProject = loadSelectedPacks();
    if (fromProject.length) return fromProject;
    try {
      const raw = localStorage.getItem('ctogo-selected-dex-packs');
      if (raw) {
        const parsed = JSON.parse(raw) as SelectedDexPack[];
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      /* ignore */
    }
    return [];
  });
  const [pack, setPack] = useState<DexAdPackAssets>(() => loadDexPackAssets());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const squareRef = useRef<HTMLInputElement>(null);
  const etiIconRef = useRef<HTMLInputElement>(null);
  const etiHeaderRef = useRef<HTMLInputElement>(null);

  const family = familyId ? getDexFamily(familyId) : null;
  const chosenPack = packKey ? getDexPack(packKey) : null;

  const collateralReady = useMemo(() => {
    if (!family) return false;
    switch (family.collateral) {
      case 'mint':
        return true;
      case 'token-ad':
        return tokenAdPackReady(pack);
      case 'trending':
        return trendingBarPackReady(pack);
      case 'token-info':
        return tokenInfoPackReady(pack);
      case 'socials':
        return socialsUpdatePackReady(pack);
      default:
        return false;
    }
  }, [family, pack]);

  const patchPack = (partial: Partial<DexAdPackAssets>) => {
    setPack((prev) => {
      const next = { ...prev, ...partial };
      persistPacks(selected, next);
      return next;
    });
  };

  const selectFamily = (id: DexFamilyId) => {
    setFamilyId(id);
    const existing = selected.find((s) => s.family === id);
    setPackKey(existing?.offerKey || getDexFamily(id)?.packs[0]?.offerKey || null);
    setStep('pack');
    setError(null);
  };

  const goCreatives = () => {
    if (!packKey || !family) return;
    setStep('creatives');
    setError(null);
  };

  const addToPlan = () => {
    if (!packKey || !family) return;
    if (!collateralReady) {
      setError('Complete required collateral before adding this pack.');
      return;
    }
    const next = upsertSelectedDexPack(selected, {
      offerKey: packKey,
      family: family.id,
    });
    setSelected(next);
    persistPacks(next, pack);
    setNotice(`Added ${getDexPack(packKey)?.label || packKey} to your spend plan.`);
    setStep('family');
    setFamilyId(null);
    setPackKey(null);
    window.setTimeout(() => setNotice(null), 4000);
  };

  const removePack = (offerKey: string) => {
    const next = removeSelectedDexPack(selected, offerKey);
    setSelected(next);
    persistPacks(next, pack);
  };

  const upload = async (
    file: File,
    field: 'squareImageUrl' | 'etiIconUrl' | 'etiHeaderUrl',
  ) => {
    setError(null);
    try {
      patchPack({ [field]: await readImageFile(file) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-black text-[#f5f7fb]">
        <header className="border-b border-white/[0.07] bg-black">
          <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-3 pr-14 sm:px-4 sm:pr-16">
            <Link
              to="/"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-1 py-1.5 text-sm text-white/55 transition hover:bg-white/[0.04] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-base font-bold">Dex Ads</p>
              <p className="truncate text-[10px] text-white/40">
                Pick product → pack → creatives
              </p>
            </div>
            <Link
              to={hasFounderProject() ? '/launch?dashboard=1' : '/dashboard'}
              className="shrink-0 text-sm text-[#c8ff3d] hover:text-[#d5ff69]"
            >
              Dashboard
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:py-8">
          <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-[12px] leading-relaxed text-white/55">
            <span className="font-semibold text-white/80">Founder owns Dex.</span> Polessia
            only pays Marketplace / Boosts as buyer. We never claim your token profile with
            our Google. You keep login for banners and later socials edits.
          </p>

          {notice ? (
            <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-200">
              {notice}
            </p>
          ) : null}

          {/* Selected packs summary */}
          <section className="space-y-2 rounded-xl border border-[#c8ff3d]/20 bg-[#c8ff3d]/[0.04] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">Your spend plan</p>
              <span className="text-[11px] text-white/40">{selected.length} pack(s)</span>
            </div>
            {selected.length === 0 ? (
              <p className="text-[12px] text-white/45">
                No Dex packs yet — choose a product below.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {selected.map((s) => {
                  const p = getDexPack(s.offerKey);
                  return (
                    <li
                      key={s.offerKey}
                      className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-white">
                          {p?.label || s.offerKey}
                        </p>
                        <p className="text-[11px] text-white/40">
                          {getDexFamily(s.family)?.name} · {formatDexPackPrice(p?.priceUsd || 0)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePack(s.offerKey)}
                        className="rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white"
                        aria-label="Remove pack"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              to="/launch?dashboard=1"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#c8ff3d] hover:text-[#d5ff69]"
            >
              Approve on roadmap
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>

          {/* Step: family */}
          {step === 'family' ? (
            <section className="space-y-3">
              <p className="text-sm font-semibold text-white">1. Choose a product</p>
              <div className="grid gap-2">
                {DEX_FAMILIES.map((f) => {
                  const active = selected.some((s) => s.family === f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => selectFamily(f.id)}
                      className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-left transition hover:border-[#c8ff3d]/30 hover:bg-[#c8ff3d]/[0.04]"
                    >
                      <img
                        src="/images/partners/dexscreener.ico"
                        alt=""
                        className="mt-0.5 h-5 w-5 rounded object-contain"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-semibold text-white">{f.name}</p>
                          {active ? (
                            <span className="rounded bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
                              In plan
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-[12px] text-white/50">{f.summary}</p>
                        <p className="mt-1 text-[11px] text-white/35">
                          From {formatDexPackPrice(f.packs[0]?.priceUsd || 0)} ·{' '}
                          {f.packs.length} option{f.packs.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/30" />
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* Step: pack */}
          {step === 'pack' && family ? (
            <section className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setStep('family');
                  setFamilyId(null);
                }}
                className="inline-flex items-center gap-1 text-[12px] text-white/50 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All products
              </button>
              <p className="text-sm font-semibold text-white">2. {family.name} — pick exact pack</p>
              <p className="text-[12px] text-white/45">{family.summary}</p>
              <div className="space-y-2">
                {family.packs.map((p) => {
                  const on = packKey === p.offerKey;
                  return (
                    <button
                      key={p.offerKey}
                      type="button"
                      onClick={() => setPackKey(p.offerKey)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                        on
                          ? 'border-[#c8ff3d]/50 bg-[#c8ff3d]/[0.08]'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          on ? 'border-[#c8ff3d] bg-[#c8ff3d]' : 'border-white/25'
                        }`}
                      >
                        {on ? <Check className="h-3 w-3 text-[#090b14]" /> : null}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-white">{p.label}</p>
                        <p className="text-[11px] text-white/40">{p.detail}</p>
                      </div>
                      <p className="shrink-0 text-[14px] font-bold tabular-nums text-[#d5ff69]">
                        {formatDexPackPrice(p.priceUsd)}
                      </p>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                disabled={!packKey}
                onClick={goCreatives}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#c8ff3d] text-[14px] font-bold text-[#090b14] disabled:opacity-40"
              >
                Continue to creatives
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </section>
          ) : null}

          {/* Step: creatives */}
          {step === 'creatives' && family && chosenPack ? (
            <section className="space-y-3">
              <button
                type="button"
                onClick={() => setStep('pack')}
                className="inline-flex items-center gap-1 text-[12px] text-white/50 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Change pack
              </button>
              <div>
                <p className="text-sm font-semibold text-white">
                  3. Creatives · {chosenPack.label}
                </p>
                <p className="mt-0.5 text-[12px] text-white/45">
                  {formatDexPackPrice(chosenPack.priceUsd)} · {family.name}
                </p>
              </div>

              {family.collateral === 'mint' ? (
                <p className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-[12px] text-white/60">
                  No creatives for Boosts. Polessia buys from your pair page after Approve (mint
                  required).
                </p>
              ) : null}

              {family.collateral === 'token-ad' || family.collateral === 'trending' ? (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-white/50">
                    Ad title * <span className="text-white/30">{pack.adTitle.length}/50</span>
                    <input
                      type="text"
                      maxLength={50}
                      value={pack.adTitle}
                      onChange={(e) => patchPack({ adTitle: e.target.value })}
                      className={inputClass}
                      placeholder="Short title for the Dex ad"
                    />
                  </label>
                  {family.collateral === 'token-ad' ? (
                    <label className="block text-xs font-medium text-white/50">
                      Ad pitch * <span className="text-white/30">{pack.adPitch.length}/120</span>
                      <textarea
                        maxLength={120}
                        rows={3}
                        value={pack.adPitch}
                        onChange={(e) => patchPack({ adPitch: e.target.value })}
                        className={inputClass}
                        placeholder="Short description to get people interested"
                      />
                    </label>
                  ) : (
                    <p className="text-[11px] text-white/40">
                      Trending Bar uses title + square only (no pitch).
                    </p>
                  )}
                  <div>
                    <p className="text-xs font-medium text-white/50">Square image * (1:1)</p>
                    <p className="text-[10px] text-white/35">{DEX_SQUARE_IMAGE_SPEC.label}</p>
                    {pack.squareImageUrl ? (
                      <div className="relative mt-2 aspect-square max-w-[8rem] overflow-hidden rounded-md border border-white/10">
                        <img src={pack.squareImageUrl} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => patchPack({ squareImageUrl: null })}
                          className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => squareRef.current?.click()}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/15 px-3 py-2 text-xs text-white/70"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Upload square
                      </button>
                    )}
                    <input
                      ref={squareRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void upload(file, 'squareImageUrl');
                        e.target.value = '';
                      }}
                    />
                  </div>
                  {family.collateral === 'token-ad' ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(
                        [
                          ['websiteUrl', 'Website (optional)'],
                          ['xUrl', 'X (optional)'],
                          ['telegramUrl', 'Telegram (optional)'],
                          ['discordUrl', 'Discord (optional)'],
                        ] as const
                      ).map(([key, label]) => (
                        <label key={key} className="block text-xs font-medium text-white/45">
                          {label}
                          <input
                            type="url"
                            value={pack[key]}
                            onChange={(e) => patchPack({ [key]: e.target.value })}
                            className={inputClass}
                            placeholder="https://"
                          />
                        </label>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {family.collateral === 'token-info' ? (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-white/50">
                    Description *
                    <textarea
                      rows={3}
                      value={pack.etiDescription}
                      onChange={(e) => patchPack({ etiDescription: e.target.value })}
                      className={inputClass}
                      placeholder="Plain text for the Dex pair page"
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-white/50">Icon * (1:1)</p>
                      <p className="text-[10px] text-white/35">{DEX_ICON_IMAGE_SPEC.label}</p>
                      {pack.etiIconUrl ? (
                        <div className="relative mt-2 aspect-square max-w-[6rem] overflow-hidden rounded-md border border-white/10">
                          <img src={pack.etiIconUrl} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => patchPack({ etiIconUrl: null })}
                            className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => etiIconRef.current?.click()}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/15 px-3 py-2 text-xs text-white/70"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Upload icon
                        </button>
                      )}
                      <input
                        ref={etiIconRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void upload(file, 'etiIconUrl');
                          e.target.value = '';
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/50">Header * (3:1)</p>
                      <p className="text-[10px] text-white/35">{DEX_HEADER_IMAGE_SPEC.label}</p>
                      {pack.etiHeaderUrl ? (
                        <div className="relative mt-2 aspect-[3/1] overflow-hidden rounded-md border border-white/10">
                          <img src={pack.etiHeaderUrl} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => patchPack({ etiHeaderUrl: null })}
                            className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => etiHeaderRef.current?.click()}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/15 px-3 py-2 text-xs text-white/70"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Upload header
                        </button>
                      )}
                      <input
                        ref={etiHeaderRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void upload(file, 'etiHeaderUrl');
                          e.target.value = '';
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {family.collateral === 'socials' ? (
                <div className="space-y-3">
                  <p className="text-[12px] text-white/50">
                    At least one link required. Prefer submitting with <strong className="text-white/70">your</strong> Dex
                    login so you keep control of later edits.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(
                      [
                        ['websiteUrl', 'Website'],
                        ['xUrl', 'X / Twitter'],
                        ['telegramUrl', 'Telegram'],
                        ['discordUrl', 'Discord'],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="block text-xs font-medium text-white/45">
                        {label}
                        <input
                          type="url"
                          value={pack[key]}
                          onChange={(e) => patchPack({ [key]: e.target.value })}
                          className={inputClass}
                          placeholder="https://"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {error ? <p className="text-xs text-rose-400">{error}</p> : null}

              <button
                type="button"
                onClick={addToPlan}
                disabled={!collateralReady}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#c8ff3d] text-[14px] font-bold text-[#090b14] disabled:opacity-40"
              >
                Add to spend plan
              </button>
            </section>
          ) : null}
        </main>
      </div>
    </AppShell>
  );
}
