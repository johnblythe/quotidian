/**
 * Sync service for journal entries
 * Handles bidirectional sync between IndexedDB and Supabase
 */

import { db } from '@/lib/db';
import { getSupabase } from '@/lib/supabase';
import type { JournalEntry } from '@/types';
import type { SupabaseJournalEntry, SupabaseJournalEntryInsert } from '@/types/supabase';

/** Convert local journal entry to Supabase format */
function toSupabaseFormat(local: JournalEntry, userId: string): SupabaseJournalEntryInsert {
  return {
    user_id: userId,
    quote_id: local.quoteId,
    content: local.content,
  };
}

/** Convert Supabase journal entry to local format */
function toLocalFormat(remote: SupabaseJournalEntry): Omit<JournalEntry, 'id'> {
  return {
    quoteId: remote.quote_id,
    content: remote.content,
    createdAt: new Date(remote.created_at),
    updatedAt: new Date(remote.updated_at),
  };
}

/**
 * Push local journal entries to Supabase
 * Uses upsert with last-write-wins conflict resolution
 */
export async function pushJournalEntries(): Promise<{ success: boolean; error?: string; pushed?: number }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not signed in' };
  }

  // Get all local journal entries
  const localEntries = await db.journalEntries.toArray();
  if (localEntries.length === 0) {
    return { success: true, pushed: 0 };
  }

  // Get existing remote entries to determine update vs insert
  const { data: remoteEntries, error: fetchError } = await supabase
    .from('journal_entries')
    .select('id, quote_id, updated_at')
    .eq('user_id', user.id);

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  // Build a map of quote_id -> remote entry for quick lookup
  const remoteMap = new Map(
    (remoteEntries || []).map(e => [e.quote_id, e])
  );

  let pushed = 0;

  for (const local of localEntries) {
    const remote = remoteMap.get(local.quoteId);
    const supabaseData = toSupabaseFormat(local, user.id);

    if (remote) {
      // Compare timestamps - only push if local is newer
      const remoteUpdatedAt = new Date(remote.updated_at);
      if (local.updatedAt > remoteUpdatedAt) {
        const { error } = await supabase
          .from('journal_entries')
          .update({
            content: supabaseData.content,
          })
          .eq('id', remote.id);

        if (error) {
          console.error(`Failed to update journal entry ${local.quoteId}:`, error.message);
          continue;
        }
        pushed++;
      }
    } else {
      // No remote entry - insert new
      const { error } = await supabase
        .from('journal_entries')
        .insert(supabaseData);

      if (error) {
        console.error(`Failed to insert journal entry ${local.quoteId}:`, error.message);
        continue;
      }
      pushed++;
    }
  }

  return { success: true, pushed };
}

/**
 * Pull journal entries from Supabase to local
 * Uses last-write-wins based on updated_at timestamp
 */
export async function pullJournalEntries(): Promise<{ success: boolean; error?: string; pulled?: number }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not signed in' };
  }

  // Fetch all remote journal entries
  const { data: remoteEntries, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  if (!remoteEntries || remoteEntries.length === 0) {
    return { success: true, pulled: 0 };
  }

  // Get all local entries for comparison
  const localEntries = await db.journalEntries.toArray();
  const localMap = new Map(
    localEntries.map(e => [e.quoteId, e])
  );

  let pulled = 0;

  for (const remote of remoteEntries) {
    const local = localMap.get(remote.quote_id);
    const remoteUpdatedAt = new Date(remote.updated_at);

    if (local) {
      // Compare timestamps - only update local if remote is newer
      if (remoteUpdatedAt > local.updatedAt) {
        await db.journalEntries.update(local.id!, {
          content: remote.content,
          updatedAt: remoteUpdatedAt,
          createdAt: new Date(remote.created_at),
        });
        pulled++;
      }
    } else {
      // No local entry - add from remote
      const localData = toLocalFormat(remote);
      await db.journalEntries.add(localData as JournalEntry);
      pulled++;
    }
  }

  return { success: true, pulled };
}

/**
 * Full two-way sync for journal entries
 * Pulls first, then pushes local changes
 */
export async function syncJournalEntries(): Promise<{ success: boolean; error?: string }> {
  // Pull first to get any remote changes
  const pullResult = await pullJournalEntries();
  if (!pullResult.success) {
    return pullResult;
  }

  // Then push local changes
  const pushResult = await pushJournalEntries();
  return pushResult;
}
