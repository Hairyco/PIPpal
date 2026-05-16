import React, { useEffect, useState } from 'react';
import { ArrowRight, MessageSquare, HeartHandshake, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface ChatPreviewProps {
  onStart: () => void;
  /** When nested inside another padded section (e.g. What is PIP), skip outer horizontal padding */
  embedded?: boolean;
}

const SLIDES = [
  {
    src: '/marketing/home-screen.png',
    headerLabel: 'Home',
    caption: 'Home',
  },
  {
    src: '/marketing/answers-prep-screen.png',
    headerLabel: 'Your answers',
    caption: 'Your answers prep',
  },
  {
    src: '/marketing/draft-answer-screen.png',
    headerLabel: 'Draft answer',
    caption: 'Draft answer',
  },
  {
    src: '/marketing/coc-pip2-pa4-screen.png',
    headerLabel: 'CoC walkthrough',
    caption: 'Your answer, PA4 assessor notes & example',
  },
] as const;

export function ChatPreview({ onStart, embedded }: ChatPreviewProps) {
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
      className={embedded ? 'py-8' : 'px-5 md:px-8 py-8'}
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
                      className="absolute inset-0"
                      initial={{ opacity: 0, x: reduceMotion ? 0 : 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: reduceMotion ? 0 : -28 }}
                      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {reduceMotion ? (
                        <img
                          src={slide.src}
                          alt={slide.caption}
                          className="w-full min-h-[112%] object-cover object-top select-none pointer-events-none block"
                          loading={index === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                        />
                      ) : (
                        <motion.img
                          src={slide.src}
                          alt={slide.caption}
                          className="w-full min-h-[112%] object-cover object-top select-none pointer-events-none block"
                          loading={index === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                          animate={{
                            y: [0, -36, 0],
                          }}
                          transition={{
                            duration: 14,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
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

      <div className="relative">
        <button
          type="button"
          onClick={onStart}
          className="relative z-10 w-full bg-orange-500 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 active:scale-[0.98] transition-all shadow-sm pr-12"
        >
          Try it yourself
          <ArrowRight className="w-4 h-4" />
        </button>
        <div
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg ring-2 ring-white"
          aria-hidden
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-sm">
            <Star className="w-2.5 h-2.5 fill-amber-600 text-amber-600" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </Shell>
  );
}
