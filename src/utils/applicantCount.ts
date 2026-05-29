/** Landing hero social proof — starts at 1,011 and ticks up by 3 each calendar day. */
const APPLICANT_COUNT_BASE = 1011;
const APPLICANT_COUNT_DAILY_INCREMENT = 3;
/** First calendar day the counter shows the base value (local time). */
const APPLICANT_COUNT_EPOCH = { year: 2026, month: 4, day: 29 };

function startOfLocalDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function getApplicantCount(now = new Date()): number {
  const epochMs = new Date(
    APPLICANT_COUNT_EPOCH.year,
    APPLICANT_COUNT_EPOCH.month,
    APPLICANT_COUNT_EPOCH.day,
  ).getTime();
  const days = Math.max(0, Math.floor((startOfLocalDay(now) - epochMs) / 86_400_000));
  return APPLICANT_COUNT_BASE + days * APPLICANT_COUNT_DAILY_INCREMENT;
}

export function formatApplicantCount(count: number): string {
  return count.toLocaleString('en-GB');
}
