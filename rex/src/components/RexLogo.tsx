import { useEffect, useState } from 'react';

function randomLook() {
  const angle = Math.random() * Math.PI * 2;
  const distance = 0.35 + Math.random() * 0.75;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance * 0.7,
  };
}

export function RexLogo({ size = 25, className }: { size?: number; className?: string }) {
  const [look, setLook] = useState(randomLook);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      const delay = 1800 + Math.random() * 2200;
      timeoutId = setTimeout(() => {
        setLook(randomLook());
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 25 25"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M12.5 2C7.5 2 4 6 4 10.5c0 3.2 1.8 5.8 4.5 7.2L7 22l4.5-2.5L16 22l-1.5-4.3c2.7-1.4 4.5-4 4.5-7.2C19 6 15.5 2 12.5 2z"
        fill="currentColor"
      />
      <g
        className="rex-pupils"
        style={{ transform: `translate(${look.x}px, ${look.y}px)` }}
      >
        <circle cx="9.5" cy="10" r="1.2" fill="#030711" />
        <circle cx="15.5" cy="10" r="1.2" fill="#030711" />
      </g>
    </svg>
  );
}
