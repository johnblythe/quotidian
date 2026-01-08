"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getFavorites } from "@/lib/favorites";
import { getQuoteById } from "@/lib/quotes";
import { Quote } from "@/components/Quote";
import { PageTransition } from "@/components/PageTransition";
import { FavoriteItemSkeleton } from "@/components/Skeleton";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { Quote as QuoteType, FavoriteQuote } from "@/types";

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-foreground/50 body-text text-lg">No favorites yet</p>
          <p className="text-foreground/30 body-text text-sm mt-2">
            Save quotes by tapping the heart icon
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
                    <p className="body-text text-foreground/40 italic mb-2 text-center py-8">
                      Quote no longer available
                    </p>
                  )}

                  <div className="text-center text-sm text-foreground/40 body-text mt-2">
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
