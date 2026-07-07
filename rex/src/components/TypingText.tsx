import { useEffect, useState } from 'react';

interface TypingTextProps {
  text: string;
  className?: string;
  /** Milliseconds per character */
  speed?: number;
  /** Delay before typing starts */
  startDelay?: number;
}

export function TypingText({
  text,
  className = '',
  speed = 70,
  startDelay = 400,
}: TypingTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setDisplayed(text);
      setShowCursor(false);
      return;
    }

    let charIndex = 0;
    let typingTimer: ReturnType<typeof setInterval> | undefined;

    const startTimer = setTimeout(() => {
      typingTimer = setInterval(() => {
        charIndex += 1;
        setDisplayed(text.slice(0, charIndex));
        if (charIndex >= text.length) {
          if (typingTimer) clearInterval(typingTimer);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      if (typingTimer) clearInterval(typingTimer);
    };
  }, [text, speed, startDelay]);

  useEffect(() => {
    if (displayed.length < text.length) return;

    const blink = setInterval(() => {
      setShowCursor((on) => !on);
    }, 530);

    return () => clearInterval(blink);
  }, [displayed.length, text.length]);

  return (
    <span className="inline-block" style={{ minWidth: `${text.length}ch` }} aria-label={text}>
      <span className={className} aria-hidden="true">
        {displayed}
      </span>
      {showCursor && (
        <span
          className="ml-0.5 inline-block w-[3px] translate-y-[0.06em] bg-sky-400 align-baseline"
          style={{ height: '0.85em' }}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
