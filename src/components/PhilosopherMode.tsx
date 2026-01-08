"use client";

import { useEffect, useState } from 'react';

interface PhilosopherModeActivatedProps {
  philosopher: string;
  onDismiss: () => void;
}

export function PhilosopherModeActivated({ philosopher, onDismiss }: PhilosopherModeActivatedProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  // Handle click to dismiss early
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Philosopher mode activated"
    >
      <div
        className={`mx-4 max-w-md transform rounded-lg bg-background p-8 text-center shadow-xl transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 text-4xl">🎮✨</div>
        <h2 className="mb-3 font-serif text-2xl text-foreground">
          Philosopher Mode Activated!
        </h2>
        <p className="mb-4 text-foreground/70">
          Today&apos;s wisdom comes exclusively from
        </p>
        <p className="mb-6 font-serif text-xl italic text-foreground">
          {philosopher}
        </p>
        <p className="text-sm text-foreground/50">
          (Click anywhere or wait to continue)
        </p>
      </div>
    </div>
  );
}
