'use client';

import { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  durationMs?: number;
  format?: (n: number) => string;
}

// Counts up from the previous value to `value` with an ease-out cubic.
// Falls back instantly to the target if the user prefers reduced motion.
export function AnimatedNumber({ value, durationMs = 1100, format }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const startValue = display;
    const startedAt = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(startValue + (value - startValue) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{format ? format(display) : display}</>;
}
