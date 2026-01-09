import { getSupabase } from "@/lib/supabase";
import type { Collection } from "@/types";

/**
 * Add a quote to a collection
 * Updates quote_ids array in Supabase, prevents duplicates
 * @returns Object with success boolean and optional error message
 */
export async function addQuoteToCollection(
  collectionId: string,
  quoteId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  // Fetch current collection to get quote_ids
  const { data: collection, error: fetchError } = await supabase
    .from("collections")
    .select("quote_ids")
    .eq("id", collectionId)
    .single();

  if (fetchError) {
    console.error("Failed to fetch collection:", fetchError);
    return { success: false, error: "Failed to fetch collection" };
  }

  // Check for duplicate
  const currentQuoteIds = (collection?.quote_ids as string[]) || [];
  if (currentQuoteIds.includes(quoteId)) {
    return { success: false, error: "Quote is already in this collection" };
  }

  // Update with new quote
  const updatedQuoteIds = [...currentQuoteIds, quoteId];
  const { error: updateError } = await supabase
    .from("collections")
    .update({ quote_ids: updatedQuoteIds })
    .eq("id", collectionId);

  if (updateError) {
    console.error("Failed to add quote to collection:", updateError);
    return { success: false, error: "Failed to add quote to collection" };
  }

  return { success: true };
}

/**
 * Remove a quote from a collection
 * Updates quote_ids array in Supabase
 * @returns Object with success boolean and optional error message
 */
export async function removeQuoteFromCollection(
  collectionId: string,
  quoteId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  // Fetch current collection to get quote_ids
  const { data: collection, error: fetchError } = await supabase
    .from("collections")
    .select("quote_ids")
    .eq("id", collectionId)
    .single();

  if (fetchError) {
    console.error("Failed to fetch collection:", fetchError);
    return { success: false, error: "Failed to fetch collection" };
  }

  // Remove quote from array
  const currentQuoteIds = (collection?.quote_ids as string[]) || [];
  const updatedQuoteIds = currentQuoteIds.filter((id) => id !== quoteId);

  const { error: updateError } = await supabase
    .from("collections")
    .update({ quote_ids: updatedQuoteIds })
    .eq("id", collectionId);

  if (updateError) {
    console.error("Failed to remove quote from collection:", updateError);
    return { success: false, error: "Failed to remove quote from collection" };
  }

  return { success: true };
}

/**
 * Get a collection by ID
 * @returns The collection or null if not found
 */
export async function getCollection(
  collectionId: string
): Promise<Collection | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("id", collectionId)
    .single();

  if (error) {
    console.error("Failed to fetch collection:", error);
    return null;
  }

  return data as Collection;
}

/**
 * Get all collections for a user
 * @returns Array of collections or empty array on error
 */
export async function getUserCollections(
  userId: string
): Promise<Collection[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch collections:", error);
    return [];
  }

  return (data as Collection[]) || [];
}

/**
 * Update a collection's details
 * Updates title, description, and visibility in Supabase
 * @returns Object with success boolean and optional error message
 */
export async function updateCollection(
  collectionId: string,
  updates: {
    title?: string;
    description?: string;
    visibility?: "private" | "public";
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  const { error } = await supabase
    .from("collections")
    .update(updates)
    .eq("id", collectionId);

  if (error) {
    console.error("Failed to update collection:", error);
    return { success: false, error: "Failed to update collection" };
  }

  return { success: true };
}

/**
 * Delete a collection
 * Removes the collection from Supabase (cascade deletes follows)
 * @returns Object with success boolean and optional error message
 */
export async function deleteCollection(
  collectionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId);

  if (error) {
    console.error("Failed to delete collection:", error);
    return { success: false, error: "Failed to delete collection" };
  }

  return { success: true };
}

/** Collection with follower count for discovery */
export interface PopularCollection {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  quote_ids: string[];
  visibility: "private" | "public";
  created_at: string;
  updated_at: string;
  follower_count: number;
}

/** Collection with quote count for "New" section */
export interface NewCollection {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  quote_ids: string[];
  visibility: "private" | "public";
  created_at: string;
  updated_at: string;
  quote_count: number;
}

/**
 * Get popular public collections ordered by follower count
 * @param limit Number of collections to return (default 10)
 * @returns Array of collections with follower counts
 */
export async function getPopularCollections(
  limit: number = 10
): Promise<PopularCollection[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return [];
  }

  // Fetch public collections with follower counts
  const { data, error } = await supabase
    .from("collections")
    .select(`
      *,
      collection_follows(count)
    `)
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch popular collections:", error);
    return [];
  }

  // Transform and sort by follower count
  type CollectionRow = {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    quote_ids: string[];
    visibility: "private" | "public";
    created_at: string;
    updated_at: string;
    collection_follows: { count: number }[];
  };

  const collectionsWithCounts = ((data || []) as CollectionRow[])
    .map((collection) => ({
      id: collection.id,
      user_id: collection.user_id,
      title: collection.title,
      description: collection.description,
      quote_ids: collection.quote_ids,
      visibility: collection.visibility,
      created_at: collection.created_at,
      updated_at: collection.updated_at,
      follower_count: collection.collection_follows?.[0]?.count || 0,
    }))
    .sort((a, b) => b.follower_count - a.follower_count)
    .slice(0, limit);

  return collectionsWithCounts;
}

