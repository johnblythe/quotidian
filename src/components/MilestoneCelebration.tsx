"use client";

import { useEffect, useRef } from "react";

interface MilestoneCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: number;
}

const MILESTONE_MESSAGES: Record<number, { title: string; message: string }> = {
  100: {
    title: "A Century of Reflections",
    message:
      "You've written 100 reflections. Each one is a moment of pause, a space for thought. This practice has become part of who you are.",
  },
  // Future milestones can be added here
};

export function MilestoneCelebration({
  isOpen,
  onClose,
  milestone,
}: MilestoneCelebrationProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(e.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = MILESTONE_MESSAGES[milestone] || {
    title: `${milestone} Reflections`,
    message: `You've reached ${milestone} reflections. Keep going.`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        className="bg-background border border-foreground/10 rounded-lg shadow-lg max-w-sm w-full mx-4 p-8 text-center milestone-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="milestone-title"
      >
        <div className="mb-6">
          <div className="text-4xl mb-4" role="img" aria-label="celebration">
            ✦
          </div>
          <h2
            id="milestone-title"
            className="text-xl font-serif text-foreground mb-3"
          >
            {content.title}
          </h2>
          <p className="body-text text-foreground/70 leading-relaxed">
            {content.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="btn-primary px-6 py-2 bg-foreground text-background rounded-lg font-medium"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Milestone tracking utilities using localStorage
const MILESTONES_KEY = "quotidian_shown_milestones";

export function getMilestones(): number[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(MILESTONES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function markMilestoneShown(milestone: number): void {
  const shown = getMilestones();
  if (!shown.includes(milestone)) {
    shown.push(milestone);
    localStorage.setItem(MILESTONES_KEY, JSON.stringify(shown));
  }
}

export function shouldShowMilestone(count: number): number | null {
  // Currently only 100 is a milestone
  const MILESTONES = [100];
  const shown = getMilestones();

  for (const milestone of MILESTONES) {
    if (count >= milestone && !shown.includes(milestone)) {
      return milestone;
    }
  }
  return null;
}
