import React, { useEffect, useState } from 'react';
import { MessageSquare, HeartHandshake, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface ChatPreviewProps {
  /** When nested inside another padded section (e.g. What is PIP), skip outer horizontal padding */
  embedded?: boolean;
}

interface CarouselSlide {
  src: string;
  headerLabel: string;
  caption: string;
  imageFit: 'cover' | 'contain';
  panScreenshot: boolean;
  /** Extra image height + travel so tall full-page shots scroll meaningfully */
  panDepth?: 'deep';
}

const SLIDES: CarouselSlide[] = [
  {
    src: '/marketing/home-screen.png',
    headerLabel: 'Home',
    caption: 'Home',
    imageFit: 'cover',
    panScreenshot: true,
  },
  {
    src: '/marketing/medical-profile-screen.png',
    headerLabel: 'Medical Profile',
    caption: 'Conditions, meds & notes',
    imageFit: 'cover',
    panScreenshot: true,
  },
  {
    src: '/marketing/answers-prep-screen.png',
    headerLabel: 'Your answers',
    caption: 'Your answers prep',
    imageFit: 'cover',
    panScreenshot: true,
  },
  {
    src: '/marketing/draft-answer-screen.png',
    headerLabel: 'Draft answer',
    caption: 'Draft answer',
    imageFit: 'cover',
    panScreenshot: true,
  },
  {
    src: '/marketing/pip-diary-screen.png',
    headerLabel: 'PIP Diary',
    caption: 'Weekly diary evidence',
    imageFit: 'cover',
    panScreenshot: true,
  },
  {
    src: '/marketing/coc-pip2-pa4-screen.png',
    headerLabel: 'CoC walkthrough',
    caption: 'Your answer, PA4 assessor notes & example',
    imageFit: 'cover',
    panScreenshot: true,
    panDepth: 'deep',
  },
];

export function ChatPreview({ embedded }: ChatPreviewProps) {
  const [index, setIndex] = useState(0);
  const [manualNav, setManualNav] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || manualNav) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [reduceMotion, manualNav]);

  const slide = SLIDES[index];

  const deepPan = slide.panDepth === 'deep';
  const panMinHClass = slide.panScreenshot ? (deepPan ? 'min-h-[175%]' : 'min-h-[112%]') : '';

  const imageClassName =
    slide.imageFit === 'contain'
      ? 'w-full h-full max-h-full object-contain object-top select-none pointer-events-none block'
      : slide.panScreenshot
        ? `${panMinHClass} w-full object-cover object-top select-none pointer-events-none block`
        : 'w-full h-full object-cover object-top select-none pointer-events-none block';

  const slidePanMotion = slide.panScreenshot && !reduceMotion;
  const panYKeyframes = deepPan ? [0, -110, 0] : [0, -36, 0];
  const panDurationSec = deepPan ? 22 : 14;

  const go = (direction: -1 | 1) => {
    setManualNav(true);
    setIndex((i) => (i + direction + SLIDES.length) % SLIDES.length);
  };

  const pickSlide = (i: number) => {
    setManualNav(true);
    setIndex(i);
  };

  const Shell = embedded ? 'div' : 'section';

  return (
    <Shell
      className={embedded ? 'py-4' : 'px-5 md:px-8 py-4'}
      {...(embedded ? ({ role: 'region', 'aria-label': 'See PIPpal in action' } as const) : {})}
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-stone-900 mb-1">See PIPpal in action</h2>
        <p className="text-stone-500 text-sm max-w-md mx-auto">
          Tap your answers. We write your PIP form responses — then review and export when you&apos;re ready.
        </p>
      </div>

      {/* Device frame + gallery */}
      <div className="max-w-xl mx-auto mb-6 px-2 sm:px-0">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            className="shrink-0 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm hover:bg-stone-50 hover:border-teal-200 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            aria-label="Previous screenshot"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
          </button>

          <div className="w-full min-w-0 max-w-sm">
            <div className="rounded-[2rem] border-[6px] border-stone-800/95 bg-stone-900 p-1 shadow-2xl ring-1 ring-black/10">
              <div className="rounded-[1.5rem] overflow-hidden bg-stone-100">
                {/* Mini app bar — echoes the original chat mock */}
                <div className="bg-teal-700 px-3 py-2.5 flex items-center gap-2 text-white">
                  <HeartHandshake className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold tracking-tight">PIPpal</span>
                  <span className="text-[10px] text-teal-100 ml-auto truncate max-w-[10rem]">{slide.headerLabel}</span>
                </div>

                <div className="relative h-[min(58vh,440px)] sm:h-[440px] overflow-hidden bg-stone-200/80">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={slide.src}
                      className="absolute inset-0 flex items-start justify-center"
                      initial={{ opacity: 0, x: reduceMotion ? 0 : 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: reduceMotion ? 0 : -28 }}
                      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {slidePanMotion ? (
                        <motion.img
                          src={slide.src}
                          alt={slide.caption}
                          className={imageClassName}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                          animate={{ y: panYKeyframes }}
                          transition={{
                            duration: panDurationSec,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      ) : (
                        <img
                          src={slide.src}
                          alt={slide.caption}
                          className={imageClassName}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center gap-2 mt-4">
              {SLIDES.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  onClick={() => pickSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? 'w-7 bg-teal-600' : 'w-2 bg-stone-300 hover:bg-stone-400'
                  }`}
                  aria-label={`Show ${s.caption}`}
                  aria-current={i === index ? 'true' : undefined}
                />
              ))}
            </div>
            <p className="text-center text-[11px] text-stone-500 mt-2 font-medium">{slide.caption}</p>
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            className="shrink-0 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm hover:bg-stone-50 hover:border-teal-200 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            aria-label="Next screenshot"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Info strip */}
      <div className="bg-stone-100 rounded-2xl p-4 flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-stone-700 font-medium leading-relaxed">
            Just tap your answers — we generate form-ready responses written in the format the DWP scores
            against. Polish each draft, then keep everything in Your answers prep.
          </p>
        </div>
      </div>
    </Shell>
  );
}
