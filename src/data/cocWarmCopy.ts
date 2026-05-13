/**
 * Default Change of Circumstances walkthrough copy.
 * Served to /api/generate (coc-walkthrough-copy) to be rewritten in a warmer tone; merged back on success.
 */

export type StepHeaderKey = 's01' | 's02a' | 's02b' | 's03a' | 's03b' | 's04' | 's05' | 's06' | 's07' | 's08' | 's09' | 's10';

export const WHAT_CHANGED_IDS = [
  'increased_pain',
  'worse_fatigue',
  'reduced_mobility',
  'more_falls',
  'increased_anxiety',
  'panic_attacks',
  'need_supervision',
  'need_prompting',
  'new_condition',
  'medication_changes',
] as const;
export type WhatChangedId = (typeof WHAT_CHANGED_IDS)[number];

export const MED_STATUS_IDS = ['diagnosed', 'awaiting_assessment', 'suspected', 'symptoms_only'] as const;
export type MedStatusId = (typeof MED_STATUS_IDS)[number];

export const SYMPTOM_IDS = ['pain', 'exhaustion', 'confusion', 'panic', 'tremors', 'dizziness'] as const;
export type SymptomId = (typeof SYMPTOM_IDS)[number];

export const FLOW_B_AWARD_IDS = [
  'mobility_outdoors',
  'supervision_indoors',
  'prompting_reminders',
  'anxiety_outdoors',
  'physical_help',
  'fatigue_stamina',
  'thinking_memory',
] as const;
export type FlowBAwardId = (typeof FLOW_B_AWARD_IDS)[number];

export const DESCRIPTOR_HARD_IDS = [
  'need_supervision',
  'unsafe_alone',
  'forget_hazards',
  'burns_cuts_risk',
  'exhausted_after',
  'confused_overwhelmed',
  'need_prompting',
  'need_physical_help',
  'pain_stops_me',
  'anxiety_stops_me',
] as const;
export type DescriptorHardId = (typeof DESCRIPTOR_HARD_IDS)[number];

export const RELIABILITY_IDS = ['cannot_safely', 'cannot_repeat', 'takes_longer'] as const;
export type ReliabilityId = (typeof RELIABILITY_IDS)[number];

export const FLOW_B_MED_EXTRA_IDS = ['fluctuates', 'medication_heavy', 'formal_carer', 'family_helps'] as const;
export type FlowBMedExtraId = (typeof FLOW_B_MED_EXTRA_IDS)[number];

export const EVIDENCE_FLOW_A_IDS = [
  'medication_changes_recorded',
  'carer_statements',
  'falls_diary',
  'gp_letters',
  'specialist_referrals',
] as const;
export type EvidenceFlowAId = (typeof EVIDENCE_FLOW_A_IDS)[number];

export const EVIDENCE_FLOW_B_IDS = [
  'gp_records',
  'prescriptions',
  'carer_statements_b',
  'therapy_involvement',
  'physiotherapy_reports',
] as const;
export type EvidenceFlowBId = (typeof EVIDENCE_FLOW_B_IDS)[number];

export const ACCEPTED_UPLOAD_IDS = [
  'award_letter',
  'pa4_report',
  'previous_review_form',
  'decision_notice',
  'assessor_report',
  'screenshots',
] as const;
export type AcceptedUploadId = (typeof ACCEPTED_UPLOAD_IDS)[number];

