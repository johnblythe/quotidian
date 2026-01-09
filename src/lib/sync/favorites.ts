/**
 * Sync service for favorites
 * Handles bidirectional sync between IndexedDB and Supabase
 */

import { db } from '@/lib/db';
import { getSupabase } from '@/lib/supabase';
import type { FavoriteQuote } from '@/types';
import type { SupabaseFavorite, SupabaseFavoriteInsert } from '@/types/supabase';

/** Convert local favorite to Supabase format */
function toSupabaseFormat(local: FavoriteQuote, userId: string): SupabaseFavoriteInsert {
  return {
    user_id: userId,
    quote_id: local.quoteId,
    saved_at: local.savedAt.toISOString(),
  };
}

/** Convert Supabase favorite to local format */
function toLocalFormat(remote: SupabaseFavorite): Omit<FavoriteQuote, 'id'> {
  return {
    quoteId: remote.quote_id,
    savedAt: new Date(remote.saved_at),
  };
}

/**
 * Push local favorites to Supabase
 * Adds any favorites that exist locally but not remotely
 * Removes any that were deleted locally (by detecting missing quoteIds)
 */
export async function pushFavorites(): Promise<{ success: boolean; error?: string; pushed?: number }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not signed in' };
  }

  // Get all local favorites
  const localFavorites = await db.favorites.toArray();
  const localQuoteIds = new Set(localFavorites.map(f => f.quoteId));

  // Get existing remote favorites
  const { data: remoteFavorites, error: fetchError } = await supabase
    .from('favorites')
    .select('id, quote_id')
    .eq('user_id', user.id);

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  const remoteQuoteIds = new Set((remoteFavorites || []).map(f => f.quote_id));

  let pushed = 0;

  // Add favorites that exist locally but not remotely
  for (const local of localFavorites) {
    if (!remoteQuoteIds.has(local.quoteId)) {
      const { error } = await supabase
        .from('favorites')
        .insert(toSupabaseFormat(local, user.id));

      if (error) {
        console.error(`Failed to insert favorite ${local.quoteId}:`, error.message);
        continue;
      }
      pushed++;
    }
  }

  // Remove favorites that exist remotely but not locally (user unfavorited)
  for (const remote of (remoteFavorites || [])) {
    if (!localQuoteIds.has(remote.quote_id)) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', remote.id);

      if (error) {
        console.error(`Failed to delete favorite ${remote.quote_id}:`, error.message);
        continue;
      }
      pushed++; // Count deletions as sync operations too
    }
  }

  return { success: true, pushed };
}

/**
 * Pull favorites from Supabase to local
 * Adds any favorites that exist remotely but not locally
 * Removes any that were deleted remotely
 */
export async function pullFavorites(): Promise<{ success: boolean; error?: string; pulled?: number }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not signed in' };
  }

  // Fetch all remote favorites
  const { data: remoteFavorites, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  const remoteQuoteIds = new Set((remoteFavorites || []).map(f => f.quote_id));

  // Get all local favorites for comparison
  const localFavorites = await db.favorites.toArray();
  const localMap = new Map(localFavorites.map(f => [f.quoteId, f]));

  let pulled = 0;

  // Add favorites that exist remotely but not locally
  for (const remote of (remoteFavorites || [])) {
    if (!localMap.has(remote.quote_id)) {
      const localData = toLocalFormat(remote);
      await db.favorites.add(localData as FavoriteQuote);
      pulled++;
    }
  }

  // Remove favorites that exist locally but not remotely (deleted on another device)
  for (const local of localFavorites) {
    if (!remoteQuoteIds.has(local.quoteId)) {
      await db.favorites.delete(local.id!);
      pulled++; // Count deletions as sync operations too
    }
  }

  return { success: true, pulled };
}

/**
 * Full two-way sync for favorites
 * Pulls first to get remote state, then pushes local additions
 * Note: For favorites, we can't do true "last-write-wins" for removals
 * since we don't track when something was unfavorited.
 * Current strategy: remote wins on pull, local wins on push.
 * To get true bidirectional sync, run pullFavorites then pushFavorites.
 */
export async function syncFavorites(): Promise<{ success: boolean; error?: string }> {
  // Pull first to get any remote changes
  const pullResult = await pullFavorites();
  if (!pullResult.success) {
    return pullResult;
  }

  // Then push local changes
  const pushResult = await pushFavorites();
  return pushResult;
}
