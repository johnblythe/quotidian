"use client";

import { useEffect, useState, useCallback } from "react";

const CONFETTI_KEY = "quotidian_first_favorite_shown";

/**
 * Check if first favorite confetti has been shown
 */
export function hasShownFirstFavoriteConfetti(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(CONFETTI_KEY) === "true";
}

/**
 * Mark first favorite confetti as shown
 */
export function markFirstFavoriteConfettiShown(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONFETTI_KEY, "true");
}

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
}

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
}

const COLORS = [
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#10b981", // emerald
];

export function Confetti({ isActive, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const generatePieces = useCallback(() => {
    const newPieces: ConfettiPiece[] = [];
    // Create 30 confetti pieces for a subtle effect
    for (let i = 0; i < 30; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100, // percentage across screen
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 200, // stagger start
        duration: 1200 + Math.random() * 800, // 1.2-2s fall time
      });
    }
    return newPieces;
  }, []);

  useEffect(() => {
    if (isActive) {
      setPieces(generatePieces());
      // Clear confetti after animation completes
      const timeout = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [isActive, generatePieces, onComplete]);

  if (!isActive || pieces.length === 0) return null;

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    // Just show a brief flash of colors instead
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-100/30 to-transparent animate-pulse" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece absolute w-2 h-2"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}ms`,
            animationDuration: `${piece.duration}ms`,
          }}
        />
      ))}
    </div>
  );
}
