import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { HeroScene } from './HeroScene';
import { HowItWorksModal } from './HowItWorksModal';

const lineVariants = {
  hidden: { opacity: 0, y: 32, rotateX: -12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: 0.15 + i * 0.12,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export function Hero() {
  const reduceMotion = useReducedMotion();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden py-16 md:py-24">
        {!reduceMotion && <HeroScene />}

        <div className="container relative z-10 text-center" style={{ perspective: 800 }}>
          <motion.span
            className="block font-serif text-4xl font-bold text-white md:text-7xl"
            custom={0}
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
            variants={lineVariants}
            style={{ transformStyle: 'preserve-3d' }}
          >
            Create anything
          </motion.span>

          <motion.h1
            className="hero-shimmer bg-gradient-to-br from-white via-sky-100 to-white/20 bg-clip-text text-4xl font-bold text-transparent md:text-7xl"
            custom={1}
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
            variants={lineVariants}
            style={{ transformStyle: 'preserve-3d' }}
          >
            Incubator
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg"
            custom={2}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.55, duration: 0.6 }}
          >
            The safest place to trade. No dev. No rugs. Automated marketing wallets
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.7, duration: 0.5 }}
          >
            <button
              type="button"
              onClick={() => setShowHowItWorks(true)}
              className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:border-sky-400/40 hover:bg-white/10"
            >
              <HelpCircle className="h-4 w-4 text-sky-400" />
              How it works
            </button>
          </motion.div>

          <motion.div
            className="mx-auto mt-8 h-px w-32 bg-gradient-to-r from-transparent via-sky-400 to-transparent"
            initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.8, duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </section>

      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
    </>
  );
}
