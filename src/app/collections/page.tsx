"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getSupabase } from "@/lib/supabase";
import { getFollowedCollections, type FollowedCollection } from "@/lib/collections";
import { PageTransition } from "@/components/PageTransition";
import type { Collection } from "@/types";

interface CollectionWithFollowers extends Collection {
  follower_count?: number;
}

// Type for the raw Supabase response with aggregate
interface CollectionRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  quote_ids: string[];
  visibility: "private" | "public";
  created_at: string;
  updated_at: string;
  collection_follows: { count: number }[];
}

export default function CollectionsPage() {
  const { user, isLoading: authLoading, isSignedIn } = useAuth();
  const [collections, setCollections] = useState<CollectionWithFollowers[]>([]);
  const [followedCollections, setFollowedCollections] = useState<FollowedCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        setLoading(false);
        return;
      }

      // Fetch user's collections with follower counts
      const { data, error } = await supabase
        .from("collections")
        .select(`
          *,
          collection_follows(count)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching collections:", error);
        setLoading(false);
        return;
      }

      // Transform the data to include follower_count
      const collectionsWithCounts = ((data || []) as CollectionRow[]).map((collection) => ({
        id: collection.id,
        user_id: collection.user_id,
        title: collection.title,
        description: collection.description,
        quote_ids: collection.quote_ids,
        visibility: collection.visibility,
        created_at: collection.created_at,
        updated_at: collection.updated_at,
        follower_count: collection.collection_follows?.[0]?.count || 0,
      }));

      setCollections(collectionsWithCounts);

      // Fetch followed collections
      const followed = await getFollowedCollections(user.id);
      setFollowedCollections(followed);

      setLoading(false);
    };

    if (!authLoading) {
      loadCollections();
    }
  }, [user, authLoading]);

  // Not signed in state
  if (!authLoading && !isSignedIn) {
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
            <h2 className="quote-text text-xl sm:text-2xl text-foreground/70 mb-3">
              Sign in to create collections
            </h2>
            <p className="body-text text-foreground/60 text-sm mb-8 leading-relaxed">
              Collections let you curate and organize quotes that resonate with you.
            </p>
            <Link
              href="/account/signin"
              className="inline-flex items-center gap-2 body-text text-sm text-foreground/60 hover:text-foreground/80 transition-colors btn-nav px-4 py-2"
            >
              Sign in
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="quote-text text-2xl text-center mb-8 text-foreground/80">
            My Collections
          </h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-foreground/5 rounded-lg p-4"
              >
                <div className="h-5 bg-foreground/10 rounded w-1/3 mb-2" />
                <div className="h-4 bg-foreground/10 rounded w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state - only show if user has no owned AND no followed collections
  if (collections.length === 0 && followedCollections.length === 0) {
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
            <h2 className="quote-text text-xl sm:text-2xl text-foreground/70 mb-3">
              No collections yet
            </h2>
            <p className="body-text text-foreground/60 text-sm mb-8 leading-relaxed">
              Create your first collection by tapping the + button on any quote.
            </p>
            <Link
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
              Browse quotes
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Collections list
  return (
    <PageTransition>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="quote-text text-2xl text-center mb-8 text-foreground/80">
            My Collections
          </h1>

          {/* Owned collections section */}
          {collections.length > 0 && (
            <div className="space-y-3">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  className="block bg-foreground/5 hover:bg-foreground/10 rounded-lg p-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="quote-text text-lg text-foreground/90 truncate">
                        {collection.title}
                      </h2>
                      <div className="flex items-center gap-3 mt-1 body-text text-sm text-foreground/60">
                        <span>
                          {collection.quote_ids.length} quote{collection.quote_ids.length !== 1 ? "s" : ""}
                        </span>
                        {collection.visibility === "public" && collection.follower_count !== undefined && collection.follower_count > 0 && (
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            {collection.follower_count}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
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
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Following section */}
          {followedCollections.length > 0 && (
            <div className={collections.length > 0 ? "mt-10" : ""}>
              <h2 className="quote-text text-lg text-foreground/60 mb-4 flex items-center gap-2">
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
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                Following
              </h2>
              <div className="space-y-3">
                {followedCollections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.id}`}
                    className="block bg-foreground/5 hover:bg-foreground/10 rounded-lg p-4 transition-colors border-l-2 border-foreground/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="quote-text text-lg text-foreground/90 truncate">
                          {collection.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 body-text text-sm text-foreground/60">
                          <span>
                            {collection.quote_ids.length} quote{collection.quote_ids.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
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
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
