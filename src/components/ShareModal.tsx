"use client";

import { useState, useEffect } from "react";
import type { Quote } from "@/types";
import { generateShareCard, generateShareCardDataUrl } from "@/lib/shareCard";

interface ShareModalProps {
  quote: Quote;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal for sharing quotes as images
 * Shows a preview of the generated share card and share options
 */
export function ShareModal({ quote, isOpen, onClose }: ShareModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copying" | "success" | "error">("idle");
  const [copyError, setCopyError] = useState<string | null>(null);

  // Check if browser supports image clipboard
  const supportsClipboardImage = typeof navigator !== "undefined" &&
    "clipboard" in navigator &&
    "write" in navigator.clipboard;

  // Copy image to clipboard
  const handleCopy = async () => {
    if (!imageUrl) return;

    setCopyStatus("copying");
    setCopyError(null);

    try {
      // Generate a fresh blob for clipboard (can't reuse object URL)
      const blob = await generateShareCard(quote);

      if (!supportsClipboardImage) {
        // Fallback: copy quote text instead
        await navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`);
        setCopyStatus("success");
        setCopyError("Image clipboard not supported. Quote text copied instead.");
        setTimeout(() => {
          setCopyStatus("idle");
          setCopyError(null);
        }, 3000);
        return;
      }

      // Use ClipboardItem API to copy image
      const clipboardItem = new ClipboardItem({
        "image/png": blob,
      });

      await navigator.clipboard.write([clipboardItem]);
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      setCopyStatus("error");

      // Fallback: try copying text
      try {
        await navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`);
        setCopyError("Couldn't copy image. Quote text copied instead.");
      } catch {
        setCopyError("Failed to copy. Please try downloading instead.");
      }

      setTimeout(() => {
        setCopyStatus("idle");
        setCopyError(null);
      }, 3000);
    }
  };

  // Generate share card when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Clean up object URL when modal closes
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
        setImageUrl(null);
      }
      return;
    }

    const generateImage = async () => {
      setIsGenerating(true);
      setError(null);
      try {
        const url = await generateShareCardDataUrl(quote);
        setImageUrl(url);
      } catch (err) {
        console.error("Failed to generate share card:", err);
        setError("Failed to generate share image");
      } finally {
        setIsGenerating(false);
      }
    };

    generateImage();
  }, [isOpen, quote]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-background rounded-lg max-w-lg w-full shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-foreground/10">
          <h2 className="font-serif text-lg">Share Quote</h2>
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
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Preview */}
        <div className="p-4">
          <div className="aspect-[1200/630] bg-foreground/5 rounded-md overflow-hidden">
            {isGenerating ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-foreground/50 body-text text-sm">
                  Generating preview...
                </div>
              </div>
            ) : error ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-red-500 body-text text-sm">{error}</div>
              </div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt="Share card preview"
                className="w-full h-full object-contain"
              />
            ) : null}
          </div>
        </div>

        {/* Toast notification for copy status */}
        {(copyStatus === "success" || copyStatus === "error") && (
          <div className="px-4">
            <div
              className={`px-4 py-2 rounded-md text-sm text-center ${
                copyStatus === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {copyStatus === "success" && !copyError
                ? "Image copied to clipboard!"
                : copyError || "Failed to copy"}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 pt-0 flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleCopy}
            disabled={!imageUrl || copyStatus === "copying"}
            className="btn-nav px-4 py-2 text-sm border border-foreground/20 rounded-md hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            aria-label="Copy image to clipboard"
          >
            {copyStatus === "copying" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-spin"
              >
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : copyStatus === "success" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
            {copyStatus === "copying"
              ? "Copying..."
              : copyStatus === "success"
              ? "Copied!"
              : "Copy"}
          </button>
          <button
            disabled={!imageUrl}
            className="btn-nav px-4 py-2 text-sm border border-foreground/20 rounded-md hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            aria-label="Download image (coming soon)"
            title="Coming soon"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>
          <button
            disabled={!imageUrl}
            className="btn-nav px-4 py-2 text-sm border border-foreground/20 rounded-md hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            aria-label="Share (coming soon)"
            title="Coming soon"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
