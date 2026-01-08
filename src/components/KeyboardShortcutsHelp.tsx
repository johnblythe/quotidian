"use client";

import { useEffect, useRef } from "react";

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  context?: "home" | "list";
}

const HOME_SHORTCUTS = [
  { key: "s", description: "Save / unsave quote" },
  { key: "r", description: "Open / close reflection" },
  { key: "Esc", description: "Close reflection" },
];

const LIST_SHORTCUTS = [
  { key: "j", description: "Next item" },
  { key: "k", description: "Previous item" },
  { key: "Esc", description: "Clear selection" },
];

const GLOBAL_SHORTCUTS = [
  { key: "?", description: "Show this help" },
];

export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
  context = "home",
}: KeyboardShortcutsHelpProps) {
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

  const contextShortcuts = context === "home" ? HOME_SHORTCUTS : LIST_SHORTCUTS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        className="bg-background border border-foreground/10 rounded-lg shadow-lg max-w-sm w-full mx-4 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="shortcuts-title" className="text-lg font-serif text-foreground">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="btn-icon text-foreground/60 hover:text-foreground"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-foreground/50 mb-2">
              {context === "home" ? "Quote" : "Navigation"}
            </h3>
            <div className="space-y-2">
              {contextShortcuts.map(({ key, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-foreground/70 body-text text-sm">
                    {description}
                  </span>
                  <kbd className="px-2 py-1 bg-foreground/5 border border-foreground/10 rounded text-xs font-mono text-foreground/80">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-foreground/10 pt-4">
            <h3 className="text-xs uppercase tracking-wider text-foreground/50 mb-2">
              Global
            </h3>
            <div className="space-y-2">
              {GLOBAL_SHORTCUTS.map(({ key, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-foreground/70 body-text text-sm">
                    {description}
                  </span>
                  <kbd className="px-2 py-1 bg-foreground/5 border border-foreground/10 rounded text-xs font-mono text-foreground/80">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-foreground/40 mt-4 text-center">
          Press <kbd className="px-1 py-0.5 bg-foreground/5 border border-foreground/10 rounded text-xs font-mono">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
