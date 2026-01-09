"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getSupabase } from "@/lib/supabase";
import { getQuoteById } from "@/lib/quotes";
import { removeQuoteFromCollection, deleteCollection, updateCollection, followCollection, unfollowCollection, isFollowingCollection, getFollowerCount } from "@/lib/collections";
import { startCollectionJourney, hasActiveJourney } from "@/lib/journeys";
import { useRouter } from "next/navigation";
import { Quote } from "@/components/Quote";
import { PageTransition } from "@/components/PageTransition";
import type { Collection } from "@/types";
import type { Quote as QuoteType } from "@/types";

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [quotes, setQuotes] = useState<(QuoteType | undefined)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quoteToRemove, setQuoteToRemove] = useState<QuoteType | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVisibility, setEditVisibility] = useState<"private" | "public">("private");
  const [isSaving, setIsSaving] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowingAction, setIsFollowingAction] = useState(false);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [isUnfollowing, setIsUnfollowing] = useState(false);
  const [hasExistingJourney, setHasExistingJourney] = useState(false);
  const [isStartingJourney, setIsStartingJourney] = useState(false);

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

      // Load follower count for public collections
      if (data.visibility === "public") {
        const count = await getFollowerCount(collectionId);
        setFollowerCount(count);
      }

      setLoading(false);
    };

    if (!authLoading) {
      loadCollection();
    }
  }, [collectionId, authLoading]);

  // Load follow status when user changes or collection loads
  useEffect(() => {
    const loadFollowStatus = async () => {
      if (!user || !collection || collection.visibility !== "public") {
        setIsFollowing(false);
        return;
      }

      // Don't check follow status for own collection
      if (user.id === collection.user_id) {
        setIsFollowing(false);
        return;
      }

      const following = await isFollowingCollection(collectionId, user.id);
      setIsFollowing(following);
    };

    loadFollowStatus();
  }, [user, collection, collectionId]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Check for existing journey
  useEffect(() => {
    const checkJourney = async () => {
      const active = await hasActiveJourney();
      setHasExistingJourney(active);
    };
    checkJourney();
  }, []);

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

  // Handle delete collection
  const handleDeleteCollection = async () => {
    if (!collection) return;

    setIsDeleting(true);
    const result = await deleteCollection(collectionId);
    setIsDeleting(false);

    if (result.success) {
      router.push("/collections");
    } else {
      setShowDeleteConfirm(false);
      setToast(result.error || "Failed to delete collection");
    }
  };

  // Open edit form and populate fields
  const openEditForm = () => {
    if (!collection) return;
    setEditTitle(collection.title);
    setEditDescription(collection.description || "");
    setEditVisibility(collection.visibility);
    setShowEditForm(true);
  };

  // Handle save collection edits
  const handleSaveEdit = async () => {
    if (!collection || !editTitle.trim()) return;

    setIsSaving(true);
    const result = await updateCollection(collectionId, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      visibility: editVisibility,
    });
    setIsSaving(false);

    if (result.success) {
      // Update local state
      setCollection((prev) =>
        prev
          ? {
              ...prev,
              title: editTitle.trim(),
              description: editDescription.trim() || null,
              visibility: editVisibility,
            }
          : null
      );
      setShowEditForm(false);
      setToast("Collection updated");
    } else {
      setToast(result.error || "Failed to update collection");
    }
  };

  // Handle follow collection
  const handleFollow = async () => {
    if (!user || !collection || isFollowingAction) return;

    setIsFollowingAction(true);
    const result = await followCollection(collectionId, user.id);
    setIsFollowingAction(false);

    if (result.success) {
      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
      setToast("Now following this collection");
    } else {
      setToast(result.error || "Failed to follow collection");
    }
  };

  // Handle unfollow collection
  const handleUnfollow = async () => {
    if (!user || !collection || isUnfollowing) return;

    setIsUnfollowing(true);
    const result = await unfollowCollection(collectionId, user.id);
    setIsUnfollowing(false);

    if (result.success) {
      setIsFollowing(false);
      setFollowerCount((prev) => Math.max(0, prev - 1));
      setShowUnfollowConfirm(false);
      setToast("Unfollowed collection");
    } else {
      setToast(result.error || "Failed to unfollow collection");
    }
  };

  // Handle start collection journey
  const handleStartJourney = async () => {
    if (!collection || isStartingJourney || hasExistingJourney) return;

    setIsStartingJourney(true);
    try {
      // Duration = number of quotes in collection
      await startCollectionJourney(collectionId, quotes.length);
      setHasExistingJourney(true);
      setToast("Journey started!");
      // Navigate to home to begin the journey
      router.push("/");
    } catch (error) {
      console.error("Error starting journey:", error);
      setToast("Failed to start journey");
    }
    setIsStartingJourney(false);
  };

  // Check if collection has enough quotes for a journey (3+)
  const canStartJourney = quotes.length >= 3 && !hasExistingJourney;

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
              {collection.visibility === "public" && (
                <p className="body-text text-foreground/40 text-xs mt-2">
                  {followerCount} follower{followerCount !== 1 ? "s" : ""}
                </p>
              )}
              {/* Follow button for public collections (not owned by user) */}
              {collection.visibility === "public" && !isOwner && user && (
                <div className="mt-4">
                  {isFollowing ? (
                    <button
                      onClick={() => setShowUnfollowConfirm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md body-text text-sm transition-colors bg-foreground/10 text-foreground/60 hover:bg-foreground/15 hover:text-foreground/80"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Following
                    </button>
                  ) : (
                    <button
                      onClick={handleFollow}
                      disabled={isFollowingAction}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md body-text text-sm transition-colors bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
                    >
                      {isFollowingAction ? (
                        "Following..."
                      ) : (
                        <>
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
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Follow
                        </>
                      )}
                    </button>
                  )}
                </div>
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
                <div className="flex flex-col items-center gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 body-text text-sm text-foreground/60 hover:text-foreground/80 transition-colors btn-nav px-4 py-2"
                  >
                    Browse quotes
                  </Link>
                  {isOwner && (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={openEditForm}
                        className="inline-flex items-center gap-2 body-text text-xs text-foreground/60 hover:text-foreground/80 transition-colors"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="inline-flex items-center gap-2 body-text text-xs text-red-500/70 hover:text-red-500 transition-colors"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Delete collection confirmation dialog */}
          {showDeleteConfirm && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <div
                className="bg-background rounded-lg shadow-xl max-w-sm w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="quote-text text-lg text-foreground/80 mb-2">
                  Delete collection?
                </h3>
                <p className="body-text text-foreground/60 text-sm mb-2">
                  &ldquo;{collection.title}&rdquo;
                </p>
                <p className="body-text text-red-500/80 text-xs mb-6">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="body-text text-sm text-foreground/60 hover:text-foreground/80 px-4 py-2 transition-colors"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCollection}
                    disabled={isDeleting}
                    className="body-text text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Unfollow confirmation dialog (empty state) */}
          {showUnfollowConfirm && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowUnfollowConfirm(false)}
            >
              <div
                className="bg-background rounded-lg shadow-xl max-w-sm w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="quote-text text-lg text-foreground/80 mb-2">
                  Unfollow collection?
                </h3>
                <p className="body-text text-foreground/60 text-sm mb-6">
                  You will no longer see &ldquo;{collection.title}&rdquo; in your followed collections.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowUnfollowConfirm(false)}
                    className="body-text text-sm text-foreground/60 hover:text-foreground/80 px-4 py-2 transition-colors"
                    disabled={isUnfollowing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUnfollow}
                    disabled={isUnfollowing}
                    className="body-text text-sm bg-foreground/80 hover:bg-foreground text-background px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    {isUnfollowing ? "Unfollowing..." : "Unfollow"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast notification (empty state) */}
          {toast && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg body-text text-sm z-50">
              {toast}
            </div>
          )}
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
              {collection.visibility === "public" && (
                <span className="ml-2">
                  · {followerCount} follower{followerCount !== 1 ? "s" : ""}
                </span>
              )}
            </p>
            {/* Follow button for public collections (not owned by user) */}
            {collection.visibility === "public" && !isOwner && user && (
              <div className="mt-4">
                {isFollowing ? (
                  <button
                    onClick={() => setShowUnfollowConfirm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md body-text text-sm transition-colors bg-foreground/10 text-foreground/60 hover:bg-foreground/15 hover:text-foreground/80"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    Following
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    disabled={isFollowingAction}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md body-text text-sm transition-colors bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
                  >
                    {isFollowingAction ? (
                      "Following..."
                    ) : (
                      <>
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Follow
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
            {isOwner && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  onClick={openEditForm}
                  className="inline-flex items-center gap-2 body-text text-xs text-foreground/60 hover:text-foreground/80 transition-colors"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 body-text text-xs text-red-500/70 hover:text-red-500 transition-colors"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            )}
            {/* Start Journey button - only for collections with 3+ quotes */}
            {canStartJourney && user && (
              <div className="mt-6">
                <button
                  onClick={handleStartJourney}
                  disabled={isStartingJourney}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md body-text text-sm transition-colors bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
                >
                  {isStartingJourney ? (
                    "Starting..."
                  ) : (
                    <>
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
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Start Journey
                    </>
                  )}
                </button>
              </div>
            )}
            {hasExistingJourney && user && quotes.length >= 3 && (
              <p className="mt-4 body-text text-foreground/40 text-xs">
                Complete your current journey before starting a new one
              </p>
            )}
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

        {/* Delete collection confirmation dialog */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="bg-background rounded-lg shadow-xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="quote-text text-lg text-foreground/80 mb-2">
                Delete collection?
              </h3>
              <p className="body-text text-foreground/60 text-sm mb-2">
                &ldquo;{collection.title}&rdquo;
              </p>
              <p className="body-text text-red-500/80 text-xs mb-6">
                This action cannot be undone. All quotes will remain saved but will be removed from this collection.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="body-text text-sm text-foreground/60 hover:text-foreground/80 px-4 py-2 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCollection}
                  disabled={isDeleting}
                  className="body-text text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit collection form modal */}
        {showEditForm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditForm(false)}
          >
            <div
              className="bg-background rounded-lg shadow-xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="quote-text text-lg text-foreground/80 mb-4">
                Edit collection
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="body-text text-xs text-foreground/60 block mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-transparent body-text text-sm focus:outline-none focus:border-foreground/40"
                    placeholder="Collection title"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="body-text text-xs text-foreground/60 block mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-transparent body-text text-sm focus:outline-none focus:border-foreground/40 resize-none"
                    placeholder="What is this collection about?"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="body-text text-xs text-foreground/60 block mb-2">
                    Visibility
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditVisibility("private")}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border body-text text-sm transition-colors ${
                        editVisibility === "private"
                          ? "border-foreground/40 bg-foreground/5"
                          : "border-foreground/20 hover:border-foreground/30"
                      }`}
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Private
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditVisibility("public")}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border body-text text-sm transition-colors ${
                        editVisibility === "public"
                          ? "border-foreground/40 bg-foreground/5"
                          : "border-foreground/20 hover:border-foreground/30"
                      }`}
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
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Public
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowEditForm(false)}
                  className="body-text text-sm text-foreground/60 hover:text-foreground/80 px-4 py-2 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editTitle.trim()}
                  className="body-text text-sm bg-foreground text-background px-4 py-2 rounded-md transition-colors disabled:opacity-50 hover:bg-foreground/90"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unfollow confirmation dialog */}
        {showUnfollowConfirm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUnfollowConfirm(false)}
          >
            <div
              className="bg-background rounded-lg shadow-xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="quote-text text-lg text-foreground/80 mb-2">
                Unfollow collection?
              </h3>
              <p className="body-text text-foreground/60 text-sm mb-6">
                You will no longer see &ldquo;{collection.title}&rdquo; in your followed collections.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowUnfollowConfirm(false)}
                  className="body-text text-sm text-foreground/60 hover:text-foreground/80 px-4 py-2 transition-colors"
                  disabled={isUnfollowing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnfollow}
                  disabled={isUnfollowing}
                  className="body-text text-sm bg-foreground/80 hover:bg-foreground text-background px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                >
                  {isUnfollowing ? "Unfollowing..." : "Unfollow"}
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
