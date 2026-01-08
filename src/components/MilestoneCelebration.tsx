"use client";

import { useEffect, useRef, useCallback } from "react";

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
  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Store previous focus and focus continue button when opening
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      // Small delay to ensure dialog is rendered
      requestAnimationFrame(() => {
        continueButtonRef.current?.focus();
      });
    } else if (previousActiveElement.current instanceof HTMLElement) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard events (Escape to close, Tab to trap focus)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "Escape") {
      onClose();
      return;
    }

    // Focus trap - Tab cycles within dialog (only one button, so just prevent leaving)
    if (e.key === "Tab") {
      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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
          ref={continueButtonRef}
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
