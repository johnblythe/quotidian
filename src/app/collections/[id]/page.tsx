"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getSupabase } from "@/lib/supabase";
import { getQuoteById } from "@/lib/quotes";
import { removeQuoteFromCollection } from "@/lib/collections";
import { Quote } from "@/components/Quote";
import { PageTransition } from "@/components/PageTransition";
import type { Collection } from "@/types";
import type { Quote as QuoteType } from "@/types";

export default function CollectionDetailPage() {
  const params = useParams();
  const collectionId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [quotes, setQuotes] = useState<(QuoteType | undefined)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quoteToRemove, setQuoteToRemove] = useState<QuoteType | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const loadCollection = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        setError("Database not available");
        setLoading(false);
        return;
      }

      // Fetch collection - RLS will allow if user owns it or it's public
      const { data, error: fetchError } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          setError("Collection not found");
        } else {
          setError("Failed to load collection");
          console.error("Error fetching collection:", fetchError);
        }
        setLoading(false);
        return;
      }

      setCollection(data as Collection);

      // Load quote details for each quote_id
      const quoteDetails = (data.quote_ids || []).map((id: string) =>
        getQuoteById(id)
      );
      setQuotes(quoteDetails);
      setLoading(false);
    };

    if (!authLoading) {
      loadCollection();
    }
  }, [collectionId, authLoading]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle remove quote from collection
  const handleRemoveQuote = async () => {
    if (!quoteToRemove || !collection) return;

    setIsRemoving(true);
    const result = await removeQuoteFromCollection(collectionId, quoteToRemove.id);
    setIsRemoving(false);

    if (result.success) {
      // Update local state
      setQuotes((prev) => prev.filter((q) => q?.id !== quoteToRemove.id));
      setCollection((prev) =>
        prev
          ? {
              ...prev,
              quote_ids: prev.quote_ids.filter((id) => id !== quoteToRemove.id),
            }
          : null
      );
      setToast("Quote removed from collection");
    } else {
      setToast(result.error || "Failed to remove quote");
    }

    setQuoteToRemove(null);
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-foreground/10 rounded w-1/2 mx-auto mb-4" />
            <div className="h-4 bg-foreground/10 rounded w-1/3 mx-auto mb-8" />
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-8">
                  <div className="h-6 bg-foreground/10 rounded w-3/4 mx-auto mb-4" />
                  <div className="h-4 bg-foreground/10 rounded w-1/4 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <PageTransition>
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center max-w-sm">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="quote-text text-xl sm:text-2xl text-foreground/70 mb-3">
              {error}
            </h2>
            <p className="body-text text-foreground/60 text-sm mb-8 leading-relaxed">
              This collection may be private or no longer exist.
            </p>
            <Link
              href="/collections"
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
              Back to collections
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!collection) {
    return null;
  }

  const isOwner = user?.id === collection.user_id;

  // Empty collection state
  if (quotes.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h1 className="quote-text text-2xl text-foreground/80">
                  {collection.title}
                </h1>
                {collection.visibility === "private" ? (
                  <svg
                    className="w-4 h-4 text-foreground/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Private"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-foreground/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Public"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              {collection.description && (
                <p className="body-text text-foreground/60 text-sm">
                  {collection.description}
                </p>
              )}
            </div>

            {/* Empty state */}
            <div className="flex items-center justify-center py-16">
              <div className="text-center max-w-sm">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-foreground/20"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                </div>
                <p className="body-text text-foreground/60 text-sm mb-6">
                  This collection is empty.
                  {isOwner && " Add quotes using the + button on any quote."}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 body-text text-sm text-foreground/60 hover:text-foreground/80 transition-colors btn-nav px-4 py-2"
                >
                  Browse quotes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Collection with quotes
  return (
    <PageTransition>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="quote-text text-2xl text-foreground/80">
                {collection.title}
              </h1>
              {collection.visibility === "private" ? (
                <svg
                  className="w-4 h-4 text-foreground/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Private"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-foreground/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Public"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            {collection.description && (
              <p className="body-text text-foreground/60 text-sm mb-2">
                {collection.description}
              </p>
            )}
            <p className="body-text text-foreground/40 text-xs">
              {quotes.length} quote{quotes.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Quotes list */}
          <div className="space-y-8">
            {quotes.map((quote, index) => (
              <article
                key={quote?.id || index}
                className="border-b border-foreground/10 pb-6"
              >
                {quote ? (
                  <div className="relative">
                    <Quote quote={quote} />
                    {isOwner && (
                      <button
                        onClick={() => setQuoteToRemove(quote)}
                        className="absolute top-0 right-0 p-2 text-foreground/30 hover:text-red-500 transition-colors"
                        aria-label="Remove from collection"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="body-text text-foreground/60 italic text-center py-8">
                    Quote no longer available
                  </p>
                )}
              </article>
            ))}
          </div>

          {/* Back link */}
          <div className="mt-12 text-center">
            <Link
              href="/collections"
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
              All collections
            </Link>
          </div>
        </div>

        {/* Remove confirmation dialog */}
        {quoteToRemove && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setQuoteToRemove(null)}
          >
            <div
              className="bg-background rounded-lg shadow-xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="quote-text text-lg text-foreground/80 mb-4">
                Remove from collection?
              </h3>
              <p className="body-text text-foreground/60 text-sm mb-6">
                &ldquo;{quoteToRemove.text.slice(0, 60)}
                {quoteToRemove.text.length > 60 ? "..." : ""}&rdquo;
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setQuoteToRemove(null)}
                  className="body-text text-sm text-foreground/60 hover:text-foreground/80 px-4 py-2 transition-colors"
                  disabled={isRemoving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveQuote}
                  disabled={isRemoving}
                  className="body-text text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                >
                  {isRemoving ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast notification */}
        {toast && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg body-text text-sm z-50">
            {toast}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