export type CocWarmCopy = {
  stepHeaders: Record<StepHeaderKey, string>;
  bandLabels: { none: string; standard: string; enhanced: string };
  steps: {
    s01: {
      heroEyebrow: string;
      heroTitle: string;
      heroSubtitle: string;
      uploadTitle: string;
      uploadBody: string;
      acceptedLabel: string;
      acceptedChips: Record<AcceptedUploadId, string>;
      uploadButton: string;
      skipButton: string;
      riskTitle: string;
      riskBody: string;
      adminEyebrow: string;
      adminBody: string;
      adminPreviewUpload: string;
      adminPreviewSkip: string;
    };
    s02a: {
      leadTitle: string;
      leadBody: string;
      analysisLoading: string;
      queuedLabel: string;
      signalsTitle: string;
      signalsBody: string;
      hintNoAnswers: string;
      hintWithAnswers: string;
    };
    s02b: {
      leadTitle: string;
      leadBody: string;
      worthTitle: string;
      worthItems: [string, string, string];
    };
    s03a: {
      leadTitle: string;
      leadBody: string;
      dailyLivingLabel: string;
      mobilityLabel: string;
    };
    s03b: {
      leadTitle: string;
      leadBody: string;
      dailyLivingSection: string;
      mobilitySection: string;
      prevAwardSection: string;
    };
    s04: {
      leadTitle: string;
      leadBody: string;
      pickOneHint: string;
    };
    s05: {
      leadTitle: string;
      leadBody: string;
      statusSection: string;
      symptomSection: string;
      flowBExtraSection: string;
      medicalProfileCta: string;
    };
    s06: {
      leadTitle: string;
      leadBody: string;
      difficultiesLabel: string;
      reliabilityLabel: string;
    };
    s07: {
      leadTitle: string;
      leadBody: string;
    };
    s08: {
      leadTitle: string;
      leadBody: string;
      amberBody: string;
    };
    s09: {
      leadTitle: string;
      leadBodyPaid: string;
      leadBodyFree: string;
      offlineBannerA: string;
      offlineBannerB: string;
      loadingLine: string;
      emptyLine: string;
    };
    s10: {
      leadTitle: string;
      leadBody: string;
      copyButton: string;
      copyButtonDone: string;
      tuneAnswers: string;
      openDownloads: string;
      downloadsLockedNote: string;
      calcTitle: string;
      calcSub: string;
      calcOpen: string;
      assistantLabel: string;
      assistantSublabel: string;
      homeCta: string;
    };
  };
  labels: {
    whatChanged: Record<WhatChangedId, string>;
    medStatus: Record<MedStatusId, string>;
    symptoms: Record<SymptomId, string>;
    flowBAward: Record<FlowBAwardId, string>;
    descriptorHard: Record<DescriptorHardId, string>;
    reliability: Record<ReliabilityId, string>;
    flowBMedExtra: Record<FlowBMedExtraId, string>;
    evidenceA: Record<EvidenceFlowAId, string>;
    evidenceB: Record<EvidenceFlowBId, string>;
  };
};

export const COC_WARM_COPY_CACHE_KEY = 'pippal_coc_warm_copy_v3';
const CACHE_MS = 1000 * 60 * 60 * 6;

