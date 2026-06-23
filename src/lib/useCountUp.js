import { useState, useEffect } from 'react';

// Animate a number from 0 up to `value`. Safe if the animation clock is throttled:
// a fallback timer guarantees the final value is shown.
export function useCountUp(value, ms = 650) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (typeof value !== 'number' || value <= 0) {
      const id = requestAnimationFrame(() => setN(value > 0 ? value : 0));
      return () => cancelAnimationFrame(id);
    }
    let raf;
    let start = null;
    const ease = (p) => 1 - Math.pow(1 - p, 3);
    const tick = (t) => {
      if (start == null) start = t;
      const p = Math.min(1, (t - start) / ms);
      setN(Math.round(value * ease(p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const fallback = setTimeout(() => setN(value), ms + 200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [value, ms]);
  return n;
}
