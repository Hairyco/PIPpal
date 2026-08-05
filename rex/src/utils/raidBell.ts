/** Soft cash-register / bell chime for raid fee credits. Free — Web Audio, no asset. */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  return audioCtx;
}

/** Call from a user gesture (connect / copy / click) so later chimes are allowed. */
export function unlockRaidAudio(): void {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();
}

export function playRaidBell(): void {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();

    const now = ctx.currentTime;

    const ding = (freq: number, start: number, dur: number, gain: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(gain, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    };

    ding(880, now, 0.22, 0.09);
    ding(1174.7, now + 0.08, 0.28, 0.07);
  } catch {
    /* autoplay / unsupported */
  }
}
