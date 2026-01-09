"use client";

import { useRef, useEffect } from "react";

interface ActionButtonsProps {
  onSave: () => void;
  onReflect: () => void;
  onAnother: () => void;
  onShare?: () => void;
  onAddToCollection?: () => void;
  isSaved?: boolean;
  isReflecting?: boolean;
  remainingPulls?: number;
  isSignedIn?: boolean;
}

export function ActionButtons({
  onSave,
  onReflect,
  onAnother,
  onShare,
  onAddToCollection,
  isSaved = false,
  isReflecting = false,
  remainingPulls,
  isSignedIn = false,
}: ActionButtonsProps) {
  const isAnotherDisabled = remainingPulls !== undefined && remainingPulls <= 0;
  const prevSavedRef = useRef<boolean | null>(null);
  const heartRef = useRef<SVGSVGElement>(null);

  // Track animation on save state change
  useEffect(() => {
    const heart = heartRef.current;
    if (!heart) return;

    // Only animate on actual state changes (not initial mount)
    if (prevSavedRef.current !== null && prevSavedRef.current !== isSaved) {
      // Remove any existing animation classes
      heart.classList.remove("heart-filled", "heart-unfilled");
      // Force reflow to restart animation
      void heart.getBoundingClientRect();
      // Add appropriate animation class
      heart.classList.add(isSaved ? "heart-filled" : "heart-unfilled");
    }

    prevSavedRef.current = isSaved;
  }, [isSaved]);

  return (
    <div className="flex items-center justify-center gap-8 py-8">
      {/* Save (heart) button */}
      <button
        onClick={onSave}
        className="btn-icon flex flex-col items-center gap-1 text-foreground/60 hover:text-foreground"
        aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
      >
        <svg
          ref={heartRef}
          className="heart-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={isSaved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
        <span className="text-xs body-text">Save</span>
      </button>

      {/* Reflect (pencil) button */}
      <button
        onClick={onReflect}
        className={`btn-icon flex flex-col items-center gap-1 ${
          isReflecting
            ? "text-foreground"
            : "text-foreground/60 hover:text-foreground"
        }`}
        aria-label="Write a reflection"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
        <span className="text-xs body-text">Reflect</span>
      </button>

      {/* Share button */}
      {onShare && (
        <button
          onClick={onShare}
          className="btn-icon flex flex-col items-center gap-1 text-foreground/60 hover:text-foreground"
          aria-label="Share quote"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span className="text-xs body-text">Share</span>
        </button>
      )}

      {/* Add to collection button - only visible when signed in */}
      {isSignedIn && onAddToCollection && (
        <button
          onClick={onAddToCollection}
          className="btn-icon flex flex-col items-center gap-1 text-foreground/60 hover:text-foreground"
          aria-label="Add to collection"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          <span className="text-xs body-text">Collect</span>
        </button>
      )}

      {/* Another (arrow) button */}
      <button
        onClick={onAnother}
        disabled={isAnotherDisabled}
        className={`btn-icon flex flex-col items-center gap-1 ${
          isAnotherDisabled
            ? "text-foreground/30 cursor-not-allowed"
            : "text-foreground/60 hover:text-foreground"
        }`}
        aria-label={isAnotherDisabled ? "No more quotes available today" : "Get another quote"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
        <span className="text-xs body-text">
          {remainingPulls !== undefined ? `Another (${remainingPulls} left)` : "Another"}
        </span>
      </button>
    </div>
  );
}