export function getDefaultCocWarmCopy(): CocWarmCopy {
  return {
    stepHeaders: {
      s01: 'Let\'s get started',
      s02a: 'Looking at what you\'ve shared',
      s02b: 'No documents — no problem',
      s03a: 'What were you awarded before?',
      s03b: 'Your current award',
      s04: 'What\'s got harder?',
      s05: 'Your health picture',
      s06: 'Which activities are affected?',
      s07: 'Helpful evidence',
      s08: 'One thing to be aware of',
      s09: 'Your draft wording',
      s10: 'You\'re nearly there',
    },
    bandLabels: {
      none: 'No award',
      standard: 'Standard',
      enhanced: 'Enhanced',
    },
    steps: {
      s01: {
        heroEyebrow: 'Change of circumstances',
        heroTitle: 'Report a Change of Circumstances',
        heroSubtitle:
          'Things have got harder and you want DWP to know. We\'ll walk through it together, one step at a time.',
        uploadTitle: 'Got any old PIP paperwork?',
        uploadBody:
          'If you have your previous award letter, assessor\'s report or decision notice, uploading them helps us understand what was accepted before — so we can show clearly what\'s changed. Totally optional.',
        acceptedLabel: 'Things you can upload',
        acceptedChips: {
          award_letter: 'Award letter',
          pa4_report: 'PA4 assessor report',
          previous_review_form: 'Previous review form',
          decision_notice: 'Decision notice',
          assessor_report: 'Assessor report',
          screenshots: 'Screenshots or photos',
        },
        uploadButton: 'Upload my documents',
        skipButton: 'I don\'t have anything to upload',
        riskTitle: 'Something to know before you start',
        riskBody:
          'When you tell DWP things have got worse, they look at your whole award again — not just what\'s changed. For most people the award goes up or stays the same. But it\'s worth knowing it could go down too.',
        adminEyebrow: 'Admin preview',
        adminBody:
          'Skip straight to the flow without uploading. Only you can see this.',
        adminPreviewUpload: 'Preview with uploads →',
        adminPreviewSkip: 'Preview without documents →',
      },
      s02a: {
        leadTitle: 'Thanks — we\'ve got your documents',
        leadBody:
          'We\'ve looked at what you uploaded and picked out which activities are likely to be relevant. Have a look and remove anything that doesn\'t feel right.',
        analysisLoading: 'Reading what you\'ve shared…',
        queuedLabel: 'Files you uploaded',
        signalsTitle: 'Activities that look relevant',
        signalsBody:
          'These are the areas that came up in your paperwork. Tap to deselect anything that doesn\'t apply, or carry on to add more as you go.',
        hintNoAnswers:
          'You haven\'t answered any PIP questions in the app yet, so we\'ve suggested some common areas to start with. You can change these as you go.',
        hintWithAnswers:
          'These match what you\'ve told us before. Tap to adjust — your previous answers are a useful starting point, not a fixed answer.',
      },
      s02b: {
        leadTitle: 'That\'s completely fine',
        leadBody:
          'Lots of people don\'t have their paperwork to hand. We\'ll ask you a few simple questions to build up a picture of where things stand, and you can add documents later if you find them.',
        worthTitle: 'Worth trying to find if you can',
        worthItems: ['PA4 assessor report', 'Award letter', 'Previous review form'],
      },
      s03a: {
        leadTitle: 'What was in your last assessment?',
        leadBody: 'Tap the areas that were included in your previous award. Don\'t worry if you\'re not sure — just go with what feels right.',
        dailyLivingLabel: 'Daily Living',
        mobilityLabel: 'Mobility',
      },
      s03b: {
        leadTitle: 'What are you getting at the moment?',
        leadBody: 'Tap the rate for each part of your award. An estimate is fine if you\'re not sure of the exact figure.',
        dailyLivingSection: 'Daily Living',
        mobilitySection: 'Mobility',
        prevAwardSection: 'What were you awarded for?',
      },
      s04: {
        leadTitle: 'What\'s got harder since your last assessment?',
        leadBody: 'Tap everything that applies. You can change your mind at any point.',
        pickOneHint: 'Tap at least one thing to continue.',
      },
      s05: {
        leadTitle: 'Tell us a bit about your health',
        leadBody:
          'A few quick taps so we understand your situation better. Go with what feels true right now — not what\'s on a letter.',
        statusSection: 'Where things stand medically',
        symptomSection: 'What you deal with day to day',
        flowBExtraSection: 'Support and medication',
        medicalProfileCta: 'Update your medical profile',
      },
      s06: {
        leadTitle: 'Which activities are affected?',
        leadBody:
          'Work through each activity and tap the things that honestly describe what happens. Think about your bad days, not your best ones.',
        difficultiesLabel: 'What makes it hard',
        reliabilityLabel: 'How it affects you overall',
      },
      s07: {
        leadTitle: 'Is there any evidence you could include?',
        leadBody:
          'Evidence isn\'t essential, but it can help. Tick anything you think you could realistically get together.',
      },
      s08: {
        leadTitle: 'One thing worth knowing',
        leadBody:
          'Telling DWP your needs have increased means they\'ll look at your whole award again — and it can go up, stay the same, or in some cases go down.',
        amberBody:
          'Only go ahead if things have genuinely got harder for you. If you\'re unsure, it\'s worth speaking to a benefits adviser first — Citizens Advice can help for free.',
      },
      s09: {
        leadTitle: 'Here\'s your draft',
        leadBodyPaid: 'We\'ve put together some wording based on what you\'ve told us. Read it through, change anything that doesn\'t sound right, and use it as the basis for what you send.',
        leadBodyFree:
          'Here\'s a structured summary of what you\'ve told us. Upgrade to get full personalised wording you can send straight to DWP.',
        offlineBannerA:
          'This is a draft based on your uploads and your answers. Read it carefully and adjust anything before you use it.',
        offlineBannerB:
          'This is a draft based on your answers. Read it carefully and adjust anything before you use it.',
        loadingLine: 'Writing your draft…',
        emptyLine: 'Your draft will appear here.',
      },
      s10: {
        leadTitle: 'You\'re nearly there',
        leadBody: 'Keep a copy of everything you send, and make a note of when you sent it.',
        copyButton: 'Copy to clipboard',
        copyButtonDone: 'Copied',
        tuneAnswers: 'Review your saved answers',
        openDownloads: 'Go to downloads',
        downloadsLockedNote: 'Upgrade to download a PDF version.',
        calcTitle: 'See what your new award could be',
        calcSub: 'Run the numbers before you submit.',
        calcOpen: 'Open →',
        assistantLabel: 'Not sure whether to go ahead?',
        assistantSublabel: 'We can talk it through with you',
        homeCta: 'Back to home',
      },
    },
    labels: {
      whatChanged: {
        increased_pain: 'My pain is worse',
        worse_fatigue: 'I\'m more exhausted',
        reduced_mobility: 'I can\'t get around as well',
        more_falls: 'I\'m having more falls',
        increased_anxiety: 'My anxiety has got worse',
        panic_attacks: 'I\'m having panic attacks',
        need_supervision: 'I now need someone with me',
        need_prompting: 'I need reminding to do things',
        new_condition: 'I have a new condition',
        medication_changes: 'My medication has changed',
      },
      medStatus: {
        diagnosed: 'Formally diagnosed',
        awaiting_assessment: 'Waiting for an assessment',
        suspected: 'Suspected but not confirmed',
        symptoms_only: 'Symptoms but no diagnosis yet',
      },
      symptoms: {
        pain: 'Ongoing pain',
        exhaustion: 'Exhaustion',
        confusion: 'Confusion or brain fog',
        panic: 'Panic or severe anxiety',
        tremors: 'Tremors or shaking',
        dizziness: 'Dizziness',
      },
      flowBAward: {
        mobility_outdoors: 'Getting around outside',
        supervision_indoors: 'Needing someone nearby at home',
        prompting_reminders: 'Needing reminders to do things',
        anxiety_outdoors: 'Anxiety about going out',
        physical_help: 'Needing physical help',
        fatigue_stamina: 'Low energy or stamina',
        thinking_memory: 'Memory and concentration',
      },
      descriptorHard: {
        need_supervision: 'I need someone nearby',
        unsafe_alone: 'I\'m not safe on my own',
        forget_hazards: 'I forget to turn things off',
        burns_cuts_risk: 'Risk of burns or cuts',
        exhausted_after: 'I\'m exhausted afterwards',
        confused_overwhelmed: 'I get confused or overwhelmed',
        need_prompting: 'I need reminding',
        need_physical_help: 'I need physical help',
        pain_stops_me: 'Pain stops me',
        anxiety_stops_me: 'Anxiety stops me',
      },
      reliability: {
        cannot_safely: 'Not safely',
        cannot_repeat: 'Can\'t do it consistently',
        takes_longer: 'Takes much longer than it should',
      },
      flowBMedExtra: {
        fluctuates: 'My condition varies a lot day to day',
        medication_heavy: 'My medication has a big impact on me',
        formal_carer: 'I have a paid carer',
        family_helps: 'Family or friends help me most days',
      },
      evidenceA: {
        medication_changes_recorded: 'Records of medication changes',
        carer_statements: 'Carer\'s statement',
        falls_diary: 'Falls diary or record',
        gp_letters: 'Letter from my GP',
        specialist_referrals: 'Specialist referral letters',
      },
      evidenceB: {
        gp_records: 'GP records or letters',
        prescriptions: 'Prescription history',
        carer_statements_b: 'Carer\'s statement',
        therapy_involvement: 'Therapy records',
        physiotherapy_reports: 'Physiotherapy reports',
      },
    },
  };
}

