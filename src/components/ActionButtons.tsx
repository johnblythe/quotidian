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
    <div className="flex items-center justify-center gap-6 py-4">
      {/* Save (heart) button */}
      <button
        onClick={onSave}
        className="btn-icon p-2 text-foreground/35 hover:text-foreground/60 transition-all duration-200 ease-out hover:scale-105"
        aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
        title={isSaved ? "Saved" : "Save"}
      >
        <svg
          ref={heartRef}
          className="heart-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={isSaved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </button>

      {/* Reflect (pencil) button */}
      <button
        onClick={onReflect}
        className={`btn-icon p-2 transition-all duration-200 ease-out hover:scale-105 ${
          isReflecting
            ? "text-foreground/80"
            : "text-foreground/35 hover:text-foreground/60"
        }`}
        aria-label="Write a reflection"
        title="Reflect"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      </button>

      {/* Share button */}
      {onShare && (
        <button
          onClick={onShare}
          className="btn-icon p-2 text-foreground/35 hover:text-foreground/60 transition-all duration-200 ease-out hover:scale-105"
          aria-label="Share quote"
          title="Share"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      )}

      {/* Add to collection button - only visible when signed in */}
      {isSignedIn && onAddToCollection && (
        <button
          onClick={onAddToCollection}
          className="btn-icon p-2 text-foreground/35 hover:text-foreground/60 transition-all duration-200 ease-out hover:scale-105"
          aria-label="Add to collection"
          title="Collect"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>
      )}

      {/* Another (refresh) button */}
      <button
        onClick={onAnother}
        disabled={isAnotherDisabled}
        className={`btn-icon p-2 relative transition-all duration-200 ease-out ${
          isAnotherDisabled
            ? "text-foreground/20 cursor-not-allowed"
            : "text-foreground/35 hover:text-foreground/60 hover:scale-105"
        }`}
        aria-label={isAnotherDisabled ? "No more quotes available today" : "Get another quote"}
        title={remainingPulls !== undefined ? `Another (${remainingPulls})` : "Another"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
        {remainingPulls !== undefined && remainingPulls > 0 && (
          <span className="absolute -top-0.5 -right-0.5 text-[9px] text-foreground/35 font-medium">
            {remainingPulls}
          </span>
        )}
      </button>
    </div>
  );
}
