import { useState, useCallback } from 'react';

// Copy text to the clipboard with a brief "copied" confirmation flag.
export function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
        return true;
      } catch {
        return false;
      }
    },
    [timeout],
  );
  return { copied, copy };
}
