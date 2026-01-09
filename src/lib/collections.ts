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
