"use client";

import { useEffect, useState } from 'react';

interface PersonalizationUnlockedProps {
  onDismiss: () => void;
}

export function PersonalizationUnlocked({ onDismiss }: PersonalizationUnlockedProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto-dismiss after 6 seconds (longer than philosopher mode since it's a milestone)
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 6000);

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
      aria-label="Personalization unlocked"
    >
      <div
        className={`mx-4 max-w-md transform rounded-lg bg-background p-8 text-center shadow-xl transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 text-4xl">🎯✨</div>
        <h2 className="mb-3 font-serif text-2xl text-foreground">
          Personalization Unlocked!
        </h2>
        <p className="mb-4 text-foreground/70">
          After two weeks of learning your preferences, Quotidian now selects quotes tailored just for you.
        </p>
        <p className="mb-6 text-foreground/60">
          Your favorites, reflections, and reading patterns shape which wisdom finds you each day.
        </p>
        <p className="text-sm text-foreground/50">
          (Click anywhere to continue)
        </p>
      </div>
    </div>
  );
}
