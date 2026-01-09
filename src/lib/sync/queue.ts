/**
 * Offline sync queue manager
 * Queues sync operations when offline, processes when online
 */

import { db } from '@/lib/db';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { SyncType, PendingSync } from '@/types';
import { syncPreferences } from './preferences';
import { syncJournalEntries } from './journal';
import { syncFavorites } from './favorites';
import { syncHistory } from './history';

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Queue a sync operation for later processing
 * Deduplicates by type (only one pending sync per type at a time)
 */
export async function queueSync(type: SyncType): Promise<void> {
  // Check if there's already a pending sync of this type
  const existing = await db.pendingSyncs
    .where('type')
    .equals(type)
    .first();

  if (existing) {
    // Already queued, no need to add another
    return;
  }

  await db.pendingSyncs.add({
    type,
    createdAt: new Date(),
  });
}

/**
 * Get count of pending sync operations
 */
export async function getPendingSyncCount(): Promise<number> {
  return db.pendingSyncs.count();
}

/**
 * Get all pending sync operations
 */
export async function getPendingSyncs(): Promise<PendingSync[]> {
  return db.pendingSyncs.orderBy('createdAt').toArray();
}

/**
 * Clear a pending sync operation after successful processing
 */
async function clearPendingSync(id: number): Promise<void> {
  await db.pendingSyncs.delete(id);
}

/**
 * Process a single sync operation by type
 */
async function processSyncByType(type: SyncType): Promise<{ success: boolean; error?: string }> {
  switch (type) {
    case 'preferences':
      return syncPreferences();
    case 'journal':
      return syncJournalEntries();
    case 'favorites':
      return syncFavorites();
    case 'history':
      return syncHistory();
    default:
      return { success: false, error: `Unknown sync type: ${type}` };
  }
}

/**
 * Process all pending sync operations
 * Called when coming back online or on app startup while online
 */
export async function processPendingSyncs(): Promise<{
  processed: number;
  failed: number;
  errors: string[];
}> {
  const result = {
    processed: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Must be online to process
  if (!isOnline()) {
    return result;
  }

  // Must have Supabase configured
  if (!isSupabaseConfigured()) {
    return result;
  }

  // Must be signed in
  const supabase = getSupabase();
  if (!supabase) {
    return result;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return result;
  }

  // Get all pending syncs ordered by creation time
  const pendingSyncs = await getPendingSyncs();

  for (const pending of pendingSyncs) {
    const syncResult = await processSyncByType(pending.type);

    if (syncResult.success) {
      await clearPendingSync(pending.id!);
      result.processed++;
    } else {
      result.failed++;
      if (syncResult.error) {
        result.errors.push(`${pending.type}: ${syncResult.error}`);
      }
    }
  }

  return result;
}

/**
 * Queue sync operation if offline, or execute immediately if online
 * This is the main entry point for sync-aware operations
 */
export async function syncOrQueue(type: SyncType): Promise<{
  queued: boolean;
  success?: boolean;
  error?: string;
}> {
  // If Supabase isn't configured, just return silently
  if (!isSupabaseConfigured()) {
    return { queued: false, success: true };
  }

  // Check if user is signed in
  const supabase = getSupabase();
  if (!supabase) {
    return { queued: false, success: true };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Not signed in, no sync needed
    return { queued: false, success: true };
  }

  // If offline, queue for later
  if (!isOnline()) {
    await queueSync(type);
    return { queued: true };
  }

  // Online - try to sync immediately
  const result = await processSyncByType(type);
  return {
    queued: false,
    success: result.success,
    error: result.error,
  };
}

/**
 * Set up listeners for online/offline events
 * Automatically processes queue when coming back online
 */
export function setupSyncListeners(): () => void {
  const handleOnline = async () => {
    console.log('[Sync] Back online, processing pending syncs...');
    const result = await processPendingSyncs();
    if (result.processed > 0 || result.failed > 0) {
      console.log(`[Sync] Processed: ${result.processed}, Failed: ${result.failed}`);
    }
    if (result.errors.length > 0) {
      console.error('[Sync] Errors:', result.errors);
    }
  };

  const handleOffline = () => {
    console.log('[Sync] Went offline, changes will be queued');
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  // SSR - return no-op cleanup
  return () => {};
}

/**
 * Run a full sync of all data types
 * Useful for initial sync after sign-in or manual refresh
 */
export async function syncAll(): Promise<{
  success: boolean;
  results: Record<SyncType, { success: boolean; error?: string }>;
}> {
  const types: SyncType[] = ['preferences', 'journal', 'favorites', 'history'];
  const results: Record<SyncType, { success: boolean; error?: string }> = {} as Record<SyncType, { success: boolean; error?: string }>;

  let allSuccess = true;

  for (const type of types) {
    const result = await processSyncByType(type);
    results[type] = result;
    if (!result.success) {
      allSuccess = false;
    }
  }

  return { success: allSuccess, results };
}
