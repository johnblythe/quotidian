/**
 * Sync service for quote history
 * Handles bidirectional sync between IndexedDB and Supabase
 */

import { db } from '@/lib/db';
import { getSupabase } from '@/lib/supabase';
import type { QuoteHistory } from '@/types';
import type { SupabaseQuoteHistory, SupabaseQuoteHistoryInsert } from '@/types/supabase';

/** Convert local history entry to Supabase format */
function toSupabaseFormat(local: QuoteHistory, userId: string): SupabaseQuoteHistoryInsert {
  return {
    user_id: userId,
    quote_id: local.quoteId,
    shown_at: local.shownAt.toISOString(),
    fresh_pull: local.freshPull,
  };
}

/** Convert Supabase history entry to local format */
function toLocalFormat(remote: SupabaseQuoteHistory): Omit<QuoteHistory, 'id'> {
  return {
    quoteId: remote.quote_id,
    shownAt: new Date(remote.shown_at),
    freshPull: remote.fresh_pull,
  };
}

/**
 * Create a unique key for a history entry
 * We use quoteId + shownAt timestamp to deduplicate
 */
function getHistoryKey(quoteId: string, shownAt: Date | string): string {
  const ts = typeof shownAt === 'string' ? shownAt : shownAt.toISOString();
  return `${quoteId}:${ts}`;
}

/**
 * Push local history entries to Supabase
 * Adds entries that exist locally but not remotely
 */
export async function pushHistory(): Promise<{ success: boolean; error?: string; pushed?: number }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not signed in' };
  }

  // Get all local history
  const localHistory = await db.quoteHistory.toArray();

  // Get existing remote history
  const { data: remoteHistory, error: fetchError } = await supabase
    .from('quote_history')
    .select('quote_id, shown_at')
    .eq('user_id', user.id);

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  // Build set of remote keys for deduplication
  const remoteKeys = new Set(
    (remoteHistory || []).map(r => getHistoryKey(r.quote_id, r.shown_at))
  );

  let pushed = 0;

  // Add entries that exist locally but not remotely
  for (const local of localHistory) {
    const key = getHistoryKey(local.quoteId, local.shownAt);
    if (!remoteKeys.has(key)) {
      const { error } = await supabase
        .from('quote_history')
        .insert(toSupabaseFormat(local, user.id));

      if (error) {
        console.error(`Failed to insert history ${local.quoteId}:`, error.message);
        continue;
      }
      pushed++;
    }
  }

  return { success: true, pushed };
}

/**
 * Pull history entries from Supabase to local
 * Adds entries that exist remotely but not locally
 */
export async function pullHistory(): Promise<{ success: boolean; error?: string; pulled?: number }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not signed in' };
  }

  // Fetch all remote history
  const { data: remoteHistory, error } = await supabase
    .from('quote_history')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  // Get all local history for comparison
  const localHistory = await db.quoteHistory.toArray();
  const localKeys = new Set(
    localHistory.map(l => getHistoryKey(l.quoteId, l.shownAt))
  );

  let pulled = 0;

  // Add entries that exist remotely but not locally
  for (const remote of (remoteHistory || [])) {
    const key = getHistoryKey(remote.quote_id, remote.shown_at);
    if (!localKeys.has(key)) {
      const localData = toLocalFormat(remote);
      await db.quoteHistory.add(localData as QuoteHistory);
      pulled++;
    }
  }

  return { success: true, pulled };
}

/**
 * Full two-way sync for quote history
 * Pulls first to get remote entries, then pushes local entries
 * History is append-only (entries are never deleted/modified), so no conflicts
 */
export async function syncHistory(): Promise<{ success: boolean; error?: string }> {
  // Pull first to get any remote entries
  const pullResult = await pullHistory();
  if (!pullResult.success) {
    return pullResult;
  }

  // Then push local entries
  const pushResult = await pushHistory();
  return pushResult;
}
