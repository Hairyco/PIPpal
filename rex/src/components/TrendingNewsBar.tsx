import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Flame } from 'lucide-react';
import { TRENDING_NEWS_TAGS, type NewsTagId } from '../data/trendingNews';

type TrendingNewsBarProps = {
  /** Optional active tag highlight when already on /news */
  activeTagId?: NewsTagId | 'all' | null;
  /** Back control — used on /news to return to Trenches */
  showBack?: boolean;
  backTo?: string;
};

const RESUME_MS = 900;
const SPEED_PX = 0.55;

function TagPill({
  tagId,
  label,
  active,
}: {
  tagId: NewsTagId;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={`/news?tag=${encodeURIComponent(tagId)}`}
      className={`inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-[11px] font-semibold transition ${
        active
          ? 'bg-[#c8ff3d]/15 text-[#d5ff69] ring-1 ring-[#c8ff3d]/45'
          : 'bg-[#1c1c1e] text-white/65 ring-1 ring-white/10 hover:text-white'
      }`}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
    >
      {label}
    </Link>
  );
}

export function TrendingNewsBar({
  activeTagId = null,
  showBack = false,
  backTo = '/?tab=trenches',
}: TrendingNewsBarProps) {
  /** Two identical runs for a seamless -50% loop. */
  const marqueeTags = [...TRENDING_NEWS_TAGS, ...TRENDING_NEWS_TAGS];
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let offset = 0;
    let paused = false;
    let frame = 0;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    let dragging = false;
    let dragStartX = 0;
    let dragStartOffset = 0;

    const loopWidth = () => track.scrollWidth / 2;

    const apply = () => {
      const half = loopWidth();
      if (half > 0) {
        offset = ((offset % half) + half) % half;
      }
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };

    const pause = () => {
      paused = true;
      if (resumeTimer) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };

    const resumeSoon = () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
        resumeTimer = null;
      }, RESUME_MS);
    };

    const tick = () => {
      if (!paused) {
        offset += SPEED_PX;
        apply();
      }
      frame = window.requestAnimationFrame(tick);
    };

    const onPointerDown = (event: PointerEvent) => {
      // Only treat primary touch/mouse as a drag pause
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      dragging = true;
      dragStartX = event.clientX;
      dragStartOffset = offset;
      pause();
      viewport.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - dragStartX;
      offset = dragStartOffset - dx;
      apply();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      try {
        viewport.releasePointerCapture?.(event.pointerId);
      } catch {
        // ignore
      }
      resumeSoon();
    };

    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', onPointerUp);
    viewport.addEventListener('pointercancel', onPointerUp);
    viewport.addEventListener('lostpointercapture', onPointerUp);

    frame = window.requestAnimationFrame(tick);
    apply();

    return () => {
      window.cancelAnimationFrame(frame);
      if (resumeTimer) clearTimeout(resumeTimer);
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', onPointerUp);
      viewport.removeEventListener('pointercancel', onPointerUp);
      viewport.removeEventListener('lostpointercapture', onPointerUp);
    };
  }, []);

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 py-2">
      {showBack ? (
        <Link
          to={backTo}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1c1c1e] text-white/70 ring-1 ring-white/10 transition hover:text-white"
          aria-label="Back to Trenches"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
        </Link>
      ) : null}
      <Link
        to="/news"
        className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-[#d5ff69] transition hover:text-white"
      >
        <Flame className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
        Trending News
      </Link>

      <div
        ref={viewportRef}
        className="relative min-w-0 flex-1 touch-pan-x overflow-hidden"
        aria-label="Trending news tags"
        style={{ touchAction: 'pan-x' }}
      >
        <div
          ref={trackRef}
          className="flex w-max items-center gap-1.5 pr-1 will-change-transform"
        >
          {marqueeTags.map((tag, index) => (
            <TagPill
              key={`${tag.id}-${index}`}
              tagId={tag.id}
              label={tag.label}
              active={activeTagId === tag.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
