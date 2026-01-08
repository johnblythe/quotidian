"use client";

import { useEffect, useCallback, useRef } from "react";

interface ShortcutHandlers {
  onSave?: () => void;
  onReflect?: () => void;
  onEscape?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onHelp?: () => void;
}

/**
 * Hook for global keyboard shortcuts
 * - s: toggle save/favorite
 * - r: open reflection editor
 * - Escape: close modals/editors
 * - j: navigate down in lists
 * - k: navigate up in lists
 * - ?: show keyboard shortcuts help
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handlersRef = useRef(handlers);

  // Keep handlers ref up to date
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if user is typing in an input/textarea
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      // Only handle Escape in inputs
      if (e.key === "Escape" && handlersRef.current.onEscape) {
        handlersRef.current.onEscape();
      }
      return;
    }

    // Ignore if modifier keys are pressed (except Shift for ?)
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    switch (e.key) {
      case "s":
        e.preventDefault();
        handlersRef.current.onSave?.();
        break;
      case "r":
        e.preventDefault();
        handlersRef.current.onReflect?.();
        break;
      case "Escape":
        handlersRef.current.onEscape?.();
        break;
      case "j":
        e.preventDefault();
        handlersRef.current.onNavigateDown?.();
        break;
      case "k":
        e.preventDefault();
        handlersRef.current.onNavigateUp?.();
        break;
      case "?":
        e.preventDefault();
        handlersRef.current.onHelp?.();
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
