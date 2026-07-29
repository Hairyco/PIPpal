/**
 * Due diligence: socials / external websites must reference the same mint
 * that is traded on CTOgo. Live page/X scraping needs a backend later;
 * client checks URL + pasted page text for mint presence / mismatch.
 */

const BASE58_MINT = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;

export type DiligenceChannel = 'x' | 'website' | 'telegram' | 'discord';

export type DiligenceResult = {
  channel: DiligenceChannel;
  status: 'matched' | 'mismatch' | 'not_found' | 'empty';
  foundMints: string[];
  detail: string;
};

export function normalizeMint(mint: string): string {
  return mint.trim();
}

export function extractCandidateMints(text: string): string[] {
  const hits = text.match(BASE58_MINT) ?? [];
  return [...new Set(hits)];
}

export function mintInText(mint: string, text: string): boolean {
  const m = normalizeMint(mint);
  if (m.length < 32) return false;
  return text.toLowerCase().includes(m.toLowerCase());
}

/** Compare any found mints to the CA traded on CTOgo. */
export function classifyAgainstTraded(
  foundMints: string[],
  tradedMint: string,
): DiligenceResult['status'] {
  const traded = normalizeMint(tradedMint);
  if (!traded) return 'empty';
  if (foundMints.length === 0) return 'not_found';
  if (foundMints.some((m) => m === traded || m.toLowerCase() === traded.toLowerCase())) {
    return 'matched';
  }
  return 'mismatch';
}

export function checkUrlForMint(
  channel: DiligenceChannel,
  url: string,
  tradedMint: string,
): DiligenceResult {
  const trimmed = url.trim();
  if (!trimmed) {
    return {
      channel,
      status: 'empty',
      foundMints: [],
      detail: 'No URL set.',
    };
  }

  const foundMints = extractCandidateMints(trimmed);
  const status = classifyAgainstTraded(foundMints, tradedMint);

  if (status === 'matched') {
    return {
      channel,
      status,
      foundMints,
      detail: 'CTOgo contract appears in this URL.',
    };
  }
  if (status === 'mismatch') {
    return {
      channel,
      status,
      foundMints,
      detail: `Different contract in URL — must match CTOgo mint ${shortMint(tradedMint)}.`,
    };
  }
  return {
    channel,
    status: 'not_found',
    foundMints: [],
    detail:
      channel === 'website'
        ? 'No contract in URL. Paste page text below or ensure the live site shows the CTOgo CA.'
        : 'No contract in this link. Bio / pinned post must show the exact CTOgo CA.',
  };
}

/** Scan free text (pasted bio, homepage HTML snippet, etc.). */
export function checkTextForMint(
  channel: DiligenceChannel,
  text: string,
  tradedMint: string,
): DiligenceResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      channel,
      status: 'empty',
      foundMints: [],
      detail: 'Nothing to scan.',
    };
  }
  const foundMints = extractCandidateMints(trimmed);
  const status = classifyAgainstTraded(foundMints, tradedMint);
  if (status === 'matched') {
    return {
      channel,
      status,
      foundMints,
      detail: 'Matches the contract traded on CTOgo.',
    };
  }
  if (status === 'mismatch') {
    return {
      channel,
      status,
      foundMints,
      detail: `Found other mint(s). Must equal CTOgo ${shortMint(tradedMint)}.`,
    };
  }
  return {
    channel,
    status: 'not_found',
    foundMints: [],
    detail: 'No Solana-style contract found in the pasted text.',
  };
}

export function shortMint(mint: string): string {
  const m = normalizeMint(mint);
  if (m.length < 10) return m || '—';
  return `${m.slice(0, 4)}…${m.slice(-4)}`;
}

export const DILIGENCE_CHECKLIST = [
  'X profile bio or pinned post shows the exact CTOgo contract',
  'Independent website displays the same contract as CTOgo trading',
  'No other mint is promoted as the live token',
] as const;
