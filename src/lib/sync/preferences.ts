/**
 * Sync service for user preferences
 * Handles bidirectional sync between IndexedDB and Supabase
 */

import { db } from '@/lib/db';
import { getSupabase } from '@/lib/supabase';
import type { UserPreferences } from '@/types';
import type { SupabasePreferences, SupabasePreferencesInsert } from '@/types/supabase';

/** Convert local preferences to Supabase format */
function toSupabaseFormat(local: UserPreferences, userId: string): SupabasePreferencesInsert {
  return {
    user_id: userId,
    name: local.name,
    notification_time: local.notificationTime,
    onboarded_at: local.onboardedAt.toISOString(),
    algorithm_enabled_at: local.algorithmEnabledAt?.toISOString() ?? null,
    personalization_celebrated: local.personalizationCelebrated ?? false,
    last_timing_calculation_date: local.lastTimingCalculationDate ?? null,
    digest_enabled: false, // Default for new syncs
  };
}

/** Convert Supabase preferences to local format */
function toLocalFormat(remote: SupabasePreferences): Omit<UserPreferences, 'id'> {
  return {
    name: remote.name,
    notificationTime: remote.notification_time,
    onboardedAt: new Date(remote.onboarded_at),
    algorithmEnabledAt: remote.algorithm_enabled_at ? new Date(remote.algorithm_enabled_at) : undefined,
    personalizationCelebrated: remote.personalization_celebrated,
    lastTimingCalculationDate: remote.last_timing_calculation_date ?? undefined,
  };
}

/**
 * Push local preferences to Supabase
 * Uses upsert with last-write-wins conflict resolution
 */
export async function pushPreferences(): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not signed in' };
  }

  // Get local preferences
  const localPrefs = await db.preferences.toCollection().first();
  if (!localPrefs) {
    return { success: false, error: 'No local preferences to push' };
  }

  const supabaseData = toSupabaseFormat(localPrefs, user.id);

  // Check if remote exists to preserve digest_enabled setting
  const { data: existing } = await supabase
    .from('preferences')
    .select('digest_enabled')
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Preserve digest_enabled when updating
    supabaseData.digest_enabled = existing.digest_enabled;
  }

  // Upsert preferences (insert or update based on user_id)
  const { error } = await supabase
    .from('preferences')
    .upsert(supabaseData, { onConflict: 'user_id' });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Pull preferences from Supabase to local
 * Uses last-write-wins based on updated_at timestamp
 */
export async function pullPreferences(): Promise<{ success: boolean; error?: string; merged?: boolean }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not signed in' };
  }

  // Fetch remote preferences
  const { data: remotePrefs, error } = await supabase
    .from('preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned (not an error, just no remote data)
    return { success: false, error: error.message };
  }

  if (!remotePrefs) {
    // No remote preferences - nothing to pull
    return { success: true, merged: false };
  }

  // Get local preferences
  const localPrefs = await db.preferences.toCollection().first();

  // Determine if we should update local based on timestamps
  let shouldUpdateLocal = true;

  if (localPrefs) {
    // Compare timestamps - Supabase has updated_at, local uses onboardedAt as proxy
    // For preferences, we use simple last-write-wins with remote timestamp
    const remoteUpdatedAt = new Date(remotePrefs.updated_at);

    // If local was modified more recently (onboardedAt is later), keep local
    // This is a simple heuristic - in practice, we might want a dedicated updatedAt field locally
    if (localPrefs.onboardedAt > remoteUpdatedAt) {
      shouldUpdateLocal = false;
    }
  }

  if (shouldUpdateLocal) {
    const localData = toLocalFormat(remotePrefs);

    if (localPrefs?.id) {
      // Update existing local preferences
      await db.preferences.update(localPrefs.id, localData);
    } else {
      // Create new local preferences from remote
      await db.preferences.add(localData as UserPreferences);
    }
  }

  return { success: true, merged: shouldUpdateLocal };
}

/**
 * Full two-way sync for preferences
 * Pulls first, then pushes local changes
 */
export async function syncPreferences(): Promise<{ success: boolean; error?: string }> {
  // Pull first to get any remote changes
  const pullResult = await pullPreferences();
  if (!pullResult.success) {
    return pullResult;
  }

  // Then push local changes
  const pushResult = await pushPreferences();
  return pushResult;
}
