"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { getFavorites } from "@/lib/favorites";
import { getQuoteById } from "@/lib/quotes";
import { Quote } from "@/components/Quote";
import { PageTransition } from "@/components/PageTransition";
import { FavoriteItemSkeleton } from "@/components/Skeleton";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { Quote as QuoteType, FavoriteQuote } from "@/types";

// Lazy load modal component
const KeyboardShortcutsHelp = dynamic(() => import("@/components/KeyboardShortcutsHelp").then(mod => ({ default: mod.KeyboardShortcutsHelp })), { ssr: false });

interface FavoriteItem {
  favorite: FavoriteQuote;
  quote: QuoteType | undefined;
}

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
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
    const loadFavorites = async () => {
      const favorites = await getFavorites();

      // Load quote details for each favorite
      const favoriteItems = favorites.map((f) => ({
        favorite: f,
        quote: getQuoteById(f.quoteId),
      }));

      setItems(favoriteItems);
      setLoading(false);
    };
    loadFavorites();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="quote-text text-2xl text-center mb-8 text-foreground/80">
            Favorites
          </h1>
          <div className="space-y-8">
            <FavoriteItemSkeleton />
            <FavoriteItemSkeleton />
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
            {/* Decorative heart icon */}
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Main message */}
            <h2 className="quote-text text-xl sm:text-2xl text-foreground/70 mb-3">
              Your collection awaits
            </h2>

            {/* Helper text */}
            <p className="body-text text-foreground/60 text-sm mb-8 leading-relaxed">
              When a quote speaks to you, tap the heart to save it here.
              Build a personal treasury of wisdom.
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
              Find your first quote
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
              Favorites
            </h1>

            <div className="space-y-8">
              {items.map((item, index) => (
                <article
                  key={item.favorite.id}
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
                    <Quote quote={item.quote} />
                  ) : (
                    <p className="body-text text-foreground/60 italic mb-2 text-center py-8">
                      Quote no longer available
                    </p>
                  )}

                  <div className="text-center text-sm text-foreground/60 body-text mt-2">
                    <time dateTime={new Date(item.favorite.savedAt).toISOString()}>
                      Saved {formatDate(item.favorite.savedAt)}
                    </time>
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
