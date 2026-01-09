"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Collection, CollectionVisibility } from "@/types";

interface AddToCollectionModalProps {
  quoteId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Modal for adding a quote to a collection
 * Lists user's collections with radio selection, shows check marks for already-added
 * Includes form for creating new collections
 */
export function AddToCollectionModal({
  quoteId,
  isOpen,
  onClose,
  onSuccess,
}: AddToCollectionModalProps) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New collection form state
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newVisibility, setNewVisibility] = useState<CollectionVisibility>("private");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch user's collections when modal opens
  useEffect(() => {
    if (!isOpen || !user) {
      return;
    }

    const fetchCollections = async () => {
      setIsLoading(true);
      setError(null);

      const supabase = getSupabase();
      if (!supabase) {
        setError("Supabase not configured");
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (fetchError) {
        console.error("Failed to fetch collections:", fetchError);
        setError("Failed to load collections");
      } else {
        setCollections(data || []);
      }

      setIsLoading(false);
    };

    fetchCollections();
  }, [isOpen, user]);

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

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      setError(null);
      setShowNewForm(false);
      setNewTitle("");
      setNewDescription("");
      setNewVisibility("private");
    }
  }, [isOpen]);

  // Handle creating a new collection
  const handleCreateCollection = async () => {
    if (!newTitle.trim() || !user) return;

    setIsCreating(true);
    setError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase not configured");
      setIsCreating(false);
      return;
    }

    const { data, error: createError } = await supabase
      .from("collections")
      .insert({
        user_id: user.id,
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        quote_ids: [],
        visibility: newVisibility,
      })
      .select()
      .single();

    if (createError) {
      console.error("Failed to create collection:", createError);
      setError("Failed to create collection");
      setIsCreating(false);
      return;
    }

    // Add new collection to list and auto-select it
    setCollections((prev) => [data, ...prev]);
    setSelectedId(data.id);

    // Reset form and close it
    setShowNewForm(false);
    setNewTitle("");
    setNewDescription("");
    setNewVisibility("private");
    setIsCreating(false);
  };

  const handleConfirm = async () => {
    if (!selectedId || !user) return;

    const collection = collections.find((c) => c.id === selectedId);
    if (!collection) return;

    // Check if quote already in collection
    if (collection.quote_ids.includes(quoteId)) {
      setError("Quote is already in this collection");
      return;
    }

    setIsSaving(true);
    setError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase not configured");
      setIsSaving(false);
      return;
    }

    const updatedQuoteIds = [...collection.quote_ids, quoteId];

    const { error: updateError } = await supabase
      .from("collections")
      .update({ quote_ids: updatedQuoteIds })
      .eq("id", selectedId);

    if (updateError) {
      console.error("Failed to add quote to collection:", updateError);
      setError("Failed to add quote to collection");
      setIsSaving(false);
      return;
    }

    // Update local state
    setCollections((prev) =>
      prev.map((c) =>
        c.id === selectedId ? { ...c, quote_ids: updatedQuoteIds } : c
      )
    );

    setIsSaving(false);
    onSuccess?.();
    onClose();
  };

  const isQuoteInCollection = (collection: Collection) => {
    return collection.quote_ids.includes(quoteId);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-background rounded-lg max-w-md w-full shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-foreground/10">
          <h2 className="font-serif text-lg">Add to Collection</h2>
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

        {/* Content */}
        <div className="p-4 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-foreground/50 body-text text-sm">
                Loading collections...
              </span>
            </div>
          ) : error && collections.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-red-500 body-text text-sm">{error}</span>
            </div>
          ) : collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-foreground/50 body-text text-sm mb-2">
                No collections yet
              </span>
              <span className="text-foreground/40 body-text text-xs">
                Create your first collection using the + New Collection button
                below
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((collection) => {
                const isAdded = isQuoteInCollection(collection);
                return (
                  <label
                    key={collection.id}
                    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                      selectedId === collection.id
                        ? "bg-foreground/10"
                        : "hover:bg-foreground/5"
                    } ${isAdded ? "opacity-60" : ""}`}
                  >
                    <input
                      type="radio"
                      name="collection"
                      value={collection.id}
                      checked={selectedId === collection.id}
                      onChange={() => setSelectedId(collection.id)}
                      disabled={isAdded}
                      className="w-4 h-4 text-foreground accent-foreground"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-sm truncate">
                          {collection.title}
                        </span>
                        {collection.visibility === "public" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-foreground/40 flex-shrink-0"
                            aria-label="Public collection"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-foreground/50 body-text">
                        {collection.quote_ids.length}{" "}
                        {collection.quote_ids.length === 1 ? "quote" : "quotes"}
                      </span>
                    </div>
                    {isAdded && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600 flex-shrink-0"
                        aria-label="Already in collection"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* New Collection Form */}
        {showNewForm ? (
          <div className="px-4 pb-4 border-t border-foreground/10 pt-4">
            <div className="space-y-3">
              {/* Title field */}
              <div>
                <label className="block text-xs text-foreground/60 body-text mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="My Collection"
                  className="w-full px-3 py-2 text-sm rounded-md border border-foreground/20 bg-transparent focus:border-foreground/40 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              {/* Description field */}
              <div>
                <label className="block text-xs text-foreground/60 body-text mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="A brief description..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-md border border-foreground/20 bg-transparent focus:border-foreground/40 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Visibility toggle */}
              <div>
                <label className="block text-xs text-foreground/60 body-text mb-2">
                  Visibility
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewVisibility("private")}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md border transition-colors ${
                      newVisibility === "private"
                        ? "border-foreground bg-foreground/5"
                        : "border-foreground/20 hover:border-foreground/40"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Private
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVisibility("public")}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md border transition-colors ${
                      newVisibility === "public"
                        ? "border-foreground bg-foreground/5"
                        : "border-foreground/20 hover:border-foreground/40"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    Public
                  </button>
                </div>
              </div>

              {/* Form actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewTitle("");
                    setNewDescription("");
                    setNewVisibility("private");
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-foreground/20 rounded-md hover:bg-foreground/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCollection}
                  disabled={!newTitle.trim() || isCreating}
                  className="flex-1 px-3 py-2 text-sm bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
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
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 pb-2">
            <button
              type="button"
              onClick={() => setShowNewForm(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border border-dashed border-foreground/20 rounded-md hover:border-foreground/40 hover:bg-foreground/5 transition-colors text-foreground/60 hover:text-foreground"
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Collection
            </button>
          </div>
        )}

        {/* Error message */}
        {error && collections.length > 0 && (
          <div className="px-4 pb-2">
            <div className="px-3 py-2 rounded-md bg-red-100 text-red-800 text-sm text-center">
              {error}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 pt-0 flex gap-3 justify-end border-t border-foreground/10 mt-2 pt-4">
          <button
            onClick={onClose}
            className="btn-nav px-4 py-2 text-sm border border-foreground/20 rounded-md hover:bg-foreground/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId || isSaving}
            className="btn-nav px-4 py-2 text-sm bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
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
                Adding...
              </>
            ) : (
              "Add to Collection"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
