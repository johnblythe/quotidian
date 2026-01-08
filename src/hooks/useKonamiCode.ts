/**
 * Hook to detect Konami code: up up down down left right left right b a
 */

import { useEffect, useRef, useCallback } from 'react';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

export function useKonamiCode(onActivate: () => void): void {
  const inputSequence = useRef<string[]>([]);
  const callbackRef = useRef(onActivate);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = onActivate;
  }, [onActivate]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    // Ignore if modifier keys are pressed
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    // Add the key to the sequence
    inputSequence.current = [...inputSequence.current, event.code].slice(-KONAMI_CODE.length);

    // Check if the sequence matches
    if (inputSequence.current.length === KONAMI_CODE.length) {
      const matches = inputSequence.current.every((key, index) => key === KONAMI_CODE[index]);
      if (matches) {
        inputSequence.current = [];
        callbackRef.current();
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
