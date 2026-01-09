"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface JourneyCompletionProps {
  journeyTitle: string;
  journeyEmoji: string;
  onDismiss: () => void;
  onStartAnother: () => void;
}

export function JourneyCompletion({
  journeyTitle,
  journeyEmoji,
  onDismiss,
  onStartAnother
}: JourneyCompletionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleStartAnother = () => {
    setIsVisible(false);
    setTimeout(() => {
      onStartAnother();
      router.push('/journeys');
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Journey completed"
    >
      <div
        className={`mx-4 max-w-md transform rounded-lg bg-background p-8 text-center shadow-xl transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 text-4xl">{journeyEmoji} 🎉</div>
        <h2 className="mb-3 font-serif text-2xl text-foreground">
          Journey Complete!
        </h2>
        <p className="mb-4 text-foreground/70">
          Congratulations! You&apos;ve completed &quot;{journeyTitle}&quot;.
        </p>
        <p className="mb-6 text-foreground/60">
          Take a moment to appreciate the wisdom you&apos;ve gathered along the way.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleStartAnother}
            className="btn-nav w-full px-4 py-3 text-sm bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors"
          >
            Start Another Journey
          </button>
          <button
            onClick={handleDismiss}
            className="btn-nav w-full px-4 py-3 text-sm border border-foreground/20 rounded-md hover:bg-foreground/5 transition-colors"
          >
            Return to Daily Quotes
          </button>
        </div>
      </div>
    </div>
  );
}
