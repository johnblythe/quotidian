"use client";

interface ActionButtonsProps {
  onSave: () => void;
  onReflect: () => void;
  onAnother: () => void;
  isSaved?: boolean;
  isReflecting?: boolean;
  remainingPulls?: number;
}

export function ActionButtons({
  onSave,
  onReflect,
  onAnother,
  isSaved = false,
  isReflecting = false,
  remainingPulls,
}: ActionButtonsProps) {
  const isAnotherDisabled = remainingPulls !== undefined && remainingPulls <= 0;
  return (
    <div className="flex items-center justify-center gap-8 py-8">
      {/* Save (heart) button */}
      <button
        onClick={onSave}
        className="btn-icon flex flex-col items-center gap-1 text-foreground/60 hover:text-foreground"
        aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
      >
        <svg
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
