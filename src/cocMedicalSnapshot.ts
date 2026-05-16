/** Snapshot written before Medical Profile from Change of Circumstances — consumed on save */

export const COC_POST_MEDICAL_SNAPSHOT_KEY = 'coc_post_medical_snapshot';
export const COC_MEDICAL_EXPECTED_KEY = 'coc_medical_expected';

/** Persists CoC wizard step (1–4) — see ChangeOfCircumstancesScreen */
export const COC_FLOW_STEP_KEY = 'coc_flow_step';
/** Step 1: whether user still has their completed PIP2 copy */
export const COC_HAS_ORIGINAL_PIP2_KEY = 'coc_has_original_pip2';
export const COC_RETURN_STEP_KEY = 'coc_return_step';

export const COC_WIZARD_TOTAL_STEPS = 4;

/** Remove wizard / handoff keys after CoC successfully hands off to the question hub (or explicit reset). */
export function clearCocWizardSessionKeys(): void {
  try {
    sessionStorage.removeItem(COC_FLOW_STEP_KEY);
    sessionStorage.removeItem(COC_RETURN_STEP_KEY);
    sessionStorage.removeItem(COC_HAS_ORIGINAL_PIP2_KEY);
    sessionStorage.removeItem(COC_POST_MEDICAL_SNAPSHOT_KEY);
    sessionStorage.removeItem(COC_MEDICAL_EXPECTED_KEY);
  } catch {
    /* ignore */
  }
}

function parseStoredCocFlowStep(raw: string | null): number {
  if (!raw) return 1;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return Math.min(n, COC_WIZARD_TOTAL_STEPS);
}

/**
 * Dashboard “resume CoC” detection (sessionStorage).
 *
 * Resumable when:
 * - Medical handoff is pending: COC_MEDICAL_EXPECTED_KEY + a JSON snapshot (user left on / before medical save).
 * - Wizard steps 2–3: uploads or per-activity checklist.
 * - Step 1 only if they committed the PIP2 question (coc_has_original_pip2 true/false) — bare step 1 with no key is treated as not started.
 *
 * Not resumable:
 * - Step 4 with no medical expected: snapshot was consumed finishing to questions, or keys are stale (avoids false “continue” after completion).
 */
