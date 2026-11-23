import { useEffect } from 'react';

let locks = 0;
let restore = null;

// Freezes page scrolling while an overlay (dialog, mobile menu) is open.
// The scrollbar's width is padded back in so the page doesn't shift sideways.
export default function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;

    if (locks === 0) {
      const root = document.documentElement;
      const { body } = document;
      const previous = { overflow: root.style.overflow, paddingRight: body.style.paddingRight };
      const scrollbarWidth = window.innerWidth - root.clientWidth;

      root.style.overflow = 'hidden';
      if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

      restore = () => {
        root.style.overflow = previous.overflow;
        body.style.paddingRight = previous.paddingRight;
      };
    }
    locks += 1;

    return () => {
      locks -= 1;
      if (locks === 0 && restore) {
        restore();
        restore = null;
      }
    };
  }, [active]);
}
