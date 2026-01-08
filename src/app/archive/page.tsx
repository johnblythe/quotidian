"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { getQuoteHistory } from "@/lib/history";
import { getJournalEntry } from "@/lib/journal";
import { getQuoteById } from "@/lib/quotes";
import { PageTransition } from "@/components/PageTransition";
import { ArchiveItemSkeleton } from "@/components/Skeleton";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { Quote, QuoteHistory, JournalEntry } from "@/types";

// Lazy load modal component
const KeyboardShortcutsHelp = dynamic(() => import("@/components/KeyboardShortcutsHelp").then(mod => ({ default: mod.KeyboardShortcutsHelp })), { ssr: false });

interface ArchiveItem {
  history: QuoteHistory;
  quote: Quote | undefined;
  reflection: JournalEntry | null;
}

export default function ArchivePage() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // Keyboard navigation handlers
  const handleNavigateDown = useCallback(() => {
    if (items.length === 0) return;
    setSelectedIndex((prev) => {
      const next = prev < items.length - 1 ? prev + 1 : 0;
      itemRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return next;
    });
  }, [items.length]);

  const handleNavigateUp = useCallback(() => {
    if (items.length === 0) return;
    setSelectedIndex((prev) => {
      const next = prev > 0 ? prev - 1 : items.length - 1;
      itemRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return next;
    });
  }, [items.length]);

  const handleEscape = useCallback(() => {
    if (showShortcutsHelp) {
      setShowShortcutsHelp(false);
    } else {
      setSelectedIndex(-1);
    }
  }, [showShortcutsHelp]);

  const handleHelp = useCallback(() => {
    setShowShortcutsHelp((prev) => !prev);
  }, []);

  useKeyboardShortcuts({
    onNavigateDown: handleNavigateDown,
    onNavigateUp: handleNavigateUp,
    onEscape: handleEscape,
    onHelp: handleHelp,
  });

  useEffect(() => {
    const loadArchive = async () => {
      const history = await getQuoteHistory();

      // Deduplicate by quoteId - keep only the first (most recent) occurrence
      const seen = new Set<string>();
      const uniqueHistory = history.filter(h => {
        if (seen.has(h.quoteId)) return false;
        seen.add(h.quoteId);
        return true;
      });

      // Load quote details and reflections for each history entry
      const archiveItems = await Promise.all(
        uniqueHistory.map(async (h) => {
          const quote = getQuoteById(h.quoteId);
          const reflection = await getJournalEntry(h.quoteId);
          return { history: h, quote, reflection };
        })
      );

      setItems(archiveItems);
      setLoading(false);
    };
    loadArchive();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncateReflection = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength).trim() + "…";
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="quote-text text-2xl text-center mb-8 text-foreground/80">
            Archive
          </h1>
          <div className="space-y-6">
            <ArchiveItemSkeleton />
            <ArchiveItemSkeleton />
            <ArchiveItemSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center max-w-sm">
            {/* Decorative book/archive icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-foreground/5 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-foreground/20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>

            {/* Main message */}
            <h2 className="quote-text text-xl sm:text-2xl text-foreground/70 mb-3">
              Your journey begins
            </h2>

            {/* Helper text */}
            <p className="body-text text-foreground/60 text-sm mb-8 leading-relaxed">
              Each day brings a new quote for reflection. Your history of
              quotes and thoughts will be collected here.
            </p>

            {/* CTA link */}
            <a
              href="/"
              className="inline-flex items-center gap-2 body-text text-sm text-foreground/60 hover:text-foreground/80 transition-colors btn-nav px-4 py-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              See today&apos;s quote
            </a>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <>
      <PageTransition>
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="quote-text text-2xl text-center mb-8 text-foreground/80">
              Archive
            </h1>

            <div className="space-y-6">
              {items.map((item, index) => (
                <article
                  key={item.history.id}
                  ref={(el) => { itemRefs.current[index] = el; }}
                  className={`border-b border-foreground/10 pb-6 transition-all duration-150 rounded-lg ${
                    selectedIndex === index
                      ? "bg-foreground/5 -mx-4 px-4 py-4 border-foreground/20"
                      : ""
                  }`}
                  tabIndex={0}
                  onClick={() => setSelectedIndex(index)}
                >
                  {item.quote ? (
                    <>
                      <blockquote className="quote-text text-lg mb-3">
                        &ldquo;{item.quote.text}&rdquo;
                      </blockquote>
                      <p className="body-text text-foreground/60 text-sm mb-2">
                        — {item.quote.author}
                      </p>
                    </>
                  ) : (
                    <p className="body-text text-foreground/60 italic mb-2">
                      Quote no longer available
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-foreground/60 body-text">
                    <time dateTime={new Date(item.history.shownAt).toISOString()}>
                      {formatDate(item.history.shownAt)}
                    </time>
                    {item.reflection && (
                      <span className="text-foreground/50 italic ml-4 text-right flex-1">
                        {truncateReflection(item.reflection.content)}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
        context="list"
      />
    </>
  );
}
