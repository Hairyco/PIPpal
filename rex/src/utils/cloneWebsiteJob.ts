/** Background website-clone job — survives route changes within the SPA. */

export type CloneJobStatus = 'idle' | 'cloning' | 'ready' | 'failed';

export type CloneWebsiteJob = {
  status: CloneJobStatus;
  progress: number;
  statusLabel: string;
  sourceUrl: string;
  sourceTicker?: string;
  sourceName?: string;
  sourceLogo?: string;
  startedAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'ctogo-clone-website-job';

type Listener = (job: CloneWebsiteJob | null) => void;

const listeners = new Set<Listener>();
let job: CloneWebsiteJob | null = loadFromStorage();
let tickTimer: ReturnType<typeof setInterval> | null = null;

const STAGES = [
  { pct: 12, label: 'Fetching page…' },
  { pct: 28, label: 'Cloning layout…' },
  { pct: 46, label: 'Mirroring assets…' },
  { pct: 64, label: 'Applying brand…' },
  { pct: 82, label: 'Building preview…' },
  { pct: 100, label: 'Clone ready' },
] as const;

const STAGE_MS = 1100;

function loadFromStorage(): CloneWebsiteJob | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CloneWebsiteJob>;
    if (!parsed.status || parsed.status === 'idle') return null;
    return {
      status: parsed.status,
      progress: typeof parsed.progress === 'number' ? parsed.progress : 0,
      statusLabel: parsed.statusLabel ?? '',
      sourceUrl: parsed.sourceUrl ?? '',
      sourceTicker: parsed.sourceTicker,
      sourceName: parsed.sourceName,
      sourceLogo: parsed.sourceLogo,
      startedAt: parsed.startedAt ?? new Date().toISOString(),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function persist(next: CloneWebsiteJob | null) {
  job = next;
  try {
    if (!next || next.status === 'idle') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    // ignore quota
  }
  listeners.forEach((l) => l(job));
}

function stopTimer() {
  if (tickTimer != null) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

function advanceFrom(progress: number): { pct: number; label: string } | null {
  const next = STAGES.find((s) => s.pct > progress);
  return next ?? null;
}

function runTicks() {
  stopTimer();
  if (!job || job.status !== 'cloning') return;

  tickTimer = setInterval(() => {
    if (!job || job.status !== 'cloning') {
      stopTimer();
      return;
    }
    const next = advanceFrom(job.progress);
    if (!next) {
      stopTimer();
      persist({
        ...job,
        status: 'ready',
        progress: 100,
        statusLabel: 'Clone ready',
        updatedAt: new Date().toISOString(),
      });
      return;
    }
    const done = next.pct >= 100;
    persist({
      ...job,
      status: done ? 'ready' : 'cloning',
      progress: next.pct,
      statusLabel: next.label,
      updatedAt: new Date().toISOString(),
    });
    if (done) stopTimer();
  }, STAGE_MS);
}

/** Resume an in-flight job after refresh / remount. */
export function resumeCloneWebsiteJob(): void {
  if (!job) job = loadFromStorage();
  if (job?.status === 'cloning') runTicks();
}

export function getCloneWebsiteJob(): CloneWebsiteJob | null {
  return job;
}

export function subscribeCloneWebsiteJob(listener: Listener): () => void {
  listeners.add(listener);
  listener(job);
  return () => {
    listeners.delete(listener);
  };
}

export function startCloneWebsiteJob(input: {
  sourceUrl: string;
  sourceTicker?: string;
  sourceName?: string;
  sourceLogo?: string;
}): void {
  const url = input.sourceUrl.trim();
  if (!url) return;
  stopTimer();
  persist({
    status: 'cloning',
    progress: 0,
    statusLabel: 'Starting clone…',
    sourceUrl: url,
    sourceTicker: input.sourceTicker,
    sourceName: input.sourceName,
    sourceLogo: input.sourceLogo,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  // Kick first stage immediately so the bar moves right away
  window.setTimeout(() => {
    if (!job || job.status !== 'cloning') return;
    const first = STAGES[0];
    persist({
      ...job,
      progress: first.pct,
      statusLabel: first.label,
      updatedAt: new Date().toISOString(),
    });
    runTicks();
  }, 120);
}

export function clearCloneWebsiteJob(): void {
  stopTimer();
  persist(null);
}

export function markCloneWebsiteReady(): void {
  if (!job) return;
  stopTimer();
  persist({
    ...job,
    status: 'ready',
    progress: 100,
    statusLabel: 'Clone ready',
    updatedAt: new Date().toISOString(),
  });
}

resumeCloneWebsiteJob();
