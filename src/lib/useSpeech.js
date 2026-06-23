import { useRef, useState, useEffect, useCallback } from 'react';

// Voice dictation via the Web Speech API. Feature-detected — if the browser
// doesn't support it, `supported` is false and the UI falls back to typing.
export function useSpeech({ onFinal } = {}) {
  const Rec =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  const supported = !!Rec;

  const recRef = useRef(null);
  const finalCb = useRef(onFinal);
  useEffect(() => {
    finalCb.current = onFinal;
  });

  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      // ignore
    }
  }, []);

  const start = useCallback(() => {
    if (!supported || recRef.current) return;
    const rec = new Rec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

    rec.onresult = (e) => {
      let live = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalCb.current?.(chunk.trim());
        } else {
          live += chunk;
        }
      }
      setInterim(live);
    };
    rec.onerror = () => {};
    rec.onend = () => {
      recRef.current = null;
      setListening(false);
      setInterim('');
    };

    recRef.current = rec;
    setListening(true);
    rec.start();
  }, [Rec, supported]);

  useEffect(() => () => stop(), [stop]);

  return { supported, listening, interim, start, stop };
}
