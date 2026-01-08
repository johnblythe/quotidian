"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getQuoteHistory } from "@/lib/history";
import { getJournalEntry } from "@/lib/journal";
import { getQuoteById } from "@/lib/quotes";
import { PageTransition } from "@/components/PageTransition";
import { ArchiveItemSkeleton } from "@/components/Skeleton";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { Quote, QuoteHistory, JournalEntry } from "@/types";

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-foreground/50 body-text text-lg">No quotes yet</p>
          <p className="text-foreground/30 body-text text-sm mt-2">
            Your quote history will appear here
          </p>
        </div>
      </div>
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
                    <p className="body-text text-foreground/40 italic mb-2">
                      Quote no longer available
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-foreground/40 body-text">
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