/**
 * Get new public collections from the last 30 days, ordered by created_at desc
 * @param limit Number of collections to return (default 10)
 * @returns Array of collections with quote counts
 */
export async function getNewCollections(
  limit: number = 10
): Promise<NewCollection[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return [];
  }

  // Calculate date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

  // Fetch public collections created in last 30 days
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("visibility", "public")
    .gte("created_at", thirtyDaysAgoISO)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch new collections:", error);
    return [];
  }

  // Transform to include quote_count
  const collectionsWithCounts = ((data || []) as Collection[]).map(
    (collection) => ({
      id: collection.id,
      user_id: collection.user_id,
      title: collection.title,
      description: collection.description,
      quote_ids: collection.quote_ids,
      visibility: collection.visibility,
      created_at: collection.created_at,
      updated_at: collection.updated_at,
      quote_count: collection.quote_ids?.length || 0,
    })
  );

  return collectionsWithCounts;
}

/**
 * Follow a collection
 * Inserts a record into collection_follows
 * @returns Object with success boolean and optional error message
 */
export async function followCollection(
  collectionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  const { error } = await supabase.from("collection_follows").insert({
    collection_id: collectionId,
    user_id: userId,
  });

  if (error) {
    // Check if already following (unique constraint violation)
    if (error.code === "23505") {
      return { success: false, error: "Already following this collection" };
    }
    console.error("Failed to follow collection:", error);
    return { success: false, error: "Failed to follow collection" };
  }

  return { success: true };
}

/**
 * Check if a user is following a collection
 * @returns Boolean indicating follow status
 */
export async function isFollowingCollection(
  collectionId: string,
  userId: string
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    return false;
  }

  const { data, error } = await supabase
    .from("collection_follows")
    .select("collection_id")
    .eq("collection_id", collectionId)
    .eq("user_id", userId)
    .single();

  if (error) {
    // PGRST116 means no rows found - not an error, just not following
    if (error.code !== "PGRST116") {
      console.error("Failed to check follow status:", error);
    }
    return false;
  }

  return !!data;
}

/**
 * Get the follower count for a collection
 * @returns Number of followers
 */
export async function getFollowerCount(collectionId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) {
    return 0;
  }

  const { count, error } = await supabase
    .from("collection_follows")
    .select("*", { count: "exact", head: true })
    .eq("collection_id", collectionId);

  if (error) {
    console.error("Failed to get follower count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Unfollow a collection
 * Deletes the record from collection_follows
 * @returns Object with success boolean and optional error message
 */
export async function unfollowCollection(
  collectionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  const { error } = await supabase
    .from("collection_follows")
    .delete()
    .eq("collection_id", collectionId)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to unfollow collection:", error);
    return { success: false, error: "Failed to unfollow collection" };
  }

  return { success: true };
}

/** Followed collection with owner info */
export interface FollowedCollection extends Collection {
  followed_at: string;
}

/**
 * Get collections that a user follows (not owns)
 * @returns Array of collections the user follows
 */
export async function getFollowedCollections(
  userId: string
): Promise<FollowedCollection[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return [];
  }

  // Fetch collection_follows for this user with the collection data
  const { data, error } = await supabase
    .from("collection_follows")
    .select(`
      followed_at,
      collections (
        id,
        user_id,
        title,
        description,
        quote_ids,
        visibility,
        created_at,
        updated_at
      )
    `)
    .eq("user_id", userId)
    .order("followed_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch followed collections:", error);
    return [];
  }

  // Transform the joined data into FollowedCollection array
  // Supabase returns the related table as a single object (not array) for foreign key relations
  type CollectionData = {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    quote_ids: string[];
    visibility: "private" | "public";
    created_at: string;
    updated_at: string;
  };

  type FollowRow = {
    followed_at: string;
    collections: CollectionData | CollectionData[] | null;
  };

  const followedCollections = ((data || []) as unknown as FollowRow[])
    .filter((row) => row.collections !== null)
    .map((row) => {
      // Handle both single object and array cases (Supabase returns single object for FK)
      const collection = Array.isArray(row.collections)
        ? row.collections[0]
        : row.collections;
      if (!collection) return null;
      return {
        id: collection.id,
        user_id: collection.user_id,
        title: collection.title,
        description: collection.description,
        quote_ids: collection.quote_ids,
        visibility: collection.visibility,
        created_at: collection.created_at,
        updated_at: collection.updated_at,
        followed_at: row.followed_at,
      };
    })
    .filter((c): c is FollowedCollection => c !== null);

  return followedCollections;
}
