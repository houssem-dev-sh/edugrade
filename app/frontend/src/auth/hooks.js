import { useCallback, useEffect, useState } from 'react';

// Countdown used to rate-limit "Resend code" buttons.
export function useCooldown() {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const start = useCallback((seconds) => setSecondsLeft(seconds), []);
  return [secondsLeft, start];
}