/** Shallow-merge nested objects for API overlay (best-effort). */
export function mergeCocWarmCopy(base: CocWarmCopy, patch: Partial<unknown>): CocWarmCopy {
  if (!patch || typeof patch !== 'object') return base;
  const p = patch as Record<string, unknown>;
  const out = JSON.parse(JSON.stringify(base)) as CocWarmCopy;

  function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
    for (const k of Object.keys(source)) {
      const sv = source[k];
      if (sv !== null && typeof sv === 'object' && !Array.isArray(sv) && typeof target[k] === 'object' && target[k] !== null && !Array.isArray(target[k])) {
        deepMerge(target[k] as Record<string, unknown>, sv as Record<string, unknown>);
      } else if (typeof sv === 'string' || typeof sv === 'number' || typeof sv === 'boolean') {
        target[k] = sv;
      } else if (Array.isArray(sv) && Array.isArray(target[k]) && sv.length === (target[k] as unknown[]).length) {
        target[k] = sv;
      } else if (sv !== null && typeof sv === 'object' && !Array.isArray(sv) && typeof target[k] === 'object' && target[k] !== null) {
        deepMerge(target[k] as Record<string, unknown>, sv as Record<string, unknown>);
      }
    }
  }

  deepMerge(out as unknown as Record<string, unknown>, p);
  return out;
}

export function readCachedCocWarmCopy(): CocWarmCopy | null {
  try {
    const raw = sessionStorage.getItem(COC_WARM_COPY_CACHE_KEY);
    if (!raw) return null;
    const { ts, copy } = JSON.parse(raw) as { ts: number; copy: CocWarmCopy };
    if (Date.now() - ts > CACHE_MS) return null;
    return copy;
  } catch {
    return null;
  }
}

export function writeCachedCocWarmCopy(copy: CocWarmCopy): void {
  try {
    sessionStorage.setItem(COC_WARM_COPY_CACHE_KEY, JSON.stringify({ ts: Date.now(), copy }));
  } catch {
    /* ignore quota */
  }
}
