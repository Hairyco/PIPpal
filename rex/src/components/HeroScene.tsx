import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

function FloatingParticle({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-sky-400/40 blur-[1px]"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{
        y: [0, -18, 0],
        opacity: [0.2, 0.7, 0.2],
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
}

export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const rotateY = useTransform(springX, [-0.5, 0.5], [-14, 14]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10]);
  const orbX = useTransform(springX, [-0.5, 0.5], [-24, 24]);
  const orbY = useTransform(springY, [-0.5, 0.5], [-16, 16]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  const particles = [
    { delay: 0, x: '12%', y: '28%', size: 4 },
    { delay: 0.6, x: '78%', y: '22%', size: 3 },
    { delay: 1.2, x: '85%', y: '58%', size: 5 },
    { delay: 0.3, x: '18%', y: '68%', size: 3 },
    { delay: 0.9, x: '62%', y: '72%', size: 4 },
    { delay: 1.5, x: '42%', y: '18%', size: 3 },
    { delay: 0.4, x: '92%', y: '42%', size: 2 },
    { delay: 1.1, x: '8%', y: '48%', size: 2 },
  ];

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      aria-hidden
    >
      {/* Ambient glow pulses */}
      <motion.div
        className="absolute h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-[100px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute h-[280px] w-[280px] rounded-full bg-indigo-500/10 blur-[80px]"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {particles.map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}

      {/* 3D scene */}
      <motion.div
        className="relative h-64 w-64 md:h-80 md:w-80"
        style={{
          perspective: 900,
          x: orbX,
          y: orbY,
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Orbital ring 1 */}
        <motion.div
          className="absolute inset-0 rounded-full border border-sky-400/25"
          style={{ transform: 'rotateX(72deg)' }}
          animate={{ rotateZ: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
        {/* Orbital ring 2 */}
        <motion.div
          className="absolute inset-4 rounded-full border border-indigo-400/20"
          style={{ transform: 'rotateX(55deg) rotateY(40deg)' }}
          animate={{ rotateZ: -360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        />
        {/* Orbital ring 3 */}
        <motion.div
          className="absolute inset-8 rounded-full border border-cyan-300/15"
          style={{ transform: 'rotateX(30deg) rotateY(-30deg)' }}
          animate={{ rotateZ: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />

        {/* Core orb */}
        <motion.div
          className="absolute inset-[28%] rounded-full"
          style={{
            background:
              'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35) 0%, rgba(14,165,233,0.5) 35%, rgba(99,102,241,0.6) 70%, rgba(3,7,17,0.9) 100%)',
            boxShadow:
              '0 0 60px rgba(14,165,233,0.35), 0 0 120px rgba(99,102,241,0.2), inset 0 -20px 40px rgba(0,0,0,0.4)',
            transform: 'translateZ(40px)',
          }}
          animate={{
            scale: [1, 1.04, 1],
            boxShadow: [
              '0 0 60px rgba(14,165,233,0.35), 0 0 120px rgba(99,102,241,0.2), inset 0 -20px 40px rgba(0,0,0,0.4)',
              '0 0 80px rgba(14,165,233,0.5), 0 0 140px rgba(99,102,241,0.35), inset 0 -20px 40px rgba(0,0,0,0.4)',
              '0 0 60px rgba(14,165,233,0.35), 0 0 120px rgba(99,102,241,0.2), inset 0 -20px 40px rgba(0,0,0,0.4)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating 3D cubes */}
        {[
          { x: -70, y: -50, z: 60, delay: 0 },
          { x: 80, y: 30, z: 30, delay: 0.5 },
          { x: -40, y: 70, z: 80, delay: 1 },
        ].map((cube, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 h-3 w-3 rounded-sm border border-white/20 bg-sky-400/20 backdrop-blur-sm md:h-4 md:w-4"
            style={{
              transform: `translate3d(${cube.x}px, ${cube.y}px, ${cube.z}px)`,
            }}
            animate={{
              y: [cube.y, cube.y - 12, cube.y],
              rotateZ: [0, 180, 360],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: cube.delay,
            }}
          />
        ))}
      </motion.div>

      {/* Perspective grid floor */}
      <div
        className="absolute bottom-0 left-1/2 h-40 w-[140%] -translate-x-1/2 opacity-20"
        style={{
          background:
            'linear-gradient(transparent, rgba(14,165,233,0.08) 80%), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 48px), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 48px)',
          transform: 'perspective(400px) rotateX(65deg)',
          transformOrigin: 'center bottom',
          maskImage: 'linear-gradient(to top, black, transparent)',
        }}
      />
    </div>
  );
}