export function getCocDashboardResumeInfo(): { title: string; subtitle: string } | null {
  try {
    const medicalExpected = sessionStorage.getItem(COC_MEDICAL_EXPECTED_KEY) === '1';
    const rawSnap = sessionStorage.getItem(COC_POST_MEDICAL_SNAPSHOT_KEY);
    const hasSnapshot = Boolean(rawSnap && rawSnap.trim().startsWith('{'));

    const step = parseStoredCocFlowStep(sessionStorage.getItem(COC_FLOW_STEP_KEY));
    const step1Committed =
      sessionStorage.getItem(COC_HAS_ORIGINAL_PIP2_KEY) === 'true' ||
      sessionStorage.getItem(COC_HAS_ORIGINAL_PIP2_KEY) === 'false';

    if (medicalExpected && hasSnapshot) {
      return {
        title: 'Continue change of circumstances',
        subtitle: 'Finish medical profile to continue your review.',
      };
    }

    if (step >= 4 && !medicalExpected) {
      return null;
    }

    if (step >= 2) {
      return {
        title: 'Continue change of circumstances',
        subtitle: `Step ${step} of ${COC_WIZARD_TOTAL_STEPS} · documents & activity review`,
      };
    }

    if (step === 1 && step1Committed) {
      return {
        title: 'Continue change of circumstances',
        subtitle: `Step 1 of ${COC_WIZARD_TOTAL_STEPS}`,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export type CocSnapshotExtractedEntry = {
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  pointsAwarded?: number | null;
};

export type CocMedicalSnapshot = {
  formType: 'pip2' | 'ar1' | null;
  hasPip2: boolean;
  hasPa4: boolean;
  hasAward: boolean;
  pip2Extracted: Record<string, CocSnapshotExtractedEntry>;
  pa4Extracted: Record<string, CocSnapshotExtractedEntry>;
  awardExtracted: Record<string, CocSnapshotExtractedEntry>;
  /** Saved new-claim workbook answers from PIPpal — used when claimant has no copy of their PIP2 */
  platformWorkbookAnswers?: Record<string, string>;
  activityFallbackNotes: Record<string, string>;
  cocManualPoints: Record<string, string>;
};

const ALL_ACTIVITY_IDS = [
  'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10',
  'q11', 'q12',
];

function normalizeActivityPoints(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n)) return null;
  return Math.round(Math.max(0, Math.min(12, n)));
}

function mergeCocPreviousPoints(
  pip2: Record<string, CocSnapshotExtractedEntry>,
  pa4: Record<string, CocSnapshotExtractedEntry>,
  award: Record<string, CocSnapshotExtractedEntry>,
  manualRaw: Record<string, string>,
): Record<string, number | null> {
  const merged: Record<string, number | null> = {};
  for (const id of ALL_ACTIVITY_IDS) {
    const typed = manualRaw[id]?.trim();
    if (typed) {
      const m = normalizeActivityPoints(typed);
      if (m != null) {
        merged[id] = m;
        continue;
      }
    }
    const fromAward = normalizeActivityPoints(award[id]?.pointsAwarded);
    if (fromAward != null) {
      merged[id] = fromAward;
      continue;
    }
    const fromP2 = normalizeActivityPoints(pip2[id]?.pointsAwarded);
    if (fromP2 != null) {
      merged[id] = fromP2;
      continue;
    }
    merged[id] = normalizeActivityPoints(pa4[id]?.pointsAwarded);
  }
  return merged;
}

export function computeCocSessionFromSnapshot(s: CocMedicalSnapshot): {
  derivedDocType: 'pip2_only' | 'pa4_only' | 'both' | 'award_only';
  primary: Record<string, string>;
  pa4Answers: Record<string, string>;
  cocPreviousPoints: Record<string, number | null>;
} {
  const {
    hasPip2,
    hasPa4,
    hasAward,
    pip2Extracted,
    pa4Extracted,
    awardExtracted,
    platformWorkbookAnswers,
    activityFallbackNotes,
    cocManualPoints,
  } = s;

  let derivedDocType: 'pip2_only' | 'pa4_only' | 'both' | 'award_only';
  if (hasPip2 && hasPa4) derivedDocType = 'both';
  else if (hasPa4) derivedDocType = 'pa4_only';
  else if (hasAward && !hasPip2 && !hasPa4) derivedDocType = 'award_only';
  else derivedDocType = 'pip2_only';

  const pip2Answers: Record<string, string> = {};
  for (const [k, v] of Object.entries(pip2Extracted)) pip2Answers[k] = v.answer ?? '';

  const pa4Answers: Record<string, string> = {};
  for (const [k, v] of Object.entries(pa4Extracted)) pa4Answers[k] = v.answer ?? '';

  const awardAnswers: Record<string, string> = {};
  for (const [k, v] of Object.entries(awardExtracted)) awardAnswers[k] = v.answer ?? '';

  const primary = { ...pa4Answers };
  for (const [k, v] of Object.entries(pip2Answers)) {
    if (v) primary[k] = v;
  }

  for (const id of ALL_ACTIVITY_IDS) {
    if (primary[id]?.trim()) continue;
    const fromAward = awardAnswers[id]?.trim();
    if (fromAward) primary[id] = fromAward;
  }

  const workbook = platformWorkbookAnswers ?? {};
  for (const id of ALL_ACTIVITY_IDS) {
    if (primary[id]?.trim()) continue;
    const w = workbook[id]?.trim();
    if (w) primary[id] = w;
  }

  for (const [k, v] of Object.entries(activityFallbackNotes)) {
    const t = v?.trim();
    if (t) primary[k] = t;
  }

  return {
    derivedDocType,
    primary,
    pa4Answers,
    cocPreviousPoints: mergeCocPreviousPoints(pip2Extracted, pa4Extracted, awardExtracted, cocManualPoints),
  };
}
